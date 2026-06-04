/**
 * Phase 7.2 AI Learning Generation Execution Plan validator.
 *
 * Validates the generated phase7_2_ai_learning_generation_execution_plan.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * Usage:
 *   pnpm validate:ai-learning-generation-execution-plan
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-generation-execution-plan.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase7_2_ai_learning_generation_execution_plan.json");

function fail(message: string): never {
  console.error(`[validate:ai-learning-generation-execution-plan] ERROR: ${message}`);
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
  console.log("[validate:ai-learning-generation-execution-plan] Phase 7.2 AI Learning Generation Execution Plan validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:ai-learning-generation-execution-plan] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:ai-learning-generation-execution-plan] Schema validation: PASS");

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

  const plannedOutputs = manifest["planned_outputs"] as Array<Record<string, unknown>> | undefined;
  if (!plannedOutputs) fail("planned_outputs missing");

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

  const plannedOutputNames = plannedOutputs.map((o) => o["name"] as string);
  const allPlannedStatusArePlanned = plannedOutputs.every((o) => o["status"] === "planned");

  const checks: Array<[string, boolean]> = [
    // ─── Phase identity ───────────────────────────────────────
    ["manifest_version = phase7.2", manifest["manifest_version"] === "phase7.2"],
    ["phase = 7.2", manifest["phase"] === "7.2"],

    // ─── Artifact identity ────────────────────────────────────
    ["manifest_type = ai_learning_generation_execution_plan", manifest["manifest_type"] === "ai_learning_generation_execution_plan"],
    ["artifact_type = ai_learning_generation_execution_plan", manifest["artifact_type"] === "ai_learning_generation_execution_plan"],
    ["status = ai_learning_generation_execution_plan_created", manifest["status"] === "ai_learning_generation_execution_plan_created"],
    ["created_for_phase = 7.2", manifest["created_for_phase"] === "7.2"],

    // ─── Execution plan identity ──────────────────────────────
    ["execution_plan_status = planned", manifest["execution_plan_status"] === "planned"],
    ["execution_mode = offline_existing_source_packet_only", manifest["execution_mode"] === "offline_existing_source_packet_only"],
    ["execution_status = not_started", manifest["execution_status"] === "not_started"],

    // ─── Upstream linkage ─────────────────────────────────────
    ["upstream_phase = 7.1", manifest["upstream_phase"] === "7.1"],
    ["upstream_manifest = phase7_1_ai_learning_generation_approval_gate.json", manifest["upstream_manifest"] === "phase7_1_ai_learning_generation_approval_gate.json"],
    ["upstream_artifact_type = ai_learning_generation_approval_gate", manifest["upstream_artifact_type"] === "ai_learning_generation_approval_gate"],
    ["upstream_approval_status = ai_learning_generation_approved", manifest["upstream_approval_status"] === "ai_learning_generation_approved"],
    ["upstream_ai_learning_generation_approved = true", manifest["upstream_ai_learning_generation_approved"] === true],

    // ─── Batch identity ───────────────────────────────────────
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── Operational gates ────────────────────────────────────
    ["crawler_allowed = false", manifest["crawler_allowed"] === false],
    ["renderer_allowed = false", manifest["renderer_allowed"] === false],
    ["recovery_allowed = false", manifest["recovery_allowed"] === false],
    ["web_requests_allowed = false", manifest["web_requests_allowed"] === false],
    ["source_layer_modification_allowed = false", manifest["source_layer_modification_allowed"] === false],
    ["ai_learning_content_generation_allowed = true", manifest["ai_learning_content_generation_allowed"] === true],
    ["ai_learning_request_creation_allowed = true", manifest["ai_learning_request_creation_allowed"] === true],
    ["phase7_2_entry_allowed = true", manifest["phase7_2_entry_allowed"] === true],
    ["phase7_3_entry_allowed = false", manifest["phase7_3_entry_allowed"] === false],

    // ─── No actual content generation ─────────────────────────
    ["actual_generated_outputs is empty array", Array.isArray(actualGeneratedOutputs) && actualGeneratedOutputs.length === 0],

    // ─── Planned outputs ──────────────────────────────────────
    ["planned_outputs has 8 items", plannedOutputs.length === 8],
    ["planned_outputs contains all 8 expected names", expectedOutputNames.every((o) => plannedOutputNames.includes(o))],
    ["planned_outputs has no duplicate names", new Set(plannedOutputNames).size === plannedOutputNames.length],
    ["all planned_outputs status = planned", allPlannedStatusArePlanned],

    // ─── Scope ────────────────────────────────────────────────
    ["scope.allowed_source_basis = closed_pass_phase6_1_batch_001_only", scope["allowed_source_basis"] === "closed_pass_phase6_1_batch_001_only"],
    ["scope.unapproved_sources_allowed = false", scope["unapproved_sources_allowed"] === false],
    ["scope.external_sources_allowed = false", scope["external_sources_allowed"] === false],
    ["scope.source_expansion_allowed = false", scope["source_expansion_allowed"] === false],
    ["scope.generation_mode = offline_existing_source_packet_only", scope["generation_mode"] === "offline_existing_source_packet_only"],
    ["scope.source_packet_boundary = frozen_after_phase6_22_closure", scope["source_packet_boundary"] === "frozen_after_phase6_22_closure"],

    // ─── Risk ─────────────────────────────────────────────────
    ["risk.risk_level = low", risk["risk_level"] === "low"],
    ["risk.risk_reason is string", typeof risk["risk_reason"] === "string"],

    // ─── Closure ──────────────────────────────────────────────
    ["closure.phase7_2_status = complete", closure["phase7_2_status"] === "complete"],
    ["closure.phase7_2_result = pass", closure["phase7_2_result"] === "pass"],

    // ─── Next phase recommendation ────────────────────────────
    ["next_phase_recommendation.next_recommended_phase = phase7.3_ai_learning_generation_validation", nextPhaseRecommendation["next_recommended_phase"] === "phase7.3_ai_learning_generation_validation"],
    ["next_phase_recommendation.phase7_3_entry_allowed = false", nextPhaseRecommendation["phase7_3_entry_allowed"] === false],
    ["next_phase_recommendation.phase7_3_entry_requires_approval = true", nextPhaseRecommendation["phase7_3_entry_requires_approval"] === true],

    // ─── Rollback condition ───────────────────────────────────
    ["rollback_condition.phase7_2_rollback_needed = false", rollbackCondition["phase7_2_rollback_needed"] === false],

    // ─── Audit condition ──────────────────────────────────────
    ["audit_condition.upstream_phase = 7.1", auditCondition["upstream_phase"] === "7.1"],
    ["audit_condition.upstream_approval_status = ai_learning_generation_approved", auditCondition["upstream_approval_status"] === "ai_learning_generation_approved"],
    ["audit_condition.upstream_ai_learning_generation_approved = true", auditCondition["upstream_ai_learning_generation_approved"] === true],
    ["audit_condition.current_execution_plan_status = planned", auditCondition["current_execution_plan_status"] === "planned"],
    ["audit_condition.current_execution_status = not_started", auditCondition["current_execution_status"] === "not_started"],
    ["audit_condition.current_ai_learning_content_generation_allowed = true", auditCondition["current_ai_learning_content_generation_allowed"] === true],
    ["audit_condition.current_phase7_2_entry_allowed = true", auditCondition["current_phase7_2_entry_allowed"] === true],
    ["audit_condition.current_phase7_3_entry_allowed = false", auditCondition["current_phase7_3_entry_allowed"] === false],
    ["audit_condition.planned_output_count = 8", auditCondition["planned_output_count"] === 8],
    ["audit_condition.actual_generated_outputs_empty = true", auditCondition["actual_generated_outputs_empty"] === true],
    ["audit_condition.source_packet_boundary_frozen = true", auditCondition["source_packet_boundary_frozen"] === true],
    ["audit_condition.validation_commands is array", Array.isArray(auditCondition["validation_commands"])],
    ["audit_condition.commit_scope is string", typeof auditCondition["commit_scope"] === "string"],

    // ─── Phase progression history ────────────────────────────
    ["phase_progression_history has 3 entries", phaseProgressionHistory.length === 3],
    ["phase_progression_history[0].phase = 7.0", phaseProgressionHistory[0]?.["phase"] === "7.0"],
    ["phase_progression_history[0].outcome = ai_learning_generation_request_created", phaseProgressionHistory[0]?.["outcome"] === "ai_learning_generation_request_created"],
    ["phase_progression_history[1].phase = 7.1", phaseProgressionHistory[1]?.["phase"] === "7.1"],
    ["phase_progression_history[1].outcome = ai_learning_generation_approval_gate_recorded", phaseProgressionHistory[1]?.["outcome"] === "ai_learning_generation_approval_gate_recorded"],
    ["phase_progression_history[2].phase = 7.2", phaseProgressionHistory[2]?.["phase"] === "7.2"],
    ["phase_progression_history[2].outcome = ai_learning_generation_execution_plan_created", phaseProgressionHistory[2]?.["outcome"] === "ai_learning_generation_execution_plan_created"],

    // ─── Validation expectations ──────────────────────────────
    ["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"],
    ["validation_expectations.invariant_checks = must_pass", validationExpectations["invariant_checks"] === "must_pass"],
    ["validation_expectations.phase_must_be = 7.2", validationExpectations["phase_must_be"] === "7.2"],
    ["validation_expectations.artifact_type_must_be = ai_learning_generation_execution_plan", validationExpectations["artifact_type_must_be"] === "ai_learning_generation_execution_plan"],
    ["validation_expectations.execution_plan_status_must_be = planned", validationExpectations["execution_plan_status_must_be"] === "planned"],
    ["validation_expectations.execution_mode_must_be = offline_existing_source_packet_only", validationExpectations["execution_mode_must_be"] === "offline_existing_source_packet_only"],
    ["validation_expectations.execution_status_must_be = not_started", validationExpectations["execution_status_must_be"] === "not_started"],
    ["validation_expectations.upstream_phase_must_be = 7.1", validationExpectations["upstream_phase_must_be"] === "7.1"],
    ["validation_expectations.upstream_approval_status_must_be = ai_learning_generation_approved", validationExpectations["upstream_approval_status_must_be"] === "ai_learning_generation_approved"],
    ["validation_expectations.upstream_ai_learning_generation_approved_must_be = true", validationExpectations["upstream_ai_learning_generation_approved_must_be"] === true],
    ["validation_expectations.batch_id_must_be = phase6_1_batch_001", validationExpectations["batch_id_must_be"] === "phase6_1_batch_001"],
    ["validation_expectations.ai_learning_content_generation_allowed_must_be = true", validationExpectations["ai_learning_content_generation_allowed_must_be"] === true],
    ["validation_expectations.phase7_2_entry_allowed_must_be = true", validationExpectations["phase7_2_entry_allowed_must_be"] === true],
    ["validation_expectations.phase7_3_entry_allowed_must_be = false", validationExpectations["phase7_3_entry_allowed_must_be"] === false],
    ["validation_expectations.crawler_allowed_must_be = false", validationExpectations["crawler_allowed_must_be"] === false],
    ["validation_expectations.renderer_allowed_must_be = false", validationExpectations["renderer_allowed_must_be"] === false],
    ["validation_expectations.recovery_allowed_must_be = false", validationExpectations["recovery_allowed_must_be"] === false],
    ["validation_expectations.web_requests_allowed_must_be = false", validationExpectations["web_requests_allowed_must_be"] === false],
    ["validation_expectations.source_layer_modification_allowed_must_be = false", validationExpectations["source_layer_modification_allowed_must_be"] === false],
    ["validation_expectations.actual_generated_outputs_must_be_empty = true", validationExpectations["actual_generated_outputs_must_be_empty"] === true],
    ["validation_expectations.planned_output_count_must_be = 8", validationExpectations["planned_output_count_must_be"] === 8],
    ["validation_expectations.all_planned_outputs_status_must_be_planned = true", validationExpectations["all_planned_outputs_status_must_be_planned"] === true],
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

  console.log(`\n[validate:ai-learning-generation-execution-plan] Invariant checks: ${passed} passed, ${failed} failed, ${checks.length} total`);

  if (failed > 0) {
    fail(`${failed} invariant check(s) failed`);
  }

  console.log("[validate:ai-learning-generation-execution-plan] All checks: PASS");
}

main();
