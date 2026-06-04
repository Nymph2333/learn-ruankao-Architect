/**
 * Phase 7.0 AI Learning Generation Request validator.
 *
 * Validates the generated phase7_0_ai_learning_generation_request.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - manifest_version is not phase7.0
 * - manifest_type is not ai_learning_generation_request
 * - phase is not 7.0
 * - artifact_type is not ai_learning_generation_request
 * - status is not ai_learning_generation_request_created
 * - request_status is not requested
 * - request_mode is not request_only
 * - batch_id is not phase6_1_batch_001
 * - upstream_phase is not 6.22
 * - upstream_closure_status is not closed
 * - upstream_closure_result is not pass
 * - ai_learning_content_generation_allowed is not false
 * - ai_learning_request_creation_allowed is not true
 * - phase7_1_entry_allowed is not false
 * - actual_generated_outputs is not empty
 * - requested_future_outputs does not contain exactly 8 approved outputs
 * - risk_level is not low
 * - closure status/result do not match expectations
 * - Any operational gate that should be false is true
 *
 * Usage:
 *   pnpm validate:ai-learning-generation-request
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-generation-request.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase7_0_ai_learning_generation_request.json");

function fail(message: string): never {
  console.error(`[validate:ai-learning-generation-request] ERROR: ${message}`);
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
      (e) => `${e.instancePath} ${e.message ?? "(no message)"}`
    );
  };
}

function main(): void {
  console.log("[validate:ai-learning-generation-request] Phase 7.0 AI Learning Generation Request validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:ai-learning-generation-request] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:ai-learning-generation-request] Schema validation: PASS");

  // Extract nested objects
  const scope = manifest["scope"] as Record<string, unknown> | undefined;
  if (!scope) fail("scope missing");

  const risk = manifest["risk"] as Record<string, unknown> | undefined;
  if (!risk) fail("risk missing");

  const closure = manifest["closure"] as Record<string, unknown> | undefined;
  if (!closure) fail("closure missing");

  const nextPhaseRecommendation = manifest["next_phase_recommendation"] as Record<string, unknown> | undefined;
  if (!nextPhaseRecommendation) fail("next_phase_recommendation missing");

  const rollbackCondition = manifest["rollback_condition"] as Record<string, unknown> | undefined;
  if (!rollbackCondition) fail("rollback_condition missing");

  const auditCondition = manifest["audit_condition"] as Record<string, unknown> | undefined;
  if (!auditCondition) fail("audit_condition missing");

  const validationExpectations = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (!validationExpectations) fail("validation_expectations missing");

  const requestedFutureOutputs = manifest["requested_future_outputs"] as string[] | undefined;
  if (!requestedFutureOutputs) fail("requested_future_outputs missing");

  const actualGeneratedOutputs = manifest["actual_generated_outputs"] as string[] | undefined;
  if (!actualGeneratedOutputs) fail("actual_generated_outputs missing");

  const expectedFutureOutputs = [
    "learning_objectives",
    "knowledge_units",
    "exam_oriented_explanations",
    "practice_questions",
    "answer_rationales",
    "misconception_warnings",
    "review_checklist",
    "source_traceability_map",
  ];

  const checks: Array<[string, boolean]> = [
    // ─── Phase identity ───────────────────────────────────────
    ["manifest_version = phase7.0", manifest["manifest_version"] === "phase7.0"],
    ["phase = 7.0", manifest["phase"] === "7.0"],

    // ─── Artifact identity ────────────────────────────────────
    ["manifest_type = ai_learning_generation_request", manifest["manifest_type"] === "ai_learning_generation_request"],
    ["artifact_type = ai_learning_generation_request", manifest["artifact_type"] === "ai_learning_generation_request"],
    ["status = ai_learning_generation_request_created", manifest["status"] === "ai_learning_generation_request_created"],
    ["created_for_phase = 7.0", manifest["created_for_phase"] === "7.0"],

    // ─── Request-only mode ────────────────────────────────────
    ["request_status = requested", manifest["request_status"] === "requested"],
    ["request_mode = request_only", manifest["request_mode"] === "request_only"],

    // ─── Upstream closure linkage ─────────────────────────────
    ["upstream_phase = 6.22", manifest["upstream_phase"] === "6.22"],
    ["upstream_manifest = phase6_22_formal_run_review_and_closure_report.json", manifest["upstream_manifest"] === "phase6_22_formal_run_review_and_closure_report.json"],
    ["upstream_artifact_type = formal_run_review_and_closure_report", manifest["upstream_artifact_type"] === "formal_run_review_and_closure_report"],
    ["upstream_closure_status = closed", manifest["upstream_closure_status"] === "closed"],
    ["upstream_closure_result = pass", manifest["upstream_closure_result"] === "pass"],

    // ─── Batch identity ───────────────────────────────────────
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── Operational gates — all false except ai_learning_request_creation_allowed ──
    ["crawler_allowed = false", manifest["crawler_allowed"] === false],
    ["renderer_allowed = false", manifest["renderer_allowed"] === false],
    ["recovery_allowed = false", manifest["recovery_allowed"] === false],
    ["web_requests_allowed = false", manifest["web_requests_allowed"] === false],
    ["source_layer_modification_allowed = false", manifest["source_layer_modification_allowed"] === false],
    ["ai_learning_content_generation_allowed = false", manifest["ai_learning_content_generation_allowed"] === false],
    ["ai_learning_request_creation_allowed = true", manifest["ai_learning_request_creation_allowed"] === true],
    ["phase7_1_entry_allowed = false", manifest["phase7_1_entry_allowed"] === false],

    // ─── No actual content generation ─────────────────────────
    ["actual_generated_outputs is empty array", Array.isArray(actualGeneratedOutputs) && actualGeneratedOutputs.length === 0],

    // ─── Requested future outputs enum integrity ──────────────
    ["requested_future_outputs has 8 items", requestedFutureOutputs.length === 8],
    ["requested_future_outputs contains all 8 expected outputs", expectedFutureOutputs.every((o) => requestedFutureOutputs.includes(o))],
    ["requested_future_outputs has no duplicates", new Set(requestedFutureOutputs).size === requestedFutureOutputs.length],

    // ─── Scope ────────────────────────────────────────────────
    ["scope.allowed_source_basis = closed_pass_phase6_1_batch_001_only", scope["allowed_source_basis"] === "closed_pass_phase6_1_batch_001_only"],
    ["scope.unapproved_sources_allowed = false", scope["unapproved_sources_allowed"] === false],
    ["scope.external_sources_allowed = false", scope["external_sources_allowed"] === false],
    ["scope.source_expansion_allowed = false", scope["source_expansion_allowed"] === false],

    // ─── Risk ─────────────────────────────────────────────────
    ["risk.risk_level = low", risk["risk_level"] === "low"],
    ["risk.risk_reason is string", typeof risk["risk_reason"] === "string"],

    // ─── Closure ──────────────────────────────────────────────
    ["closure.phase7_0_status = complete", closure["phase7_0_status"] === "complete"],
    ["closure.phase7_0_result = pass", closure["phase7_0_result"] === "pass"],

    // ─── Next phase recommendation ────────────────────────────
    ["next_phase_recommendation.next_recommended_phase = phase7.1_ai_learning_generation_execution", nextPhaseRecommendation["next_recommended_phase"] === "phase7.1_ai_learning_generation_execution"],
    ["next_phase_recommendation.phase7_1_entry_allowed = false", nextPhaseRecommendation["phase7_1_entry_allowed"] === false],
    ["next_phase_recommendation.phase7_1_entry_requires_approval = true", nextPhaseRecommendation["phase7_1_entry_requires_approval"] === true],

    // ─── Rollback condition ───────────────────────────────────
    ["rollback_condition.phase7_0_rollback_needed = false", rollbackCondition["phase7_0_rollback_needed"] === false],

    // ─── Audit condition ──────────────────────────────────────
    ["audit_condition.upstream_phase_chain_complete = true", auditCondition["upstream_phase_chain_complete"] === true],
    ["audit_condition.upstream_closure_status = closed", auditCondition["upstream_closure_status"] === "closed"],
    ["audit_condition.upstream_closure_result = pass", auditCondition["upstream_closure_result"] === "pass"],
    ["audit_condition.request_mode = request_only", auditCondition["request_mode"] === "request_only"],
    ["audit_condition.actual_generated_outputs_empty = true", auditCondition["actual_generated_outputs_empty"] === true],
    ["audit_condition.validation_commands is array", Array.isArray(auditCondition["validation_commands"])],
    ["audit_condition.commit_scope is string", typeof auditCondition["commit_scope"] === "string"],

    // ─── Validation expectations ──────────────────────────────
    ["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"],
    ["validation_expectations.invariant_checks = must_pass", validationExpectations["invariant_checks"] === "must_pass"],
    ["validation_expectations.phase_must_be = 7.0", validationExpectations["phase_must_be"] === "7.0"],
    ["validation_expectations.artifact_type_must_be = ai_learning_generation_request", validationExpectations["artifact_type_must_be"] === "ai_learning_generation_request"],
    ["validation_expectations.request_mode_must_be = request_only", validationExpectations["request_mode_must_be"] === "request_only"],
    ["validation_expectations.batch_id_must_be = phase6_1_batch_001", validationExpectations["batch_id_must_be"] === "phase6_1_batch_001"],
    ["validation_expectations.upstream_phase_must_be = 6.22", validationExpectations["upstream_phase_must_be"] === "6.22"],
    ["validation_expectations.upstream_closure_status_must_be = closed", validationExpectations["upstream_closure_status_must_be"] === "closed"],
    ["validation_expectations.upstream_closure_result_must_be = pass", validationExpectations["upstream_closure_result_must_be"] === "pass"],
    ["validation_expectations.ai_learning_content_generation_allowed_must_be = false", validationExpectations["ai_learning_content_generation_allowed_must_be"] === false],
    ["validation_expectations.ai_learning_request_creation_allowed_must_be = true", validationExpectations["ai_learning_request_creation_allowed_must_be"] === true],
    ["validation_expectations.phase7_1_entry_allowed_must_be = false", validationExpectations["phase7_1_entry_allowed_must_be"] === false],
    ["validation_expectations.actual_generated_outputs_must_be_empty = true", validationExpectations["actual_generated_outputs_must_be_empty"] === true],
    ["validation_expectations.requested_future_outputs_count_must_be = 8", validationExpectations["requested_future_outputs_count_must_be"] === 8],
    ["validation_expectations.risk_level_must_be = low", validationExpectations["risk_level_must_be"] === "low"],
    ["validation_expectations.closure_status_must_be = complete", validationExpectations["closure_status_must_be"] === "complete"],
    ["validation_expectations.closure_result_must_be = pass", validationExpectations["closure_result_must_be"] === "pass"],
  ];

  // ─── Run checks ──────────────────────────────────────────
  let passed = 0;
  let failed = 0;
  for (const [label, ok] of checks) {
    if (ok) {
      console.log(`  [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${label}`);
      failed++;
    }
  }

  console.log(`\n[validate:ai-learning-generation-request] Invariant checks: ${passed} passed, ${failed} failed, ${checks.length} total`);

  if (failed > 0) {
    fail(`${failed} invariant check(s) failed`);
  }

  console.log("[validate:ai-learning-generation-request] All checks: PASS");
}

main();
