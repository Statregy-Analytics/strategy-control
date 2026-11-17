const advisory = "https://github.com/advisories/GHSA-fc5q-39xc-vjpf";
// Only the exact advisory whose installed source has been mitigated can pass.
// Transitive metavulnerabilities are accepted only if every cause is that same leaf.
export function assessAudit(report) {
  if (
    !report ||
    report.error ||
    report.auditReportVersion !== 2 ||
    !report.vulnerabilities ||
    !report.metadata?.vulnerabilities
  )
    throw Error("Missing or invalid npm audit report");
  const entries = report.vulnerabilities;
  for (const severity of ["high", "critical"]) {
    if (
      Object.values(entries).filter((entry) => entry.severity === severity)
        .length !== report.metadata.vulnerabilities[severity]
    )
      throw Error("Inconsistent npm audit vulnerability counts");
  }
  const leaf = entries.picomatch;
  const accepted = new Set();
  if (
    leaf &&
    leaf.nodes?.length === 1 &&
    leaf.nodes[0] === "node_modules/picomatch" &&
    leaf.via?.length === 1 &&
    leaf.via[0].url === advisory &&
    leaf.via[0].range === "<=4.0.7"
  )
    accepted.add("picomatch");
  let changed = true;
  while (changed) {
    changed = false;
    for (const [name, entry] of Object.entries(entries)) {
      if (
        !accepted.has(name) &&
        entry.via?.length &&
        entry.via.every((cause) =>
          typeof cause === "string"
            ? accepted.has(cause)
            : ["info", "low", "moderate"].includes(cause.severity),
        )
      ) {
        accepted.add(name);
        changed = true;
      }
    }
  }
  const blocked = Object.entries(entries)
    .filter(
      ([name, entry]) =>
        ["high", "critical"].includes(entry.severity) && !accepted.has(name),
    )
    .map(([name]) => name);
  return {
    blocked,
    mitigated: [...accepted].filter((name) =>
      ["high", "critical"].includes(entries[name].severity),
    ),
  };
}
