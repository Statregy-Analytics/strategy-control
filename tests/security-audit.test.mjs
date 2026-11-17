import test from "node:test";
import assert from "node:assert/strict";
import { assessAudit } from "../scripts/security/audit-policy.mjs";
import { verifyPicomatch } from "../scripts/security/verify-picomatch.mjs";
const leaf = {
  severity: "high",
  nodes: ["node_modules/picomatch"],
  via: [
    {
      url: "https://github.com/advisories/GHSA-fc5q-39xc-vjpf",
      range: "<=4.0.7",
      severity: "high",
    },
  ],
};
function report(vulnerabilities) {
  return {
    auditReportVersion: 2,
    vulnerabilities,
    metadata: {
      vulnerabilities: {
        high: Object.values(vulnerabilities).filter(
          (v) => v.severity === "high",
        ).length,
        critical: Object.values(vulnerabilities).filter(
          (v) => v.severity === "critical",
        ).length,
      },
    },
  };
}
test("installed source guard and timed regression reject the vulnerable extglobs", () =>
  verifyPicomatch());
test("audit accepts only mitigated leaf and transitive effects at the original high threshold", () => {
  const result = assessAudit(
    report({
      picomatch: leaf,
      tooling: { severity: "high", via: ["picomatch", "moderate"] },
      moderate: {
        severity: "moderate",
        via: [{ severity: "moderate", url: "https://example.com/moderate" }],
      },
    }),
  );
  assert.deepEqual(result.blocked, []);
  assert.deepEqual(result.mitigated.sort(), ["picomatch", "tooling"]);
});
test("new direct high/critical advisories remain blocking, including in an inherited chain", () => {
  const entries = {
    picomatch: leaf,
    another: {
      severity: "critical",
      via: [{ severity: "critical", url: "https://example.com/new" }],
    },
    parent: { severity: "high", via: ["picomatch", "another"] },
  };
  assert.deepEqual(assessAudit(report(entries)).blocked.sort(), [
    "another",
    "parent",
  ]);
});
test("new picomatch advisory, nested install or changed affected range cannot use the mitigation exception", () => {
  for (const entry of [
    {
      ...leaf,
      via: [...leaf.via, { severity: "high", url: "https://example.com/new" }],
    },
    { ...leaf, nodes: ["node_modules/nested/node_modules/picomatch"] },
    { ...leaf, via: [{ ...leaf.via[0], range: "<=4.0.8" }] },
  ])
    assert.deepEqual(assessAudit(report({ picomatch: entry })).blocked, [
      "picomatch",
    ]);
});
test("audit errors, missing reports and inconsistent counts fail closed", () => {
  for (const value of [
    null,
    {},
    { error: "network" },
    { ...report({}), metadata: { vulnerabilities: { high: 1, critical: 0 } } },
  ])
    assert.throws(() => assessAudit(value));
});

test("source verification fails when the installed mitigation is missing or tampered", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const url = await import("node:url");
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "strategy-picomatch-verification-"),
  );
  fs.mkdirSync(path.join(root, "scripts/security"), { recursive: true });
  fs.mkdirSync(path.join(root, "node_modules/picomatch/lib"), {
    recursive: true,
  });
  for (const name of ["verify-picomatch.mjs", "picomatch-policy.json"])
    fs.copyFileSync(
      "scripts/security/" + name,
      path.join(root, "scripts/security", name),
    );
  fs.writeFileSync(
    path.join(root, "node_modules/picomatch/package.json"),
    JSON.stringify({ version: "4.0.7" }),
  );
  const checker = await import(
    url.pathToFileURL(path.join(root, "scripts/security/verify-picomatch.mjs"))
  );
  const original = fs.readFileSync(
    "node_modules/picomatch/lib/parse.js",
    "utf8",
  );
  for (const source of [
    original + "\n// modified",
    original.replace(
      JSON.parse(fs.readFileSync("scripts/security/picomatch-policy.json"))
        .guard,
      "",
    ),
  ]) {
    fs.writeFileSync(
      path.join(root, "node_modules/picomatch/lib/parse.js"),
      source,
    );
    assert.throws(
      () => checker.verifyPicomatch(),
      /mitigation missing or modified/,
    );
  }
});
