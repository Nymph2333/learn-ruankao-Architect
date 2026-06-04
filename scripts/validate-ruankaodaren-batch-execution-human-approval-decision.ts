/**
 * Phase 6.8 Batch Execution Human Approval Decision validator.
 *
 * Validates the generated phase6_8_batch_execution_human_approval_decision.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - approval_status is not execution_approved
 * - approved_decision is not approve_execution
 * - approval_scope is not batch_execution_authorization_only
 * - approved_batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not true
 * - execution_allowed is not true
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - 13.3 appears in approved_items
 * - 13.3 is not quarantined
 * - 9.1 is not deferred
 * - Any expansion execution, crawler output, renderer output, AI generation,
 *   source mutation, snapshot creation, or intermediate JSON creation is claimed
 *
 * Usage:
 *   pnpm validate:batch-execution-human-approval-decision
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-batch-execution-human-approval-decision.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_8_batch_execution_human_approval_decision.json");

function fail(message: string): never {
  console.error(`[validate:batch-execution-human-approval-decision] ERROR: ${message}`);
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
  console.log("[validate:batch-execution-human-approval-decision] Phase 6.8 Batch Execution Human Approval Decision validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:batch-execution-human-approval-decision] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:batch-execution-human-approval-decision] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const decisionMeta = manifest["decision_metadata"] as Record<string, unknown> | undefined;
  if (!decisionMeta) fail("decision_metadata missing");

  const batchSummary = manifest["batch_summary"] as Record<string, unknown> | undefined;
  if (!batchSummary) fail("batch_summary missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const noGoConfirmation = manifest["no_go_confirmation"] as Record<string, unknown> | undefined;
  if (!noGoConfirmation) fail("no_go_confirmation missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.8", manifest["manifest_version"] === "phase6.8"],
    ["manifest_type = batch_execution_human_approval_decision", manifest["manifest_type"] === "batch_execution_human_approval_decision"],
    ["status = execution_approved", manifest["status"] === "execution_approved"],
    ["created_for_phase = 6.8", manifest["created_for_phase"] === "6.8"],

    // Phase gates — batch_executable and execution_allowed now true, operational gates remain false
    ["phase_gates.phase6_1_entry_allowed = true", gates!["phase6_1_entry_allowed"] === true],
    ["phase_gates.activation_allowed = true", gates!["activation_allowed"] === true],
    ["phase_gates.batch_executable = true", gates!["batch_executable"] === true],
    ["phase_gates.execution_allowed = true", gates!["execution_allowed"] === true],
    ["phase_gates.crawler_allowed = false", gates!["crawler_allowed"] === false],
    ["phase_gates.renderer_allowed = false", gates!["renderer_allowed"] === false],
    ["phase_gates.recovery_allowed = false", gates!["recovery_allowed"] === false],
    ["phase_gates.web_requests_allowed = false", gates!["web_requests_allowed"] === false],
    ["phase_gates.ai_learning_generation_allowed = false", gates!["ai_learning_generation_allowed"] === false],
    ["phase_gates.approval_granted = false", gates!["approval_granted"] === false],

    // Decision metadata
    ["decision_metadata.decision_type = human_execution_approval", decisionMeta!["decision_type"] === "human_execution_approval"],
    ["decision_metadata.approved_decision = approve_execution", decisionMeta!["approved_decision"] === "approve_execution"],
    ["decision_metadata.approval_scope = batch_execution_authorization_only", decisionMeta!["approval_scope"] === "batch_execution_authorization_only"],
    ["decision_metadata.approval_status = execution_approved", decisionMeta!["approval_status"] === "execution_approved"],
    ["decision_metadata.approved_batch_id = phase6_1_batch_001", decisionMeta!["approved_batch_id"] === "phase6_1_batch_001"],
    ["decision_metadata.decision_phase = 6.8", decisionMeta!["decision_phase"] === "6.8"],

    // Batch summary
    ["batch_summary.batch_id = phase6_1_batch_001", batchSummary!["batch_id"] === "phase6_1_batch_001"],
    ["batch_summary.item_count = 1", batchSummary!["item_count"] === 1],
    ["batch_summary.batch_size_within_limits = true", batchSummary!["batch_size_within_limits"] === true],

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

  // Gate changes applied validation
  const gateChangesApplied = manifest["gate_changes_applied"] as Record<string, unknown> | undefined;
  if (gateChangesApplied) {
    const changes = gateChangesApplied["changes"] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(changes)) {
      const batchExecutableChange = changes.find((c) => c["gate"] === "batch_executable");
      checks.push(["gate_changes_applied.batch_executable: false→true", batchExecutableChange !== undefined && batchExecutableChange["before"] === false && batchExecutableChange["after"] === true]);

      const executionAllowedChange = changes.find((c) => c["gate"] === "execution_allowed");
      checks.push(["gate_changes_applied.execution_allowed: false→true", executionAllowedChange !== undefined && executionAllowedChange["before"] === false && executionAllowedChange["after"] === true]);
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
  checks.push(["no_go_confirmation.crawler_allowed_remains_false = true", noGoConfirmation!["crawler_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.renderer_allowed_remains_false = true", noGoConfirmation!["renderer_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.recovery_allowed_remains_false = true", noGoConfirmation!["recovery_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.web_requests_allowed_remains_false = true", noGoConfirmation!["web_requests_allowed_remains_false"] === true]);
  checks.push(["no_go_confirmation.ai_learning_generation_allowed_remains_false = true", noGoConfirmation!["ai_learning_generation_allowed_remains_false"] === true]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:batch-execution-human-approval-decision] PASS: ${label}`);
    } else {
      console.error(`[validate:batch-execution-human-approval-decision] FAIL: ${label}`);
      failed = true;
    }
  }

  console.log(`[validate:batch-execution-human-approval-decision] All ${checks.length} invariant checks passed`);
  if (failed) fail("One or more invariant checks failed");
  console.log("[validate:batch-execution-human-approval-decision] PASS");
}

main();
