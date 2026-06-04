/**
 * Phase 7.5 AI Learning Generation Human Review Request Package validator.
 *
 * Validates the phase7_5_ai_learning_generation_human_review_request_package.json
 * artifact against its schema and checks all required boundary invariants.
 *
 * Usage:
 *   pnpm validate:ai-learning-generation-human-review-request-package
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-generation-human-review-request-package.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase7_5_ai_learning_generation_human_review_request_package.json");

function fail(message: string): never {
  console.error(`[validate:ai-learning-generation-human-review-request-package] ERROR: ${message}`);
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
  console.log("[validate:ai-learning-generation-human-review-request-package] Phase 7.5 AI Learning Generation Human Review Request Package validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:ai-learning-generation-human-review-request-package] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:ai-learning-generation-human-review-request-package] Schema validation: PASS");

  // Extract nested objects
  const uge = manifest["upstream_generation_execution"] as Record<string, unknown> | undefined;
  if (!uge) fail("upstream_generation_execution missing");

  const ua = manifest["upstream_authorization"] as Record<string, unknown> | undefined;
  if (!ua) fail("upstream_authorization missing");

  const uep = manifest["upstream_execution_plan"] as Record<string, unknown> | undefined;
  if (!uep) fail("upstream_execution_plan missing");

  const uc = manifest["upstream_closure"] as Record<string, unknown> | undefined;
  if (!uc) fail("upstream_closure missing");

  const ri = manifest["review_inventory"] as Record<string, unknown> | undefined;
  if (!ri) fail("review_inventory missing");

  const rd = manifest["review_decision"] as Record<string, unknown> | undefined;
  if (!rd) fail("review_decision missing");

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

  const outputCategories = ri["output_categories"] as Array<Record<string, unknown>> | undefined;
  if (!outputCategories) fail("review_inventory.output_categories missing");

  const humanReviewCriteria = manifest["human_review_criteria"] as Array<string> | undefined;
  if (!humanReviewCriteria) fail("human_review_criteria missing");

  const allowedDecisions = manifest["allowed_human_review_decisions"] as Array<string> | undefined;
  if (!allowedDecisions) fail("allowed_human_review_decisions missing");

  const severityLevels = manifest["issue_severity_levels"] as Array<string> | undefined;
  if (!severityLevels) fail("issue_severity_levels missing");

  // Compute derived values
  const expectedOutputTypes = [
    "learning_objectives",
    "knowledge_units",
    "exam_oriented_explanations",
    "practice_questions",
    "answer_rationales",
    "misconception_warnings",
    "review_checklist",
    "source_traceability_map",
  ];
  const actualOutputTypes = outputCategories.map((o) => String(o["output_type"]));
  const historyPhases = history.map((h) => String(h["phase"]));
  const allCategoriesRequireReview = outputCategories.every((o) => o["review_required"] === true);

  const expectedCriteria = [
    "source_fidelity",
    "exam_relevance",
    "conceptual_correctness",
    "explanation_clarity",
    "question_validity",
    "answer_rationale_consistency",
    "unsupported_item_correctness",
    "traceability_sufficiency",
    "hallucination_or_overreach_detection",
    "duplicate_or_low_value_content_detection",
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
    ["manifest_version = phase7.5", manifest["manifest_version"] === "phase7.5"],
    ["phase = 7.5", manifest["phase"] === "7.5"],

    // ─── Group 2: Artifact identity ───────────────────────────
    ["manifest_type = ai_learning_generation_human_review_request_package", manifest["manifest_type"] === "ai_learning_generation_human_review_request_package"],
    ["artifact_type = ai_learning_generation_human_review_request_package", manifest["artifact_type"] === "ai_learning_generation_human_review_request_package"],
    ["status = ai_learning_generation_human_review_request_package_created", manifest["status"] === "ai_learning_generation_human_review_request_package_created"],
    ["created_for_phase = 7.5", manifest["created_for_phase"] === "7.5"],
    ["created_at is present", typeof manifest["created_at"] === "string"],

    // ─── Group 3: Review-request-only mode ────────────────────
    ["review_request_status = requested", manifest["review_request_status"] === "requested"],
    ["review_request_result = pending_human_review", manifest["review_request_result"] === "pending_human_review"],
    ["review_request_mode = review_request_only", manifest["review_request_mode"] === "review_request_only"],

    // ─── Group 4: Upstream Phase 7.4 execution linkage ────────
    ["upstream_generation_execution.phase = 7.4", uge["phase"] === "7.4"],
    ["upstream_generation_execution.artifact_type = ai_learning_generation_execution", uge["artifact_type"] === "ai_learning_generation_execution"],
    ["upstream_generation_execution.manifest = phase7_4_ai_learning_generation_execution.json", uge["manifest"] === "phase7_4_ai_learning_generation_execution.json"],

    // ─── Group 5: Upstream Phase 7.4 commit linkage ───────────
    ["upstream_generation_execution.commit = 71f8f3f", uge["commit"] === "71f8f3f"],
    ["upstream_generation_execution.execution_status = completed", uge["execution_status"] === "completed"],
    ["upstream_generation_execution.execution_result = pass", uge["execution_result"] === "pass"],
    ["upstream_generation_execution.execution_mode = offline_existing_source_packet_only", uge["execution_mode"] === "offline_existing_source_packet_only"],

    // ─── Group 6: Upstream generated item counts ──────────────
    ["upstream_generation_execution.generated_output_category_count = 8", uge["generated_output_category_count"] === 8],
    ["upstream_generation_execution.generated_item_count = 36", uge["generated_item_count"] === 36],

    // ─── Group 7: Upstream unsupported item counts ────────────
    ["upstream_generation_execution.unsupported_generation_item_count = 3", uge["unsupported_generation_item_count"] === 3],
    ["upstream_generation_execution.phase7_5_entry_allowed = false", uge["phase7_5_entry_allowed"] === false],

    // ─── Group 8: Upstream Phase 7.3 authorization linkage ────
    ["upstream_authorization.phase = 7.3", ua["phase"] === "7.3"],
    ["upstream_authorization.artifact_type = ai_learning_generation_execution_authorization_gate", ua["artifact_type"] === "ai_learning_generation_execution_authorization_gate"],
    ["upstream_authorization.manifest = phase7_3_ai_learning_generation_execution_authorization_gate.json", ua["manifest"] === "phase7_3_ai_learning_generation_execution_authorization_gate.json"],
    ["upstream_authorization.commit = bc5f2af", ua["commit"] === "bc5f2af"],
    ["upstream_authorization.authorization_status = authorized", ua["authorization_status"] === "authorized"],
    ["upstream_authorization.authorization_result = pass", ua["authorization_result"] === "pass"],

    // ─── Group 9: Upstream Phase 7.2 plan linkage ─────────────
    ["upstream_execution_plan.phase = 7.2", uep["phase"] === "7.2"],
    ["upstream_execution_plan.artifact_type = ai_learning_generation_execution_plan", uep["artifact_type"] === "ai_learning_generation_execution_plan"],
    ["upstream_execution_plan.manifest = phase7_2_ai_learning_generation_execution_plan.json", uep["manifest"] === "phase7_2_ai_learning_generation_execution_plan.json"],
    ["upstream_execution_plan.commit = 6f0ac44", uep["commit"] === "6f0ac44"],
    ["upstream_execution_plan.execution_plan_status = planned", uep["execution_plan_status"] === "planned"],

    // ─── Group 10: Upstream Phase 6.22 closure linkage ────────
    ["upstream_closure.phase = 6.22", uc["phase"] === "6.22"],
    ["upstream_closure.closure_status = closed", uc["closure_status"] === "closed"],
    ["upstream_closure.closure_result = pass", uc["closure_result"] === "pass"],
    ["upstream_closure.batch_id = phase6_1_batch_001", uc["batch_id"] === "phase6_1_batch_001"],

    // ─── Group 11: Batch identity ─────────────────────────────
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── Group 12: No crawler / renderer / recovery / web request ──
    ["crawler_allowed = false", manifest["crawler_allowed"] === false],
    ["renderer_allowed = false", manifest["renderer_allowed"] === false],
    ["recovery_allowed = false", manifest["recovery_allowed"] === false],
    ["web_requests_allowed = false", manifest["web_requests_allowed"] === false],

    // ─── Group 13: No source-layer mutation ───────────────────
    ["source_layer_modification_allowed = false", manifest["source_layer_modification_allowed"] === false],

    // ─── Group 14: No new AI learning content generation ──────
    ["ai_learning_content_generation_allowed = false", manifest["ai_learning_content_generation_allowed"] === false],

    // ─── Group 15: No content revision ────────────────────────
    ["ai_learning_content_revision_allowed = false", manifest["ai_learning_content_revision_allowed"] === false],

    // ─── Group 16: No acceptance decision ─────────────────────
    ["ai_learning_acceptance_allowed = false", manifest["ai_learning_acceptance_allowed"] === false],

    // ─── Group 17: No human review execution yet ──────────────
    ["human_review_execution_allowed = false", manifest["human_review_execution_allowed"] === false],
    ["ai_learning_review_request_creation_allowed = true", manifest["ai_learning_review_request_creation_allowed"] === true],

    // ─── Group 18: Review inventory has exactly 8 categories ──
    ["review_inventory.generated_output_category_count = 8", ri["generated_output_category_count"] === 8],
    ["review_inventory.output_categories has exactly 8 entries", outputCategories.length === 8],
    ["review_inventory includes all 8 expected output types", expectedOutputTypes.every((o) => actualOutputTypes.includes(o))],
    ["review_inventory.output_categories has no duplicate types", new Set(actualOutputTypes).size === actualOutputTypes.length],

    // ─── Group 19: Generated item count equals 36 ─────────────
    ["review_inventory.generated_item_count = 36", ri["generated_item_count"] === 36],

    // ─── Group 20: Unsupported generation item count equals 3 ─
    ["review_inventory.unsupported_generation_item_count = 3", ri["unsupported_generation_item_count"] === 3],
    ["review_inventory.unsupported_generation_items_review_required = true", ri["unsupported_generation_items_review_required"] === true],

    // ─── Group 21: Every category is marked review_required ───
    ["all output_categories have review_required = true", allCategoriesRequireReview],

    // ─── Group 22: Human review criteria enum integrity ───────
    ["human_review_criteria has exactly 10 items", humanReviewCriteria.length === 10],
    ["human_review_criteria contains all expected criteria", expectedCriteria.every((c) => humanReviewCriteria.includes(c))],
    ["human_review_criteria has no duplicates", new Set(humanReviewCriteria).size === humanReviewCriteria.length],

    // ─── Group 23: Allowed human review decision enum integrity ─
    ["allowed_human_review_decisions has exactly 5 items", allowedDecisions.length === 5],
    ["allowed_human_review_decisions contains all expected decisions", expectedDecisions.every((d) => allowedDecisions.includes(d))],
    ["allowed_human_review_decisions has no duplicates", new Set(allowedDecisions).size === allowedDecisions.length],

    // ─── Group 24: Issue severity enum integrity ──────────────
    ["issue_severity_levels has exactly 4 items", severityLevels.length === 4],
    ["issue_severity_levels contains all expected severities", expectedSeverities.every((s) => severityLevels.includes(s))],
    ["issue_severity_levels has no duplicates", new Set(severityLevels).size === severityLevels.length],

    // ─── Group 25: review_decision remains not_started ────────
    ["review_decision.decision_status = not_started", rd["decision_status"] === "not_started"],
    ["review_decision.decision_result = null", rd["decision_result"] === null],
    ["review_decision.reviewer = null", rd["reviewer"] === null],
    ["review_decision.reviewed_at = null", rd["reviewed_at"] === null],

    // ─── Group 26: review_decision.issues remains empty ───────
    ["review_decision.issues is empty array", Array.isArray(rd["issues"]) && (rd["issues"] as unknown[]).length === 0],

    // ─── Group 27: Phase 7.6 remains blocked ──────────────────
    ["phase7_6_entry_allowed = false", manifest["phase7_6_entry_allowed"] === false],
    ["next_phase_recommendation.next_recommended_phase = phase7.6_ai_learning_generation_quality_review", npr["next_recommended_phase"] === "phase7.6_ai_learning_generation_quality_review"],
    ["next_phase_recommendation.phase7_6_entry_allowed = false", npr["phase7_6_entry_allowed"] === false],
    ["next_phase_recommendation.phase7_6_entry_requires_review_decision = true", npr["phase7_6_entry_requires_review_decision"] === true],

    // ─── Group 28: Low-risk posture ───────────────────────────
    ["risk.risk_level = low", risk["risk_level"] === "low"],
    ["risk.risk_reason is present", typeof risk["risk_reason"] === "string" && String(risk["risk_reason"]).length > 0],

    // ─── Group 29: Closure pass result ────────────────────────
    ["closure.phase7_5_status = complete", closure["phase7_5_status"] === "complete"],
    ["closure.phase7_5_result = pass", closure["phase7_5_result"] === "pass"],

    // ─── Rollback condition ───────────────────────────────────
    ["rollback_condition.phase7_5_rollback_needed = false", rc["phase7_5_rollback_needed"] === false],

    // ─── Scope ────────────────────────────────────────────────
    ["scope.review_scope = phase7_4_generated_outputs_only", scope["review_scope"] === "phase7_4_generated_outputs_only"],
    ["scope.allowed_source_basis = closed_pass_phase6_1_batch_001_only", scope["allowed_source_basis"] === "closed_pass_phase6_1_batch_001_only"],
    ["scope.content_mutation_allowed = false", scope["content_mutation_allowed"] === false],
    ["scope.new_generation_allowed = false", scope["new_generation_allowed"] === false],
    ["scope.external_sources_allowed = false", scope["external_sources_allowed"] === false],
    ["scope.source_expansion_allowed = false", scope["source_expansion_allowed"] === false],
    ["scope.offline_only = true", scope["offline_only"] === true],

    // ─── Audit condition ──────────────────────────────────────
    ["audit_condition.upstream_generation_execution_phase = 7.4", ac["upstream_generation_execution_phase"] === "7.4"],
    ["audit_condition.upstream_generation_execution_commit = 71f8f3f", ac["upstream_generation_execution_commit"] === "71f8f3f"],
    ["audit_condition.upstream_generation_execution_status = completed", ac["upstream_generation_execution_status"] === "completed"],
    ["audit_condition.upstream_generation_execution_result = pass", ac["upstream_generation_execution_result"] === "pass"],
    ["audit_condition.upstream_authorization_phase = 7.3", ac["upstream_authorization_phase"] === "7.3"],
    ["audit_condition.upstream_authorization_commit = bc5f2af", ac["upstream_authorization_commit"] === "bc5f2af"],
    ["audit_condition.upstream_authorization_status = authorized", ac["upstream_authorization_status"] === "authorized"],
    ["audit_condition.upstream_execution_plan_phase = 7.2", ac["upstream_execution_plan_phase"] === "7.2"],
    ["audit_condition.upstream_execution_plan_commit = 6f0ac44", ac["upstream_execution_plan_commit"] === "6f0ac44"],
    ["audit_condition.upstream_closure_phase = 6.22", ac["upstream_closure_phase"] === "6.22"],
    ["audit_condition.upstream_closure_result = pass", ac["upstream_closure_result"] === "pass"],
    ["audit_condition.current_review_request_status = requested", ac["current_review_request_status"] === "requested"],
    ["audit_condition.current_review_request_result = pending_human_review", ac["current_review_request_result"] === "pending_human_review"],
    ["audit_condition.current_ai_learning_content_generation_allowed = false", ac["current_ai_learning_content_generation_allowed"] === false],
    ["audit_condition.current_ai_learning_content_revision_allowed = false", ac["current_ai_learning_content_revision_allowed"] === false],
    ["audit_condition.current_human_review_execution_allowed = false", ac["current_human_review_execution_allowed"] === false],
    ["audit_condition.current_ai_learning_acceptance_allowed = false", ac["current_ai_learning_acceptance_allowed"] === false],
    ["audit_condition.current_phase7_6_entry_allowed = false", ac["current_phase7_6_entry_allowed"] === false],
    ["audit_condition.review_inventory_category_count = 8", ac["review_inventory_category_count"] === 8],
    ["audit_condition.review_inventory_item_count = 36", ac["review_inventory_item_count"] === 36],
    ["audit_condition.review_inventory_unsupported_item_count = 3", ac["review_inventory_unsupported_item_count"] === 3],

    // ─── Phase progression history ────────────────────────────
    ["phase_progression_history has 6 entries", history.length === 6],
    ["phase_progression_history includes phase 7.0", historyPhases.includes("7.0")],
    ["phase_progression_history includes phase 7.1", historyPhases.includes("7.1")],
    ["phase_progression_history includes phase 7.2", historyPhases.includes("7.2")],
    ["phase_progression_history includes phase 7.3", historyPhases.includes("7.3")],
    ["phase_progression_history includes phase 7.4", historyPhases.includes("7.4")],
    ["phase_progression_history includes phase 7.5", historyPhases.includes("7.5")],
    ["phase7.5 outcome = ai_learning_generation_human_review_request_package_created", history.find((h) => h["phase"] === "7.5")?.["outcome"] === "ai_learning_generation_human_review_request_package_created"],

    // ─── Validation expectations ──────────────────────────────
    ["validation_expectations.schema_validation = must_pass", ve["schema_validation"] === "must_pass"],
    ["validation_expectations.invariant_checks = must_pass", ve["invariant_checks"] === "must_pass"],
    ["validation_expectations.review_request_status_must_be = requested", ve["review_request_status_must_be"] === "requested"],
    ["validation_expectations.review_request_result_must_be = pending_human_review", ve["review_request_result_must_be"] === "pending_human_review"],
    ["validation_expectations.review_request_mode_must_be = review_request_only", ve["review_request_mode_must_be"] === "review_request_only"],
    ["validation_expectations.review_decision_status_must_be = not_started", ve["review_decision_status_must_be"] === "not_started"],
    ["validation_expectations.review_decision_result_must_be = null", ve["review_decision_result_must_be"] === null],
    ["validation_expectations.review_decision_issues_must_be_empty = true", ve["review_decision_issues_must_be_empty"] === true],
    ["validation_expectations.phase7_6_entry_allowed_must_be = false", ve["phase7_6_entry_allowed_must_be"] === false],
    ["validation_expectations.generated_output_category_count_must_be = 8", ve["generated_output_category_count_must_be"] === 8],
    ["validation_expectations.generated_item_count_must_be = 36", ve["generated_item_count_must_be"] === 36],
    ["validation_expectations.unsupported_generation_item_count_must_be = 3", ve["unsupported_generation_item_count_must_be"] === 3],
  ];

  // ─── Report ───────────────────────────────────────────────────────────────
  const failed = checks.filter(([, ok]) => !ok);

  console.log(`\nPhase 7.5 AI Learning Generation Human Review Request Package — invariant checks`);
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
