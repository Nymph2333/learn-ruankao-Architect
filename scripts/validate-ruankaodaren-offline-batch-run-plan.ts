/**
 * Phase 6.12 Offline Batch Run Plan validator.
 *
 * Validates the generated phase6_12_offline_batch_run_plan.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - plan_status is not planned_not_executed
 * - run_mode is not offline_existing_source_packet_only
 * - batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - execution_authorization_status is not execution_approved
 * - operational_mode_approval_status is not operational_mode_approved
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not true
 * - execution_allowed is not true
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - Any operational gate decision is not not_required or not_allowed
 * - 13.3 appears in approved_items
 * - 13.3 is not in quarantined_items
 * - 9.1 is not in deferred_items
 * - Any execution, crawler, renderer, recovery, web request, AI generation,
 *   source mutation, snapshot, intermediate JSON, or asset capture is claimed
 * - Any run sequence step has executed_in_phase6_12 = true
 *
 * Usage:
 *   pnpm validate:offline-batch-run-plan
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-offline-batch-run-plan.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_12_offline_batch_run_plan.json");

function fail(message: string): never {
  console.error(`[validate:offline-batch-run-plan] ERROR: ${message}`);
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
  console.log("[validate:offline-batch-run-plan] Phase 6.12 Offline Batch Run Plan validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:offline-batch-run-plan] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:offline-batch-run-plan] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const operationalGateDecisions = manifest["operational_gate_decisions"] as Record<string, unknown> | undefined;
  if (!operationalGateDecisions) fail("operational_gate_decisions missing");

  const runScope = manifest["run_scope"] as Record<string, unknown> | undefined;
  if (!runScope) fail("run_scope missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const noGoConfirmation = manifest["no_go_confirmation"] as Record<string, unknown> | undefined;
  if (!noGoConfirmation) fail("no_go_confirmation missing");

  const planMetadata = manifest["plan_metadata"] as Record<string, unknown> | undefined;
  if (!planMetadata) fail("plan_metadata missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.12", manifest["manifest_version"] === "phase6.12"],
    ["manifest_type = offline_batch_run_plan", manifest["manifest_type"] === "offline_batch_run_plan"],
    ["status = offline_batch_run_plan_created", manifest["status"] === "offline_batch_run_plan_created"],
    ["created_for_phase = 6.12", manifest["created_for_phase"] === "6.12"],

    // Plan status
    ["plan_status = planned_not_executed", manifest["plan_status"] === "planned_not_executed"],
    ["run_mode = offline_existing_source_packet_only", manifest["run_mode"] === "offline_existing_source_packet_only"],

    // Batch identity
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],
    ["execution_authorization_status = execution_approved", manifest["execution_authorization_status"] === "execution_approved"],
    ["operational_mode_approval_status = operational_mode_approved", manifest["operational_mode_approval_status"] === "operational_mode_approved"],

    // Plan metadata
    ["plan_metadata.plan_type = offline_batch_run_plan", planMetadata!["plan_type"] === "offline_batch_run_plan"],
    ["plan_metadata.plan_phase = 6.12", planMetadata!["plan_phase"] === "6.12"],
    ["plan_metadata.referencing_decision_phase = 6.11", planMetadata!["referencing_decision_phase"] === "6.11"],
    ["plan_metadata.referencing_approval_phase = 6.10", planMetadata!["referencing_approval_phase"] === "6.10"],
    ["plan_metadata.plan_scope = offline_batch_run_plan_only", planMetadata!["plan_scope"] === "offline_batch_run_plan_only"],

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

    // Run scope
    ["run_scope.batch_id = phase6_1_batch_001", runScope!["batch_id"] === "phase6_1_batch_001"],
    ["run_scope.source_layer_mutation_allowed = false", runScope!["source_layer_mutation_allowed"] === false],

    // Operational assertions — no execution, generation, or mutation claimed
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

  // run_scope approved_items must be exactly ["1.3"]
  const runScopeApprovedItems = runScope!["approved_items"] as string[] | undefined;
  checks.push(["run_scope.approved_items = ['1.3']", Array.isArray(runScopeApprovedItems) && runScopeApprovedItems.length === 1 && runScopeApprovedItems[0] === "1.3"]);

  // 9.1 must appear in deferred_items
  const deferredItems = runScope!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in quarantined_items
  const quarantinedItems = runScope!["quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in quarantined_items", Array.isArray(quarantinedItems) && quarantinedItems.includes("13.3")]);

  // All planned run sequence steps must have executed_in_phase6_12 = false
  const plannedRunSequence = manifest["planned_run_sequence"] as Record<string, unknown> | undefined;
  if (plannedRunSequence) {
    const steps = plannedRunSequence["steps"] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(steps)) {
      const allNotExecuted = steps.every((s) => s["executed_in_phase6_12"] === false);
      checks.push(["all run sequence steps executed_in_phase6_12 = false", allNotExecuted]);
      checks.push(["run sequence has 12 steps", steps.length === 12]);
    }
  }

  // Future artifacts must all be marked as "planned"
  const allowedFutureArtifacts = manifest["allowed_future_artifacts"] as Record<string, unknown> | undefined;
  if (allowedFutureArtifacts) {
    const artifacts = allowedFutureArtifacts["artifacts"] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(artifacts)) {
      const allPlanned = artifacts.every((a) => a["status"] === "planned");
      checks.push(["future artifacts all marked as planned", allPlanned]);
      checks.push(["future artifacts count >= 4", artifacts.length >= 4]);
    }
  }

  // Forbidden artifacts must be explicitly listed
  const forbiddenArtifacts = manifest["forbidden_phase6_12_artifacts"] as Record<string, unknown> | undefined;
  if (forbiddenArtifacts) {
    const artifacts = forbiddenArtifacts["artifacts"] as string[] | undefined;
    if (Array.isArray(artifacts)) {
      checks.push(["forbidden artifacts includes raw_snapshots", artifacts.includes("raw_snapshots")]);
      checks.push(["forbidden artifacts includes intermediate_json", artifacts.includes("intermediate_json")]);
      checks.push(["forbidden artifacts includes rendered_outputs", artifacts.includes("rendered_outputs")]);
      checks.push(["forbidden artifacts includes crawler_outputs", artifacts.includes("crawler_outputs")]);
      checks.push(["forbidden artifacts includes recovery_outputs", artifacts.includes("recovery_outputs")]);
      checks.push(["forbidden artifacts includes ai_learning_content", artifacts.includes("ai_learning_content")]);
      checks.push(["forbidden artifacts includes source_layer_mutations", artifacts.includes("source_layer_mutations")]);
      checks.push(["forbidden artifacts includes newly_captured_assets", artifacts.includes("newly_captured_assets")]);
      checks.push(["forbidden artifacts includes web_request_results", artifacts.includes("web_request_results")]);
      checks.push(["forbidden artifacts includes actual_execution_result_files", artifacts.includes("actual_execution_result_files")]);
    }
  }

  // Input boundary — access_mode must be read_only for all allowed inputs
  const inputBoundary = manifest["input_boundary"] as Record<string, unknown> | undefined;
  if (inputBoundary) {
    const allowedInputs = inputBoundary["allowed_inputs"] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(allowedInputs)) {
      const allReadOnly = allowedInputs.every((i) => i["access_mode"] === "read_only");
      checks.push(["all allowed inputs access_mode = read_only", allReadOnly]);
      checks.push(["allowed inputs count = 13", allowedInputs.length === 13]);
    }
    const forbiddenInputs = inputBoundary["forbidden_inputs"] as string[] | undefined;
    if (Array.isArray(forbiddenInputs)) {
      checks.push(["forbidden inputs includes new_web_content", forbiddenInputs.includes("new_web_content")]);
      checks.push(["forbidden inputs includes crawler_output", forbiddenInputs.includes("crawler_output")]);
      checks.push(["forbidden inputs includes ai_generated_learning_content", forbiddenInputs.includes("ai_generated_learning_content")]);
      checks.push(["forbidden inputs count = 8", forbiddenInputs.length === 8]);
    }
  }

  // Rollback boundary
  const rollbackBoundary = manifest["rollback_boundary"] as Record<string, unknown> | undefined;
  if (rollbackBoundary) {
    checks.push(["rollback_boundary.phase6_12_rollback_needed = false", rollbackBoundary["phase6_12_rollback_needed"] === false]);
  }

  // Audit boundary
  const auditBoundary = manifest["audit_boundary"] as Record<string, unknown> | undefined;
  if (auditBoundary) {
    checks.push(["audit_boundary.current_run_mode = offline_existing_source_packet_only", auditBoundary["current_run_mode"] === "offline_existing_source_packet_only"]);
    checks.push(["audit_boundary.current_operational_mode_approval_status = operational_mode_approved", auditBoundary["current_operational_mode_approval_status"] === "operational_mode_approved"]);
    checks.push(["audit_boundary.current_execution_authorization_status = execution_approved", auditBoundary["current_execution_authorization_status"] === "execution_approved"]);
    checks.push(["audit_boundary.current_plan_status = planned_not_executed", auditBoundary["current_plan_status"] === "planned_not_executed"]);
    checks.push(["audit_boundary.no_go_confirmation = true", auditBoundary["no_go_confirmation"] === true]);

    const priorPhaseChain = auditBoundary["prior_phase_chain"] as string[] | undefined;
    if (Array.isArray(priorPhaseChain)) {
      checks.push(["audit_boundary prior_phase_chain includes 6.0 through 6.11", priorPhaseChain.length === 12 && priorPhaseChain[0] === "6.0" && priorPhaseChain[11] === "6.11"]);
    }
  }

  // Phase progression history
  const phaseProgressionHistory = manifest["phase_progression_history"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(phaseProgressionHistory)) {
    checks.push(["phase_progression_history has 13 entries", phaseProgressionHistory.length === 13]);
    const lastEntry = phaseProgressionHistory[phaseProgressionHistory.length - 1];
    checks.push(["last phase progression = 6.12 offline_batch_run_plan_created", lastEntry?.["phase"] === "6.12" && lastEntry?.["outcome"] === "offline_batch_run_plan_created"]);
  }

  // Validation expectations
  const validationExpectations = manifest["validation_expectations"] as Record<string, unknown> | undefined;
  if (validationExpectations) {
    checks.push(["validation_expectations.schema_validation = must_pass", validationExpectations["schema_validation"] === "must_pass"]);
    checks.push(["validation_expectations.plan_status_must_be = planned_not_executed", validationExpectations["plan_status_must_be"] === "planned_not_executed"]);
    checks.push(["validation_expectations.run_mode_must_be = offline_existing_source_packet_only", validationExpectations["run_mode_must_be"] === "offline_existing_source_packet_only"]);
    checks.push(["validation_expectations.operational_assertions_all_false = true", validationExpectations["operational_assertions_all_false"] === true]);
    checks.push(["validation_expectations.no_go_confirmations_all_true = true", validationExpectations["no_go_confirmations_all_true"] === true]);
  }

  // No-go confirmation validation
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
  checks.push(["no_go_confirmation.crawler_allowed_remains_false = true", noGoConfirmation!["crawler_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.renderer_allowed_remains_false = true", noGoConfirmation!["renderer_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.recovery_allowed_remains_false = true", noGoConfirmation!["recovery_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.web_requests_allowed_remains_false = true", noGoConfirmation!["web_requests_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.ai_learning_generation_allowed_remains_false = true", noGoConfirmation!["ai_learning_generation_allowed_remains_false"] === true]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:offline-batch-run-plan] PASS: ${label}`);
    } else {
      console.error(`[validate:offline-batch-run-plan] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:offline-batch-run-plan] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:offline-batch-run-plan] PASS");
}

main();
