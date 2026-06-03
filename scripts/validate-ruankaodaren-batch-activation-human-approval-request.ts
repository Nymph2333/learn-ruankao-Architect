/**
 * Phase 6.4 Batch Activation Human Approval Request validator.
 *
 * Validates the generated phase6_4_batch_activation_human_approval_request.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - Approval status is not pending_human_review
 * - Any execution gate is true
 * - 13.3 appears in selected_items
 * - 13.3 is not quarantined
 * - Approval is claimed to be granted
 *
 * Usage:
 *   pnpm validate:batch-activation-human-approval-request
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-batch-activation-human-approval-request.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_4_batch_activation_human_approval_request.json");

function fail(message: string): never {
  console.error(`[validate:batch-activation-human-approval-request] ERROR: ${message}`);
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
  console.log("[validate:batch-activation-human-approval-request] Phase 6.4 Batch Activation Human Approval Request validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:batch-activation-human-approval-request] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:batch-activation-human-approval-request] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const approvalMeta = manifest["approval_request_metadata"] as Record<string, unknown> | undefined;
  if (!approvalMeta) fail("approval_request_metadata missing");

  const batchSummary = manifest["batch_summary"] as Record<string, unknown> | undefined;
  if (!batchSummary) fail("batch_summary missing");

  const decision = manifest["final_decision"] as Record<string, unknown> | undefined;
  if (!decision) fail("final_decision missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.4", manifest["manifest_version"] === "phase6.4"],
    ["manifest_type = batch_activation_human_approval_request", manifest["manifest_type"] === "batch_activation_human_approval_request"],
    ["status = approval_request_pending_human_review", manifest["status"] === "approval_request_pending_human_review"],

    // Phase gates — all must remain closed
    ["phase_gates.phase6_1_entry_allowed = false", gates!["phase6_1_entry_allowed"] === false],
    ["phase_gates.activation_allowed = false", gates!["activation_allowed"] === false],
    ["phase_gates.batch_executable = false", gates!["batch_executable"] === false],
    ["phase_gates.execution_allowed = false", gates!["execution_allowed"] === false],
    ["phase_gates.crawler_allowed = false", gates!["crawler_allowed"] === false],
    ["phase_gates.renderer_allowed = false", gates!["renderer_allowed"] === false],
    ["phase_gates.recovery_allowed = false", gates!["recovery_allowed"] === false],
    ["phase_gates.web_requests_allowed = false", gates!["web_requests_allowed"] === false],
    ["phase_gates.ai_learning_generation_allowed = false", gates!["ai_learning_generation_allowed"] === false],
    ["phase_gates.approval_granted = false", gates!["approval_granted"] === false],

    // Approval request metadata
    ["approval_request_metadata.request_type = batch_activation_approval", approvalMeta!["request_type"] === "batch_activation_approval"],
    ["approval_request_metadata.requested_for_batch = phase6_1_batch_001", approvalMeta!["requested_for_batch"] === "phase6_1_batch_001"],
    ["approval_request_metadata.requested_decision = approve_activation", approvalMeta!["requested_decision"] === "approve_activation"],
    ["approval_request_metadata.approval_status = pending_human_review", approvalMeta!["approval_status"] === "pending_human_review"],
    ["approval_request_metadata.requires_human_decision = true", approvalMeta!["requires_human_decision"] === true],

    // Batch summary
    ["batch_summary.batch_id = phase6_1_batch_001", batchSummary!["batch_id"] === "phase6_1_batch_001"],
    ["batch_summary.item_count = 1", batchSummary!["item_count"] === 1],
    ["batch_summary.readiness_status = activation_candidate", batchSummary!["readiness_status"] === "activation_candidate"],

    // Final decision
    ["final_decision.approval_request_prepared = true", decision!["approval_request_prepared"] === true],
    ["final_decision.approval_status = pending_human_review", decision!["approval_status"] === "pending_human_review"],
    ["final_decision.batch_id = phase6_1_batch_001", decision!["batch_id"] === "phase6_1_batch_001"],
    ["final_decision.requested_decision = approve_activation", decision!["requested_decision"] === "approve_activation"],
    ["final_decision.phase6_1_entry_allowed = false", decision!["phase6_1_entry_allowed"] === false],
    ["final_decision.activation_allowed = false", decision!["activation_allowed"] === false],
    ["final_decision.batch_executable = false", decision!["batch_executable"] === false],
    ["final_decision.execution_allowed = false", decision!["execution_allowed"] === false],
  ];

  // selected_items must be exactly ["1.3"]
  const selectedItems = batchSummary!["selected_items"] as string[] | undefined;
  checks.push(["selected_items = ['1.3']", Array.isArray(selectedItems) && selectedItems.length === 1 && selectedItems[0] === "1.3"]);

  // 13.3 must not appear in selected_items
  checks.push(["13.3 not in selected_items", Array.isArray(selectedItems) && !selectedItems.includes("13.3")]);

  // 9.1 must appear in deferred_items
  const deferredItems = batchSummary!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in quarantined_items
  const quarantinedItems = batchSummary!["quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in quarantined_items", Array.isArray(quarantinedItems) && quarantinedItems.includes("13.3")]);

  // Final decision checks
  const finalSelectedItems = decision!["selected_items"] as string[] | undefined;
  checks.push(["final_decision.selected_items = ['1.3']", Array.isArray(finalSelectedItems) && finalSelectedItems.length === 1 && finalSelectedItems[0] === "1.3"]);

  const finalDeferredItems = decision!["deferred_items"] as string[] | undefined;
  checks.push(["final_decision.deferred_items includes 9.1", Array.isArray(finalDeferredItems) && finalDeferredItems.includes("9.1")]);

  const finalQuarantinedItems = decision!["quarantined_items"] as string[] | undefined;
  checks.push(["final_decision.quarantined_items includes 13.3", Array.isArray(finalQuarantinedItems) && finalQuarantinedItems.includes("13.3")]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:batch-activation-human-approval-request] PASS: ${label}`);
    } else {
      console.error(`[validate:batch-activation-human-approval-request] FAIL: ${label}`);
      failed = true;
    }
  }

  if (failed) fail("One or more invariant checks failed");

  console.log(`[validate:batch-activation-human-approval-request] All ${checks.length} invariant checks passed`);
  console.log("[validate:batch-activation-human-approval-request] PASS");
}

main();
