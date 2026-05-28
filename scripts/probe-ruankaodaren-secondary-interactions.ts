/**
 * Phase 3.20 – Secondary Interaction Probe (framework)
 *
 * Reads phase3_20 detail interaction discovery reports from verification/generated/.
 * If any report shows secondary_interaction_required or alternate_container_found,
 * logs the targets and probe plan. Does not execute probes in this phase.
 *
 * Usage:
 *   pnpm probe:secondary-interactions
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(__dirname, "..");
const generatedDir = resolve(repoRoot, "verification/generated");

interface DiscoveryConclusion {
  content_access_pattern: string;
  recommended_next_action: string;
  notes: string;
}

interface DiscoveryReport {
  target: string;
  generated_at: string;
  final_url: string;
  stabilization?: { status: string; text_length: number };
  baseline?: { body_text_length: number; ql_editor_text_length: number; img_count: number };
  interaction_candidate_count?: number;
  safe_candidate_count?: number;
  clicked_candidate_count?: number;
  max_text_length_after_clicks?: number;
  alternate_container_max_text_length?: number;
  conclusion: DiscoveryConclusion;
}

function loadDiscoveryReports(): DiscoveryReport[] {
  if (!existsSync(generatedDir)) {
    console.log("[probe:secondary] No generated/ directory found.");
    return [];
  }

  const files = readdirSync(generatedDir).filter(
    (f) => f.startsWith("phase3_20_detail_interaction_discovery_") && f.endsWith(".json")
  );

  if (files.length === 0) {
    console.log("[probe:secondary] No phase3_20 discovery reports found.");
    return [];
  }

  const reports: DiscoveryReport[] = [];
  for (const file of files) {
    const filePath = resolve(generatedDir, file);
    try {
      const raw = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as DiscoveryReport;
      reports.push(parsed);
      console.log(`[probe:secondary] Loaded: ${file}`);
    } catch (err) {
      console.warn(`[probe:secondary] Failed to parse ${file}: ${String(err)}`);
    }
  }
  return reports;
}

function main(): void {
  console.log("[probe:secondary] Phase 3.20 Secondary Interaction Probe Framework");
  console.log("[probe:secondary] Reading discovery reports from verification/generated/");

  const reports = loadDiscoveryReports();

  if (reports.length === 0) {
    console.log("[probe:secondary] No reports to process. Run discover:detail-interactions first.");
    return;
  }

  const secondaryRequired = reports.filter(
    (r) =>
      r.conclusion.content_access_pattern === "secondary_interaction_required" ||
      r.conclusion.content_access_pattern === "alternate_container_found"
  );

  const staticLowText = reports.filter(
    (r) => r.conclusion.content_access_pattern === "static_low_text"
  );

  const manualReview = reports.filter(
    (r) => r.conclusion.content_access_pattern === "manual_review_required" ||
      r.conclusion.content_access_pattern === "unknown"
  );

  console.log("");
  console.log(`[probe:secondary] Summary:`);
  console.log(`  Total reports: ${reports.length}`);
  console.log(`  secondary_interaction_required / alternate_container_found: ${secondaryRequired.length}`);
  console.log(`  static_low_text: ${staticLowText.length}`);
  console.log(`  manual_review_required / unknown: ${manualReview.length}`);
  console.log("");

  if (secondaryRequired.length > 0) {
    console.log("[probe:secondary] Targets requiring secondary interaction probe (max 3):");
    for (const r of secondaryRequired.slice(0, 3)) {
      console.log(`  - ${r.target}`);
      console.log(`    pattern: ${r.conclusion.content_access_pattern}`);
      console.log(`    action:  ${r.conclusion.recommended_next_action}`);
      console.log(`    notes:   ${r.conclusion.notes}`);
      console.log(`    url:     ${r.final_url}`);
      console.log("");
    }
    console.log(
      "[probe:secondary] NOTE: Secondary probe execution not yet implemented in this phase."
    );
    console.log(
      "[probe:secondary] To proceed, implement probe logic targeting the above URLs."
    );
  } else if (staticLowText.length === reports.length) {
    console.log(
      "[probe:secondary] All targets show static_low_text. No secondary interaction probe needed."
    );
    console.log(
      "[probe:secondary] Consider: manual inspection of the knowledge category, or adjusting renderer baseline threshold."
    );
  } else {
    console.log(
      "[probe:secondary] No actionable secondary interaction targets found. Manual review recommended."
    );
  }

  console.log("");
  console.log("[probe:secondary] Constraints:");
  console.log("  - No formal samples generated.");
  console.log("  - No intermediate JSON written.");
  console.log("  - No Markdown docs generated.");
  console.log("  - No OCR used.");
  console.log("  - No encrypt=1 decrypted.");
  console.log("  - No Phase 4 entry.");
}

main();
