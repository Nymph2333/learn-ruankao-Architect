/**
 * Phase 4.5 controlled expansion plan validator.
 *
 * Validates that Phase 4.6 remains blocked while human review is pending and
 * confirms the plan does not propose full-site rendering or create new official
 * Markdown.
 *
 * Usage:
 *   pnpm validate:controlled-expansion-plan
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const officialDir = resolve(repoRoot, "docs/ruankaodaren/baseline");
const planJsonPath = resolve(generatedDir, "phase4_5_controlled_expansion_plan.json");
const planMdPath = resolve(generatedDir, "phase4_5_controlled_expansion_plan.md");

const EXPECTED_DOCS = [
  "1.3_指令系统CISC和RISC.md",
  "13.3_软件架构风格.md",
  "9.1_信息安全基础知识.md",
];

const REQUIRED_PROHIBITIONS = [
  "no full-site rendering",
  "no OCR",
  "no raw HTML direct read",
  "no raw XHR direct read",
  "no web requests",
  "no image table reconstruction",
  "no encrypted XHR decryption",
  "no content invention",
];

interface ControlledExpansionPlan {
  current_status: {
    human_review_overall_status: string;
    expansion_allowed: boolean;
  };
  phase4_6_entry_conditions: Array<{ condition: string }>;
  phase4_6_expansion_scope_proposal: {
    additional_reachable_leaf_nodes_min: number;
    additional_reachable_leaf_nodes_max: number;
    prohibited_scope: string[];
  };
  explicit_prohibitions: string[];
  recommended_next_phase: string;
}

function fail(message: string): never {
  console.error(`[validate:controlled-expansion-plan] ERROR: ${message}`);
  process.exit(1);
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function main(): void {
  if (!existsSync(planJsonPath)) fail("controlled expansion plan JSON missing");
  if (!existsSync(planMdPath)) fail("controlled expansion plan Markdown missing");
  if (!existsSync(officialDir)) fail("official baseline directory missing");

  const plan = readJson<ControlledExpansionPlan>(planJsonPath);
  const errors: string[] = [];

  if (plan.current_status.human_review_overall_status === "pending_review" &&
    plan.current_status.expansion_allowed !== false) {
    errors.push("expansion_allowed must be false while human review is pending");
  }
  if (plan.recommended_next_phase !== "manual_human_review") {
    errors.push(`recommended_next_phase must be manual_human_review while pending, got ${plan.recommended_next_phase}`);
  }
  if (plan.phase4_6_entry_conditions.length < 6) {
    errors.push("Phase 4.6 entry conditions are incomplete");
  }
  for (const required of REQUIRED_PROHIBITIONS) {
    if (!plan.explicit_prohibitions.includes(required)) {
      errors.push(`explicit_prohibitions missing: ${required}`);
    }
  }
  if (plan.phase4_6_expansion_scope_proposal.additional_reachable_leaf_nodes_min !== 3 ||
    plan.phase4_6_expansion_scope_proposal.additional_reachable_leaf_nodes_max !== 5) {
    errors.push("controlled expansion scope must be 3-5 additional reachable leaf nodes");
  }
  if (plan.phase4_6_expansion_scope_proposal.prohibited_scope.some((entry) => /full-library|full-site/i.test(entry) === false) &&
    !plan.phase4_6_expansion_scope_proposal.prohibited_scope.join("\n").includes("No full-library rendering")) {
    errors.push("plan must prohibit full-library or full-site rendering");
  }

  const actualMdFiles = readdirSync(officialDir).filter((file) => file.endsWith(".md")).sort();
  const expectedMdFiles = [...EXPECTED_DOCS].sort();
  for (const expected of expectedMdFiles) {
    if (!actualMdFiles.includes(expected)) errors.push(`expected official Markdown missing: ${expected}`);
  }
  for (const actual of actualMdFiles) {
    if (!expectedMdFiles.includes(actual)) errors.push(`unexpected official Markdown found: ${actual}`);
  }

  if (errors.length > 0) {
    console.error("[validate:controlled-expansion-plan] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:controlled-expansion-plan] Controlled expansion plan validation passed");
  console.log(`  expansion_allowed:       ${plan.current_status.expansion_allowed}`);
  console.log(`  recommended_next_phase:  ${plan.recommended_next_phase}`);
  console.log(`  entry_conditions:        ${plan.phase4_6_entry_conditions.length}`);
  console.log(`  official_docs:           ${actualMdFiles.join(", ")}`);
}

main();
