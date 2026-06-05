/**
 * Phase 7.6 AI Learning Generation Human Review Result Recording Gate validator.
 *
 * Validates the phase7_6_ai_learning_generation_human_review_result_recording_gate.json
 * artifact against its schema and checks all required boundary invariants.
 *
 * Usage:
 *   pnpm validate:ai-learning-generation-human-review-result-recording-gate
 */

import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-generation-human-review-result-recording-gate.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase7_6_ai_learning_generation_human_review_result_recording_gate.json");

function fail(message: string): never {
  console.error(`[validate:ai-learning-generation-human-review-result-recording-gate] ERROR: ${message}`);
  process.exit(1);
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function buildSchemaValidator(): (data: unknown) => string[] {
  if (!existsSync(schemaPath)) fail(`schema missing: ${schemaPath}`);
  const schema = readJson<object>(schemaPath);
  const ajv = new AjvCtor({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  return (data: unknown): string[] => {
    const valid = validate(data);
    if (valid) return [];
    return (validate.errors ?? []).map(
      (e: AjvError) => `${e.instancePath} ${e.message ?? "unknown error"}`
    );
  };
}

function main(): void {
  console.log("[validate:ai-learning-generation-human-review-result-recording-gate] Phase 7.6 AI Learning Generation Human Review Result Recording Gate validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:ai-learning-generation-human-review-result-recording-gate] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:ai-learning-generation-human-review-result-recording-gate] Schema validation: PASS");

  // Extract nested objects
  const urr = manifest["upstream_review_request"] as Record<string, unknown> | undefined;
  if (!urr) fail("upstream_review_request missing");

  const uge = manifest["upstream_generation_execution"] as Record<string, unknown> | undefined;
  if (!uge) fail("upstream_generation_execution missing");

  const ua = manifest["upstream_authorization"] as Record<string, unknown> | undefined;
  if (!ua) fail("upstream_authorization missing");

  const uep = manifest["upstream_execution_plan"] as Record<string, unknown> | undefined;
  if (!uep) fail("upstream_execution_plan missing");

  const hri = manifest["human_review_input"] as Record<string, unknown> | undefined;
  if (!hri) fail("human_review_input missing");

  const rd = manifest["review_decision"] as Record<string, unknown> | undefined;
  if (!rd) fail("review_decision missing");

  const ehric = manifest["expected_human_review_input_contract"] as Record<string, unknown> | undefined;
  if (!ehric) fail("expected_human_review_input_contract missing");

  const scope = manifest["scope"] as Record<string, unknown> | undefined;
  if (!scope) fail("scope missing");

  const risk = manifest["risk"] as Record<string, unknown> | undefined;
  if (!risk) fail("risk missing");

  const closure = manifest["closure"] as Record<string, unknown> | undefined;
  if (!closure) fail("closure missing");

  const npr = manifest["next_phase_recommendation"] as Record<string, unknown> | undefined;
  if (!npr) fail("next_phase_recommendation missing");

  const rc = manifest["rollback_condition"] as Record<string, unknown> | undefined;
  if (!rc) fail("rollback_condition missing");

  const ac = manifest["audit_condition"] as Record<string, unknown> | undefined;
  if (!ac) fail("audit_condition missing");

  const ve = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (!ve) fail("validation_expectations missing");

  const history = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (!history) fail("phase_progression_history missing");

  const requiredFields = ehric["required_fields"] as Array<string> | undefined;
  if (!requiredFields) fail("expected_human_review_input_contract.required_fields missing");

  const allowedDecisions = ehric["allowed_decision_results"] as Array<string> | undefined;
  if (!allowedDecisions) fail("expected_human_review_input_contract.allowed_decision_results missing");

  const severityLevels = ehric["allowed_issue_severity_levels"] as Array<string> | undefined;
  if (!severityLevels) fail("expected_human_review_input_contract.allowed_issue_severity_levels missing");

  // Compute derived values
  const historyPhases = history.map((h) => String(h["phase"]));

  const expectedRequiredFields = [
    "reviewer",
    "reviewed_at",
    "decision_result",
    "reviewed_output_category_count",
    "reviewed_generated_item_count",
    "reviewed_unsupported_generation_item_count",
    "traceability_review_confirmed",
    "issues",
  ];

  const expectedDecisions = [
    "approve_for_quality_review",
    "require_minor_revision_plan",
    "require_major_revision_plan",
    "reject_generation_batch",
    "request_source_recheck",
  ];

  const expectedSeverities = ["blocker", "major", "minor", "advisory"];

  const checks: Array<[string, boolean]> = [
    // ─── Group 1: Phase identity ──────────────────────────────
    ["manifest_version = phase7.6", manifest["manifest_version"] === "phase7.6"],
    ["phase = 7.6", manifest["phase"] === "7.6"],

    // ─── Group 2: Artifact identity ───────────────────────────
    ["manifest_type = ai_learning_generation_human_review_result_recording_gate", manifest["manifest_type"] === "ai_learning_generation_human_review_result_recording_gate"],
    ["artifact_type = ai_learning_generation_human_review_result_recording_gate", manifest["artifact_type"] === "ai_learning_generation_human_review_result_recording_gate"],
    ["status = ai_learning_generation_human_review_result_recording_gate_created", manifest["status"] === "ai_learning_generation_human_review_result_recording_gate_created"],
    ["created_for_phase = 7.6", manifest["created_for_phase"] === "7.6"],
    ["created_at is present", typeof manifest["created_at"] === "string"],

    // ─── Group 3: Result-recording-only mode ──────────────────
    ["review_recording_status = blocked", manifest["review_recording_status"] === "blocked"],
    ["review_recording_result = no_human_review_input", manifest["review_recording_result"] === "no_human_review_input"],
    ["review_recording_mode = result_recording_only", manifest["review_recording_mode"] === "result_recording_only"],

    // ─── Group 4: Blocked status when human input is absent ───
    ["review_recording_status = blocked (no human input)", manifest["review_recording_status"] === "blocked"],

    // ─── Group 5: No-human-review-input result ────────────────
    ["review_recording_result = no_human_review_input (confirmed)", manifest["review_recording_result"] === "no_human_review_input"],

    // ─── Group 6: Upstream Phase 7.5 review request linkage ───
    ["upstream_review_request.phase = 7.5", urr["phase"] === "7.5"],
    ["upstream_review_request.artifact_type = ai_learning_generation_human_review_request_package", urr["artifact_type"] === "ai_learning_generation_human_review_request_package"],
    ["upstream_review_request.manifest = phase7_5_ai_learning_generation_human_review_request_package.json", urr["manifest"] === "phase7_5_ai_learning_generation_human_review_request_package.json"],
    ["upstream_review_request.review_request_status = requested", urr["review_request_status"] === "requested"],
    ["upstream_review_request.review_request_result = pending_human_review", urr["review_request_result"] === "pending_human_review"],
    ["upstream_review_request.review_request_mode = review_request_only", urr["review_request_mode"] === "review_request_only"],

    // ─── Group 7: Upstream Phase 7.5 commit linkage ───────────
    ["upstream_review_request.commit = 5e14cc2", urr["commit"] === "5e14cc2"],
    ["upstream_review_request.generated_output_category_count = 8", urr["generated_output_category_count"] === 8],
    ["upstream_review_request.generated_item_count = 36", urr["generated_item_count"] === 36],
    ["upstream_review_request.unsupported_generation_item_count = 3", urr["unsupported_generation_item_count"] === 3],
    ["upstream_review_request.phase7_6_entry_allowed = false", urr["phase7_6_entry_allowed"] === false],

    // ─── Group 8: Upstream Phase 7.4 generation linkage ───────
    ["upstream_generation_execution.phase = 7.4", uge["phase"] === "7.4"],
    ["upstream_generation_execution.artifact_type = ai_learning_generation_execution", uge["artifact_type"] === "ai_learning_generation_execution"],
    ["upstream_generation_execution.manifest = phase7_4_ai_learning_generation_execution.json", uge["manifest"] === "phase7_4_ai_learning_generation_execution.json"],

    // ─── Group 9: Upstream Phase 7.4 commit linkage ───────────
    ["upstream_generation_execution.commit = 71f8f3f", uge["commit"] === "71f8f3f"],
    ["upstream_generation_execution.execution_status = completed", uge["execution_status"] === "completed"],
    ["upstream_generation_execution.execution_result = pass", uge["execution_result"] === "pass"],

    // ─── Group 10: Upstream generated item counts ─────────────
    ["upstream_generation_execution.generated_output_category_count = 8", uge["generated_output_category_count"] === 8],
    ["upstream_generation_execution.generated_item_count = 36", uge["generated_item_count"] === 36],

    // ─── Group 11: Upstream unsupported item counts ───────────
    ["upstream_generation_execution.unsupported_generation_item_count = 3", uge["unsupported_generation_item_count"] === 3],

    // ─── Group 12: Upstream Phase 7.3 authorization linkage ───
    ["upstream_authorization.phase = 7.3", ua["phase"] === "7.3"],
    ["upstream_authorization.artifact_type = ai_learning_generation_execution_authorization_gate", ua["artifact_type"] === "ai_learning_generation_execution_authorization_gate"],
    ["upstream_authorization.manifest = phase7_3_ai_learning_generation_execution_authorization_gate.json", ua["manifest"] === "phase7_3_ai_learning_generation_execution_authorization_gate.json"],
    ["upstream_authorization.commit = bc5f2af", ua["commit"] === "bc5f2af"],
    ["upstream_authorization.authorization_status = authorized", ua["authorization_status"] === "authorized"],
    ["upstream_authorization.authorization_result = pass", ua["authorization_result"] === "pass"],

    // ─── Group 13: Upstream Phase 7.2 plan linkage ────────────
    ["upstream_execution_plan.phase = 7.2", uep["phase"] === "7.2"],
    ["upstream_execution_plan.artifact_type = ai_learning_generation_execution_plan", uep["artifact_type"] === "ai_learning_generation_execution_plan"],
    ["upstream_execution_plan.manifest = phase7_2_ai_learning_generation_execution_plan.json", uep["manifest"] === "phase7_2_ai_learning_generation_execution_plan.json"],
    ["upstream_execution_plan.commit = 6f0ac44", uep["commit"] === "6f0ac44"],
    ["upstream_execution_plan.execution_plan_status = planned", uep["execution_plan_status"] === "planned"],

    // ─── Group 14: Batch identity ─────────────────────────────
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── Group 15: human_review_input_present is false ────────
    ["human_review_input.human_review_input_present = false", hri["human_review_input_present"] === false],

    // ─── Group 16: human_review_input_valid is false ──────────
    ["human_review_input.human_review_input_valid = false", hri["human_review_input_valid"] === false],

    // ─── Group 17: No reviewer identity is fabricated ─────────
    ["review_decision.reviewer = null (not fabricated)", rd["reviewer"] === null],

    // ─── Group 18: No reviewed_at timestamp is fabricated ─────
    ["review_decision.reviewed_at = null (not fabricated)", rd["reviewed_at"] === null],

    // ─── Group 19: No decision result is fabricated ───────────
    ["review_decision.decision_result = null (not fabricated)", rd["decision_result"] === null],
    ["review_decision.decision_status = not_available", rd["decision_status"] === "not_available"],

    // ─── Group 20: No issues are fabricated ───────────────────
    ["review_decision.issues is empty array (not fabricated)", Array.isArray(rd["issues"]) && (rd["issues"] as unknown[]).length === 0],

    // ─── Group 21: No crawler / renderer / recovery / web ─────
    ["crawler_allowed = false", manifest["crawler_allowed"] === false],
    ["renderer_allowed = false", manifest["renderer_allowed"] === false],
    ["recovery_allowed = false", manifest["recovery_allowed"] === false],
    ["web_requests_allowed = false", manifest["web_requests_allowed"] === false],

    // ─── Group 22: No source-layer mutation ───────────────────
    ["source_layer_modification_allowed = false", manifest["source_layer_modification_allowed"] === false],

    // ─── Group 23: No new AI learning content generation ──────
    ["ai_learning_content_generation_allowed = false", manifest["ai_learning_content_generation_allowed"] === false],

    // ─── Group 24: No content revision ────────────────────────
    ["ai_learning_content_revision_allowed = false", manifest["ai_learning_content_revision_allowed"] === false],

    // ─── Group 25: No acceptance permission ───────────────────
    ["ai_learning_acceptance_allowed = false", manifest["ai_learning_acceptance_allowed"] === false],

    // ─── Group 26: No revision permission ─────────────────────
    ["ai_learning_revision_allowed = false", manifest["ai_learning_revision_allowed"] === false],
    ["ai_learning_review_result_recording_allowed = true", manifest["ai_learning_review_result_recording_allowed"] === true],

    // ─── Group 27: Expected human review input contract ───────
    ["expected_human_review_input_contract.required_fields has 8 items", requiredFields.length === 8],
    ["expected_human_review_input_contract.required_fields contains all expected fields", expectedRequiredFields.every((f) => requiredFields.includes(f))],
    ["expected_human_review_input_contract.required_fields has no duplicates", new Set(requiredFields).size === requiredFields.length],

    // ─── Group 28: Allowed decision enum integrity ────────────
    ["allowed_decision_results has 5 items", allowedDecisions.length === 5],
    ["allowed_decision_results contains all expected decisions", expectedDecisions.every((d) => allowedDecisions.includes(d))],
    ["allowed_decision_results has no duplicates", new Set(allowedDecisions).size === allowedDecisions.length],

    // ─── Group 29: Issue severity enum integrity ──────────────
    ["allowed_issue_severity_levels has 4 items", severityLevels.length === 4],
    ["allowed_issue_severity_levels contains all expected severities", expectedSeverities.every((s) => severityLevels.includes(s))],
    ["allowed_issue_severity_levels has no duplicates", new Set(severityLevels).size === severityLevels.length],

    // ─── Group 30: Phase 7.7 remains blocked ──────────────────
    ["phase7_7_entry_allowed = false", manifest["phase7_7_entry_allowed"] === false],
    ["next_phase_recommendation.next_recommended_phase = phase7.7_ai_learning_generation_quality_review", npr["next_recommended_phase"] === "phase7.7_ai_learning_generation_quality_review"],
    ["next_phase_recommendation.phase7_7_entry_allowed = false", npr["phase7_7_entry_allowed"] === false],
    ["next_phase_recommendation.phase7_7_entry_requires_human_review_result = true", npr["phase7_7_entry_requires_human_review_result"] === true],

    // ─── Group 31: Low-risk posture ───────────────────────────
    ["risk.risk_level = low", risk["risk_level"] === "low"],
    ["risk.risk_reason is present", typeof risk["risk_reason"] === "string" && String(risk["risk_reason"]).length > 0],

    // ─── Group 32: Closure result is blocked_no_human_review_input ─
    ["closure.phase7_6_status = complete", closure["phase7_6_status"] === "complete"],
    ["closure.phase7_6_result = blocked_no_human_review_input", closure["phase7_6_result"] === "blocked_no_human_review_input"],

    // ─── Rollback condition ───────────────────────────────────
    ["rollback_condition.phase7_6_rollback_needed = false", rc["phase7_6_rollback_needed"] === false],

    // ─── Scope ────────────────────────────────────────────────
    ["scope.recording_scope = human_review_result_for_phase7_4_generated_outputs_only", scope["recording_scope"] === "human_review_result_for_phase7_4_generated_outputs_only"],
    ["scope.allowed_source_basis = closed_pass_phase6_1_batch_001_only", scope["allowed_source_basis"] === "closed_pass_phase6_1_batch_001_only"],
    ["scope.content_mutation_allowed = false", scope["content_mutation_allowed"] === false],
    ["scope.new_generation_allowed = false", scope["new_generation_allowed"] === false],
    ["scope.external_sources_allowed = false", scope["external_sources_allowed"] === false],
    ["scope.source_expansion_allowed = false", scope["source_expansion_allowed"] === false],
    ["scope.offline_only = true", scope["offline_only"] === true],

    // ─── human_review_input artifact is null ──────────────────
    ["human_review_input.human_review_input_artifact = null", hri["human_review_input_artifact"] === null],
    ["human_review_input.missing_required_input_reason is present", typeof hri["missing_required_input_reason"] === "string" && String(hri["missing_required_input_reason"]).length > 0],

    // ─── Audit condition ──────────────────────────────────────
    ["audit_condition.upstream_review_request_phase = 7.5", ac["upstream_review_request_phase"] === "7.5"],
    ["audit_condition.upstream_review_request_commit = 5e14cc2", ac["upstream_review_request_commit"] === "5e14cc2"],
    ["audit_condition.upstream_review_request_status = requested", ac["upstream_review_request_status"] === "requested"],
    ["audit_condition.upstream_review_request_result = pending_human_review", ac["upstream_review_request_result"] === "pending_human_review"],
    ["audit_condition.upstream_generation_execution_phase = 7.4", ac["upstream_generation_execution_phase"] === "7.4"],
    ["audit_condition.upstream_generation_execution_commit = 71f8f3f", ac["upstream_generation_execution_commit"] === "71f8f3f"],
    ["audit_condition.upstream_generation_execution_status = completed", ac["upstream_generation_execution_status"] === "completed"],
    ["audit_condition.upstream_generation_execution_result = pass", ac["upstream_generation_execution_result"] === "pass"],
    ["audit_condition.upstream_authorization_phase = 7.3", ac["upstream_authorization_phase"] === "7.3"],
    ["audit_condition.upstream_authorization_commit = bc5f2af", ac["upstream_authorization_commit"] === "bc5f2af"],
    ["audit_condition.upstream_authorization_status = authorized", ac["upstream_authorization_status"] === "authorized"],
    ["audit_condition.upstream_execution_plan_phase = 7.2", ac["upstream_execution_plan_phase"] === "7.2"],
    ["audit_condition.upstream_execution_plan_commit = 6f0ac44", ac["upstream_execution_plan_commit"] === "6f0ac44"],
    ["audit_condition.batch_id = phase6_1_batch_001", ac["batch_id"] === "phase6_1_batch_001"],
    ["audit_condition.human_review_input_present = false", ac["human_review_input_present"] === false],
    ["audit_condition.human_review_input_valid = false", ac["human_review_input_valid"] === false],
    ["audit_condition.review_recording_status = blocked", ac["review_recording_status"] === "blocked"],
    ["audit_condition.review_recording_result = no_human_review_input", ac["review_recording_result"] === "no_human_review_input"],
    ["audit_condition.current_ai_learning_content_generation_allowed = false", ac["current_ai_learning_content_generation_allowed"] === false],
    ["audit_condition.current_ai_learning_content_revision_allowed = false", ac["current_ai_learning_content_revision_allowed"] === false],
    ["audit_condition.current_ai_learning_acceptance_allowed = false", ac["current_ai_learning_acceptance_allowed"] === false],
    ["audit_condition.current_ai_learning_revision_allowed = false", ac["current_ai_learning_revision_allowed"] === false],
    ["audit_condition.current_phase7_7_entry_allowed = false", ac["current_phase7_7_entry_allowed"] === false],
    ["audit_condition.review_inventory_category_count = 8", ac["review_inventory_category_count"] === 8],
    ["audit_condition.review_inventory_item_count = 36", ac["review_inventory_item_count"] === 36],
    ["audit_condition.review_inventory_unsupported_item_count = 3", ac["review_inventory_unsupported_item_count"] === 3],

    // ─── Phase progression history ────────────────────────────
    ["phase_progression_history has 7 entries", history.length === 7],
    ["phase_progression_history includes phase 7.0", historyPhases.includes("7.0")],
    ["phase_progression_history includes phase 7.1", historyPhases.includes("7.1")],
    ["phase_progression_history includes phase 7.2", historyPhases.includes("7.2")],
    ["phase_progression_history includes phase 7.3", historyPhases.includes("7.3")],
    ["phase_progression_history includes phase 7.4", historyPhases.includes("7.4")],
    ["phase_progression_history includes phase 7.5", historyPhases.includes("7.5")],
    ["phase_progression_history includes phase 7.6", historyPhases.includes("7.6")],
    ["phase7.6 outcome includes blocked_no_human_review_input", String(history.find((h) => h["phase"] === "7.6")?.["outcome"]).includes("blocked_no_human_review_input")],

    // ─── Validation expectations ──────────────────────────────
    ["validation_expectations.schema_validation = must_pass", ve["schema_validation"] === "must_pass"],
    ["validation_expectations.invariant_checks = must_pass", ve["invariant_checks"] === "must_pass"],
    ["validation_expectations.review_recording_status_must_be = blocked", ve["review_recording_status_must_be"] === "blocked"],
    ["validation_expectations.review_recording_result_must_be = no_human_review_input", ve["review_recording_result_must_be"] === "no_human_review_input"],
    ["validation_expectations.review_recording_mode_must_be = result_recording_only", ve["review_recording_mode_must_be"] === "result_recording_only"],
    ["validation_expectations.human_review_input_present_must_be = false", ve["human_review_input_present_must_be"] === false],
    ["validation_expectations.human_review_input_valid_must_be = false", ve["human_review_input_valid_must_be"] === false],
    ["validation_expectations.review_decision_status_must_be = not_available", ve["review_decision_status_must_be"] === "not_available"],
    ["validation_expectations.review_decision_result_must_be = null", ve["review_decision_result_must_be"] === null],
    ["validation_expectations.review_decision_issues_must_be_empty = true", ve["review_decision_issues_must_be_empty"] === true],
    ["validation_expectations.phase7_7_entry_allowed_must_be = false", ve["phase7_7_entry_allowed_must_be"] === false],
    ["validation_expectations.ai_learning_acceptance_allowed_must_be = false", ve["ai_learning_acceptance_allowed_must_be"] === false],
    ["validation_expectations.ai_learning_revision_allowed_must_be = false", ve["ai_learning_revision_allowed_must_be"] === false],
  ];

  // ─── Report ───────────────────────────────────────────────────────────────
  const failed = checks.filter(([, ok]) => !ok);

  console.log(`\nPhase 7.6 AI Learning Generation Human Review Result Recording Gate — invariant checks`);
  console.log(`Total: ${checks.length}, Passed: ${checks.length - failed.length}, Failed: ${failed.length}\n`);

  for (const [label, ok] of checks) {
    console.log(`${ok ? "✅" : "❌"} ${label}`);
  }

  if (failed.length > 0) {
    console.log("\nResult: FAIL");
    process.exit(1);
  }

  console.log("\nResult: PASS");
}

main();
