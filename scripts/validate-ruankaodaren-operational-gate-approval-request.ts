/**
 * Phase 6.10 Operational Gate Approval Request validator.
 *
 * Validates the generated phase6_10_operational_gate_approval_request.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - approval_status is not pending_human_review
 * - requested_decision is not approve_operational_execution_mode
 * - requested_execution_mode is not offline_existing_source_packet_only
 * - batch_id is not phase6_1_batch_001
 * - execution_authorization_status is not execution_approved
 * - plan_status is not planned_not_executed
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not true
 * - execution_allowed is not true
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - Any requested operational gate change is true
 * - explicitly_not_requested does not include all 5 operational gates
 * - approved_items is not exactly ["1.3"]
 * - 13.3 appears in approved_items
 * - 13.3 is not in quarantined_items
 * - 9.1 is not in deferred_items
 * - Any execution, crawler, renderer, recovery, web request, AI generation,
 *   source mutation, snapshot, or intermediate JSON creation is claimed
 *
 * Usage:
 *   pnpm validate:operational-gate-approval-request
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-operational-gate-approval-request.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_10_operational_gate_approval_request.json");

function fail(message: string): never {
  console.error(`[validate:operational-gate-approval-request] ERROR: ${message}`);
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
  console.log("[validate:operational-gate-approval-request] Phase 6.10 Operational Gate Approval Request validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:operational-gate-approval-request] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:operational-gate-approval-request] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const requestedGateChanges = manifest["requested_operational_gate_changes"] as Record<string, unknown> | undefined;
  if (!requestedGateChanges) fail("requested_operational_gate_changes missing");

  const explicitlyNotRequested = manifest["explicitly_not_requested"] as Record<string, unknown> | undefined;
  if (!explicitlyNotRequested) fail("explicitly_not_requested missing");

  const inputBoundary = manifest["input_boundary"] as Record<string, unknown> | undefined;
  if (!inputBoundary) fail("input_boundary missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const noGoConfirmation = manifest["no_go_confirmation"] as Record<string, unknown> | undefined;
  if (!noGoConfirmation) fail("no_go_confirmation missing");

  const executionModeRationale = manifest["execution_mode_rationale"] as Record<string, unknown> | undefined;
  if (!executionModeRationale) fail("execution_mode_rationale missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.10", manifest["manifest_version"] === "phase6.10"],
    ["manifest_type = operational_gate_approval_request", manifest["manifest_type"] === "operational_gate_approval_request"],
    ["status = operational_gate_approval_request_created", manifest["status"] === "operational_gate_approval_request_created"],
    ["created_for_phase = 6.10", manifest["created_for_phase"] === "6.10"],

    // Approval status
    ["approval_status = pending_human_review", manifest["approval_status"] === "pending_human_review"],
    ["requested_decision = approve_operational_execution_mode", manifest["requested_decision"] === "approve_operational_execution_mode"],
    ["requested_execution_mode = offline_existing_source_packet_only", manifest["requested_execution_mode"] === "offline_existing_source_packet_only"],

    // Batch identity
    ["batch_id = phase6_1_batch_001", manifest["batch_id"] === "phase6_1_batch_001"],
    ["execution_authorization_status = execution_approved", manifest["execution_authorization_status"] === "execution_approved"],
    ["plan_status = planned_not_executed", manifest["plan_status"] === "planned_not_executed"],

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

    // Requested operational gate changes — all false
    ["requested_gate_changes.crawler_allowed = false", requestedGateChanges!["crawler_allowed"] === false],
    ["requested_gate_changes.renderer_allowed = false", requestedGateChanges!["renderer_allowed"] === false],
    ["requested_gate_changes.recovery_allowed = false", requestedGateChanges!["recovery_allowed"] === false],
    ["requested_gate_changes.web_requests_allowed = false", requestedGateChanges!["web_requests_allowed"] === false],
    ["requested_gate_changes.ai_learning_generation_allowed = false", requestedGateChanges!["ai_learning_generation_allowed"] === false],

    // Operational assertions — no execution, generation, or mutation claimed
    ["operational_assertions.expansion_execution_claimed = false", operationalAssertions!["expansion_execution_claimed"] === false],
    ["operational_assertions.crawler_output_claimed = false", operationalAssertions!["crawler_output_claimed"] === false],
    ["operational_assertions.renderer_output_claimed = false", operationalAssertions!["renderer_output_claimed"] === false],
    ["operational_assertions.recovery_output_claimed = false", operationalAssertions!["recovery_output_claimed"] === false],
    ["operational_assertions.ai_learning_generation_claimed = false", operationalAssertions!["ai_learning_generation_claimed"] === false],
    ["operational_assertions.source_layer_mutation_declared = false", operationalAssertions!["source_layer_mutation_declared"] === false],
    ["operational_assertions.web_requests_declared = false", operationalAssertions!["web_requests_declared"] === false],
    ["operational_assertions.raw_snapshots_created = false", operationalAssertions!["raw_snapshots_created"] === false],
    ["operational_assertions.intermediate_json_created = false", operationalAssertions!["intermediate_json_created"] === false],
    ["operational_assertions.assets_captured = false", operationalAssertions!["assets_captured"] === false],

    // Execution mode rationale exists
    ["execution_mode_rationale.recommended_mode = offline_existing_source_packet_only", executionModeRationale!["recommended_mode"] === "offline_existing_source_packet_only"],
    ["execution_mode_rationale.why_crawler_not_required is non-empty string", typeof executionModeRationale!["why_crawler_not_required"] === "string" && (executionModeRationale!["why_crawler_not_required"] as string).length > 0],
    ["execution_mode_rationale.why_renderer_not_required is non-empty string", typeof executionModeRationale!["why_renderer_not_required"] === "string" && (executionModeRationale!["why_renderer_not_required"] as string).length > 0],
    ["execution_mode_rationale.why_recovery_not_required is non-empty string", typeof executionModeRationale!["why_recovery_not_required"] === "string" && (executionModeRationale!["why_recovery_not_required"] as string).length > 0],
    ["execution_mode_rationale.why_web_requests_not_required is non-empty string", typeof executionModeRationale!["why_web_requests_not_required"] === "string" && (executionModeRationale!["why_web_requests_not_required"] as string).length > 0],
    ["execution_mode_rationale.why_ai_learning_generation_not_allowed is non-empty string", typeof executionModeRationale!["why_ai_learning_generation_not_allowed"] === "string" && (executionModeRationale!["why_ai_learning_generation_not_allowed"] as string).length > 0],
  ];

  // approved_items must be exactly ["1.3"]
  const approvedItems = inputBoundary!["approved_items"] as string[] | undefined;
  checks.push(["approved_items = ['1.3']", Array.isArray(approvedItems) && approvedItems.length === 1 && approvedItems[0] === "1.3"]);

  // 13.3 must not appear in approved_items
  checks.push(["13.3 not in approved_items", Array.isArray(approvedItems) && !approvedItems.includes("13.3")]);

  // 9.1 must appear in deferred_items
  const deferredItems = inputBoundary!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in quarantined_items
  const quarantinedItems = inputBoundary!["quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in quarantined_items", Array.isArray(quarantinedItems) && quarantinedItems.includes("13.3")]);

  // explicitly_not_requested must include all 5 operational gates
  const notRequestedGates = explicitlyNotRequested!["gates"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(notRequestedGates)) {
    const gateNames = notRequestedGates.map((g) => g["gate"]);
    const allTrue = notRequestedGates.every((g) => g["value"] === true);
    checks.push(["explicitly_not_requested includes crawler_allowed=true", gateNames.includes("crawler_allowed")]);
    checks.push(["explicitly_not_requested includes renderer_allowed=true", gateNames.includes("renderer_allowed")]);
    checks.push(["explicitly_not_requested includes recovery_allowed=true", gateNames.includes("recovery_allowed")]);
    checks.push(["explicitly_not_requested includes web_requests_allowed=true", gateNames.includes("web_requests_allowed")]);
    checks.push(["explicitly_not_requested includes ai_learning_generation_allowed=true", gateNames.includes("ai_learning_generation_allowed")]);
    checks.push(["explicitly_not_requested all gate values are true", allTrue]);
    checks.push(["explicitly_not_requested count = 5", notRequestedGates.length === 5]);
  } else {
    checks.push(["explicitly_not_requested.gates is array", false]);
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
  const forbiddenArtifacts = manifest["forbidden_phase6_10_artifacts"] as Record<string, unknown> | undefined;
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
    }
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
      console.log(`[validate:operational-gate-approval-request] PASS: ${label}`);
    } else {
      console.error(`[validate:operational-gate-approval-request] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:operational-gate-approval-request] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:operational-gate-approval-request] PASS");
}

main();
