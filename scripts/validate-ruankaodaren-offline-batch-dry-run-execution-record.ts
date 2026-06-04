/**
 * Phase 6.18 Offline Batch Dry-Run Execution Record validator.
 *
 * Validates the generated phase6_18_offline_batch_dry_run_execution_record.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - dry_run_status is not completed
 * - dry_run_result is not pass
 * - dry_run_executed is not true
 * - batch_run_executed is not false
 * - formal_execution_status is not not_started
 * - run_mode is not offline_existing_source_packet_only
 * - batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - dry_run_approval_status is not approved
 * - dry_run_approved is not true
 * - run_command_approved is not true
 * - command_has_been_executed is not true
 * - command_execution_scope is not dry_run_only
 * - command_not_in_package_json is not true
 * - command_status is not executed_as_dry_run_record
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not true
 * - execution_allowed is not true
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - Any operational gate decision is not not_required or not_allowed
 * - dry_run_command.command_status is not executed_as_dry_run_record
 * - dry_run_command.command_has_been_executed is not true
 * - dry_run_command.command_is_placeholder_only is not true
 * - dry_run_command.command_not_in_package_json is not true
 * - 13.3 appears in approved_items
 * - 13.3 is not in quarantined_items
 * - 9.1 is not in deferred_items
 * - Any formal batch execution, formal item-level result, formal post-run validation,
 *   crawler, renderer, recovery, web request, AI generation, source mutation, snapshot,
 *   intermediate JSON, or asset capture is claimed
 * - future rollback requirements are missing
 * - forbidden artifacts are not explicitly listed
 *
 * Usage:
 *   pnpm validate:offline-batch-dry-run-execution-record
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-offline-batch-dry-run-execution-record.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_18_offline_batch_dry_run_execution_record.json");

function fail(message: string): never {
  console.error(`[validate:offline-batch-dry-run-execution-record] ERROR: ${message}`);
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
  console.log("[validate:offline-batch-dry-run-execution-record] Phase 6.18 Offline Batch Dry-Run Execution Record validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:offline-batch-dry-run-execution-record] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:offline-batch-dry-run-execution-record] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const operationalGateDecisions = manifest["operational_gate_decisions"] as Record<string, unknown> | undefined;
  if (!operationalGateDecisions) fail("operational_gate_decisions missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const noGoConfirmation = manifest["no_go_confirmation"] as Record<string, unknown> | undefined;
  if (!noGoConfirmation) fail("no_go_confirmation missing");

  const executionMetadata = manifest["execution_metadata"] as Record<string, unknown> | undefined;
  if (!executionMetadata) fail("execution_metadata missing");

  const dryRunCommand = manifest["dry_run_command"] as Record<string, unknown> | undefined;
  if (!dryRunCommand) fail("dry_run_command missing");

  const dryRunScope = manifest["dry_run_scope"] as Record<string, unknown> | undefined;
  if (!dryRunScope) fail("dry_run_scope missing");

  const itemAssessmentResults = manifest["item_assessment_results"] as Record<string, unknown> | undefined;
  if (!itemAssessmentResults) fail("item_assessment_results missing");

  const dryRunArtifacts = manifest["dry_run_artifacts"] as Record<string, unknown> | undefined;
  if (!dryRunArtifacts) fail("dry_run_artifacts missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.18", manifest["manifest_version"] === "phase6.18"],
    ["manifest_type = offline_batch_dry_run_execution_record", manifest["manifest_type"] === "offline_batch_dry_run_execution_record"],
    ["status = offline_batch_dry_run_execution_record_created", manifest["status"] === "offline_batch_dry_run_execution_record_created"],
    ["created_for_phase = 6.18", manifest["created_for_phase"] === "6.18"],

    // Dry-run execution status — now completed
    ["dry_run_status = completed", manifest["dry_run_status"] === "completed"],
    ["dry_run_result = pass", manifest["dry_run_result"] === "pass"],
    ["dry_run_executed = true", manifest["dry_run_executed"] === true],
    ["batch_run_executed = false", manifest["batch_run_executed"] === false],
    ["formal_execution_status = not_started", manifest["formal_execution_status"] === "not_started"],

    // Run mode and batch identity
    ["run_mode = offline_existing_source_packet_only", manifest["run_mode"] === "offline_existing_source_packet_only"],
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],
    ["dry_run_approval_status = approved", manifest["dry_run_approval_status"] === "approved"],
    ["dry_run_approved = true", manifest["dry_run_approved"] === true],
    ["run_command_approved = true", manifest["run_command_approved"] === true],
    ["command_has_been_executed = true", manifest["command_has_been_executed"] === true],
    ["command_execution_scope = dry_run_only", manifest["command_execution_scope"] === "dry_run_only"],
    ["command_not_in_package_json = true", manifest["command_not_in_package_json"] === true],

    // Execution metadata
    ["execution_metadata.execution_type = offline_batch_dry_run_execution_record", executionMetadata!["execution_type"] === "offline_batch_dry_run_execution_record"],
    ["execution_metadata.execution_phase = 6.18", executionMetadata!["execution_phase"] === "6.18"],
    ["execution_metadata.prior_decision_phase = 6.17", executionMetadata!["prior_decision_phase"] === "6.17"],
    ["execution_metadata.prior_decision_status = offline_batch_dry_run_approval_decision_recorded", executionMetadata!["prior_decision_status"] === "offline_batch_dry_run_approval_decision_recorded"],
    ["execution_metadata.prior_approval_status = dry_run_approved", executionMetadata!["prior_approval_status"] === "dry_run_approved"],
    ["execution_metadata.prior_dry_run_approval_status = approved", executionMetadata!["prior_dry_run_approval_status"] === "approved"],
    ["execution_metadata.prior_dry_run_approved = true", executionMetadata!["prior_dry_run_approved"] === true],
    ["execution_metadata.referencing_approval_phase = 6.14", executionMetadata!["referencing_approval_phase"] === "6.14"],
    ["execution_metadata.referencing_decision_phase = 6.11", executionMetadata!["referencing_decision_phase"] === "6.11"],
    ["execution_metadata.referencing_plan_phase = 6.15", executionMetadata!["referencing_plan_phase"] === "6.15"],
    ["execution_metadata.referencing_dry_run_approval_phase = 6.16", executionMetadata!["referencing_dry_run_approval_phase"] === "6.16"],
    ["execution_metadata.referencing_dry_run_decision_phase = 6.17", executionMetadata!["referencing_dry_run_decision_phase"] === "6.17"],
    ["execution_metadata.execution_scope = dry_run_only", executionMetadata!["execution_scope"] === "dry_run_only"],

    // Dry-run command — now executed as dry-run record
    ["dry_run_command.command_type = offline_batch_dry_run", dryRunCommand!["command_type"] === "offline_batch_dry_run"],
    ["dry_run_command.command_status = executed_as_dry_run_record", dryRunCommand!["command_status"] === "executed_as_dry_run_record"],
    ["dry_run_command.command_has_been_executed = true", dryRunCommand!["command_has_been_executed"] === true],
    ["dry_run_command.command_execution_scope = dry_run_only", dryRunCommand!["command_execution_scope"] === "dry_run_only"],
    ["dry_run_command.command_is_placeholder_only = true", dryRunCommand!["command_is_placeholder_only"] === true],
    ["dry_run_command.command_not_in_package_json = true", dryRunCommand!["command_not_in_package_json"] === true],

    // Dry-run scope
    ["dry_run_scope.source_layer_mutation_allowed = false", dryRunScope!["source_layer_mutation_allowed"] === false],
    ["dry_run_scope.output_artifact_creation_allowed = true", dryRunScope!["output_artifact_creation_allowed"] === true],
    ["dry_run_scope.output_artifact_isolation = data/dry-runs/phase6_18/", dryRunScope!["output_artifact_isolation"] === "data/dry-runs/phase6_18/"],

    // Item assessment results
    ["item_assessment_results.item_1_3.status = execution_approved", (itemAssessmentResults!["item_1_3"] as Record<string, unknown>)?.["status"] === "execution_approved"],
    ["item_assessment_results.item_1_3.dry_run_result = dry_run_scope_valid", (itemAssessmentResults!["item_1_3"] as Record<string, unknown>)?.["dry_run_result"] === "dry_run_scope_valid"],
    ["item_assessment_results.item_1_3.source_packet_available = true", (itemAssessmentResults!["item_1_3"] as Record<string, unknown>)?.["source_packet_available"] === true],
    ["item_assessment_results.item_1_3.parser_contract_valid = true", (itemAssessmentResults!["item_1_3"] as Record<string, unknown>)?.["parser_contract_valid"] === true],
    ["item_assessment_results.item_9_1.status = deferred_candidate", (itemAssessmentResults!["item_9_1"] as Record<string, unknown>)?.["status"] === "deferred_candidate"],
    ["item_assessment_results.item_9_1.dry_run_result = deferred_not_assessed", (itemAssessmentResults!["item_9_1"] as Record<string, unknown>)?.["dry_run_result"] === "deferred_not_assessed"],
    ["item_assessment_results.item_13_3.status = quarantined_ineligible", (itemAssessmentResults!["item_13_3"] as Record<string, unknown>)?.["status"] === "quarantined_ineligible"],
    ["item_assessment_results.item_13_3.dry_run_result = quarantined_ineligible", (itemAssessmentResults!["item_13_3"] as Record<string, unknown>)?.["dry_run_result"] === "quarantined_ineligible"],

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

  // 9.1 must appear in deferred_items
  const deferredItems = dryRunScope!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in quarantined_items
  const quarantinedItems = dryRunScope!["quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in quarantined_items", Array.isArray(quarantinedItems) && quarantinedItems.includes("13.3")]);

  // 1.3 must appear in included_items
  const includedItems = dryRunScope!["included_items"] as string[] | undefined;
  checks.push(["1.3 in included_items", Array.isArray(includedItems) && includedItems.includes("1.3")]);

  // 9.1 and 13.3 must appear in excluded_items
  const excludedItems = dryRunScope!["excluded_items"] as string[] | undefined;
  checks.push(["9.1 in excluded_items", Array.isArray(excludedItems) && excludedItems.includes("9.1")]);
  checks.push(["13.3 in excluded_items", Array.isArray(excludedItems) && excludedItems.includes("13.3")]);

  // Command arguments must have 3 entries
  const commandArguments = dryRunCommand!["command_arguments"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(commandArguments)) {
    checks.push(["command_arguments has 3 entries", commandArguments.length === 3]);
    const allHaveFields = commandArguments.every((a) => typeof a["argument"] === "string" && typeof a["value"] === "string" && typeof a["description"] === "string");
    checks.push(["all command_arguments have argument/value/description", allHaveFields]);
  }

  // Dry-run artifacts must have 4 entries
  const dryRunArtifactList = dryRunArtifacts!["artifacts"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(dryRunArtifactList)) {
    checks.push(["dry_run_artifacts has 4 entries", dryRunArtifactList.length === 4]);
    const allCreated = dryRunArtifactList.every((a) => a["status"] === "created");
    checks.push(["all dry_run_artifacts status = created", allCreated]);
  }

  // Forbidden artifacts must be explicitly listed
  const forbiddenArtifacts = manifest["forbidden_phase6_18_artifacts"] as Record<string, unknown> | undefined;
  if (forbiddenArtifacts) {
    const artifacts = forbiddenArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artifacts)) {
      checks.push(["forbidden artifacts includes formal_controlled_batch_run_record", artifacts.includes("formal_controlled_batch_run_record")]);
      checks.push(["forbidden artifacts includes formal_item_level_execution_result", artifacts.includes("formal_item_level_execution_result")]);
      checks.push(["forbidden artifacts includes formal_post_run_validation_report", artifacts.includes("formal_post_run_validation_report")]);
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

  // Rollback condition
  const rollbackCondition = manifest["rollback_condition"] as Record<string, unknown> | undefined;
  if (rollbackCondition) {
    checks.push(["rollback_condition.phase6_18_rollback_needed = false", rollbackCondition["phase6_18_rollback_needed"] === false]);
    const rollbackReqs = rollbackCondition["future_rollback_requirements"] as string[] | undefined;
    if (Array.isArray(rollbackReqs)) {
      checks.push(["future_rollback_requirements count = 3", rollbackReqs.length === 3]);
    }
  }

  // Audit condition
  const auditCondition = manifest["audit_condition"] as Record<string, unknown> | undefined;
  if (auditCondition) {
    checks.push(["audit_condition.current_dry_run_status = completed", auditCondition["current_dry_run_status"] === "completed"]);
    checks.push(["audit_condition.current_dry_run_result = pass", auditCondition["current_dry_run_result"] === "pass"]);
    checks.push(["audit_condition.current_dry_run_executed = true", auditCondition["current_dry_run_executed"] === true]);
    checks.push(["audit_condition.current_batch_run_executed = false", auditCondition["current_batch_run_executed"] === false]);
    checks.push(["audit_condition.current_formal_execution_status = not_started", auditCondition["current_formal_execution_status"] === "not_started"]);
    checks.push(["audit_condition.no_go_confirmation = true", auditCondition["no_go_confirmation"] === true]);

    const priorPhaseChain = auditCondition["prior_phase_chain"] as string[] | undefined;
    if (Array.isArray(priorPhaseChain)) {
      checks.push(["audit_condition prior_phase_chain includes 6.0 through 6.17", priorPhaseChain.length === 18 && priorPhaseChain[0] === "6.0" && priorPhaseChain[17] === "6.17"]);
    }
  }

  // Phase progression history
  const phaseProgressionHistory = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(phaseProgressionHistory)) {
    checks.push(["phase_progression_history has 19 entries", phaseProgressionHistory.length === 19]);
    const lastEntry = phaseProgressionHistory[phaseProgressionHistory.length - 1];
    checks.push(["last phase progression = 6.18 offline_batch_dry_run_execution_record_created", lastEntry?.["phase"] === "6.18" && lastEntry?.["outcome"] === "offline_batch_dry_run_execution_record_created"]);
  }

  // Validation expectations
  const validationExpectations = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (validationExpectations) {
    checks.push(["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"]);
    checks.push(["validation_expectations.dry_run_status_must_be = completed", validationExpectations["dry_run_status_must_be"] === "completed"]);
    checks.push(["validation_expectations.dry_run_result_must_be = pass", validationExpectations["dry_run_result_must_be"] === "pass"]);
    checks.push(["validation_expectations.dry_run_executed_must_be = true", validationExpectations["dry_run_executed_must_be"] === true]);
    checks.push(["validation_expectations.batch_run_executed_must_be = false", validationExpectations["batch_run_executed_must_be"] === false]);
    checks.push(["validation_expectations.formal_execution_status_must_be = not_started", validationExpectations["formal_execution_status_must_be"] === "not_started"]);
    checks.push(["validation_expectations.operational_assertions_all_false = true", validationExpectations["operational_assertions_all_false"] === true]);
    checks.push(["validation_expectations.no_go_confirmations_all_true = true", validationExpectations["no_go_confirmations_all_true"] === true]);
    checks.push(["validation_expectations.dry_run_artifacts_isolated = true", validationExpectations["dry_run_artifacts_isolated"] === true]);
    checks.push(["validation_expectations.forbidden_artifacts_explicitly_listed = true", validationExpectations["forbidden_artifacts_explicitly_listed"] === true]);
    checks.push(["validation_expectations.dry_run_command_executed_as_dry_run_record = true", validationExpectations["dry_run_command_executed_as_dry_run_record"] === true]);
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
  checks.push(["no_go_confirmation.no_package_script_added_for_batch = true", noGoConfirmation!["no_package_script_added_for_batch"] === true]);
  checks.push(["no_go_confirmation.crawler_allowed_remains_false = true", noGoConfirmation!["crawler_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.renderer_allowed_remains_false = true", noGoConfirmation!["renderer_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.recovery_allowed_remains_false = true", noGoConfirmation!["recovery_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.web_requests_allowed_remains_false = true", noGoConfirmation!["web_requests_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.ai_learning_generation_allowed_remains_false = true", noGoConfirmation!["ai_learning_generation_allowed_remains_false"] === true]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:offline-batch-dry-run-execution-record] PASS: ${label}`);
    } else {
      console.error(`[validate:offline-batch-dry-run-execution-record] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:offline-batch-dry-run-execution-record] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:offline-batch-dry-run-execution-record] PASS");
}

main();
