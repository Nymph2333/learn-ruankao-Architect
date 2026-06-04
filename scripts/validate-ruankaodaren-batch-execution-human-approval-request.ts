/**
 * Phase 6.7 Batch Execution Human Approval Request validator.
 *
 * Validates the generated phase6_7_batch_execution_human_approval_request.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - approval_status is not pending_human_review
 * - requested_decision is not approve_execution
 * - approval_scope is not batch_execution_authorization_only
 * - batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - readiness_status is not execution_candidate
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not false
 * - execution_allowed is not false
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - requested_gate_changes does not request batch_executable=true and execution_allowed=true
 * - explicitly_not_requested does not include all operational gates
 * - 13.3 appears in approved_items
 * - 13.3 is not quarantined
 * - 9.1 is not deferred
 * - Any expansion execution, crawler output, renderer output, AI generation,
 *   source mutation, snapshot creation, or intermediate JSON creation is claimed
 *
 * Usage:
 *   pnpm validate:batch-execution-human-approval-request
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-batch-execution-human-approval-request.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_7_batch_execution_human_approval_request.json");

function fail(message: string): never {
  console.error(`[validate:batch-execution-human-approval-request] ERROR: ${message}`);
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
  console.log("[validate:batch-execution-human-approval-request] Phase 6.7 Batch Execution Human Approval Request validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:batch-execution-human-approval-request] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:batch-execution-human-approval-request] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const approvalMeta = manifest["approval_request_metadata"] as Record<string, unknown> | undefined;
  if (!approvalMeta) fail("approval_request_metadata missing");

  const batchSummary = manifest["batch_summary"] as Record<string, unknown> | undefined;
  if (!batchSummary) fail("batch_summary missing");

  const finalDecision = manifest["final_decision"] as Record<string, unknown> | undefined;
  if (!finalDecision) fail("final_decision missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.7", manifest["manifest_version"] === "phase6.7"],
    ["manifest_type = batch_execution_human_approval_request", manifest["manifest_type"] === "batch_execution_human_approval_request"],
    ["status = execution_approval_request_pending_human_review", manifest["status"] === "execution_approval_request_pending_human_review"],

    // Phase gates — activation gates open, execution gates closed
    ["phase_gates.phase6_1_entry_allowed = true", gates!["phase6_1_entry_allowed"] === true],
    ["phase_gates.activation_allowed = true", gates!["activation_allowed"] === true],
    ["phase_gates.batch_executable = false", gates!["batch_executable"] === false],
    ["phase_gates.execution_allowed = false", gates!["execution_allowed"] === false],
    ["phase_gates.crawler_allowed = false", gates!["crawler_allowed"] === false],
    ["phase_gates.renderer_allowed = false", gates!["renderer_allowed"] === false],
    ["phase_gates.recovery_allowed = false", gates!["recovery_allowed"] === false],
    ["phase_gates.web_requests_allowed = false", gates!["web_requests_allowed"] === false],
    ["phase_gates.ai_learning_generation_allowed = false", gates!["ai_learning_generation_allowed"] === false],
    ["phase_gates.approval_granted = false", gates!["approval_granted"] === false],

    // Approval request metadata
    ["approval_request_metadata.request_type = batch_execution_approval", approvalMeta!["request_type"] === "batch_execution_approval"],
    ["approval_request_metadata.requested_for_batch = phase6_1_batch_001", approvalMeta!["requested_for_batch"] === "phase6_1_batch_001"],
    ["approval_request_metadata.requested_decision = approve_execution", approvalMeta!["requested_decision"] === "approve_execution"],
    ["approval_request_metadata.approval_scope = batch_execution_authorization_only", approvalMeta!["approval_scope"] === "batch_execution_authorization_only"],
    ["approval_request_metadata.approval_status = pending_human_review", approvalMeta!["approval_status"] === "pending_human_review"],
    ["approval_request_metadata.requires_human_decision = true", approvalMeta!["requires_human_decision"] === true],
    ["approval_request_metadata.readiness_status = execution_candidate", approvalMeta!["readiness_status"] === "execution_candidate"],

    // Batch summary
    ["batch_summary.batch_id = phase6_1_batch_001", batchSummary!["batch_id"] === "phase6_1_batch_001"],
    ["batch_summary.item_count = 1", batchSummary!["item_count"] === 1],
    ["batch_summary.batch_size_within_limits = true", batchSummary!["batch_size_within_limits"] === true],
    ["batch_summary.readiness_status = execution_candidate", batchSummary!["readiness_status"] === "execution_candidate"],

    // Final decision
    ["final_decision.approval_request_prepared = true", finalDecision!["approval_request_prepared"] === true],
    ["final_decision.approval_status = pending_human_review", finalDecision!["approval_status"] === "pending_human_review"],
    ["final_decision.requested_decision = approve_execution", finalDecision!["requested_decision"] === "approve_execution"],
    ["final_decision.approval_scope = batch_execution_authorization_only", finalDecision!["approval_scope"] === "batch_execution_authorization_only"],
    ["final_decision.batch_id = phase6_1_batch_001", finalDecision!["batch_id"] === "phase6_1_batch_001"],
    ["final_decision.readiness_status = execution_candidate", finalDecision!["readiness_status"] === "execution_candidate"],
    ["final_decision.phase6_1_entry_allowed = true", finalDecision!["phase6_1_entry_allowed"] === true],
    ["final_decision.activation_allowed = true", finalDecision!["activation_allowed"] === true],
    ["final_decision.batch_executable = false", finalDecision!["batch_executable"] === false],
    ["final_decision.execution_allowed = false", finalDecision!["execution_allowed"] === false],

    // Operational assertions — no execution, generation, or mutation claimed
    ["operational_assertions.expansion_execution_claimed = false", operationalAssertions!["expansion_execution_claimed"] === false],
    ["operational_assertions.crawler_output_claimed = false", operationalAssertions!["crawler_output_claimed"] === false],
    ["operational_assertions.renderer_output_claimed = false", operationalAssertions!["renderer_output_claimed"] === false],
    ["operational_assertions.ai_learning_generation_claimed = false", operationalAssertions!["ai_learning_generation_claimed"] === false],
    ["operational_assertions.source_layer_mutation_declared = false", operationalAssertions!["source_layer_mutation_declared"] === false],
    ["operational_assertions.web_requests_declared = false", operationalAssertions!["web_requests_declared"] === false],
    ["operational_assertions.raw_snapshots_created = false", operationalAssertions!["raw_snapshots_created"] === false],
    ["operational_assertions.intermediate_json_created = false", operationalAssertions!["intermediate_json_created"] === false],
    ["operational_assertions.assets_captured = false", operationalAssertions!["assets_captured"] === false],
  ];

  // approved_items must be exactly ["1.3"]
  const approvedItems = batchSummary!["approved_items"] as string[] | undefined;
  checks.push(["approved_items = ['1.3']", Array.isArray(approvedItems) && approvedItems.length === 1 && approvedItems[0] === "1.3"]);

  // 13.3 must not appear in approved_items
  checks.push(["13.3 not in approved_items", Array.isArray(approvedItems) && !approvedItems.includes("13.3")]);

  // 9.1 must appear in deferred_items
  const deferredItems = batchSummary!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in quarantined_items
  const quarantinedItems = batchSummary!["quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in quarantined_items", Array.isArray(quarantinedItems) && quarantinedItems.includes("13.3")]);

  // Final decision item checks
  const finalApprovedItems = finalDecision!["approved_items"] as string[] | undefined;
  checks.push(["final_decision.approved_items = ['1.3']", Array.isArray(finalApprovedItems) && finalApprovedItems.length === 1 && finalApprovedItems[0] === "1.3"]);

  const finalDeferredItems = finalDecision!["deferred_items"] as string[] | undefined;
  checks.push(["final_decision.deferred_items includes 9.1", Array.isArray(finalDeferredItems) && finalDeferredItems.includes("9.1")]);

  const finalQuarantinedItems = finalDecision!["quarantined_items"] as string[] | undefined;
  checks.push(["final_decision.quarantined_items includes 13.3", Array.isArray(finalQuarantinedItems) && finalQuarantinedItems.includes("13.3")]);

  // Requested gate changes validation
  const requestedGateChanges = manifest["requested_gate_changes"] as Record<string, unknown> | undefined;
  if (requestedGateChanges) {
    const gatesToOpen = requestedGateChanges["gates_to_open"] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(gatesToOpen)) {
      const batchExecutableRequested = gatesToOpen.find((g) => g["gate"] === "batch_executable");
      checks.push(["requested_gate_changes.batch_executable = true", batchExecutableRequested !== undefined && batchExecutableRequested["requested"] === true]);

      const executionAllowedRequested = gatesToOpen.find((g) => g["gate"] === "execution_allowed");
      checks.push(["requested_gate_changes.execution_allowed = true", executionAllowedRequested !== undefined && executionAllowedRequested["requested"] === true]);
    }
  }

  // Explicitly not requested validation
  const explicitlyNotRequested = manifest["explicitly_not_requested"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(explicitlyNotRequested)) {
    const gateNames = explicitlyNotRequested.map((g) => g["gate"]);
    checks.push(["explicitly_not_requested includes crawler_allowed", gateNames.includes("crawler_allowed")]);
    checks.push(["explicitly_not_requested includes renderer_allowed", gateNames.includes("renderer_allowed")]);
    checks.push(["explicitly_not_requested includes recovery_allowed", gateNames.includes("recovery_allowed")]);
    checks.push(["explicitly_not_requested includes web_requests_allowed", gateNames.includes("web_requests_allowed")]);
    checks.push(["explicitly_not_requested includes ai_learning_generation_allowed", gateNames.includes("ai_learning_generation_allowed")]);

    // All explicitly_not_requested must have requested=false
    const allNotRequested = explicitlyNotRequested.every((g) => g["requested"] === false);
    checks.push(["explicitly_not_requested all have requested=false", allNotRequested]);
  }

  // No-go confirmation validation
  const noGoConfirmation = manifest["no_go_confirmation"] as Record<string, unknown> | undefined;
  if (noGoConfirmation) {
    checks.push(["no_go_confirmation.batch_executable_remains_false = true", noGoConfirmation["batch_executable_remains_false"] === true]);
    checks.push(["no_go_confirmation.execution_allowed_remains_false = true", noGoConfirmation["execution_allowed_remains_false"] === true]);
    checks.push(["no_go_confirmation.no_batch_execution_occurs = true", noGoConfirmation["no_batch_execution_occurs"] === true]);
    checks.push(["no_go_confirmation.no_crawler_runs = true", noGoConfirmation["no_crawler_runs"] === true]);
    checks.push(["no_go_confirmation.no_renderer_runs = true", noGoConfirmation["no_renderer_runs"] === true]);
    checks.push(["no_go_confirmation.no_recovery_runs = true", noGoConfirmation["no_recovery_runs"] === true]);
    checks.push(["no_go_confirmation.no_web_requests_made = true", noGoConfirmation["no_web_requests_made"] === true]);
    checks.push(["no_go_confirmation.no_source_layer_modified = true", noGoConfirmation["no_source_layer_modified"] === true]);
    checks.push(["no_go_confirmation.no_ai_learning_generated = true", noGoConfirmation["no_ai_learning_generated"] === true]);
  }

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:batch-execution-human-approval-request] PASS: ${label}`);
    } else {
      console.error(`[validate:batch-execution-human-approval-request] FAIL: ${label}`);
      failed = true;
    }
  }

  if (failed) fail("One or more invariant checks failed");

  console.log(`[validate:batch-execution-human-approval-request] All ${checks.length} invariant checks passed`);
  console.log("[validate:batch-execution-human-approval-request] PASS");
}

main();
