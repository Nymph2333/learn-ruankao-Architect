/**
 * Phase 4.5 controlled expansion plan builder.
 *
 * Builds a planning artifact for the next possible phase. It does not render
 * new Markdown, does not approve human review, does not crawl, does not access
 * raw HTML/XHR, and does not propose full-site rendering.
 *
 * Usage:
 *   pnpm build:controlled-expansion-plan
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoHumanReviewStatus } from "../packages/domain-types/ruankaodaren-human-review-status.js";
import type { RuankaoRendererInputContract } from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const statusPath = resolve(repoRoot, "reviews/ruankaodaren/baseline/human-review-status.json");
const contractPath = resolve(generatedDir, "phase3_25_renderer_input_contract.json");
const baselineManifestPath = resolve(generatedDir, "phase3_23_renderer_baseline_manifest.json");
const qualityAuditPath = resolve(generatedDir, "phase4_3_render_quality_audit.json");
const refinementReportPath = resolve(generatedDir, "phase4_4_renderer_policy_refinement_report.json");
const jsonOutputPath = resolve(generatedDir, "phase4_5_controlled_expansion_plan.json");
const mdOutputPath = resolve(generatedDir, "phase4_5_controlled_expansion_plan.md");

interface QualityAudit {
  boundary_violation_count: number;
  fail_count: number;
}

interface BaselineManifest {
  unique_title_count: number;
  phase4_input_contract_ready: boolean;
}

interface RefinementReport {
  boundary_violations: number;
  recommended_next_phase: string;
}

interface PlanCondition {
  condition: string;
  required: true;
  current_status: "met" | "not_met";
}

interface ControlledExpansionPlan {
  phase: "4.5";
  created_at: string;
  source_name: "ruankaodaren";
  current_status: {
    official_baseline_docs: number;
    human_review_overall_status: string;
    expansion_allowed: boolean;
    boundary_violation_count: number;
  };
  source_reports: {
    human_review_status: string;
    renderer_input_contract: string;
    renderer_baseline_manifest: string;
    render_quality_audit: string;
    renderer_policy_refinement_report: string;
  };
  phase4_6_entry_conditions: PlanCondition[];
  phase4_6_expansion_scope_proposal: {
    mode: "controlled_expansion_dry_run";
    additional_reachable_leaf_nodes_min: 3;
    additional_reachable_leaf_nodes_max: 5;
    requirements: string[];
    prohibited_scope: string[];
  };
  explicit_prohibitions: string[];
  recommended_next_phase: "manual_human_review" | "phase4_6_controlled_expansion_dry_run";
}

function fail(message: string): never {
  console.error(`[build:controlled-expansion-plan] ERROR: ${message}`);
  process.exit(1);
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function allItemsAccepted(status: RuankaoHumanReviewStatus): boolean {
  return status.items.every((item) => item.review_status === "accepted" || item.review_status === "accepted_with_notes");
}

function allRequiredChecksComplete(status: RuankaoHumanReviewStatus): boolean {
  return status.items.every((item) => Object.values(item.required_checks).every((value) => value === true));
}

function condition(name: string, met: boolean): PlanCondition {
  return {
    condition: name,
    required: true,
    current_status: met ? "met" : "not_met",
  };
}

function writeMarkdown(plan: ControlledExpansionPlan): void {
  const lines = [
    "# Phase 4.5 Controlled Expansion Plan",
    "",
    "This plan is a gate, not an expansion run. It does not render new official Markdown, approve documents, crawl, access raw HTML/XHR, use OCR, or access the web.",
    "",
    "## Current Status",
    "",
    `- official_baseline_docs: ${plan.current_status.official_baseline_docs}`,
    `- human_review_overall_status: \`${plan.current_status.human_review_overall_status}\``,
    `- expansion_allowed: ${plan.current_status.expansion_allowed}`,
    `- boundary_violation_count: ${plan.current_status.boundary_violation_count}`,
    "",
    "## Source Reports",
    "",
    `- human_review_status: \`${plan.source_reports.human_review_status}\``,
    `- renderer_input_contract: \`${plan.source_reports.renderer_input_contract}\``,
    `- renderer_baseline_manifest: \`${plan.source_reports.renderer_baseline_manifest}\``,
    `- render_quality_audit: \`${plan.source_reports.render_quality_audit}\``,
    `- renderer_policy_refinement_report: \`${plan.source_reports.renderer_policy_refinement_report}\``,
    "",
    "## Phase 4.6 Entry Conditions",
    "",
    ...plan.phase4_6_entry_conditions.map((entry) => `- ${entry.current_status === "met" ? "[x]" : "[ ]"} ${entry.condition}`),
    "",
    "## Phase 4.6 Expansion Scope Proposal",
    "",
    `- mode: \`${plan.phase4_6_expansion_scope_proposal.mode}\``,
    `- additional reachable leaf nodes: ${plan.phase4_6_expansion_scope_proposal.additional_reachable_leaf_nodes_min}-${plan.phase4_6_expansion_scope_proposal.additional_reachable_leaf_nodes_max}`,
    "",
    "### Requirements",
    "",
    ...plan.phase4_6_expansion_scope_proposal.requirements.map((item) => `- ${item}`),
    "",
    "### Prohibited Scope",
    "",
    ...plan.phase4_6_expansion_scope_proposal.prohibited_scope.map((item) => `- ${item}`),
    "",
    "## Explicit Prohibitions",
    "",
    ...plan.explicit_prohibitions.map((item) => `- ${item}`),
    "",
    "## Recommended Next Phase",
    "",
    `- ${plan.recommended_next_phase}`,
    "",
  ];

  writeFileSync(mdOutputPath, lines.join("\n"), "utf8");
}

function main(): void {
  for (const [label, path] of [
    ["human review status", statusPath],
    ["renderer input contract", contractPath],
    ["renderer baseline manifest", baselineManifestPath],
    ["quality audit", qualityAuditPath],
    ["renderer policy refinement report", refinementReportPath],
  ] as const) {
    if (!existsSync(path)) fail(`${label} missing: ${toRepoPath(path)}`);
  }

  mkdirSync(generatedDir, { recursive: true });

  const status = readJson<RuankaoHumanReviewStatus>(statusPath);
  const contract = readJson<RuankaoRendererInputContract>(contractPath);
  const baselineManifest = readJson<BaselineManifest>(baselineManifestPath);
  const qualityAudit = readJson<QualityAudit>(qualityAuditPath);
  const refinement = readJson<RefinementReport>(refinementReportPath);

  const accepted = allItemsAccepted(status);
  const checksComplete = allRequiredChecksComplete(status);
  const noBoundaryViolations = qualityAudit.boundary_violation_count === 0 && refinement.boundary_violations === 0;
  const contractValidByInputs = contract.phase4_allowed === true &&
    contract.phase4_entry_conditions.all_constraints_safe === true &&
    contract.renderer_input_policy.forbidden_inputs.includes("raw_html_direct_read") &&
    contract.renderer_input_policy.forbidden_inputs.includes("raw_xhr_direct_read") &&
    contract.renderer_input_policy.forbidden_inputs.includes("web_requests") &&
    contract.renderer_input_policy.forbidden_inputs.includes("ocr") &&
    contract.renderer_input_policy.forbidden_inputs.includes("encrypted_xhr_decryption") &&
    contract.renderer_input_policy.forbidden_inputs.includes("image_table_reconstruction") &&
    contract.renderer_input_policy.forbidden_inputs.includes("content_invention");
  const baselineValid = baselineManifest.phase4_input_contract_ready === true && baselineManifest.unique_title_count >= 3;
  const expansionAllowed = status.phase4_6_expansion_allowed === true &&
    accepted &&
    checksComplete &&
    noBoundaryViolations &&
    contractValidByInputs &&
    baselineValid;

  const plan: ControlledExpansionPlan = {
    phase: "4.5",
    created_at: new Date().toISOString(),
    source_name: "ruankaodaren",
    current_status: {
      official_baseline_docs: status.items.length,
      human_review_overall_status: status.overall_status,
      expansion_allowed: expansionAllowed,
      boundary_violation_count: qualityAudit.boundary_violation_count,
    },
    source_reports: {
      human_review_status: toRepoPath(statusPath),
      renderer_input_contract: toRepoPath(contractPath),
      renderer_baseline_manifest: toRepoPath(baselineManifestPath),
      render_quality_audit: toRepoPath(qualityAuditPath),
      renderer_policy_refinement_report: toRepoPath(refinementReportPath),
    },
    phase4_6_entry_conditions: [
      condition("All three baseline items are accepted or accepted_with_notes by a human reviewer.", accepted),
      condition("Every required human review check is true.", checksComplete),
      condition("No renderer boundary violations exist.", noBoundaryViolations),
      condition("Baseline renderer validation still passes.", qualityAudit.fail_count === 0 && baselineValid),
      condition("Renderer input contract remains valid and constraints-safe.", contractValidByInputs),
      condition("Forbidden input policy remains unchanged.", contractValidByInputs),
    ],
    phase4_6_expansion_scope_proposal: {
      mode: "controlled_expansion_dry_run",
      additional_reachable_leaf_nodes_min: 3,
      additional_reachable_leaf_nodes_max: 5,
      requirements: [
        "Each new node must come from a reachable leaf catalog or an equivalent validated reachable-leaf source.",
        "Each new node must enter the renderer baseline manifest before official rendering.",
        "Each new node must have an explicit renderer_policy.",
        "Each new node must pass render dry-run before official rendering.",
        "Each new node must preserve the Phase 3.25 forbidden-input policy.",
      ],
      prohibited_scope: [
        "No full-library rendering.",
        "No rendering outside a controlled 3-5 node expansion.",
        "No rendering of nodes that are not in a renderer baseline manifest.",
      ],
    },
    explicit_prohibitions: [
      "no full-site rendering",
      "no OCR",
      "no raw HTML direct read",
      "no raw XHR direct read",
      "no web requests",
      "no image table reconstruction",
      "no encrypted XHR decryption",
      "no content invention",
    ],
    recommended_next_phase: status.overall_status === "pending_review"
      ? "manual_human_review"
      : expansionAllowed
        ? "phase4_6_controlled_expansion_dry_run"
        : "manual_human_review",
  };

  writeFileSync(jsonOutputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  writeMarkdown(plan);

  console.log("[build:controlled-expansion-plan] Controlled expansion plan generated");
  console.log(`  official_baseline_docs:  ${plan.current_status.official_baseline_docs}`);
  console.log(`  expansion_allowed:       ${plan.current_status.expansion_allowed}`);
  console.log(`  recommended_next_phase:  ${plan.recommended_next_phase}`);
  console.log(`  JSON:                    ${toRepoPath(jsonOutputPath)}`);
  console.log(`  MD:                      ${toRepoPath(mdOutputPath)}`);
}

main();
