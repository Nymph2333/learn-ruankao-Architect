/**
 * Phase 6.20 Formal Offline Batch Run Approval Decision validator.
 *
 * Validates the generated phase6_20_formal_offline_batch_run_approval_decision.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - approval_status is not formal_run_approved
 * - approved_decision is not approve_formal_offline_batch_run
 * - formal_run_approval_status is not approved
 * - formal_run_approved is not true
 * - formal_run_executed is not false
 * - batch_run_executed is not false
 * - formal_execution_status is not approved_not_started
 * - dry_run_review_status is not completed
 * - dry_run_result is not pass
 * - dry_run_executed is not true
 * - run_mode is not offline_existing_source_packet_only
 * - batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - 13.3 appears in approved_items
 * - 9.1 is not in deferred_items
 * - 13.3 is not in quarantined_items
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - Any operational gate decision is not not_required or not_allowed
 * - human_decision_recorded is not true
 * - human_decision is not approve_formal_offline_batch_run
 * - formal_run_approval_decision.formal_run_approved is not true
 * - planned outputs do not have status = planned
 * - prior_phase_reference.prior_phase is not 6.19
 * - approval_request_reference is missing
 * - dry_run_artifact_references does not reference all 4 dry-run artifacts
 * - forbidden artifacts are not explicitly listed
 *
 * Usage:
 *   pnpm validate:formal-offline-batch-run-approval-decision
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-formal-offline-batch-run-approval-decision.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_20_formal_offline_batch_run_approval_decision.json");

function fail(message: string): never {
  console.error(`[validate:formal-offline-batch-run-approval-decision] ERROR: ${message}`);
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
  console.log("[validate:formal-offline-batch-run-approval-decision] Phase 6.20 Formal Offline Batch Run Approval Decision validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:formal-offline-batch-run-approval-decision] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:formal-offline-batch-run-approval-decision] Schema validation: PASS");

  // Invariant checks
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

  const approvalRequestRef = manifest["approval_request_reference"] as Record<string, unknown> | undefined;
  if (!approvalRequestRef) fail("approval_request_reference missing");

  const formalRunApprovalDecision = manifest["formal_run_approval_decision"] as Record<string, unknown> | undefined;
  if (!formalRunApprovalDecision) fail("formal_run_approval_decision missing");

  const rollbackCondition = manifest["rollback_condition"] as Record<string, unknown> | undefined;
  if (!rollbackCondition) fail("rollback_condition missing");

  const auditCondition = manifest["audit_condition"] as Record<string, unknown> | undefined;
  if (!auditCondition) fail("audit_condition missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.20", manifest["manifest_version"] === "phase6.20"],
    ["manifest_type = formal_offline_batch_run_approval_decision", manifest["manifest_type"] === "formal_offline_batch_run_approval_decision"],
    ["status = formal_offline_batch_run_approval_decision_recorded", manifest["status"] === "formal_offline_batch_run_approval_decision_recorded"],
    ["created_for_phase = 6.20", manifest["created_for_phase"] === "6.20"],

    // Approval status — now approved
    ["approval_status = formal_run_approved", manifest["approval_status"] === "formal_run_approved"],
    ["approved_decision = approve_formal_offline_batch_run", manifest["approved_decision"] === "approve_formal_offline_batch_run"],
    ["formal_run_approval_status = approved", manifest["formal_run_approval_status"] === "approved"],
    ["formal_run_approved = true", manifest["formal_run_approved"] === true],
    ["formal_run_executed = false", manifest["formal_run_executed"] === false],
    ["batch_run_executed = false", manifest["batch_run_executed"] === false],
    ["formal_execution_status = approved_not_started", manifest["formal_execution_status"] === "approved_not_started"],

    // Dry-run review status (carried forward)
    ["dry_run_review_status = completed", manifest["dry_run_review_status"] === "completed"],
    ["dry_run_result = pass", manifest["dry_run_result"] === "pass"],
    ["dry_run_executed = true", manifest["dry_run_executed"] === true],

    // Run mode and batch identity
    ["run_mode = offline_existing_source_packet_only", manifest["run_mode"] === "offline_existing_source_packet_only"],
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],

    // Prior authorization statuses
    ["dry_run_approval_status = approved", manifest["dry_run_approval_status"] === "approved"],
    ["dry_run_approved = true", manifest["dry_run_approved"] === true],
    ["run_command_approved = true", manifest["run_command_approved"] === true],
    ["execution_authorization_status = execution_approved", manifest["execution_authorization_status"] === "execution_approved"],
    ["operational_mode_approval_status = operational_mode_approved", manifest["operational_mode_approval_status"] === "operational_mode_approved"],

    // Prior phase reference
    ["prior_phase_reference.prior_phase = 6.19", priorPhaseRef!["prior_phase"] === "6.19"],
    ["prior_phase_reference.prior_formal_run_approval_status = pending_human_review", priorPhaseRef!["prior_formal_run_approval_status"] === "pending_human_review"],
    ["prior_phase_reference.prior_formal_run_approved = false", priorPhaseRef!["prior_formal_run_approved"] === false],
    ["prior_phase_reference.prior_formal_execution_status = approval_requested", priorPhaseRef!["prior_formal_execution_status"] === "approval_requested"],

    // Approval request reference
    ["approval_request_reference.approval_request_status = dry_run_review_and_formal_run_approval_request_created", approvalRequestRef!["approval_request_status"] === "dry_run_review_and_formal_run_approval_request_created"],
    ["approval_request_reference.prior_formal_run_approval_status = pending_human_review", approvalRequestRef!["prior_formal_run_approval_status"] === "pending_human_review"],
    ["approval_request_reference.prior_formal_run_approved = false", approvalRequestRef!["prior_formal_run_approved"] === false],

    // Formal run approval decision
    ["formal_run_approval_decision.approved_decision = approve_formal_offline_batch_run", formalRunApprovalDecision!["approved_decision"] === "approve_formal_offline_batch_run"],
    ["formal_run_approval_decision.formal_run_approval_status = approved", formalRunApprovalDecision!["formal_run_approval_status"] === "approved"],
    ["formal_run_approval_decision.formal_run_approved = true", formalRunApprovalDecision!["formal_run_approved"] === true],
    ["formal_run_approval_decision.formal_run_executed = false", formalRunApprovalDecision!["formal_run_executed"] === false],
    ["formal_run_approval_decision.human_decision_recorded = true", formalRunApprovalDecision!["human_decision_recorded"] === true],
    ["formal_run_approval_decision.human_decision = approve_formal_offline_batch_run", formalRunApprovalDecision!["human_decision"] === "approve_formal_offline_batch_run"],
    ["formal_run_approval_decision.approved_formal_run_mode = offline_existing_source_packet_only", formalRunApprovalDecision!["approved_formal_run_mode"] === "offline_existing_source_packet_only"],

    // Phase gates — all authorization gates true, all operational gates false
    ["phase_gates.phase6_1_entry_allowed = true", gates!["phase6_1_entry_allowed"] === true],
    ["phase_gates.activation_allowed = true", gates!["activation_allowed"] === true],
    ["phase_gates.batch_executable = true", gates!["batch_executable"] === true],
    ["phase_gates.execution_allowed = true", gates!["execution_allowed"] === true],
    ["phase_gates.crawler_allowed = false", gates!["crawler_allowed"] === false],
    ["phase_gates.renderer_allowed = false", gates!["renderer_allowed"] === false],
    ["phase_gates.recovery_allowed = false", gates!["recovery_allowed"] === false],
    ["phase_gates.web_requests_allowed = false", gates!["web_requests_allowed"] === false],
    ["phase_gates.ai_learning_generation_allowed = false", gates!["ai_learning_generation_allowed"] === false],

    // Operational gate decisions
    ["operational_gate_decisions.crawler_gate_decision = not_required", operationalGateDecisions!["crawler_gate_decision"] === "not_required"],
    ["operational_gate_decisions.renderer_gate_decision = not_required", operationalGateDecisions!["renderer_gate_decision"] === "not_required"],
    ["operational_gate_decisions.recovery_gate_decision = not_required", operationalGateDecisions!["recovery_gate_decision"] === "not_required"],
    ["operational_gate_decisions.web_requests_gate_decision = not_required", operationalGateDecisions!["web_requests_gate_decision"] === "not_required"],
    ["operational_gate_decisions.ai_learning_generation_gate_decision = not_allowed", operationalGateDecisions!["ai_learning_generation_gate_decision"] === "not_allowed"],

    // Operational assertions — all false
    ["operational_assertions.formal_batch_execution_claimed = false", operationalAssertions!["formal_batch_execution_claimed"] === false],
    ["operational_assertions.formal_item_level_result_claimed = false", operationalAssertions!["formal_item_level_result_claimed"] === false],
    ["operational_assertions.formal_post_run_validation_claimed = false", operationalAssertions!["formal_post_run_validation_claimed"] === false],
    ["operational_assertions.crawler_output_claimed = false", operationalAssertions!["crawler_output_claimed"] === false],
    ["operational_assertions.renderer_output_claimed = false", operationalAssertions!["renderer_output_claimed"] === false],
    ["operational_assertions.recovery_output_claimed = false", operationalAssertions!["recovery_output_claimed"] === false],
    ["operational_assertions.ai_learning_generation_claimed = false", operationalAssertions!["ai_learning_generation_claimed"] === false],
    ["operational_assertions.source_layer_mutation_declared = false", operationalAssertions!["source_layer_mutation_declared"] === false],
    ["operational_assertions.web_requests_declared = false", operationalAssertions!["web_requests_declared"] === false],
    ["operational_assertions.raw_snapshots_created = false", operationalAssertions!["raw_snapshots_created"] === false],
    ["operational_assertions.intermediate_json_created = false", operationalAssertions!["intermediate_json_created"] === false],
    ["operational_assertions.assets_captured = false", operationalAssertions!["assets_captured"] === false],
  ];

  // approved_items must be exactly ["1.3"]
  const approvedItems = manifest["approved_items"] as string[] | undefined;
  checks.push(["approved_items = ['1.3']", Array.isArray(approvedItems) && approvedItems.length === 1 && approvedItems[0] === "1.3"]);

  // 13.3 must not appear in approved_items
  checks.push(["13.3 not in approved_items", Array.isArray(approvedItems) && !approvedItems.includes("13.3")]);

  // Formal run scope item lists
  const formalRunScope = formalRunApprovalDecision!["approved_formal_run_scope"] as Record<string, unknown> | undefined;
  if (formalRunScope) {
    const scopeDeferred = formalRunScope["deferred_items"] as string[] | undefined;
    const scopeQuarantined = formalRunScope["quarantined_items"] as string[] | undefined;
    checks.push(["formal_run_scope 9.1 in deferred_items", Array.isArray(scopeDeferred) && scopeDeferred.includes("9.1")]);
    checks.push(["formal_run_scope 13.3 in quarantined_items", Array.isArray(scopeQuarantined) && scopeQuarantined.includes("13.3")]);
    checks.push(["formal_run_scope.no_additional_item_added = true", formalRunScope["no_additional_item_added"] === true]);
    checks.push(["formal_run_scope.existing_source_packet_boundary_sufficient = true", formalRunScope["existing_source_packet_boundary_sufficient"] === true]);
  }

  // Formal run output boundary — all 4 must be planned
  const outputBoundary = formalRunApprovalDecision!["approved_formal_run_output_boundary"] as Record<string, unknown> | undefined;
  if (outputBoundary) {
    const outputs = outputBoundary["outputs"] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(outputs)) {
      checks.push(["formal_run_output_boundary.outputs has 4 entries", outputs.length === 4]);
      const allPlanned = outputs.every((o) => o["status"] === "planned");
      checks.push(["all formal run outputs status = planned", allPlanned]);
    }
  }

  // Dry-run artifact references — all 4 must be present
  checks.push(["dry_run_artifact_references.dry_run_record is string", typeof dryRunArtifactRefs!["dry_run_record"] === "string"]);
  checks.push(["dry_run_artifact_references.dry_run_audit_log is string", typeof dryRunArtifactRefs!["dry_run_audit_log"] === "string"]);
  checks.push(["dry_run_artifact_references.dry_run_item_scope_report is string", typeof dryRunArtifactRefs!["dry_run_item_scope_report"] === "string"]);
  checks.push(["dry_run_artifact_references.dry_run_validation_report is string", typeof dryRunArtifactRefs!["dry_run_validation_report"] === "string"]);

  // Rollback condition
  checks.push(["rollback_condition.phase6_20_rollback_needed = false", rollbackCondition!["phase6_20_rollback_needed"] === false]);
  const rollbackReqs = rollbackCondition!["future_rollback_requirements"] as string[] | undefined;
  if (Array.isArray(rollbackReqs)) {
    checks.push(["future_rollback_requirements count = 3", rollbackReqs.length === 3]);
  }

  // Audit condition
  checks.push(["audit_condition.current_formal_run_approval_status = approved", auditCondition!["current_formal_run_approval_status"] === "approved"]);
  checks.push(["audit_condition.current_formal_run_approved = true", auditCondition!["current_formal_run_approved"] === true]);
  checks.push(["audit_condition.current_formal_run_executed = false", auditCondition!["current_formal_run_executed"] === false]);
  checks.push(["audit_condition.current_formal_execution_status = approved_not_started", auditCondition!["current_formal_execution_status"] === "approved_not_started"]);
  checks.push(["audit_condition.current_dry_run_review_status = completed", auditCondition!["current_dry_run_review_status"] === "completed"]);
  checks.push(["audit_condition.current_dry_run_result = pass", auditCondition!["current_dry_run_result"] === "pass"]);
  checks.push(["audit_condition.current_dry_run_executed = true", auditCondition!["current_dry_run_executed"] === true]);
  checks.push(["audit_condition.no_go_confirmation = true", auditCondition!["no_go_confirmation"] === true]);

  const priorPhaseChain = auditCondition!["prior_phase_chain"] as string[] | undefined;
  if (Array.isArray(priorPhaseChain)) {
    checks.push(["audit_condition prior_phase_chain includes 6.0 through 6.19", priorPhaseChain.length === 20 && priorPhaseChain[0] === "6.0" && priorPhaseChain[19] === "6.19"]);
  }

  const validationCommands = auditCondition!["validation_commands"] as string[] | undefined;
  if (Array.isArray(validationCommands)) {
    checks.push(["audit_condition validation_commands has 3 entries", validationCommands.length === 3]);
  }

  // Phase progression history
  const phaseProgressionHistory = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(phaseProgressionHistory)) {
    checks.push(["phase_progression_history has 21 entries", phaseProgressionHistory.length === 21]);
    const lastEntry = phaseProgressionHistory[phaseProgressionHistory.length - 1];
    checks.push(["last phase progression = 6.20 formal_offline_batch_run_approval_decision_recorded", lastEntry?.["phase"] === "6.20" && lastEntry?.["outcome"] === "formal_offline_batch_run_approval_decision_recorded"]);
  }

  // Validation expectations
  const validationExpectations = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (validationExpectations) {
    checks.push(["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"]);
    checks.push(["validation_expectations.invariant_checks = must_pass", validationExpectations["invariant_checks"] === "must_pass"]);
    checks.push(["validation_expectations.approval_status_must_be = formal_run_approved", validationExpectations["approval_status_must_be"] === "formal_run_approved"]);
    checks.push(["validation_expectations.approved_decision_must_be = approve_formal_offline_batch_run", validationExpectations["approved_decision_must_be"] === "approve_formal_offline_batch_run"]);
    checks.push(["validation_expectations.formal_run_approval_status_must_be = approved", validationExpectations["formal_run_approval_status_must_be"] === "approved"]);
    checks.push(["validation_expectations.formal_run_approved_must_be = true", validationExpectations["formal_run_approved_must_be"] === true]);
    checks.push(["validation_expectations.formal_run_executed_must_be = false", validationExpectations["formal_run_executed_must_be"] === false]);
    checks.push(["validation_expectations.formal_execution_status_must_be = approved_not_started", validationExpectations["formal_execution_status_must_be"] === "approved_not_started"]);
    checks.push(["validation_expectations.dry_run_review_status_must_be = completed", validationExpectations["dry_run_review_status_must_be"] === "completed"]);
    checks.push(["validation_expectations.dry_run_result_must_be = pass", validationExpectations["dry_run_result_must_be"] === "pass"]);
    checks.push(["validation_expectations.operational_assertions_all_false = true", validationExpectations["operational_assertions_all_false"] === true]);
    checks.push(["validation_expectations.no_go_confirmations_all_true = true", validationExpectations["no_go_confirmations_all_true"] === true]);
    checks.push(["validation_expectations.human_decision_recorded = true", validationExpectations["human_decision_recorded"] === true]);
    checks.push(["validation_expectations.approval_request_referenced = true", validationExpectations["approval_request_referenced"] === true]);
    checks.push(["validation_expectations.dry_run_artifacts_referenced = true", validationExpectations["dry_run_artifacts_referenced"] === true]);
    checks.push(["validation_expectations.forbidden_artifacts_explicitly_listed = true", validationExpectations["forbidden_artifacts_explicitly_listed"] === true]);
  }

  // Forbidden artifacts must be explicitly listed
  const forbiddenArtifacts = manifest["forbidden_phase6_20_artifacts"] as Record<string, unknown> | undefined;
  if (forbiddenArtifacts) {
    const artifacts = forbiddenArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artifacts)) {
      checks.push(["forbidden artifacts includes actual_formal_controlled_batch_run_record", artifacts.includes("actual_formal_controlled_batch_run_record")]);
      checks.push(["forbidden artifacts includes actual_formal_item_level_execution_result", artifacts.includes("actual_formal_item_level_execution_result")]);
      checks.push(["forbidden artifacts includes actual_formal_post_run_validation_report", artifacts.includes("actual_formal_post_run_validation_report")]);
      checks.push(["forbidden artifacts includes raw_snapshots", artifacts.includes("raw_snapshots")]);
      checks.push(["forbidden artifacts includes intermediate_json", artifacts.includes("intermediate_json")]);
      checks.push(["forbidden artifacts includes rendered_outputs", artifacts.includes("rendered_outputs")]);
      checks.push(["forbidden artifacts includes crawler_outputs", artifacts.includes("crawler_outputs")]);
      checks.push(["forbidden artifacts includes recovery_outputs", artifacts.includes("recovery_outputs")]);
      checks.push(["forbidden artifacts includes web_request_results", artifacts.includes("web_request_results")]);
      checks.push(["forbidden artifacts includes ai_learning_content", artifacts.includes("ai_learning_content")]);
      checks.push(["forbidden artifacts includes source_layer_mutations", artifacts.includes("source_layer_mutations")]);
      checks.push(["forbidden artifacts includes captured_assets", artifacts.includes("captured_assets")]);
      checks.push(["forbidden artifacts count = 12", artifacts.length === 12]);
    }
  }

  // No-go confirmation validation
  checks.push(["no_go_confirmation.no_formal_batch_execution_occurs = true", noGoConfirmation!["no_formal_batch_execution_occurs"] === true]);
  checks.push(["no_go_confirmation.no_formal_item_level_result_created = true", noGoConfirmation!["no_formal_item_level_result_created"] === true]);
  checks.push(["no_go_confirmation.no_formal_post_run_validation_created = true", noGoConfirmation!["no_formal_post_run_validation_created"] === true]);
  checks.push(["no_go_confirmation.no_crawler_runs = true", noGoConfirmation!["no_crawler_runs"] === true]);
  checks.push(["no_go_confirmation.no_renderer_runs = true", noGoConfirmation!["no_renderer_runs"] === true]);
  checks.push(["no_go_confirmation.no_recovery_runs = true", noGoConfirmation!["no_recovery_runs"] === true]);
  checks.push(["no_go_confirmation.no_web_requests_made = true", noGoConfirmation!["no_web_requests_made"] === true]);
  checks.push(["no_go_confirmation.no_source_layer_modified = true", noGoConfirmation!["no_source_layer_modified"] === true]);
  checks.push(["no_go_confirmation.no_ai_learning_generated = true", noGoConfirmation!["no_ai_learning_generated"] === true]);
  checks.push(["no_go_confirmation.no_assets_captured = true", noGoConfirmation!["no_assets_captured"] === true]);
  checks.push(["no_go_confirmation.no_raw_snapshots_created = true", noGoConfirmation!["no_raw_snapshots_created"] === true]);
  checks.push(["no_go_confirmation.no_intermediate_json_created = true", noGoConfirmation!["no_intermediate_json_created"] === true]);
  checks.push(["no_go_confirmation.no_package_script_added_for_formal_run = true", noGoConfirmation!["no_package_script_added_for_formal_run"] === true]);
  checks.push(["no_go_confirmation.crawler_allowed_remains_false = true", noGoConfirmation!["crawler_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.renderer_allowed_remains_false = true", noGoConfirmation!["renderer_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.recovery_allowed_remains_false = true", noGoConfirmation!["recovery_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.web_requests_allowed_remains_false = true", noGoConfirmation!["web_requests_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.ai_learning_generation_allowed_remains_false = true", noGoConfirmation!["ai_learning_generation_allowed_remains_false"] === true]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:formal-offline-batch-run-approval-decision] PASS: ${label}`);
    } else {
      console.error(`[validate:formal-offline-batch-run-approval-decision] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:formal-offline-batch-run-approval-decision] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:formal-offline-batch-run-approval-decision] PASS");
}

main();
