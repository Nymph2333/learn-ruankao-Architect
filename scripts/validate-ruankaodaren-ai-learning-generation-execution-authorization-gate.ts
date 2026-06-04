/**
 * Phase 7.3 AI Learning Generation Execution Authorization Gate validator.
 *
 * Validates the generated phase7_3_ai_learning_generation_execution_authorization_gate.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * Usage:
 *   pnpm validate:ai-learning-generation-execution-authorization-gate
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-generation-execution-authorization-gate.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase7_3_ai_learning_generation_execution_authorization_gate.json");

function fail(message: string): never {
  console.error(`[validate:ai-learning-generation-execution-authorization-gate] ERROR: ${message}`);
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
  console.log("[validate:ai-learning-generation-execution-authorization-gate] Phase 7.3 AI Learning Generation Execution Authorization Gate validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:ai-learning-generation-execution-authorization-gate] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:ai-learning-generation-execution-authorization-gate] Schema validation: PASS");

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

  const authorizedFutureOutputs = manifest["authorized_future_outputs"] as string[] | undefined;
  if (!authorizedFutureOutputs) fail("authorized_future_outputs missing");

  const actualGeneratedOutputs = manifest["actual_generated_outputs"] as string[] | undefined;
  if (!actualGeneratedOutputs) fail("actual_generated_outputs missing");

  const phaseProgressionHistory = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (!phaseProgressionHistory) fail("phase_progression_history missing");

  const expectedOutputNames = [
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
    ["manifest_version = phase7.3", manifest["manifest_version"] === "phase7.3"],
    ["phase = 7.3", manifest["phase"] === "7.3"],

    // ─── Artifact identity ────────────────────────────────────
    ["manifest_type = ai_learning_generation_execution_authorization_gate", manifest["manifest_type"] === "ai_learning_generation_execution_authorization_gate"],
    ["artifact_type = ai_learning_generation_execution_authorization_gate", manifest["artifact_type"] === "ai_learning_generation_execution_authorization_gate"],
    ["status = ai_learning_generation_execution_authorization_gate_created", manifest["status"] === "ai_learning_generation_execution_authorization_gate_created"],
    ["created_for_phase = 7.3", manifest["created_for_phase"] === "7.3"],

    // ─── Authorization-only mode ──────────────────────────────
    ["authorization_status = authorized", manifest["authorization_status"] === "authorized"],
    ["authorization_result = pass", manifest["authorization_result"] === "pass"],
    ["authorization_mode = authorization_only", manifest["authorization_mode"] === "authorization_only"],

    // ─── Upstream Phase 7.2 linkage ───────────────────────────
    ["upstream_phase = 7.2", manifest["upstream_phase"] === "7.2"],
    ["upstream_manifest = phase7_2_ai_learning_generation_execution_plan.json", manifest["upstream_manifest"] === "phase7_2_ai_learning_generation_execution_plan.json"],
    ["upstream_artifact_type = ai_learning_generation_execution_plan", manifest["upstream_artifact_type"] === "ai_learning_generation_execution_plan"],

    // ─── Upstream commit linkage ──────────────────────────────
    ["upstream_commit = 6f0ac44", manifest["upstream_commit"] === "6f0ac44"],

    // ─── Upstream execution plan status ───────────────────────
    ["upstream_execution_plan_status = planned", manifest["upstream_execution_plan_status"] === "planned"],
    ["upstream_execution_status = not_started", manifest["upstream_execution_status"] === "not_started"],
    ["upstream_execution_mode = offline_existing_source_packet_only", manifest["upstream_execution_mode"] === "offline_existing_source_packet_only"],
    ["upstream_ai_learning_content_generation_allowed = true", manifest["upstream_ai_learning_content_generation_allowed"] === true],

    // ─── Batch identity ───────────────────────────────────────
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── Authorized execution ─────────────────────────────────
    ["authorized_execution_phase = 7.4", manifest["authorized_execution_phase"] === "7.4"],
    ["authorized_execution_mode = offline_existing_source_packet_only", manifest["authorized_execution_mode"] === "offline_existing_source_packet_only"],

    // ─── No crawler / renderer / recovery / web request ───────
    ["crawler_allowed = false", manifest["crawler_allowed"] === false],
    ["renderer_allowed = false", manifest["renderer_allowed"] === false],
    ["recovery_allowed = false", manifest["recovery_allowed"] === false],
    ["web_requests_allowed = false", manifest["web_requests_allowed"] === false],

    // ─── No source-layer mutation ─────────────────────────────
    ["source_layer_modification_allowed = false", manifest["source_layer_modification_allowed"] === false],

    // ─── No actual learning content generation in Phase 7.3 ──
    ["ai_learning_content_generation_allowed = false", manifest["ai_learning_content_generation_allowed"] === false],
    ["ai_learning_execution_authorization_allowed = true", manifest["ai_learning_execution_authorization_allowed"] === true],
    ["ai_learning_request_creation_allowed = true", manifest["ai_learning_request_creation_allowed"] === true],

    // ─── Phase 7.4 entry ──────────────────────────────────────
    ["phase7_3_entry_allowed = true", manifest["phase7_3_entry_allowed"] === true],
    ["phase7_4_entry_allowed = true", manifest["phase7_4_entry_allowed"] === true],

    // ─── Actual generated outputs must be empty ───────────────
    ["actual_generated_outputs is empty array", Array.isArray(actualGeneratedOutputs) && actualGeneratedOutputs.length === 0],

    // ─── Authorized future output enum integrity ──────────────
    ["authorized_future_outputs has 8 items", authorizedFutureOutputs.length === 8],
    ["authorized_future_outputs contains all 8 expected names", expectedOutputNames.every((o) => authorizedFutureOutputs.includes(o))],
    ["authorized_future_outputs has no duplicate names", new Set(authorizedFutureOutputs).size === authorizedFutureOutputs.length],

    // ─── Scope ────────────────────────────────────────────────
    ["scope.allowed_source_basis = closed_pass_phase6_1_batch_001_only", scope["allowed_source_basis"] === "closed_pass_phase6_1_batch_001_only"],
    ["scope.unapproved_sources_allowed = false", scope["unapproved_sources_allowed"] === false],
    ["scope.external_sources_allowed = false", scope["external_sources_allowed"] === false],
    ["scope.source_expansion_allowed = false", scope["source_expansion_allowed"] === false],
    ["scope.offline_only = true", scope["offline_only"] === true],

    // ─── Risk ─────────────────────────────────────────────────
    ["risk.risk_level = low", risk["risk_level"] === "low"],
    ["risk.risk_reason is string", typeof risk["risk_reason"] === "string"],

    // ─── Closure ──────────────────────────────────────────────
    ["closure.phase7_3_status = complete", closure["phase7_3_status"] === "complete"],
    ["closure.phase7_3_result = pass", closure["phase7_3_result"] === "pass"],

    // ─── Next phase recommendation ────────────────────────────
    ["next_phase_recommendation.next_recommended_phase = phase7.4_ai_learning_generation_execution", nextPhaseRecommendation["next_recommended_phase"] === "phase7.4_ai_learning_generation_execution"],
    ["next_phase_recommendation.phase7_4_entry_allowed = true", nextPhaseRecommendation["phase7_4_entry_allowed"] === true],
    ["next_phase_recommendation.phase7_4_entry_requires_authorization_gate = true", nextPhaseRecommendation["phase7_4_entry_requires_authorization_gate"] === true],

    // ─── Rollback condition ───────────────────────────────────
    ["rollback_condition.phase7_3_rollback_needed = false", rollbackCondition["phase7_3_rollback_needed"] === false],

    // ─── Audit condition ──────────────────────────────────────
    ["audit_condition.upstream_phase = 7.2", auditCondition["upstream_phase"] === "7.2"],
    ["audit_condition.upstream_artifact_type = ai_learning_generation_execution_plan", auditCondition["upstream_artifact_type"] === "ai_learning_generation_execution_plan"],
    ["audit_condition.upstream_commit = 6f0ac44", auditCondition["upstream_commit"] === "6f0ac44"],
    ["audit_condition.upstream_execution_plan_status = planned", auditCondition["upstream_execution_plan_status"] === "planned"],
    ["audit_condition.upstream_execution_status = not_started", auditCondition["upstream_execution_status"] === "not_started"],
    ["audit_condition.upstream_execution_mode = offline_existing_source_packet_only", auditCondition["upstream_execution_mode"] === "offline_existing_source_packet_only"],
    ["audit_condition.upstream_ai_learning_content_generation_allowed = true", auditCondition["upstream_ai_learning_content_generation_allowed"] === true],
    ["audit_condition.current_authorization_status = authorized", auditCondition["current_authorization_status"] === "authorized"],
    ["audit_condition.current_authorization_result = pass", auditCondition["current_authorization_result"] === "pass"],
    ["audit_condition.current_ai_learning_content_generation_allowed = false", auditCondition["current_ai_learning_content_generation_allowed"] === false],
    ["audit_condition.current_phase7_4_entry_allowed = true", auditCondition["current_phase7_4_entry_allowed"] === true],
    ["audit_condition.authorized_future_output_count = 8", auditCondition["authorized_future_output_count"] === 8],
    ["audit_condition.actual_generated_outputs_empty = true", auditCondition["actual_generated_outputs_empty"] === true],
    ["audit_condition.validation_commands is array", Array.isArray(auditCondition["validation_commands"])],
    ["audit_condition.commit_scope is string", typeof auditCondition["commit_scope"] === "string"],

    // ─── Phase progression history ────────────────────────────
    ["phase_progression_history has 4 entries", phaseProgressionHistory.length === 4],
    ["phase_progression_history[0].phase = 7.0", phaseProgressionHistory[0]?.["phase"] === "7.0"],
    ["phase_progression_history[0].outcome = ai_learning_generation_request_created", phaseProgressionHistory[0]?.["outcome"] === "ai_learning_generation_request_created"],
    ["phase_progression_history[1].phase = 7.1", phaseProgressionHistory[1]?.["phase"] === "7.1"],
    ["phase_progression_history[1].outcome = ai_learning_generation_approval_gate_recorded", phaseProgressionHistory[1]?.["outcome"] === "ai_learning_generation_approval_gate_recorded"],
    ["phase_progression_history[2].phase = 7.2", phaseProgressionHistory[2]?.["phase"] === "7.2"],
    ["phase_progression_history[2].outcome = ai_learning_generation_execution_plan_created", phaseProgressionHistory[2]?.["outcome"] === "ai_learning_generation_execution_plan_created"],
    ["phase_progression_history[3].phase = 7.3", phaseProgressionHistory[3]?.["phase"] === "7.3"],
    ["phase_progression_history[3].outcome = ai_learning_generation_execution_authorization_gate_created", phaseProgressionHistory[3]?.["outcome"] === "ai_learning_generation_execution_authorization_gate_created"],

    // ─── Validation expectations ──────────────────────────────
    ["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"],
    ["validation_expectations.invariant_checks = must_pass", validationExpectations["invariant_checks"] === "must_pass"],
    ["validation_expectations.phase_must_be = 7.3", validationExpectations["phase_must_be"] === "7.3"],
    ["validation_expectations.artifact_type_must_be = ai_learning_generation_execution_authorization_gate", validationExpectations["artifact_type_must_be"] === "ai_learning_generation_execution_authorization_gate"],
    ["validation_expectations.authorization_status_must_be = authorized", validationExpectations["authorization_status_must_be"] === "authorized"],
    ["validation_expectations.authorization_result_must_be = pass", validationExpectations["authorization_result_must_be"] === "pass"],
    ["validation_expectations.authorization_mode_must_be = authorization_only", validationExpectations["authorization_mode_must_be"] === "authorization_only"],
    ["validation_expectations.upstream_phase_must_be = 7.2", validationExpectations["upstream_phase_must_be"] === "7.2"],
    ["validation_expectations.upstream_artifact_type_must_be = ai_learning_generation_execution_plan", validationExpectations["upstream_artifact_type_must_be"] === "ai_learning_generation_execution_plan"],
    ["validation_expectations.upstream_commit_must_be = 6f0ac44", validationExpectations["upstream_commit_must_be"] === "6f0ac44"],
    ["validation_expectations.upstream_execution_plan_status_must_be = planned", validationExpectations["upstream_execution_plan_status_must_be"] === "planned"],
    ["validation_expectations.upstream_execution_status_must_be = not_started", validationExpectations["upstream_execution_status_must_be"] === "not_started"],
    ["validation_expectations.upstream_execution_mode_must_be = offline_existing_source_packet_only", validationExpectations["upstream_execution_mode_must_be"] === "offline_existing_source_packet_only"],
    ["validation_expectations.upstream_ai_learning_content_generation_allowed_must_be = true", validationExpectations["upstream_ai_learning_content_generation_allowed_must_be"] === true],
    ["validation_expectations.batch_id_must_be = phase6_1_batch_001", validationExpectations["batch_id_must_be"] === "phase6_1_batch_001"],
    ["validation_expectations.authorized_execution_phase_must_be = 7.4", validationExpectations["authorized_execution_phase_must_be"] === "7.4"],
    ["validation_expectations.authorized_execution_mode_must_be = offline_existing_source_packet_only", validationExpectations["authorized_execution_mode_must_be"] === "offline_existing_source_packet_only"],
    ["validation_expectations.ai_learning_content_generation_allowed_must_be = false", validationExpectations["ai_learning_content_generation_allowed_must_be"] === false],
    ["validation_expectations.ai_learning_execution_authorization_allowed_must_be = true", validationExpectations["ai_learning_execution_authorization_allowed_must_be"] === true],
    ["validation_expectations.phase7_4_entry_allowed_must_be = true", validationExpectations["phase7_4_entry_allowed_must_be"] === true],
    ["validation_expectations.crawler_allowed_must_be = false", validationExpectations["crawler_allowed_must_be"] === false],
    ["validation_expectations.renderer_allowed_must_be = false", validationExpectations["renderer_allowed_must_be"] === false],
    ["validation_expectations.recovery_allowed_must_be = false", validationExpectations["recovery_allowed_must_be"] === false],
    ["validation_expectations.web_requests_allowed_must_be = false", validationExpectations["web_requests_allowed_must_be"] === false],
    ["validation_expectations.source_layer_modification_allowed_must_be = false", validationExpectations["source_layer_modification_allowed_must_be"] === false],
    ["validation_expectations.actual_generated_outputs_must_be_empty = true", validationExpectations["actual_generated_outputs_must_be_empty"] === true],
    ["validation_expectations.authorized_future_output_count_must_be = 8", validationExpectations["authorized_future_output_count_must_be"] === 8],
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

  console.log(`\n[validate:ai-learning-generation-execution-authorization-gate] Invariant checks: ${passed} passed, ${failed} failed, ${checks.length} total`);

  if (failed > 0) {
    fail(`${failed} invariant check(s) failed`);
  }

  console.log("[validate:ai-learning-generation-execution-authorization-gate] All checks: PASS");
}

main();
