import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
export function verifyPicomatch() {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const policy = JSON.parse(
    readFileSync(new URL("./picomatch-policy.json", import.meta.url)),
  );
  const version = JSON.parse(
    readFileSync(root + "node_modules/picomatch/package.json"),
  ).version;
  const hash = createHash("sha256")
    .update(readFileSync(root + "node_modules/picomatch/lib/parse.js"))
    .digest("hex");
  if (version !== policy.version || hash !== policy.patchedSha256)
    throw Error("Installed picomatch mitigation missing or modified");
  const check = spawnSync(
    process.execPath,
    [
      "--input-type=commonjs",
      "-e",
      `
    const assert = require('node:assert/strict');
    const pm = require('picomatch');
    for (const pattern of ['+(*)', '+(*a)', '*(*)', '**/+(*a).js', '+(a|b)', '+(+(a))']) {
      for (const opts of [{}, {fastpaths: false}, {maxExtglobRecursion: false}]) {
        assert.throws(() => pm(pattern, opts), /Repeated extglobs/);
        assert.throws(() => pm.makeRe(pattern, opts), /Repeated extglobs/);
        assert.throws(() => pm.parse(pattern, opts), /Repeated extglobs/);
      }
    }
    assert.equal(pm('src/**/*.{js,vue}')('src/components/Hello.vue'), true);
    assert.equal(pm('src/**/*.{js,vue}')('public/Hello.vue'), false);
    assert.equal(pm('**/!(*.test).js')('src/main.js'), true);
    assert.equal(pm('**/!(*.test).js')('src/main.test.js'), false);
    assert.equal(pm('**/*.@(js|vue)')('src/Main.vue'), true);
  `,
    ],
    { cwd: root, timeout: 5000, encoding: "utf8" },
  );
  if (check.status !== 0 || check.error)
    throw Error(
      "Picomatch security regression failed: " + (check.stderr || check.error),
    );
}
