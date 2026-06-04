/**
 * Phase 6.21 Formal Offline Batch Run Execution Record validator.
 *
 * Validates the generated phase6_21_formal_offline_batch_run_execution_record.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - manifest_version is not phase6.21
 * - manifest_type is not formal_offline_batch_run_execution_record
 * - status is not formal_offline_batch_run_execution_record_created
 * - formal_run_status is not completed
 * - formal_run_result is not pass
 * - formal_run_executed is not true
 * - batch_run_executed is not true
 * - formal_execution_status is not completed
 * - dry_run_result is not pass
 * - dry_run_executed is not true
 * - run_mode is not offline_existing_source_packet_only
 * - batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - executed_items is not exactly ["1.3"]
 * - formal_run_approval_status is not approved
 * - formal_run_approved is not true
 * - command_execution_scope is not formal_offline_run_only
 * - Any operational assertion is true
 * - Any no-go confirmation is false
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - Any operational gate decision is not not_required or not_allowed
 * - Item 1.3 item_status is not formal_run_completed
 * - Item 1.3 execution_result is not pass
 * - Item 9.1 item_status is not deferred
 * - Item 13.3 item_status is not quarantined_ineligible
 * - Formal run artifacts are not isolated under data/formal-runs/phase6_21/
 * - Forbidden artifacts are not explicitly listed
 * - phase_progression_history does not have 22 entries
 * - prior_phase_chain does not have 21 entries
 * - dry_run_artifact_references does not reference all 4 dry-run artifacts
 * - formal_approval_reference is missing or invalid
 *
 * Usage:
 *   pnpm validate:formal-offline-batch-run-execution-record
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-formal-offline-batch-run-execution-record.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_21_formal_offline_batch_run_execution_record.json");

function fail(message: string): never {
  console.error(`[validate:formal-offline-batch-run-execution-record] ERROR: ${message}`);
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
  console.log("[validate:formal-offline-batch-run-execution-record] Phase 6.21 Formal Offline Batch Run Execution Record validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:formal-offline-batch-run-execution-record] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:formal-offline-batch-run-execution-record] Schema validation: PASS");

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

  const dryRunArtifactRefs = manifest["dry_run_artifact_references"] as Record<string, unknown> | undefined;
  if (!dryRunArtifactRefs) fail("dry_run_artifact_references missing");

  const formalApprovalRef = manifest["formal_approval_reference"] as Record<string, unknown> | undefined;
  if (!formalApprovalRef) fail("formal_approval_reference missing");

  const formalRunCommand = manifest["formal_run_command"] as Record<string, unknown> | undefined;
  if (!formalRunCommand) fail("formal_run_command missing");

  const executionMetadata = manifest["execution_metadata"] as Record<string, unknown> | undefined;
  if (!executionMetadata) fail("execution_metadata missing");

  const formalRunScope = manifest["formal_run_scope"] as Record<string, unknown> | undefined;
  if (!formalRunScope) fail("formal_run_scope missing");

  const itemExecutionResults = manifest["item_execution_results"] as Record<string, unknown> | undefined;
  if (!itemExecutionResults) fail("item_execution_results missing");

  const formalRunArtifacts = manifest["formal_run_artifacts"] as Record<string, unknown> | undefined;
  if (!formalRunArtifacts) fail("formal_run_artifacts missing");

  const rollbackCondition = manifest["rollback_condition"] as Record<string, unknown> | undefined;
  if (!rollbackCondition) fail("rollback_condition missing");

  const auditCondition = manifest["audit_condition"] as Record<string, unknown> | undefined;
  if (!auditCondition) fail("audit_condition missing");

  const checks: Array<[string, boolean]> = [
    // ─── Top-level identity ────────────────────────────────────
    ["manifest_version = phase6.21", manifest["manifest_version"] === "phase6.21"],
    ["manifest_type = formal_offline_batch_run_execution_record", manifest["manifest_type"] === "formal_offline_batch_run_execution_record"],
    ["status = formal_offline_batch_run_execution_record_created", manifest["status"] === "formal_offline_batch_run_execution_record_created"],
    ["created_for_phase = 6.21", manifest["created_for_phase"] === "6.21"],

    // ─── Formal run status — now completed ─────────────────────
    ["formal_run_status = completed", manifest["formal_run_status"] === "completed"],
    ["formal_run_result = pass", manifest["formal_run_result"] === "pass"],
    ["formal_run_executed = true", manifest["formal_run_executed"] === true],
    ["batch_run_executed = true", manifest["batch_run_executed"] === true],
    ["formal_execution_status = completed", manifest["formal_execution_status"] === "completed"],

    // ─── Dry-run review status (carried forward) ──────────────
    ["dry_run_review_status = completed", manifest["dry_run_review_status"] === "completed"],
    ["dry_run_result = pass", manifest["dry_run_result"] === "pass"],
    ["dry_run_executed = true", manifest["dry_run_executed"] === true],

    // ─── Run mode and batch identity ───────────────────────────
    ["run_mode = offline_existing_source_packet_only", manifest["run_mode"] === "offline_existing_source_packet_only"],
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // ─── Authorization statuses ────────────────────────────────
    ["formal_run_approval_status = approved", manifest["formal_run_approval_status"] === "approved"],
    ["formal_run_approved = true", manifest["formal_run_approved"] === true],
    ["dry_run_approval_status = approved", manifest["dry_run_approval_status"] === "approved"],
    ["dry_run_approved = true", manifest["dry_run_approved"] === true],
    ["run_command_approved = true", manifest["run_command_approved"] === true],
    ["execution_authorization_status = execution_approved", manifest["execution_authorization_status"] === "execution_approved"],
    ["operational_mode_approval_status = operational_mode_approved", manifest["operational_mode_approval_status"] === "operational_mode_approved"],
    ["command_execution_scope = formal_offline_run_only", manifest["command_execution_scope"] === "formal_offline_run_only"],

    // ─── Prior phase reference ────────────────────────────────
    ["prior_phase_reference.prior_phase = 6.20", priorPhaseRef!["prior_phase"] === "6.20"],
    ["prior_phase_reference.prior_status = formal_offline_batch_run_approval_decision_recorded", priorPhaseRef!["prior_status"] === "formal_offline_batch_run_approval_decision_recorded"],
    ["prior_phase_reference.prior_formal_run_approval_status = approved", priorPhaseRef!["prior_formal_run_approval_status"] === "approved"],
    ["prior_phase_reference.prior_formal_run_approved = true", priorPhaseRef!["prior_formal_run_approved"] === true],
    ["prior_phase_reference.prior_formal_execution_status = approved_not_started", priorPhaseRef!["prior_formal_execution_status"] === "approved_not_started"],

    // ─── Formal approval reference ────────────────────────────
    ["formal_approval_reference.approval_status = formal_offline_batch_run_approval_decision_recorded", formalApprovalRef!["approval_status"] === "formal_offline_batch_run_approval_decision_recorded"],
    ["formal_approval_reference.formal_run_approval_status = approved", formalApprovalRef!["formal_run_approval_status"] === "approved"],
    ["formal_approval_reference.formal_run_approved = true", formalApprovalRef!["formal_run_approved"] === true],
    ["formal_approval_reference.human_decision_recorded = true", formalApprovalRef!["human_decision_recorded"] === true],
    ["formal_approval_reference.human_decision = approve_formal_offline_batch_run", formalApprovalRef!["human_decision"] === "approve_formal_offline_batch_run"],

    // ─── Formal run command ───────────────────────────────────
    ["formal_run_command.command_type = formal_offline_batch_run", formalRunCommand!["command_type"] === "formal_offline_batch_run"],
    ["formal_run_command.command_status = executed_as_formal_run_record", formalRunCommand!["command_status"] === "executed_as_formal_run_record"],
    ["formal_run_command.command_has_been_executed = true", formalRunCommand!["command_has_been_executed"] === true],
    ["formal_run_command.command_execution_scope = formal_offline_run_only", formalRunCommand!["command_execution_scope"] === "formal_offline_run_only"],
    ["formal_run_command.command_is_placeholder_only = true", formalRunCommand!["command_is_placeholder_only"] === true],
    ["formal_run_command.command_not_in_package_json = true", formalRunCommand!["command_not_in_package_json"] === true],

    // ─── Execution metadata ───────────────────────────────────
    ["execution_metadata.execution_type = formal_offline_batch_run_execution_record", executionMetadata!["execution_type"] === "formal_offline_batch_run_execution_record"],
    ["execution_metadata.execution_phase = 6.21", executionMetadata!["execution_phase"] === "6.21"],
    ["execution_metadata.prior_decision_phase = 6.20", executionMetadata!["prior_decision_phase"] === "6.20"],
    ["execution_metadata.prior_decision_status = formal_offline_batch_run_approval_decision_recorded", executionMetadata!["prior_decision_status"] === "formal_offline_batch_run_approval_decision_recorded"],
    ["execution_metadata.prior_formal_run_approval_status = approved", executionMetadata!["prior_formal_run_approval_status"] === "approved"],
    ["execution_metadata.prior_formal_run_approved = true", executionMetadata!["prior_formal_run_approved"] === true],
    ["execution_metadata.prior_formal_execution_status = approved_not_started", executionMetadata!["prior_formal_execution_status"] === "approved_not_started"],
    ["execution_metadata.dry_run_reference_phase = 6.18", executionMetadata!["dry_run_reference_phase"] === "6.18"],
    ["execution_metadata.dry_run_result = pass", executionMetadata!["dry_run_result"] === "pass"],
    ["execution_metadata.execution_scope = formal_offline_run_only", executionMetadata!["execution_scope"] === "formal_offline_run_only"],

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

    // ─── Operational assertions — all false ───────────────────
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
    ["no_go_confirmation.no_source_layer_modified = true", noGoConfirmation!["no_source_layer_modified"] === true],
    ["no_go_confirmation.no_ai_learning_generated = true", noGoConfirmation!["no_ai_learning_generated"] === true],
    ["no_go_confirmation.no_assets_captured = true", noGoConfirmation!["no_assets_captured"] === true],
    ["no_go_confirmation.no_raw_snapshots_created = true", noGoConfirmation!["no_raw_snapshots_created"] === true],
    ["no_go_confirmation.no_intermediate_json_created = true", noGoConfirmation!["no_intermediate_json_created"] === true],
    ["no_go_confirmation.no_package_script_added_for_formal_run = true", noGoConfirmation!["no_package_script_added_for_formal_run"] === true],
    ["no_go_confirmation.crawler_allowed_remains_false = true", noGoConfirmation!["crawler_allowed_remains_false"] === true],
    ["no_go_confirmation.renderer_allowed_remains_false = true", noGoConfirmation!["renderer_allowed_remains_false"] === true],
    ["no_go_confirmation.recovery_allowed_remains_false = true", noGoConfirmation!["recovery_allowed_remains_false"] === true],
    ["no_go_confirmation.web_requests_allowed_remains_false = true", noGoConfirmation!["web_requests_allowed_remains_false"] === true],
    ["no_go_confirmation.ai_learning_generation_allowed_remains_false = true", noGoConfirmation!["ai_learning_generation_allowed_remains_false"] === true],
    ["no_go_confirmation.no_output_for_9_1_created = true", noGoConfirmation!["no_output_for_9_1_created"] === true],
    ["no_go_confirmation.no_output_for_13_3_created = true", noGoConfirmation!["no_output_for_13_3_created"] === true],
  ];

  // ─── approved_items must be exactly ["1.3"] ────────────────
  const approvedItems = manifest["approved_items"] as string[] | undefined;
  checks.push(["approved_items = ['1.3']", Array.isArray(approvedItems) && approvedItems.length === 1 && approvedItems[0] === "1.3"]);
  checks.push(["13.3 not in approved_items", Array.isArray(approvedItems) && !approvedItems.includes("13.3")]);

  // ─── executed_items must be exactly ["1.3"] ────────────────
  const executedItems = manifest["executed_items"] as string[] | undefined;
  checks.push(["executed_items = ['1.3']", Array.isArray(executedItems) && executedItems.length === 1 && executedItems[0] === "1.3"]);
  checks.push(["9.1 not in executed_items", Array.isArray(executedItems) && !executedItems.includes("9.1")]);
  checks.push(["13.3 not in executed_items", Array.isArray(executedItems) && !executedItems.includes("13.3")]);

  // ─── Formal run scope ─────────────────────────────────────
  checks.push(["formal_run_scope.source_layer_mutation_allowed = false", formalRunScope!["source_layer_mutation_allowed"] === false]);
  checks.push(["formal_run_scope.output_artifact_creation_allowed = true", formalRunScope!["output_artifact_creation_allowed"] === true]);
  checks.push(["formal_run_scope.no_additional_item_added = true", formalRunScope!["no_additional_item_added"] === true]);
  checks.push(["formal_run_scope.existing_source_packet_boundary_sufficient = true", formalRunScope!["existing_source_packet_boundary_sufficient"] === true]);
  checks.push(["formal_run_scope.item_count = 1", formalRunScope!["item_count"] === 1]);

  const scopeIncluded = formalRunScope!["included_items"] as string[] | undefined;
  checks.push(["formal_run_scope.included_items = ['1.3']", Array.isArray(scopeIncluded) && scopeIncluded.length === 1 && scopeIncluded[0] === "1.3"]);

  const scopeExecuted = formalRunScope!["executed_items"] as string[] | undefined;
  checks.push(["formal_run_scope.executed_items = ['1.3']", Array.isArray(scopeExecuted) && scopeExecuted.length === 1 && scopeExecuted[0] === "1.3"]);

  const scopeDeferred = formalRunScope!["deferred_items"] as string[] | undefined;
  checks.push(["formal_run_scope 9.1 in deferred_items", Array.isArray(scopeDeferred) && scopeDeferred.includes("9.1")]);

  const scopeQuarantined = formalRunScope!["quarantined_items"] as string[] | undefined;
  checks.push(["formal_run_scope 13.3 in quarantined_items", Array.isArray(scopeQuarantined) && scopeQuarantined.includes("13.3")]);

  const scopeExcluded = formalRunScope!["excluded_items"] as string[] | undefined;
  checks.push(["formal_run_scope.excluded_items includes 9.1", Array.isArray(scopeExcluded) && scopeExcluded.includes("9.1")]);
  checks.push(["formal_run_scope.excluded_items includes 13.3", Array.isArray(scopeExcluded) && scopeExcluded.includes("13.3")]);

  // ─── Item execution results ───────────────────────────────
  const item13 = itemExecutionResults!["item_1_3"] as Record<string, unknown> | undefined;
  if (item13) {
    checks.push(["item_1_3.item_id = 1.3", item13["item_id"] === "1.3"]);
    checks.push(["item_1_3.item_status = formal_run_completed", item13["item_status"] === "formal_run_completed"]);
    checks.push(["item_1_3.execution_result = pass", item13["execution_result"] === "pass"]);
    checks.push(["item_1_3.run_mode = offline_existing_source_packet_only", item13["run_mode"] === "offline_existing_source_packet_only"]);
    checks.push(["item_1_3.source_packet_mode = existing_only", item13["source_packet_mode"] === "existing_only"]);
    checks.push(["item_1_3.source_layer_mutation_detected = false", item13["source_layer_mutation_detected"] === false]);
    checks.push(["item_1_3.ai_learning_generation_detected = false", item13["ai_learning_generation_detected"] === false]);
    checks.push(["item_1_3.crawler_dependency_detected = false", item13["crawler_dependency_detected"] === false]);
    checks.push(["item_1_3.renderer_dependency_detected = false", item13["renderer_dependency_detected"] === false]);
    checks.push(["item_1_3.web_request_dependency_detected = false", item13["web_request_dependency_detected"] === false]);
  }

  const item91 = itemExecutionResults!["item_9_1"] as Record<string, unknown> | undefined;
  if (item91) {
    checks.push(["item_9_1.item_id = 9.1", item91["item_id"] === "9.1"]);
    checks.push(["item_9_1.item_status = deferred", item91["item_status"] === "deferred"]);
    checks.push(["item_9_1.execution_result = deferred_not_executed", item91["execution_result"] === "deferred_not_executed"]);
  }

  const item133 = itemExecutionResults!["item_13_3"] as Record<string, unknown> | undefined;
  if (item133) {
    checks.push(["item_13_3.item_id = 13.3", item133["item_id"] === "13.3"]);
    checks.push(["item_13_3.item_status = quarantined_ineligible", item133["item_status"] === "quarantined_ineligible"]);
    checks.push(["item_13_3.execution_result = quarantined_ineligible", item133["execution_result"] === "quarantined_ineligible"]);
  }

  // ─── Formal run artifacts ─────────────────────────────────
  checks.push(["formal_run_artifacts.isolation_path = data/formal-runs/phase6_21/", formalRunArtifacts!["isolation_path"] === "data/formal-runs/phase6_21/"]);
  const artifacts = formalRunArtifacts!["artifacts"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(artifacts)) {
    checks.push(["formal_run_artifacts has 4 entries", artifacts.length === 4]);
    const allCreated = artifacts.every((a) => a["status"] === "created");
    checks.push(["all formal run artifacts status = created", allCreated]);
  }

  // ─── Dry-run artifact references — all 4 must be present ──
  checks.push(["dry_run_artifact_references.dry_run_record is string", typeof dryRunArtifactRefs!["dry_run_record"] === "string"]);
  checks.push(["dry_run_artifact_references.dry_run_audit_log is string", typeof dryRunArtifactRefs!["dry_run_audit_log"] === "string"]);
  checks.push(["dry_run_artifact_references.dry_run_item_scope_report is string", typeof dryRunArtifactRefs!["dry_run_item_scope_report"] === "string"]);
  checks.push(["dry_run_artifact_references.dry_run_validation_report is string", typeof dryRunArtifactRefs!["dry_run_validation_report"] === "string"]);

  // ─── Allowed artifacts ────────────────────────────────────
  const allowedArtifacts = manifest["allowed_phase6_21_artifacts"] as Record<string, unknown> | undefined;
  if (allowedArtifacts) {
    const artArr = allowedArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artArr)) {
      checks.push(["allowed_phase6_21_artifacts has 7 entries", artArr.length === 7]);
    }
  }

  // ─── Forbidden artifacts ──────────────────────────────────
  const forbiddenArtifacts = manifest["forbidden_phase6_21_artifacts"] as Record<string, unknown> | undefined;
  if (forbiddenArtifacts) {
    const artArr = forbiddenArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artArr)) {
      checks.push(["forbidden_phase6_21_artifacts has 11 entries", artArr.length === 11]);
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
  checks.push(["rollback_condition.phase6_21_rollback_needed = false", rollbackCondition!["phase6_21_rollback_needed"] === false]);
  const rollbackReqs = rollbackCondition!["future_rollback_requirements"] as string[] | undefined;
  if (Array.isArray(rollbackReqs)) {
    checks.push(["future_rollback_requirements count = 3", rollbackReqs.length === 3]);
  }

  // ─── Audit condition ──────────────────────────────────────
  checks.push(["audit_condition.current_formal_run_status = completed", auditCondition!["current_formal_run_status"] === "completed"]);
  checks.push(["audit_condition.current_formal_run_result = pass", auditCondition!["current_formal_run_result"] === "pass"]);
  checks.push(["audit_condition.current_formal_run_executed = true", auditCondition!["current_formal_run_executed"] === true]);
  checks.push(["audit_condition.current_batch_run_executed = true", auditCondition!["current_batch_run_executed"] === true]);
  checks.push(["audit_condition.current_formal_execution_status = completed", auditCondition!["current_formal_execution_status"] === "completed"]);
  checks.push(["audit_condition.current_dry_run_result = pass", auditCondition!["current_dry_run_result"] === "pass"]);
  checks.push(["audit_condition.current_dry_run_executed = true", auditCondition!["current_dry_run_executed"] === true]);
  checks.push(["audit_condition.no_go_confirmation = true", auditCondition!["no_go_confirmation"] === true]);

  const priorPhaseChain = auditCondition!["prior_phase_chain"] as string[] | undefined;
  if (Array.isArray(priorPhaseChain)) {
    checks.push(["audit_condition prior_phase_chain includes 6.0 through 6.20", priorPhaseChain.length === 21 && priorPhaseChain[0] === "6.0" && priorPhaseChain[20] === "6.20"]);
  }

  const validationCommands = auditCondition!["validation_commands"] as string[] | undefined;
  if (Array.isArray(validationCommands)) {
    checks.push(["audit_condition validation_commands has 3 entries", validationCommands.length === 3]);
  }

  const auditGates = auditCondition!["current_operational_gates"] as Record<string, unknown> | undefined;
  if (auditGates) {
    checks.push(["audit_condition.current_operational_gates.crawler_allowed = false", auditGates["crawler_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.renderer_allowed = false", auditGates["renderer_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.recovery_allowed = false", auditGates["recovery_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.web_requests_allowed = false", auditGates["web_requests_allowed"] === false]);
    checks.push(["audit_condition.current_operational_gates.ai_learning_generation_allowed = false", auditGates["ai_learning_generation_allowed"] === false]);
  }

  // ─── Phase progression history ────────────────────────────
  const phaseProgressionHistory = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(phaseProgressionHistory)) {
    checks.push(["phase_progression_history has 22 entries", phaseProgressionHistory.length === 22]);
    const lastEntry = phaseProgressionHistory[phaseProgressionHistory.length - 1];
    checks.push(["last phase progression = 6.21 formal_offline_batch_run_execution_record_created", lastEntry?.["phase"] === "6.21" && lastEntry?.["outcome"] === "formal_offline_batch_run_execution_record_created"]);
  }

  // ─── inherits_from_phase ──────────────────────────────────
  const inheritsFromPhase = manifest["inherits_from_phase"] as string[] | undefined;
  if (Array.isArray(inheritsFromPhase)) {
    checks.push(["inherits_from_phase has 21 entries", inheritsFromPhase.length === 21]);
    checks.push(["inherits_from_phase starts with 6.0", inheritsFromPhase[0] === "6.0"]);
    checks.push(["inherits_from_phase ends with 6.20", inheritsFromPhase[20] === "6.20"]);
    checks.push(["inherits_from_phase does not include 6.21", !inheritsFromPhase.includes("6.21")]);
  }

  // ─── Validation expectations ──────────────────────────────
  const validationExpectations = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (validationExpectations) {
    checks.push(["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"]);
    checks.push(["validation_expectations.invariant_checks = must_pass", validationExpectations["invariant_checks"] === "must_pass"]);
    checks.push(["validation_expectations.formal_run_status_must_be = completed", validationExpectations["formal_run_status_must_be"] === "completed"]);
    checks.push(["validation_expectations.formal_run_result_must_be = pass", validationExpectations["formal_run_result_must_be"] === "pass"]);
    checks.push(["validation_expectations.formal_run_executed_must_be = true", validationExpectations["formal_run_executed_must_be"] === true]);
    checks.push(["validation_expectations.batch_run_executed_must_be = true", validationExpectations["batch_run_executed_must_be"] === true]);
    checks.push(["validation_expectations.formal_execution_status_must_be = completed", validationExpectations["formal_execution_status_must_be"] === "completed"]);
    checks.push(["validation_expectations.run_mode_must_be = offline_existing_source_packet_only", validationExpectations["run_mode_must_be"] === "offline_existing_source_packet_only"]);
    checks.push(["validation_expectations.batch_id_must_be = phase6_1_batch_001", validationExpectations["batch_id_must_be"] === "phase6_1_batch_001"]);
    checks.push(["validation_expectations.formal_run_approval_status_must_be = approved", validationExpectations["formal_run_approval_status_must_be"] === "approved"]);
    checks.push(["validation_expectations.formal_run_approved_must_be = true", validationExpectations["formal_run_approved_must_be"] === true]);
    checks.push(["validation_expectations.dry_run_result_must_be = pass", validationExpectations["dry_run_result_must_be"] === "pass"]);
    checks.push(["validation_expectations.dry_run_executed_must_be = true", validationExpectations["dry_run_executed_must_be"] === true]);
    checks.push(["validation_expectations.command_execution_scope_must_be = formal_offline_run_only", validationExpectations["command_execution_scope_must_be"] === "formal_offline_run_only"]);
    checks.push(["validation_expectations.operational_assertions_all_false = true", validationExpectations["operational_assertions_all_false"] === true]);
    checks.push(["validation_expectations.no_go_confirmations_all_true = true", validationExpectations["no_go_confirmations_all_true"] === true]);
    checks.push(["validation_expectations.item_constraints_satisfied = true", validationExpectations["item_constraints_satisfied"] === true]);
    checks.push(["validation_expectations.formal_run_artifacts_isolated = true", validationExpectations["formal_run_artifacts_isolated"] === true]);
    checks.push(["validation_expectations.forbidden_artifacts_explicitly_listed = true", validationExpectations["forbidden_artifacts_explicitly_listed"] === true]);
    checks.push(["validation_expectations.dry_run_artifacts_referenced = true", validationExpectations["dry_run_artifacts_referenced"] === true]);
    checks.push(["validation_expectations.formal_approval_referenced = true", validationExpectations["formal_approval_referenced"] === true]);
    checks.push(["validation_expectations.no_output_for_9_1 = true", validationExpectations["no_output_for_9_1"] === true]);
    checks.push(["validation_expectations.no_output_for_13_3 = true", validationExpectations["no_output_for_13_3"] === true]);
  }

  // ─── Report ───────────────────────────────────────────────
  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:formal-offline-batch-run-execution-record] PASS: ${label}`);
    } else {
      console.error(`[validate:formal-offline-batch-run-execution-record] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:formal-offline-batch-run-execution-record] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:formal-offline-batch-run-execution-record] PASS");
}

main();
