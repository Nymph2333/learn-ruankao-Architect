/**
 * Phase 3.18: apply probe recommendations to sample targets YAML.
 *
 * Reads the Phase 3.18 probe report and appends recommended acquisition
 * targets to config/ruankaodaren-sample-targets.yaml as a
 * phase3_19_probe_recommended_targets section.
 *
 * Constraints:
 * - Does not crawl or acquire samples
 * - Does not write to data/intermediate/ruankaodaren/samples/
 * - Does not invoke the Markdown renderer
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ProbeResult } from "./probe-ruankaodaren-content-rich-candidates.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const probeReportPath = resolve(repoRoot, "verification/generated/phase3_18_content_rich_probe.json");
const sampleTargetsPath = resolve(repoRoot, "config/ruankaodaren-sample-targets.yaml");
const MAX_RECOMMENDATIONS = 5;

interface ProbeReport {
  generated_at: string;
  probed_count: number;
  recommended_count: number;
  probes: ProbeResult[];
}

function titleToSlug(title: string): string {
  return title
    .replace(/^\d+(?:\.\d+)*\s*/, "")
    .replace(/[^\u4e00-\u9fffa-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, 40);
}

function extractExistingTitleHints(yamlText: string): Set<string> {
  const hints = new Set<string>();
  const pattern = /title_hint:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(yamlText)) !== null) {
    hints.add(match[1]);
  }
  return hints;
}

function buildYamlEntry(title: string): string {
  const slug = titleToSlug(title);
  return [
    `    - id: phase319_probe_${slug}`,
    `      title_hint: "${title}"`,
    `      expected_shape: leaf_knowledge_point`,
    `      expected_classification: UNKNOWN`,
    `      status: pending_capture`,
    `      require_leaf: "true"`,
    `      require_preflight: "true"`,
    `      require_live_replay: "true"`,
    `      source_probe: "verification/generated/phase3_18_content_rich_probe.md"`,
    `      selection_reason: "Phase 3.18 content-rich probe recommended"`,
  ].join("\n");
}

function main(): void {
  if (!existsSync(probeReportPath)) {
    console.error("[apply-probe] Probe report not found. Run pnpm probe:content-rich-candidates first.");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(probeReportPath, "utf8")) as ProbeReport;

  const recommendations = report.probes
    .filter((p) => p.recommended_for_acquisition)
    .slice(0, MAX_RECOMMENDATIONS);

  if (recommendations.length === 0) {
    console.log("[apply-probe] No recommended targets in probe report. Nothing to add.");
    process.exit(0);
  }

  if (!existsSync(sampleTargetsPath)) {
    console.error(`[apply-probe] Sample targets YAML not found: config/ruankaodaren-sample-targets.yaml`);
    process.exit(1);
  }

  const yamlText = readFileSync(sampleTargetsPath, "utf8");

  const existingHints = extractExistingTitleHints(yamlText);

  const newEntries = recommendations.filter((r) => !existingHints.has(r.target_title));

  if (newEntries.length === 0) {
    console.log("[apply-probe] No new recommended targets to add.");
    process.exit(0);
  }

  const sectionAlreadyExists = yamlText.includes("phase3_19_probe_recommended_targets:");

  let appendText: string;

  if (sectionAlreadyExists) {
    const entryLines = newEntries.map((r) => buildYamlEntry(r.target_title)).join("\n");
    appendText = "\n" + entryLines + "\n";
  } else {
    const entryLines = newEntries.map((r) => buildYamlEntry(r.target_title)).join("\n");
    appendText = "\n  phase3_19_probe_recommended_targets:\n" + entryLines + "\n";
  }

  const updatedYaml = yamlText.trimEnd() + "\n" + appendText;
  writeFileSync(sampleTargetsPath, updatedYaml, "utf8");

  console.log(`[apply-probe] Added ${newEntries.length} new recommended target(s) to config/ruankaodaren-sample-targets.yaml`);
  for (const r of newEntries) {
    console.log(`  + ${r.target_title} (richness=${r.content_richness}, alignment=${r.alignment_status})`);
  }
}

main();
