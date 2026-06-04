/**
 * Phase 7.4 AI Learning Generation Execution validator.
 *
 * Validates the generated phase7_4_ai_learning_generation_execution.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * Usage:
 *   pnpm validate:ai-learning-generation-execution
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-generation-execution.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase7_4_ai_learning_generation_execution.json");

function fail(message: string): never {
  console.error(`[validate:ai-learning-generation-execution] ERROR: ${message}`);
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
  console.log("[validate:ai-learning-generation-execution] Phase 7.4 AI Learning Generation Execution validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:ai-learning-generation-execution] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:ai-learning-generation-execution] Schema validation: PASS");

  // Extract nested objects
  const ua = manifest["upstream_authorization"] as Record<string, unknown> | undefined;
  if (!ua) fail("upstream_authorization missing");

  const uep = manifest["upstream_execution_plan"] as Record<string, unknown> | undefined;
  if (!uep) fail("upstream_execution_plan missing");

  const uc = manifest["upstream_closure"] as Record<string, unknown> | undefined;
  if (!uc) fail("upstream_closure missing");

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

  const gqc = manifest["generation_quality_controls"] as Record<string, unknown> | undefined;
  if (!gqc) fail("generation_quality_controls missing");

  const ve = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (!ve) fail("validation_expectations missing");

  const generatedOutputs = manifest["generated_outputs"] as Array<Record<string, unknown>> | undefined;
  if (!generatedOutputs) fail("generated_outputs missing");

  const unsupportedItems = manifest["unsupported_generation_items"] as Array<Record<string, unknown>> | undefined;
  if (!unsupportedItems) fail("unsupported_generation_items missing");

  const history = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (!history) fail("phase_progression_history missing");

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

  // Compute derived values
  let totalGeneratedItems = 0;
  let allItemsHaveSourceRefs = true;
  let allSourceRefsApproved = true;
  let allConfidenceValid = true;
  let allItemStatusesValid = true;
  let allPracticeQuestionsValid = true;

  const approvedSourceIds = [
    "ruankaodaren/baseline/1.3_指令系统CISC和RISC",
    "ruankaodaren/baseline/13.3_软件架构风格",
    "ruankaodaren/baseline/9.1_信息安全基础知识",
  ];

  const validConfidenceLevels = ["high", "medium", "low"];
  const validGenerationStatuses = ["generated", "not_generated", "insufficient_source_basis"];
  const validQuestionTypes = ["single_choice", "multiple_choice", "true_false", "fill_in_blank", "short_answer"];

  for (const group of generatedOutputs) {
    const items = group["items"] as Array<Record<string, unknown>> | undefined;
    if (!items) continue;
    totalGeneratedItems += items.length;
    for (const item of items) {
      const sourceRefs = item["source_refs"] as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(sourceRefs) || sourceRefs.length === 0) {
        allItemsHaveSourceRefs = false;
      }
      for (const ref of sourceRefs ?? []) {
        if (!ref["evidence"] || String(ref["evidence"]).trim().length === 0) {
          allItemsHaveSourceRefs = false;
        }
        if (!approvedSourceIds.includes(String(ref["source_packet_id"]))) {
          allSourceRefsApproved = false;
        }
        if (!validConfidenceLevels.includes(String(ref["confidence"]))) {
          allConfidenceValid = false;
        }
      }
      if (!validGenerationStatuses.includes(String(item["generation_status"]))) {
        allItemStatusesValid = false;
      }
      // Check practice question fields
      if (group["output_type"] === "practice_questions") {
        if (!item["question_type"] || !item["question"] || !item["correct_answer"]) {
          allPracticeQuestionsValid = false;
        }
        if (!validQuestionTypes.includes(String(item["question_type"]))) {
          allPracticeQuestionsValid = false;
        }
      }
    }
  }

  const actualOutputTypes = generatedOutputs.map((o) => String(o["output_type"]));
  const historyPhases = history.map((h) => String(h["phase"]));

  const checks: Array<[string, boolean]> = [
    // ─── Phase identity ───────────────────────────────────────
    ["manifest_version = phase7.4", manifest["manifest_version"] === "phase7.4"],
    ["phase = 7.4", manifest["phase"] === "7.4"],

    // ─── Artifact identity ────────────────────────────────────
    ["manifest_type = ai_learning_generation_execution", manifest["manifest_type"] === "ai_learning_generation_execution"],
    ["artifact_type = ai_learning_generation_execution", manifest["artifact_type"] === "ai_learning_generation_execution"],
    ["status = ai_learning_generation_execution_completed", manifest["status"] === "ai_learning_generation_execution_completed"],
    ["created_for_phase = 7.4", manifest["created_for_phase"] === "7.4"],
    ["created_at is present", typeof manifest["created_at"] === "string"],

    // ─── Execution identity ───────────────────────────────────
    ["execution_status = completed", manifest["execution_status"] === "completed"],
    ["execution_result = pass", manifest["execution_result"] === "pass"],
    ["execution_mode = offline_existing_source_packet_only", manifest["execution_mode"] === "offline_existing_source_packet_only"],

    // ─── Upstream authorization (Phase 7.3) ───────────────────
    ["upstream_authorization.phase = 7.3", ua["phase"] === "7.3"],
    ["upstream_authorization.artifact_type = ai_learning_generation_execution_authorization_gate", ua["artifact_type"] === "ai_learning_generation_execution_authorization_gate"],
    ["upstream_authorization.commit = bc5f2af", ua["commit"] === "bc5f2af"],
    ["upstream_authorization.authorization_status = authorized", ua["authorization_status"] === "authorized"],
    ["upstream_authorization.authorization_result = pass", ua["authorization_result"] === "pass"],
    ["upstream_authorization.authorized_execution_phase = 7.4", ua["authorized_execution_phase"] === "7.4"],
    ["upstream_authorization.authorized_execution_mode = offline_existing_source_packet_only", ua["authorized_execution_mode"] === "offline_existing_source_packet_only"],
    ["upstream_authorization.phase7_4_entry_allowed = true", ua["phase7_4_entry_allowed"] === true],

    // ─── Upstream execution plan (Phase 7.2) ──────────────────
    ["upstream_execution_plan.phase = 7.2", uep["phase"] === "7.2"],
    ["upstream_execution_plan.artifact_type = ai_learning_generation_execution_plan", uep["artifact_type"] === "ai_learning_generation_execution_plan"],
    ["upstream_execution_plan.commit = 6f0ac44", uep["commit"] === "6f0ac44"],
    ["upstream_execution_plan.execution_plan_status = planned", uep["execution_plan_status"] === "planned"],
    ["upstream_execution_plan.execution_status = not_started", uep["execution_status"] === "not_started"],
    ["upstream_execution_plan.execution_mode = offline_existing_source_packet_only", uep["execution_mode"] === "offline_existing_source_packet_only"],

    // ─── Upstream closure (Phase 6.22) ────────────────────────
    ["upstream_closure.phase = 6.22", uc["phase"] === "6.22"],
    ["upstream_closure.closure_status = closed", uc["closure_status"] === "closed"],
    ["upstream_closure.closure_result = pass", uc["closure_result"] === "pass"],
    ["upstream_closure.batch_id = phase6_1_batch_001", uc["batch_id"] === "phase6_1_batch_001"],

    // ─── Batch identity ───────────────────────────────────────
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── No crawler / renderer / recovery / web request ───────
    ["crawler_allowed = false", manifest["crawler_allowed"] === false],
    ["renderer_allowed = false", manifest["renderer_allowed"] === false],
    ["recovery_allowed = false", manifest["recovery_allowed"] === false],
    ["web_requests_allowed = false", manifest["web_requests_allowed"] === false],

    // ─── No source-layer mutation ─────────────────────────────
    ["source_layer_modification_allowed = false", manifest["source_layer_modification_allowed"] === false],

    // ─── AI learning generation gates ─────────────────────────
    ["ai_learning_content_generation_allowed = true", manifest["ai_learning_content_generation_allowed"] === true],
    ["ai_learning_execution_allowed = true", manifest["ai_learning_execution_allowed"] === true],
    ["ai_learning_request_creation_allowed = true", manifest["ai_learning_request_creation_allowed"] === true],

    // ─── Phase entry gates ────────────────────────────────────
    ["phase7_4_entry_allowed = true", manifest["phase7_4_entry_allowed"] === true],
    ["phase7_5_entry_allowed = false", manifest["phase7_5_entry_allowed"] === false],

    // ─── Generated outputs structure ──────────────────────────
    ["generated_outputs is array", Array.isArray(generatedOutputs)],
    ["generated_outputs has exactly 8 groups", generatedOutputs.length === 8],
    ["generated_outputs includes all 8 expected types", expectedOutputTypes.every((o) => actualOutputTypes.includes(o))],
    ["generated_outputs has no duplicate types", new Set(actualOutputTypes).size === actualOutputTypes.length],

    // ─── Generated items traceability ─────────────────────────
    ["all generated items have non-empty source_refs", allItemsHaveSourceRefs],
    ["all source_refs reference approved source packets", allSourceRefsApproved],
    ["all confidence levels are valid", allConfidenceValid],
    ["all item generation_status values are valid", allItemStatusesValid],
    ["total_generated_items matches audit_condition", totalGeneratedItems === ac["total_generated_items"]],

    // ─── Practice questions validation ────────────────────────
    ["all practice questions have required fields", allPracticeQuestionsValid],

    // ─── Unsupported generation items ─────────────────────────
    ["unsupported_generation_items is array", Array.isArray(unsupportedItems)],
    ["total_unsupported_items matches audit_condition", unsupportedItems.length === ac["total_unsupported_items"]],

    // ─── Generation quality controls ──────────────────────────
    ["generation_quality_controls.source_traceability_checked = true", gqc["source_traceability_checked"] === true],
    ["generation_quality_controls.unsupported_content_blocked = true", gqc["unsupported_content_blocked"] === true],
    ["generation_quality_controls.external_knowledge_blocked = true", gqc["external_knowledge_blocked"] === true],
    ["generation_quality_controls.hallucination_guard_enabled = true", gqc["hallucination_guard_enabled"] === true],
    ["generation_quality_controls.empty_traceability_disallowed = true", gqc["empty_traceability_disallowed"] === true],

    // ─── Scope ────────────────────────────────────────────────
    ["scope.allowed_source_basis = closed_pass_phase6_1_batch_001_only", scope["allowed_source_basis"] === "closed_pass_phase6_1_batch_001_only"],
    ["scope.unapproved_sources_allowed = false", scope["unapproved_sources_allowed"] === false],
    ["scope.external_sources_allowed = false", scope["external_sources_allowed"] === false],
    ["scope.source_expansion_allowed = false", scope["source_expansion_allowed"] === false],
    ["scope.offline_only = true", scope["offline_only"] === true],
    ["scope.source_traceability_required = true", scope["source_traceability_required"] === true],

    // ─── Risk ─────────────────────────────────────────────────
    ["risk.risk_level = medium", risk["risk_level"] === "medium"],
    ["risk.risk_reason is present", typeof risk["risk_reason"] === "string" && String(risk["risk_reason"]).length > 0],

    // ─── Closure ──────────────────────────────────────────────
    ["closure.phase7_4_status = complete", closure["phase7_4_status"] === "complete"],
    ["closure.phase7_4_result = pass", closure["phase7_4_result"] === "pass"],

    // ─── Next phase recommendation ────────────────────────────
    ["next_phase_recommendation.next_recommended_phase = phase7.5", npr["next_recommended_phase"] === "phase7.5_ai_learning_generation_validation"],
    ["next_phase_recommendation.phase7_5_entry_allowed = false", npr["phase7_5_entry_allowed"] === false],
    ["next_phase_recommendation.phase7_5_entry_requires_approval = true", npr["phase7_5_entry_requires_approval"] === true],

    // ─── Rollback condition ───────────────────────────────────
    ["rollback_condition.phase7_4_rollback_needed = false", rc["phase7_4_rollback_needed"] === false],

    // ─── Audit condition ──────────────────────────────────────
    ["audit_condition.upstream_authorization_phase = 7.3", ac["upstream_authorization_phase"] === "7.3"],
    ["audit_condition.upstream_authorization_commit = bc5f2af", ac["upstream_authorization_commit"] === "bc5f2af"],
    ["audit_condition.upstream_authorization_status = authorized", ac["upstream_authorization_status"] === "authorized"],
    ["audit_condition.upstream_execution_plan_phase = 7.2", ac["upstream_execution_plan_phase"] === "7.2"],
    ["audit_condition.upstream_execution_plan_commit = 6f0ac44", ac["upstream_execution_plan_commit"] === "6f0ac44"],
    ["audit_condition.upstream_closure_phase = 6.22", ac["upstream_closure_phase"] === "6.22"],
    ["audit_condition.upstream_closure_result = pass", ac["upstream_closure_result"] === "pass"],
    ["audit_condition.current_execution_status = completed", ac["current_execution_status"] === "completed"],
    ["audit_condition.current_execution_result = pass", ac["current_execution_result"] === "pass"],
    ["audit_condition.current_ai_learning_content_generation_allowed = true", ac["current_ai_learning_content_generation_allowed"] === true],
    ["audit_condition.current_ai_learning_execution_allowed = true", ac["current_ai_learning_execution_allowed"] === true],
    ["audit_condition.current_phase7_5_entry_allowed = false", ac["current_phase7_5_entry_allowed"] === false],
    ["audit_condition.generated_output_count = 8", ac["generated_output_count"] === 8],
    ["audit_condition.all_items_have_source_refs = true", ac["all_items_have_source_refs"] === true],

    // ─── Phase progression history ────────────────────────────
    ["phase_progression_history has 5 entries", history.length === 5],
    ["phase_progression_history includes phase 7.0", historyPhases.includes("7.0")],
    ["phase_progression_history includes phase 7.1", historyPhases.includes("7.1")],
    ["phase_progression_history includes phase 7.2", historyPhases.includes("7.2")],
    ["phase_progression_history includes phase 7.3", historyPhases.includes("7.3")],
    ["phase_progression_history includes phase 7.4", historyPhases.includes("7.4")],
    ["phase7.4 outcome = ai_learning_generation_execution_completed", history.find((h) => h["phase"] === "7.4")?.["outcome"] === "ai_learning_generation_execution_completed"],

    // ─── Validation expectations ──────────────────────────────
    ["validation_expectations.schema_validation = must_pass", ve["schema_validation"] === "must_pass"],
    ["validation_expectations.invariant_checks = must_pass", ve["invariant_checks"] === "must_pass"],
    ["validation_expectations.all_items_must_have_source_refs = true", ve["all_items_must_have_source_refs"] === true],
    ["validation_expectations.generated_output_count_must_be = 8", ve["generated_output_count_must_be"] === 8],
  ];

  // ─── Report ───────────────────────────────────────────────────────────────
  const failed = checks.filter(([, ok]) => !ok);

  console.log(`\nPhase 7.4 AI Learning Generation Execution — invariant checks`);
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
