import { spawnSync } from "node:child_process";
import { assessAudit } from "./audit-policy.mjs";
import { verifyPicomatch } from "./verify-picomatch.mjs";
verifyPicomatch();
const result = spawnSync("npm", ["audit", "--audit-level=high", "--json"], {
  encoding: "utf8",
  timeout: 120000,
  maxBuffer: 8 * 1024 * 1024,
});
if (result.error || ![0, 1].includes(result.status))
  throw Error(
    "npm audit could not complete: " + (result.stderr || result.error),
  );
const report = JSON.parse(result.stdout);
const assessment = assessAudit(report);
console.log(
  JSON.stringify(
    { npmAudit: report.metadata.vulnerabilities, ...assessment },
    null,
    2,
  ),
);
if (assessment.blocked.length)
  throw Error(
    "Unmitigated dependency advisories: " + assessment.blocked.join(", "),
  );
console.log(
  "Security audit passed; the exact picomatch advisory is mitigated by verified source guard and subprocess regression checks.",
);
