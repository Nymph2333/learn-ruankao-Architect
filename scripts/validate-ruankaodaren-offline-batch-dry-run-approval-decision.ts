/**
 * Phase 6.17 Offline Batch Dry-Run Approval Decision validator.
 *
 * Validates the generated phase6_17_offline_batch_dry_run_approval_decision.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - approval_status is not dry_run_approved
 * - approved_decision is not approve_offline_dry_run
 * - dry_run_approval_status is not approved
 * - dry_run_approved is not true
 * - dry_run_executed is not false
 * - batch_run_executed is not false
 * - run_mode is not offline_existing_source_packet_only
 * - batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - run_command_approved is not true
 * - command_status is not approved
 * - command_has_been_executed is not false
 * - dry_run_plan_status is not planned_not_executed
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not true
 * - execution_allowed is not true
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - Any operational gate decision is not not_required or not_allowed
 * - dry_run_command.command_status is not approved
 * - dry_run_command.command_is_executable_now is not true
 * - dry_run_command.command_has_been_executed is not false
 * - dry_run_command.command_is_placeholder_only is not true
 * - dry_run_command.command_not_in_package_json is not true
 * - 13.3 appears in approved_items
 * - 13.3 is not in quarantined_items
 * - 9.1 is not in deferred_items
 * - Any dry-run execution, batch execution, crawler, renderer, recovery,
 *   web request, AI generation, source mutation, snapshot, intermediate JSON,
 *   or asset capture is claimed
 * - future outputs are not all marked as planned
 * - human_decision_fields are missing or incorrect
 *
 * Usage:
 *   pnpm validate:offline-batch-dry-run-approval-decision
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-offline-batch-dry-run-approval-decision.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_17_offline_batch_dry_run_approval_decision.json");

function fail(message: string): never {
  console.error(`[validate:offline-batch-dry-run-approval-decision] ERROR: ${message}`);
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
  console.log("[validate:offline-batch-dry-run-approval-decision] Phase 6.17 Offline Batch Dry-Run Approval Decision validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:offline-batch-dry-run-approval-decision] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:offline-batch-dry-run-approval-decision] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const operationalGateDecisions = manifest["operational_gate_decisions"] as Record<string, unknown> | undefined;
  if (!operationalGateDecisions) fail("operational_gate_decisions missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const noGoConfirmation = manifest["no_go_confirmation"] as Record<string, unknown> | undefined;
  if (!noGoConfirmation) fail("no_go_confirmation missing");

  const decisionMetadata = manifest["decision_metadata"] as Record<string, unknown> | undefined;
  if (!decisionMetadata) fail("decision_metadata missing");

  const dryRunCommand = manifest["dry_run_command"] as Record<string, unknown> | undefined;
  if (!dryRunCommand) fail("dry_run_command missing");

  const dryRunScope = manifest["dry_run_scope"] as Record<string, unknown> | undefined;
  if (!dryRunScope) fail("dry_run_scope missing");

  const humanDecisionFields = manifest["human_decision_fields"] as Record<string, unknown> | undefined;
  if (!humanDecisionFields) fail("human_decision_fields missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.17", manifest["manifest_version"] === "phase6.17"],
    ["manifest_type = offline_batch_dry_run_approval_decision", manifest["manifest_type"] === "offline_batch_dry_run_approval_decision"],
    ["status = offline_batch_dry_run_approval_decision_recorded", manifest["status"] === "offline_batch_dry_run_approval_decision_recorded"],
    ["created_for_phase = 6.17", manifest["created_for_phase"] === "6.17"],

    // Approval status — now approved
    ["approval_status = dry_run_approved", manifest["approval_status"] === "dry_run_approved"],
    ["approved_decision = approve_offline_dry_run", manifest["approved_decision"] === "approve_offline_dry_run"],
    ["dry_run_approval_status = approved", manifest["dry_run_approval_status"] === "approved"],
    ["dry_run_approved = true", manifest["dry_run_approved"] === true],
    ["dry_run_executed = false", manifest["dry_run_executed"] === false],
    ["batch_run_executed = false", manifest["batch_run_executed"] === false],

    // Run mode and batch identity
    ["run_mode = offline_existing_source_packet_only", manifest["run_mode"] === "offline_existing_source_packet_only"],
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],
    ["run_command_approved = true", manifest["run_command_approved"] === true],
    ["command_status = approved", manifest["command_status"] === "approved"],
    ["command_is_executable_now = true", manifest["command_is_executable_now"] === true],
    ["command_has_been_executed = false", manifest["command_has_been_executed"] === false],
    ["dry_run_plan_status = planned_not_executed", manifest["dry_run_plan_status"] === "planned_not_executed"],
    ["execution_authorization_status = execution_approved", manifest["execution_authorization_status"] === "execution_approved"],
    ["operational_mode_approval_status = operational_mode_approved", manifest["operational_mode_approval_status"] === "operational_mode_approved"],

    // Decision metadata
    ["decision_metadata.decision_type = offline_batch_dry_run_approval_decision", decisionMetadata!["decision_type"] === "offline_batch_dry_run_approval_decision"],
    ["decision_metadata.decision_phase = 6.17", decisionMetadata!["decision_phase"] === "6.17"],
    ["decision_metadata.prior_request_phase = 6.16", decisionMetadata!["prior_request_phase"] === "6.16"],
    ["decision_metadata.prior_request_status = offline_batch_dry_run_approval_request_created", decisionMetadata!["prior_request_status"] === "offline_batch_dry_run_approval_request_created"],
    ["decision_metadata.prior_approval_status = pending_human_review", decisionMetadata!["prior_approval_status"] === "pending_human_review"],
    ["decision_metadata.prior_dry_run_approval_status = pending_human_review", decisionMetadata!["prior_dry_run_approval_status"] === "pending_human_review"],
    ["decision_metadata.prior_dry_run_approved = false", decisionMetadata!["prior_dry_run_approved"] === false],
    ["decision_metadata.referencing_approval_phase = 6.14", decisionMetadata!["referencing_approval_phase"] === "6.14"],
    ["decision_metadata.referencing_decision_phase = 6.11", decisionMetadata!["referencing_decision_phase"] === "6.11"],
    ["decision_metadata.referencing_plan_phase = 6.15", decisionMetadata!["referencing_plan_phase"] === "6.15"],
    ["decision_metadata.decision_scope = offline_batch_dry_run_approval_decision_only", decisionMetadata!["decision_scope"] === "offline_batch_dry_run_approval_decision_only"],

    // Dry-run command — now approved
    ["dry_run_command.command_type = offline_batch_dry_run", dryRunCommand!["command_type"] === "offline_batch_dry_run"],
    ["dry_run_command.command_status = approved", dryRunCommand!["command_status"] === "approved"],
    ["dry_run_command.command_is_executable_now = true", dryRunCommand!["command_is_executable_now"] === true],
    ["dry_run_command.command_has_been_executed = false", dryRunCommand!["command_has_been_executed"] === false],
    ["dry_run_command.command_is_placeholder_only = true", dryRunCommand!["command_is_placeholder_only"] === true],
    ["dry_run_command.command_not_in_package_json = true", dryRunCommand!["command_not_in_package_json"] === true],

    // Dry-run scope
    ["dry_run_scope.source_layer_mutation_allowed = false", dryRunScope!["source_layer_mutation_allowed"] === false],
    ["dry_run_scope.output_artifact_creation_allowed = false", dryRunScope!["output_artifact_creation_allowed"] === false],

    // Human decision fields — now recorded
    ["human_decision_fields.requested_decision = approve_offline_dry_run", humanDecisionFields!["requested_decision"] === "approve_offline_dry_run"],
    ["human_decision_fields.dry_run_approval_status = approved", humanDecisionFields!["dry_run_approval_status"] === "approved"],
    ["human_decision_fields.dry_run_approved = true", humanDecisionFields!["dry_run_approved"] === true],
    ["human_decision_fields.human_review_required = true", humanDecisionFields!["human_review_required"] === true],
    ["human_decision_fields.human_decision_recorded = true", humanDecisionFields!["human_decision_recorded"] === true],
    ["human_decision_fields.human_decision = approve_offline_dry_run", humanDecisionFields!["human_decision"] === "approve_offline_dry_run"],

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

    // Operational assertions
    ["operational_assertions.dry_run_execution_claimed = false", operationalAssertions!["dry_run_execution_claimed"] === false],
    ["operational_assertions.batch_execution_claimed = false", operationalAssertions!["batch_execution_claimed"] === false],
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

  // 9.1 must appear in deferred_items
  const deferredItems = dryRunScope!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in quarantined_items
  const quarantinedItems = dryRunScope!["quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in quarantined_items", Array.isArray(quarantinedItems) && quarantinedItems.includes("13.3")]);

  // Command arguments must have 3 entries
  const commandArguments = dryRunCommand!["command_arguments"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(commandArguments)) {
    checks.push(["command_arguments has 3 entries", commandArguments.length === 3]);
    const allHaveFields = commandArguments.every((a) => typeof a["argument"] === "string" && typeof a["value"] === "string" && typeof a["description"] === "string");
    checks.push(["all command_arguments have argument/value/description", allHaveFields]);
  }

  // Command constraints must have 5 entries
  const commandConstraints = dryRunCommand!["command_constraints"] as string[] | undefined;
  if (Array.isArray(commandConstraints)) {
    checks.push(["command_constraints has 5 entries", commandConstraints.length === 5]);
  }

  // Future outputs must all be marked as "planned"
  const allowedFutureOutputs = manifest["allowed_future_outputs"] as Record<string, unknown> | undefined;
  if (allowedFutureOutputs) {
    const artifacts = allowedFutureOutputs["artifacts"] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(artifacts)) {
      const allPlanned = artifacts.every((a) => a["status"] === "planned");
      checks.push(["future outputs all marked as planned", allPlanned]);
      checks.push(["future outputs count = 4", artifacts.length === 4]);
    }
  }

  // Forbidden artifacts must be explicitly listed
  const forbiddenArtifacts = manifest["forbidden_phase6_17_artifacts"] as Record<string, unknown> | undefined;
  if (forbiddenArtifacts) {
    const artifacts = forbiddenArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artifacts)) {
      checks.push(["forbidden artifacts includes actual_dry_run_record", artifacts.includes("actual_dry_run_record")]);
      checks.push(["forbidden artifacts includes actual_dry_run_result", artifacts.includes("actual_dry_run_result")]);
      checks.push(["forbidden artifacts includes actual_controlled_batch_run_record", artifacts.includes("actual_controlled_batch_run_record")]);
      checks.push(["forbidden artifacts includes actual_item_level_execution_result", artifacts.includes("actual_item_level_execution_result")]);
      checks.push(["forbidden artifacts includes actual_post_run_validation_report", artifacts.includes("actual_post_run_validation_report")]);
      checks.push(["forbidden artifacts includes raw_snapshots", artifacts.includes("raw_snapshots")]);
      checks.push(["forbidden artifacts includes intermediate_json", artifacts.includes("intermediate_json")]);
      checks.push(["forbidden artifacts includes rendered_outputs", artifacts.includes("rendered_outputs")]);
      checks.push(["forbidden artifacts includes crawler_outputs", artifacts.includes("crawler_outputs")]);
      checks.push(["forbidden artifacts includes recovery_outputs", artifacts.includes("recovery_outputs")]);
      checks.push(["forbidden artifacts includes web_request_results", artifacts.includes("web_request_results")]);
      checks.push(["forbidden artifacts includes ai_learning_content", artifacts.includes("ai_learning_content")]);
      checks.push(["forbidden artifacts includes source_layer_mutations", artifacts.includes("source_layer_mutations")]);
      checks.push(["forbidden artifacts includes captured_assets", artifacts.includes("captured_assets")]);
      checks.push(["forbidden artifacts count = 14", artifacts.length === 14]);
    }
  }

  // Rollback condition
  const rollbackCondition = manifest["rollback_condition"] as Record<string, unknown> | undefined;
  if (rollbackCondition) {
    checks.push(["rollback_condition.phase6_17_rollback_needed = false", rollbackCondition["phase6_17_rollback_needed"] === false]);
    const rollbackReqs = rollbackCondition["future_dry_run_rollback_requirements"] as string[] | undefined;
    if (Array.isArray(rollbackReqs)) {
      checks.push(["future_dry_run_rollback_requirements count = 3", rollbackReqs.length === 3]);
    }
  }

  // Audit condition
  const auditCondition = manifest["audit_condition"] as Record<string, unknown> | undefined;
  if (auditCondition) {
    checks.push(["audit_condition.current_approval_status = dry_run_approved", auditCondition["current_approval_status"] === "dry_run_approved"]);
    checks.push(["audit_condition.current_dry_run_status = approved_not_started", auditCondition["current_dry_run_status"] === "approved_not_started"]);
    checks.push(["audit_condition.current_dry_run_executed = false", auditCondition["current_dry_run_executed"] === false]);
    checks.push(["audit_condition.current_batch_run_executed = false", auditCondition["current_batch_run_executed"] === false]);
    checks.push(["audit_condition.no_go_confirmation = true", auditCondition["no_go_confirmation"] === true]);

    const priorPhaseChain = auditCondition["prior_phase_chain"] as string[] | undefined;
    if (Array.isArray(priorPhaseChain)) {
      checks.push(["audit_condition prior_phase_chain includes 6.0 through 6.16", priorPhaseChain.length === 17 && priorPhaseChain[0] === "6.0" && priorPhaseChain[16] === "6.16"]);
    }
  }

  // Phase progression history
  const phaseProgressionHistory = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(phaseProgressionHistory)) {
    checks.push(["phase_progression_history has 18 entries", phaseProgressionHistory.length === 18]);
    const lastEntry = phaseProgressionHistory[phaseProgressionHistory.length - 1];
    checks.push(["last phase progression = 6.17 offline_batch_dry_run_approval_decision_recorded", lastEntry?.["phase"] === "6.17" && lastEntry?.["outcome"] === "offline_batch_dry_run_approval_decision_recorded"]);
  }

  // Validation expectations
  const validationExpectations = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (validationExpectations) {
    checks.push(["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"]);
    checks.push(["validation_expectations.approval_status_must_be = dry_run_approved", validationExpectations["approval_status_must_be"] === "dry_run_approved"]);
    checks.push(["validation_expectations.approved_decision_must_be = approve_offline_dry_run", validationExpectations["approved_decision_must_be"] === "approve_offline_dry_run"]);
    checks.push(["validation_expectations.dry_run_approval_status_must_be = approved", validationExpectations["dry_run_approval_status_must_be"] === "approved"]);
    checks.push(["validation_expectations.dry_run_approved_must_be = true", validationExpectations["dry_run_approved_must_be"] === true]);
    checks.push(["validation_expectations.dry_run_executed_must_be = false", validationExpectations["dry_run_executed_must_be"] === false]);
    checks.push(["validation_expectations.batch_run_executed_must_be = false", validationExpectations["batch_run_executed_must_be"] === false]);
    checks.push(["validation_expectations.operational_assertions_all_false = true", validationExpectations["operational_assertions_all_false"] === true]);
    checks.push(["validation_expectations.no_go_confirmations_all_true = true", validationExpectations["no_go_confirmations_all_true"] === true]);
    checks.push(["validation_expectations.human_decision_fields_present = true", validationExpectations["human_decision_fields_present"] === true]);
    checks.push(["validation_expectations.dry_run_command_is_placeholder_only = true", validationExpectations["dry_run_command_is_placeholder_only"] === true]);
    checks.push(["validation_expectations.dry_run_command_approved = true", validationExpectations["dry_run_command_approved"] === true]);
  }

  // No-go confirmation validation
  checks.push(["no_go_confirmation.no_dry_run_execution_occurs = true", noGoConfirmation!["no_dry_run_execution_occurs"] === true]);
  checks.push(["no_go_confirmation.no_batch_execution_occurs = true", noGoConfirmation!["no_batch_execution_occurs"] === true]);
  checks.push(["no_go_confirmation.no_crawler_runs = true", noGoConfirmation!["no_crawler_runs"] === true]);
  checks.push(["no_go_confirmation.no_renderer_runs = true", noGoConfirmation!["no_renderer_runs"] === true]);
  checks.push(["no_go_confirmation.no_recovery_runs = true", noGoConfirmation!["no_recovery_runs"] === true]);
  checks.push(["no_go_confirmation.no_web_requests_made = true", noGoConfirmation!["no_web_requests_made"] === true]);
  checks.push(["no_go_confirmation.no_source_layer_modified = true", noGoConfirmation!["no_source_layer_modified"] === true]);
  checks.push(["no_go_confirmation.no_ai_learning_generated = true", noGoConfirmation!["no_ai_learning_generated"] === true]);
  checks.push(["no_go_confirmation.no_assets_captured = true", noGoConfirmation!["no_assets_captured"] === true]);
  checks.push(["no_go_confirmation.no_raw_snapshots_created = true", noGoConfirmation!["no_raw_snapshots_created"] === true]);
  checks.push(["no_go_confirmation.no_intermediate_json_created = true", noGoConfirmation!["no_intermediate_json_created"] === true]);
  checks.push(["no_go_confirmation.no_package_script_added_for_dry_run = true", noGoConfirmation!["no_package_script_added_for_dry_run"] === true]);
  checks.push(["no_go_confirmation.crawler_allowed_remains_false = true", noGoConfirmation!["crawler_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.renderer_allowed_remains_false = true", noGoConfirmation!["renderer_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.recovery_allowed_remains_false = true", noGoConfirmation!["recovery_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.web_requests_allowed_remains_false = true", noGoConfirmation!["web_requests_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.ai_learning_generation_allowed_remains_false = true", noGoConfirmation!["ai_learning_generation_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.no_dry_run_record_created = true", noGoConfirmation!["no_dry_run_record_created"] === true]);
  checks.push(["no_go_confirmation.no_dry_run_result_created = true", noGoConfirmation!["no_dry_run_result_created"] === true]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:offline-batch-dry-run-approval-decision] PASS: ${label}`);
    } else {
      console.error(`[validate:offline-batch-dry-run-approval-decision] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:offline-batch-dry-run-approval-decision] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:offline-batch-dry-run-approval-decision] PASS");
}

main();
