/**
 * Phase 5.10 AI Learning dry-run human review approval gate validator.
 *
 * Validates that the approval gate artifact defines gate structure only and does
 * not execute approval, generate AI learning content, generate dry-run content,
 * modify Source Layer, or rewrite official Markdown.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { RuankaoAiLearningHumanReviewApprovalGate } from "../packages/domain-types/ruankaodaren-ai-learning-human-review-approval-gate.js";

const _require = createRequire(import.meta.url);

interface AjvError {
  instancePath: string;
  message?: string;
}

interface AjvValidateFunction {
  (data: unknown): boolean;
  errors?: AjvError[] | null;
}

interface AjvInstance {
  compile(schema: object): AjvValidateFunction;
}

type AjvConstructor = new (opts: Record<string, unknown>) => AjvInstance;
type AddFormatsFn = (ajv: AjvInstance) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AjvCtor = (((_require("ajv") as any).default ?? _require("ajv")) as AjvConstructor);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = (((_require("ajv-formats") as any).default ?? _require("ajv-formats")) as AddFormatsFn);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-human-review-approval-gate.schema.json");
const gateJsonPath = resolve(repoRoot, "verification/generated/phase5_10_ai_learning_human_review_approval_gate.json");

function fail(message: string): never {
  console.error(`[validate:ai-learning-human-review-approval-gate] FAILED: ${message}`);
  process.exit(1);
}

function main(): void {
  console.log("[validate:ai-learning-human-review-approval-gate] Phase 5.10 approval gate validator");

  // Check schema exists
  if (!existsSync(schemaPath)) {
    fail("schema not found");
  }

  // Check gate artifact exists
  if (!existsSync(gateJsonPath)) {
    fail("approval gate JSON not found");
  }

  // Read schema and artifact
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const gate = JSON.parse(readFileSync(gateJsonPath, "utf8")) as RuankaoAiLearningHumanReviewApprovalGate;

  // Schema validation
  const ajv = new AjvCtor({ strict: true, allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(gate);

  if (!valid) {
    console.error("[validate:ai-learning-human-review-approval-gate] Schema validation errors:");
    for (const err of validate.errors ?? []) {
      console.error(`  - ${err.instancePath} ${err.message}`);
    }
    fail("schema validation failed");
  }

  console.log("[validate:ai-learning-human-review-approval-gate] Schema validation passed");

  // Contract-specific validations
  const errors: string[] = [];

  // Gate scope
  if (gate.gate_version !== "phase5.10") {
    errors.push("gate_version must be phase5.10");
  }
  if (gate.gate_scope !== "dry_run_human_review_approval_gate_only") {
    errors.push("gate_scope must be dry_run_human_review_approval_gate_only");
  }

  // All generation flags must be false
  if (gate.generation_allowed !== false) {
    errors.push("generation_allowed must be false");
  }
  if (gate.dry_run_generation_allowed !== false) {
    errors.push("dry_run_generation_allowed must be false");
  }
  if (gate.dry_run_execution_allowed !== false) {
    errors.push("dry_run_execution_allowed must be false");
  }
  if (gate.formal_ai_learning_generation_allowed !== false) {
    errors.push("formal_ai_learning_generation_allowed must be false");
  }

  // Gate state
  if (gate.approval_gate_defined !== true) {
    errors.push("approval_gate_defined must be true");
  }
  if (gate.approval_executed !== false) {
    errors.push("approval_executed must be false");
  }
  if (gate.reviewer_decision !== "pending") {
    errors.push("reviewer_decision must be pending");
  }
  if (gate.human_review_required !== true) {
    errors.push("human_review_required must be true");
  }
  if (gate.human_review_approved !== false) {
    errors.push("human_review_approved must be false");
  }
  if (gate.auto_approval !== false) {
    errors.push("auto_approval must be false");
  }
  if (gate.phase5_11_entry_allowed !== false) {
    errors.push("phase5_11_entry_allowed must be false");
  }

  // Prior contract gate
  const pcg = gate.source_packet_prior_contract_gate;
  if (pcg.source_packet_exists !== true) errors.push("prior gate: source_packet_exists must be true");
  if (pcg.complete_count !== 3) errors.push("prior gate: complete_count must be 3");
  if (pcg.phase5_4_generation_allowed !== false) errors.push("prior gate: phase5_4_generation_allowed must be false");
  if (pcg.phase5_5_generation_allowed !== false) errors.push("prior gate: phase5_5_generation_allowed must be false");
  if (pcg.phase5_6_generation_allowed !== false) errors.push("prior gate: phase5_6_generation_allowed must be false");
  if (pcg.phase5_6_dry_run_generation_allowed !== false) errors.push("prior gate: phase5_6_dry_run_generation_allowed must be false");
  if (pcg.phase5_7_dry_run_execution_allowed !== false) errors.push("prior gate: phase5_7_dry_run_execution_allowed must be false");
  if (pcg.phase5_8_phase5_9_entry_allowed !== false) errors.push("prior gate: phase5_8_phase5_9_entry_allowed must be false");
  if (pcg.phase5_9_review_request_allowed !== true) errors.push("prior gate: phase5_9_review_request_allowed must be true");
  if (pcg.phase5_9_reviewer_decision !== "pending") errors.push("prior gate: phase5_9_reviewer_decision must be pending");
  if (pcg.phase5_9_human_review_approved !== false) errors.push("prior gate: phase5_9_human_review_approved must be false");

  // Reviewer decision schema
  const rds = gate.reviewer_decision_schema;
  if (rds.current_decision !== "pending") {
    errors.push("reviewer_decision_schema.current_decision must be pending");
  }
  if (rds.decision_executed !== false) {
    errors.push("reviewer_decision_schema.decision_executed must be false");
  }
  if (rds.decided_by !== null) {
    errors.push("reviewer_decision_schema.decided_by must be null");
  }
  if (rds.decided_at !== null) {
    errors.push("reviewer_decision_schema.decided_at must be null");
  }
  if (rds.notes !== null) {
    errors.push("reviewer_decision_schema.notes must be null");
  }

  // Selected item
  const sel = gate.selected_item_approval_gate;
  if (sel.title !== "9.1 信息安全基础知识") {
    errors.push("selected_item title must be 9.1 信息安全基础知识");
  }
  if (sel.approval_status !== "pending") {
    errors.push("selected_item approval_status must be pending");
  }
  if (sel.reviewer_decision !== "pending") {
    errors.push("selected_item reviewer_decision must be pending");
  }
  if (sel.human_review_approved !== false) {
    errors.push("selected_item human_review_approved must be false");
  }
  if (sel.dry_run_generation_allowed !== false) {
    errors.push("selected_item dry_run_generation_allowed must be false");
  }
  if (sel.dry_run_execution_allowed !== false) {
    errors.push("selected_item dry_run_execution_allowed must be false");
  }
  if (sel.formal_generation_allowed !== false) {
    errors.push("selected_item formal_generation_allowed must be false");
  }
  if (sel.output_path_isolated !== true) {
    errors.push("selected_item output_path_isolated must be true");
  }

  // Excluded items
  if (gate.excluded_items_approval_policy.length !== 2) {
    errors.push("excluded_items_approval_policy must have 2 items");
  }
  for (const exc of gate.excluded_items_approval_policy) {
    if (exc.excluded_from_approval_gate !== true) {
      errors.push(`excluded item ${exc.title}: excluded_from_approval_gate must be true`);
    }
    if (exc.dry_run_generation_allowed !== false) {
      errors.push(`excluded item ${exc.title}: dry_run_generation_allowed must be false`);
    }
    if (exc.dry_run_execution_allowed !== false) {
      errors.push(`excluded item ${exc.title}: dry_run_execution_allowed must be false`);
    }
    if (exc.formal_generation_allowed !== false) {
      errors.push(`excluded item ${exc.title}: formal_generation_allowed must be false`);
    }
  }

  // Phase 5.11 entry policy
  if (gate.phase5_11_entry_policy.phase5_11_entry_allowed !== false) {
    errors.push("phase5_11_entry_policy.phase5_11_entry_allowed must be false");
  }

  if (errors.length > 0) {
    console.error("[validate:ai-learning-human-review-approval-gate] Contract validation errors:");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    fail("contract validation failed");
  }

  console.log("[validate:ai-learning-human-review-approval-gate] Contract validation passed");
  console.log("[validate:ai-learning-human-review-approval-gate] PASS");
}

main();