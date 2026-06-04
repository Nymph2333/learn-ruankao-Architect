/**
 * Phase 6.22 Formal Run Review and Closure Report validator.
 *
 * Validates the generated phase6_22_formal_run_review_and_closure_report.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - manifest_version is not phase6.22
 * - manifest_type is not formal_run_review_and_closure_report
 * - status is not formal_run_review_and_closure_report_created
 * - closure_status is not closed
 * - closure_result is not pass
 * - batch_id is not phase6_1_batch_001
 * - formal_run_status is not completed
 * - formal_run_result is not pass
 * - formal_run_executed is not true
 * - batch_run_executed is not true
 * - formal_execution_status is not completed
 * - run_mode is not offline_existing_source_packet_only
 * - source_layer_mutation_detected is not false
 * - ai_learning_generation_detected is not false
 * - operational_gate_violation_detected is not false
 * - reviewed/executed/approved_items is not exactly ["1.3"]
 * - Any operational assertion is false (true ones) or true (false ones)
 * - Any no-go confirmation is not true
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - Any operational gate decision is not not_required or not_allowed
 * - Item 1.3 final_status is not formal_run_completed_pass
 * - Item 9.1 final_status is not deferred_candidate
 * - Item 13.3 final_status is not quarantined_ineligible
 * - prior_phase_reference.prior_phase is not 6.21
 * - closure_review_confirmations are not all true
 * - next_phase_recommendation does not match expectations
 * - phase_progression_history does not have 23 entries
 * - prior_phase_chain does not have 22 entries
 * - inherits_from_phase does not have 22 entries
 * - Phase 6.21 formal run artifacts are not referenced
 * - Phase 6.18 dry-run artifacts are not referenced
 * - Phase 6.20 formal approval decision is not referenced
 *
 * Usage:
 *   pnpm validate:formal-run-review-and-closure-report
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-formal-run-review-and-closure-report.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_22_formal_run_review_and_closure_report.json");

function fail(message: string): never {
  console.error(`[validate:formal-run-review-and-closure-report] ERROR: ${message}`);
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
  console.log("[validate:formal-run-review-and-closure-report] Phase 6.22 Formal Run Review and Closure Report validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:formal-run-review-and-closure-report] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:formal-run-review-and-closure-report] Schema validation: PASS");

  // Extract nested objects
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const operationalGateDecisions = manifest["operational_gate_decisions"] as Record<string, unknown> | undefined;
  if (!operationalGateDecisions) fail("operational_gate_decisions missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const noGoConfirmation = manifest["no_go_confirmation"] as Record<string, unknown> | undefined;
  if (!noGoConfirmation) fail("no_go_confirmation missing");

  const priorPhaseRef = manifest["prior_phase_reference"] as Record<string, unknown> | undefined;
  if (!priorPhaseRef) fail("prior_phase_reference missing");

  const artifactReferences = manifest["artifact_references"] as Record<string, unknown> | undefined;
  if (!artifactReferences) fail("artifact_references missing");

  const dryRunArtifacts = artifactReferences["dry_run_artifacts"] as Record<string, unknown> | undefined;
  if (!dryRunArtifacts) fail("artifact_references.dry_run_artifacts missing");

  const formalApprovalDecision = artifactReferences["formal_approval_decision"] as Record<string, unknown> | undefined;
  if (!formalApprovalDecision) fail("artifact_references.formal_approval_decision missing");

  const formalRunArtifacts = artifactReferences["formal_run_artifacts"] as Record<string, unknown> | undefined;
  if (!formalRunArtifacts) fail("artifact_references.formal_run_artifacts missing");

  const closureReviewConfirmations = manifest["closure_review_confirmations"] as Record<string, unknown> | undefined;
  if (!closureReviewConfirmations) fail("closure_review_confirmations missing");

  const finalBatchResult = manifest["final_batch_result"] as Record<string, unknown> | undefined;
  if (!finalBatchResult) fail("final_batch_result missing");

  const itemFinalStatuses = manifest["item_final_statuses"] as Record<string, unknown> | undefined;
  if (!itemFinalStatuses) fail("item_final_statuses missing");

  const nextPhaseRecommendation = manifest["next_phase_recommendation"] as Record<string, unknown> | undefined;
  if (!nextPhaseRecommendation) fail("next_phase_recommendation missing");

  const rollbackCondition = manifest["rollback_condition"] as Record<string, unknown> | undefined;
  if (!rollbackCondition) fail("rollback_condition missing");

  const auditCondition = manifest["audit_condition"] as Record<string, unknown> | undefined;
  if (!auditCondition) fail("audit_condition missing");

  const checks: Array<[string, boolean]> = [
    // ─── Top-level identity ────────────────────────────────────
    ["manifest_version = phase6.22", manifest["manifest_version"] === "phase6.22"],
    ["manifest_type = formal_run_review_and_closure_report", manifest["manifest_type"] === "formal_run_review_and_closure_report"],
    ["status = formal_run_review_and_closure_report_created", manifest["status"] === "formal_run_review_and_closure_report_created"],
    ["created_for_phase = 6.22", manifest["created_for_phase"] === "6.22"],

    // ─── Closure status ──────────────────────────────────────
    ["closure_status = closed", manifest["closure_status"] === "closed"],
    ["closure_result = pass", manifest["closure_result"] === "pass"],

    // ─── Formal run status (carried forward from 6.21) ────────
    ["formal_run_status = completed", manifest["formal_run_status"] === "completed"],
    ["formal_run_result = pass", manifest["formal_run_result"] === "pass"],
    ["formal_run_executed = true", manifest["formal_run_executed"] === true],
    ["batch_run_executed = true", manifest["batch_run_executed"] === true],
    ["formal_execution_status = completed", manifest["formal_execution_status"] === "completed"],

    // ─── Run mode and batch identity ───────────────────────────
    ["run_mode = offline_existing_source_packet_only", manifest["run_mode"] === "offline_existing_source_packet_only"],
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── Detection flags — all false ──────────────────────────
    ["source_layer_mutation_detected = false", manifest["source_layer_mutation_detected"] === false],
    ["ai_learning_generation_detected = false", manifest["ai_learning_generation_detected"] === false],
    ["operational_gate_violation_detected = false", manifest["operational_gate_violation_detected"] === false],

    // ─── Prior phase reference ────────────────────────────────
    ["prior_phase_reference.prior_phase = 6.21", priorPhaseRef!["prior_phase"] === "6.21"],
    ["prior_phase_reference.prior_status = formal_offline_batch_run_execution_record_created", priorPhaseRef!["prior_status"] === "formal_offline_batch_run_execution_record_created"],
    ["prior_phase_reference.prior_formal_run_status = completed", priorPhaseRef!["prior_formal_run_status"] === "completed"],
    ["prior_phase_reference.prior_formal_run_result = pass", priorPhaseRef!["prior_formal_run_result"] === "pass"],
    ["prior_phase_reference.prior_formal_run_executed = true", priorPhaseRef!["prior_formal_run_executed"] === true],
    ["prior_phase_reference.prior_formal_execution_status = completed", priorPhaseRef!["prior_formal_execution_status"] === "completed"],

    // ─── Dry-run artifact references ─────────────────────────
    ["artifact_references.dry_run_artifacts.dry_run_result = pass", dryRunArtifacts!["dry_run_result"] === "pass"],
    ["artifact_references.dry_run_artifacts.dry_run_executed = true", dryRunArtifacts!["dry_run_executed"] === true],
    ["artifact_references.dry_run_artifacts.dry_run_record is string", typeof dryRunArtifacts!["dry_run_record"] === "string"],
    ["artifact_references.dry_run_artifacts.dry_run_audit_log is string", typeof dryRunArtifacts!["dry_run_audit_log"] === "string"],
    ["artifact_references.dry_run_artifacts.dry_run_item_scope_report is string", typeof dryRunArtifacts!["dry_run_item_scope_report"] === "string"],
    ["artifact_references.dry_run_artifacts.dry_run_validation_report is string", typeof dryRunArtifacts!["dry_run_validation_report"] === "string"],

    // ─── Formal approval decision reference ──────────────────
    ["artifact_references.formal_approval_decision.formal_run_approval_status = approved", formalApprovalDecision!["formal_run_approval_status"] === "approved"],
    ["artifact_references.formal_approval_decision.formal_run_approved = true", formalApprovalDecision!["formal_run_approved"] === true],
    ["artifact_references.formal_approval_decision.human_decision_recorded = true", formalApprovalDecision!["human_decision_recorded"] === true],

    // ─── Formal run artifact references ──────────────────────
    ["artifact_references.formal_run_artifacts.formal_batch_run_record is string", typeof formalRunArtifacts!["formal_batch_run_record"] === "string"],
    ["artifact_references.formal_run_artifacts.formal_execution_audit_log is string", typeof formalRunArtifacts!["formal_execution_audit_log"] === "string"],
    ["artifact_references.formal_run_artifacts.formal_item_execution_result_1_3 is string", typeof formalRunArtifacts!["formal_item_execution_result_1_3"] === "string"],
    ["artifact_references.formal_run_artifacts.formal_post_run_validation_report is string", typeof formalRunArtifacts!["formal_post_run_validation_report"] === "string"],
    ["artifact_references.formal_run_artifacts.formal_run_artifacts_isolation_path = data/formal-runs/phase6_21/", formalRunArtifacts!["formal_run_artifacts_isolation_path"] === "data/formal-runs/phase6_21/"],

    // ─── Closure review confirmations — all true ─────────────
    ["closure_review_confirmations.prior_phase_chain_complete = true", closureReviewConfirmations!["prior_phase_chain_complete"] === true],
    ["closure_review_confirmations.dry_run_passed_before_formal_run = true", closureReviewConfirmations!["dry_run_passed_before_formal_run"] === true],
    ["closure_review_confirmations.formal_run_approval_existed_before_formal_run = true", closureReviewConfirmations!["formal_run_approval_existed_before_formal_run"] === true],
    ["closure_review_confirmations.formal_run_completed_successfully = true", closureReviewConfirmations!["formal_run_completed_successfully"] === true],
    ["closure_review_confirmations.only_item_1_3_executed = true", closureReviewConfirmations!["only_item_1_3_executed"] === true],
    ["closure_review_confirmations.item_9_1_remains_deferred = true", closureReviewConfirmations!["item_9_1_remains_deferred"] === true],
    ["closure_review_confirmations.item_13_3_remains_quarantined_ineligible = true", closureReviewConfirmations!["item_13_3_remains_quarantined_ineligible"] === true],
    ["closure_review_confirmations.no_crawler_was_run = true", closureReviewConfirmations!["no_crawler_was_run"] === true],
    ["closure_review_confirmations.no_renderer_was_run = true", closureReviewConfirmations!["no_renderer_was_run"] === true],
    ["closure_review_confirmations.no_recovery_was_run = true", closureReviewConfirmations!["no_recovery_was_run"] === true],
    ["closure_review_confirmations.no_web_request_was_made = true", closureReviewConfirmations!["no_web_request_was_made"] === true],
    ["closure_review_confirmations.no_ai_learning_content_generated = true", closureReviewConfirmations!["no_ai_learning_content_generated"] === true],
    ["closure_review_confirmations.no_source_layer_mutation_occurred = true", closureReviewConfirmations!["no_source_layer_mutation_occurred"] === true],
    ["closure_review_confirmations.no_raw_snapshot_created = true", closureReviewConfirmations!["no_raw_snapshot_created"] === true],
    ["closure_review_confirmations.no_intermediate_json_created = true", closureReviewConfirmations!["no_intermediate_json_created"] === true],
    ["closure_review_confirmations.no_asset_capture_occurred = true", closureReviewConfirmations!["no_asset_capture_occurred"] === true],
    ["closure_review_confirmations.formal_run_artifacts_isolated = true", closureReviewConfirmations!["formal_run_artifacts_isolated"] === true],

    // ─── Final batch result ──────────────────────────────────
    ["final_batch_result.batch_id = phase6_1_batch_001", finalBatchResult!["batch_id"] === "phase6_1_batch_001"],
    ["final_batch_result.final_result = pass", finalBatchResult!["final_result"] === "pass"],
    ["final_batch_result.closure_status = closed", finalBatchResult!["closure_status"] === "closed"],

    // ─── Phase gates ──────────────────────────────────────────
    ["phase_gates.phase6_1_entry_allowed = true", gates!["phase6_1_entry_allowed"] === true],
    ["phase_gates.activation_allowed = true", gates!["activation_allowed"] === true],
    ["phase_gates.batch_executable = true", gates!["batch_executable"] === true],
    ["phase_gates.execution_allowed = true", gates!["execution_allowed"] === true],
    ["phase_gates.crawler_allowed = false", gates!["crawler_allowed"] === false],
    ["phase_gates.renderer_allowed = false", gates!["renderer_allowed"] === false],
    ["phase_gates.recovery_allowed = false", gates!["recovery_allowed"] === false],
    ["phase_gates.web_requests_allowed = false", gates!["web_requests_allowed"] === false],
    ["phase_gates.ai_learning_generation_allowed = false", gates!["ai_learning_generation_allowed"] === false],

    // ─── Operational gate decisions ───────────────────────────
    ["operational_gate_decisions.crawler_gate_decision = not_required", operationalGateDecisions!["crawler_gate_decision"] === "not_required"],
    ["operational_gate_decisions.renderer_gate_decision = not_required", operationalGateDecisions!["renderer_gate_decision"] === "not_required"],
    ["operational_gate_decisions.recovery_gate_decision = not_required", operationalGateDecisions!["recovery_gate_decision"] === "not_required"],
    ["operational_gate_decisions.web_requests_gate_decision = not_required", operationalGateDecisions!["web_requests_gate_decision"] === "not_required"],
    ["operational_gate_decisions.ai_learning_generation_gate_decision = not_allowed", operationalGateDecisions!["ai_learning_generation_gate_decision"] === "not_allowed"],

    // ─── Operational assertions ───────────────────────────────
    ["operational_assertions.no_new_formal_run_record_created = true", operationalAssertions!["no_new_formal_run_record_created"] === true],
    ["operational_assertions.no_new_item_level_execution_result_created = true", operationalAssertions!["no_new_item_level_execution_result_created"] === true],
    ["operational_assertions.no_new_post_run_validation_report_created = true", operationalAssertions!["no_new_post_run_validation_report_created"] === true],
    ["operational_assertions.crawler_execution_claimed = false", operationalAssertions!["crawler_execution_claimed"] === false],
    ["operational_assertions.renderer_execution_claimed = false", operationalAssertions!["renderer_execution_claimed"] === false],
    ["operational_assertions.recovery_execution_claimed = false", operationalAssertions!["recovery_execution_claimed"] === false],
    ["operational_assertions.web_request_claimed = false", operationalAssertions!["web_request_claimed"] === false],
    ["operational_assertions.ai_learning_generation_claimed = false", operationalAssertions!["ai_learning_generation_claimed"] === false],
    ["operational_assertions.source_layer_mutation_declared = false", operationalAssertions!["source_layer_mutation_declared"] === false],
    ["operational_assertions.raw_snapshot_creation_declared = false", operationalAssertions!["raw_snapshot_creation_declared"] === false],
    ["operational_assertions.intermediate_json_creation_declared = false", operationalAssertions!["intermediate_json_creation_declared"] === false],
    ["operational_assertions.asset_capture_declared = false", operationalAssertions!["asset_capture_declared"] === false],

    // ─── No-go confirmation — all true ───────────────────────
    ["no_go_confirmation.no_crawler_runs = true", noGoConfirmation!["no_crawler_runs"] === true],
    ["no_go_confirmation.no_renderer_runs = true", noGoConfirmation!["no_renderer_runs"] === true],
    ["no_go_confirmation.no_recovery_runs = true", noGoConfirmation!["no_recovery_runs"] === true],
    ["no_go_confirmation.no_web_requests_made = true", noGoConfirmation!["no_web_requests_made"] === true],
    ["no_go_confirmation.no_ai_learning_generated = true", noGoConfirmation!["no_ai_learning_generated"] === true],
    ["no_go_confirmation.no_source_layer_modified = true", noGoConfirmation!["no_source_layer_modified"] === true],
    ["no_go_confirmation.no_raw_snapshots_created = true", noGoConfirmation!["no_raw_snapshots_created"] === true],
    ["no_go_confirmation.no_intermediate_json_created = true", noGoConfirmation!["no_intermediate_json_created"] === true],
    ["no_go_confirmation.no_asset_capture_occurred = true", noGoConfirmation!["no_asset_capture_occurred"] === true],
    ["no_go_confirmation.no_output_for_9_1 = true", noGoConfirmation!["no_output_for_9_1"] === true],
    ["no_go_confirmation.no_output_for_13_3 = true", noGoConfirmation!["no_output_for_13_3"] === true],
    ["no_go_confirmation.no_new_formal_run_record = true", noGoConfirmation!["no_new_formal_run_record"] === true],
    ["no_go_confirmation.no_new_item_level_execution_result = true", noGoConfirmation!["no_new_item_level_execution_result"] === true],
    ["no_go_confirmation.no_new_post_run_validation_report = true", noGoConfirmation!["no_new_post_run_validation_report"] === true],
  ];

  // ─── reviewed_items must be exactly ["1.3"] ────────────────
  const reviewedItems = manifest["reviewed_items"] as string[] | undefined;
  checks.push(["reviewed_items = ['1.3']", Array.isArray(reviewedItems) && reviewedItems.length === 1 && reviewedItems[0] === "1.3"]);
  checks.push(["9.1 not in reviewed_items", Array.isArray(reviewedItems) && !reviewedItems.includes("9.1")]);
  checks.push(["13.3 not in reviewed_items", Array.isArray(reviewedItems) && !reviewedItems.includes("13.3")]);

  // ─── approved_items must be exactly ["1.3"] ────────────────
  const approvedItems = manifest["approved_items"] as string[] | undefined;
  checks.push(["approved_items = ['1.3']", Array.isArray(approvedItems) && approvedItems.length === 1 && approvedItems[0] === "1.3"]);
  checks.push(["9.1 not in approved_items", Array.isArray(approvedItems) && !approvedItems.includes("9.1")]);
  checks.push(["13.3 not in approved_items", Array.isArray(approvedItems) && !approvedItems.includes("13.3")]);

  // ─── executed_items must be exactly ["1.3"] ────────────────
  const executedItems = manifest["executed_items"] as string[] | undefined;
  checks.push(["executed_items = ['1.3']", Array.isArray(executedItems) && executedItems.length === 1 && executedItems[0] === "1.3"]);
  checks.push(["9.1 not in executed_items", Array.isArray(executedItems) && !executedItems.includes("9.1")]);
  checks.push(["13.3 not in executed_items", Array.isArray(executedItems) && !executedItems.includes("13.3")]);

  // ─── Final batch result executed_items ─────────────────────
  const finalExecutedItems = finalBatchResult!["executed_items"] as string[] | undefined;
  checks.push(["final_batch_result.executed_items = ['1.3']", Array.isArray(finalExecutedItems) && finalExecutedItems.length === 1 && finalExecutedItems[0] === "1.3"]);

  // ─── Item final statuses ──────────────────────────────────
  const item13 = itemFinalStatuses!["item_1_3"] as Record<string, unknown> | undefined;
  if (item13) {
    checks.push(["item_1_3.item_id = 1.3", item13["item_id"] === "1.3"]);
    checks.push(["item_1_3.final_status = formal_run_completed_pass", item13["final_status"] === "formal_run_completed_pass"]);
    checks.push(["item_1_3.formal_run_status = completed", item13["formal_run_status"] === "completed"]);
    checks.push(["item_1_3.execution_result = pass", item13["execution_result"] === "pass"]);
    checks.push(["item_1_3.run_mode = offline_existing_source_packet_only", item13["run_mode"] === "offline_existing_source_packet_only"]);
  }

  const item91 = itemFinalStatuses!["item_9_1"] as Record<string, unknown> | undefined;
  if (item91) {
    checks.push(["item_9_1.item_id = 9.1", item91["item_id"] === "9.1"]);
    checks.push(["item_9_1.final_status = deferred_candidate", item91["final_status"] === "deferred_candidate"]);
  }

  const item133 = itemFinalStatuses!["item_13_3"] as Record<string, unknown> | undefined;
  if (item133) {
    checks.push(["item_13_3.item_id = 13.3", item133["item_id"] === "13.3"]);
    checks.push(["item_13_3.final_status = quarantined_ineligible", item133["final_status"] === "quarantined_ineligible"]);
  }

  // ─── Next phase recommendation ────────────────────────────
  checks.push(["next_phase_recommendation.next_recommended_phase = phase7.0_ai_learning_generation_request", nextPhaseRecommendation!["next_recommended_phase"] === "phase7.0_ai_learning_generation_request"]);
  checks.push(["next_phase_recommendation.ai_learning_generation_allowed = false", nextPhaseRecommendation!["ai_learning_generation_allowed"] === false]);
  checks.push(["next_phase_recommendation.ai_learning_generation_requested = false", nextPhaseRecommendation!["ai_learning_generation_requested"] === false]);
  checks.push(["next_phase_recommendation.source_layer_modification_allowed = false", nextPhaseRecommendation!["source_layer_modification_allowed"] === false]);

  // ─── Allowed artifacts ────────────────────────────────────
  const allowedArtifacts = manifest["allowed_phase6_22_artifacts"] as Record<string, unknown> | undefined;
  if (allowedArtifacts) {
    const artArr = allowedArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artArr)) {
      checks.push(["allowed_phase6_22_artifacts has 4 entries", artArr.length === 4]);
    }
  }

  // ─── Forbidden artifacts ──────────────────────────────────
  const forbiddenArtifacts = manifest["forbidden_phase6_22_artifacts"] as Record<string, unknown> | undefined;
  if (forbiddenArtifacts) {
    const artArr = forbiddenArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artArr)) {
      checks.push(["forbidden_phase6_22_artifacts has 14 entries", artArr.length === 14]);
      checks.push(["forbidden artifacts includes new_formal_controlled_batch_run_records", artArr.includes("new_formal_controlled_batch_run_records")]);
      checks.push(["forbidden artifacts includes new_item_level_execution_results", artArr.includes("new_item_level_execution_results")]);
      checks.push(["forbidden artifacts includes new_post_run_validation_reports", artArr.includes("new_post_run_validation_reports")]);
      checks.push(["forbidden artifacts includes raw_snapshots", artArr.includes("raw_snapshots")]);
      checks.push(["forbidden artifacts includes intermediate_json", artArr.includes("intermediate_json")]);
      checks.push(["forbidden artifacts includes rendered_outputs", artArr.includes("rendered_outputs")]);
      checks.push(["forbidden artifacts includes crawler_outputs", artArr.includes("crawler_outputs")]);
      checks.push(["forbidden artifacts includes recovery_outputs", artArr.includes("recovery_outputs")]);
      checks.push(["forbidden artifacts includes web_request_results", artArr.includes("web_request_results")]);
      checks.push(["forbidden artifacts includes ai_learning_content", artArr.includes("ai_learning_content")]);
      checks.push(["forbidden artifacts includes source_layer_mutations", artArr.includes("source_layer_mutations")]);
      checks.push(["forbidden artifacts includes captured_assets", artArr.includes("captured_assets")]);
      checks.push(["forbidden artifacts includes execution_results_for_9_1", artArr.includes("execution_results_for_9_1")]);
      checks.push(["forbidden artifacts includes execution_results_for_13_3", artArr.includes("execution_results_for_13_3")]);
    }
  }

  // ─── Rollback condition ───────────────────────────────────
  checks.push(["rollback_condition.phase6_22_rollback_needed = false", rollbackCondition!["phase6_22_rollback_needed"] === false]);
  const rollbackReqs = rollbackCondition!["future_rollback_requirements"] as string[] | undefined;
  if (Array.isArray(rollbackReqs)) {
    checks.push(["future_rollback_requirements count = 3", rollbackReqs.length === 3]);
  }

  // ─── Audit condition ──────────────────────────────────────
  checks.push(["audit_condition.current_closure_status = closed", auditCondition!["current_closure_status"] === "closed"]);
  checks.push(["audit_condition.current_closure_result = pass", auditCondition!["current_closure_result"] === "pass"]);
  checks.push(["audit_condition.current_formal_run_status = completed", auditCondition!["current_formal_run_status"] === "completed"]);
  checks.push(["audit_condition.current_formal_run_result = pass", auditCondition!["current_formal_run_result"] === "pass"]);
  checks.push(["audit_condition.current_formal_run_executed = true", auditCondition!["current_formal_run_executed"] === true]);
  checks.push(["audit_condition.current_formal_execution_status = completed", auditCondition!["current_formal_execution_status"] === "completed"]);
  checks.push(["audit_condition.no_go_confirmation = true", auditCondition!["no_go_confirmation"] === true]);

  const priorPhaseChain = auditCondition!["prior_phase_chain"] as string[] | undefined;
  if (Array.isArray(priorPhaseChain)) {
    checks.push(["audit_condition prior_phase_chain includes 6.0 through 6.21", priorPhaseChain.length === 22 && priorPhaseChain[0] === "6.0" && priorPhaseChain[21] === "6.21"]);
  }

  const validationCommands = auditCondition!["validation_commands"] as string[] | undefined;
  if (Array.isArray(validationCommands)) {
    checks.push(["audit_condition validation_commands has 3 entries", validationCommands.length === 3]);
  }

  const auditGates = auditCondition!["current_operational_gates"] as Record<string, unknown> | undefined;
  if (auditGates) {
    checks.push(["audit_condition.current_operational_gates.phase6_1_entry_allowed = true", auditGates["phase6_1_entry_allowed"] === true]);
    checks.push(["audit_condition.current_operational_gates.activation_allowed = true", auditGates["activation_allowed"] === true]);
    checks.push(["audit_condition.current_operational_gates.batch_executable = true", auditGates["batch_executable"] === true]);
    checks.push(["audit_condition.current_operational_gates.execution_allowed = true", auditGates["execution_allowed"] === true]);
    checks.push(["audit_condition.current_operational_gates.crawler_allowed = false", auditGates["crawler_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.renderer_allowed = false", auditGates["renderer_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.recovery_allowed = false", auditGates["recovery_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.web_requests_allowed = false", auditGates["web_requests_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.ai_learning_generation_allowed = false", auditGates["ai_learning_generation_allowed"] === false]);
  }

  // ─── Phase progression history ────────────────────────────
  const phaseProgressionHistory = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(phaseProgressionHistory)) {
    checks.push(["phase_progression_history has 23 entries", phaseProgressionHistory.length === 23]);
    const lastEntry = phaseProgressionHistory[phaseProgressionHistory.length - 1];
    checks.push(["last phase progression = 6.22 formal_run_review_and_closure_report_created", lastEntry?.["phase"] === "6.22" && lastEntry?.["outcome"] === "formal_run_review_and_closure_report_created"]);
  }

  // ─── inherits_from_phase ──────────────────────────────────
  const inheritsFromPhase = manifest["inherits_from_phase"] as string[] | undefined;
  if (Array.isArray(inheritsFromPhase)) {
    checks.push(["inherits_from_phase has 22 entries", inheritsFromPhase.length === 22]);
    checks.push(["inherits_from_phase starts with 6.0", inheritsFromPhase[0] === "6.0"]);
    checks.push(["inherits_from_phase ends with 6.21", inheritsFromPhase[21] === "6.21"]);
    checks.push(["inherits_from_phase does not include 6.22", !inheritsFromPhase.includes("6.22")]);
  }

  // ─── Validation expectations ──────────────────────────────
  const validationExpectations = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (validationExpectations) {
    checks.push(["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"]);
    checks.push(["validation_expectations.invariant_checks = must_pass", validationExpectations["invariant_checks"] === "must_pass"]);
    checks.push(["validation_expectations.closure_status_must_be = closed", validationExpectations["closure_status_must_be"] === "closed"]);
    checks.push(["validation_expectations.closure_result_must_be = pass", validationExpectations["closure_result_must_be"] === "pass"]);
    checks.push(["validation_expectations.batch_id_must_be = phase6_1_batch_001", validationExpectations["batch_id_must_be"] === "phase6_1_batch_001"]);
    checks.push(["validation_expectations.formal_run_status_must_be = completed", validationExpectations["formal_run_status_must_be"] === "completed"]);
    checks.push(["validation_expectations.formal_run_result_must_be = pass", validationExpectations["formal_run_result_must_be"] === "pass"]);
    checks.push(["validation_expectations.formal_run_executed_must_be = true", validationExpectations["formal_run_executed_must_be"] === true]);
    checks.push(["validation_expectations.batch_run_executed_must_be = true", validationExpectations["batch_run_executed_must_be"] === true]);
    checks.push(["validation_expectations.formal_execution_status_must_be = completed", validationExpectations["formal_execution_status_must_be"] === "completed"]);
    checks.push(["validation_expectations.run_mode_must_be = offline_existing_source_packet_only", validationExpectations["run_mode_must_be"] === "offline_existing_source_packet_only"]);
    checks.push(["validation_expectations.phase6_21_formal_run_artifacts_referenced = true", validationExpectations["phase6_21_formal_run_artifacts_referenced"] === true]);
    checks.push(["validation_expectations.phase6_18_dry_run_artifacts_referenced = true", validationExpectations["phase6_18_dry_run_artifacts_referenced"] === true]);
    checks.push(["validation_expectations.phase6_20_formal_approval_decision_referenced = true", validationExpectations["phase6_20_formal_approval_decision_referenced"] === true]);
    checks.push(["validation_expectations.operational_assertions_all_valid = true", validationExpectations["operational_assertions_all_valid"] === true]);
    checks.push(["validation_expectations.no_go_confirmations_all_true = true", validationExpectations["no_go_confirmations_all_true"] === true]);
    checks.push(["validation_expectations.item_final_statuses_correct = true", validationExpectations["item_final_statuses_correct"] === true]);
    checks.push(["validation_expectations.next_recommended_phase_does_not_enable_ai_learning = true", validationExpectations["next_recommended_phase_does_not_enable_ai_learning"] === true]);
    checks.push(["validation_expectations.forbidden_artifacts_explicitly_listed = true", validationExpectations["forbidden_artifacts_explicitly_listed"] === true]);
  }

  // ─── Report ───────────────────────────────────────────────
  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:formal-run-review-and-closure-report] PASS: ${label}`);
    } else {
      console.error(`[validate:formal-run-review-and-closure-report] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:formal-run-review-and-closure-report] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:formal-run-review-and-closure-report] PASS");
}

main();
