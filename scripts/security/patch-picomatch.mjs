import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
const policy = JSON.parse(
  readFileSync(new URL("./picomatch-policy.json", import.meta.url)),
);
const file = root + "node_modules/picomatch/lib/parse.js";
const version = JSON.parse(
  readFileSync(root + "node_modules/picomatch/package.json"),
).version;
const source = readFileSync(file, "utf8");
const hash = (text) => createHash("sha256").update(text).digest("hex");
if (version !== policy.version)
  throw Error("Picomatch changed: review the mitigation before installing");
if (hash(source) === policy.patchedSha256)
  console.log("Picomatch mitigation already verified");
else {
  if (hash(source) !== policy.originalSha256)
    throw Error("Unexpected picomatch source: refusing to patch");
  const patched = source.replace(policy.needle, policy.needle + policy.guard);
  if (hash(patched) !== policy.patchedSha256)
    throw Error("Picomatch patch verification failed");
  writeFileSync(file, patched);
  console.log("Applied verified picomatch repeated-extglob mitigation");
}
