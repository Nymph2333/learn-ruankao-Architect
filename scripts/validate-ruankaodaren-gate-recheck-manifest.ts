/**
 * Phase 6.2 Gate Recheck Manifest validator.
 *
 * Validates the generated phase6_2_gate_recheck_manifest.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - Any execution flag is true
 * - 13.3 appears in selected_items
 * - 13.3 is not explicitly quarantined
 * - Batch is executable
 * - Phase gates are open
 *
 * Usage:
 *   pnpm validate:gate-recheck-manifest
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-gate-recheck-manifest.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_2_gate_recheck_manifest.json");

function fail(message: string): never {
  console.error(`[validate:gate-recheck-manifest] ERROR: ${message}`);
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
  console.log("[validate:gate-recheck-manifest] Phase 6.2 Gate Recheck Manifest validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:gate-recheck-manifest] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:gate-recheck-manifest] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const decision = manifest["final_decision"] as Record<string, unknown> | undefined;
  if (!decision) fail("final_decision missing");

  const item13Review = manifest["item_13_3_review"] as Record<string, unknown> | undefined;
  if (!item13Review) fail("item_13_3_review missing");

  const quarantineDecision = item13Review["quarantine_decision"] as Record<string, unknown> | undefined;
  if (!quarantineDecision) fail("item_13_3_review.quarantine_decision missing");

  const updatedBatch = manifest["updated_batch_status"] as Record<string, unknown> | undefined;
  if (!updatedBatch) fail("updated_batch_status missing");

  const itemStatusAfterQuarantine = updatedBatch["item_status_after_quarantine"] as Array<Record<string, unknown>> | undefined;

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.2", manifest["manifest_version"] === "phase6.2"],
    ["manifest_type = gate_recheck_and_taxonomy_quarantine", manifest["manifest_type"] === "gate_recheck_and_taxonomy_quarantine"],
    ["status = recheck_complete_expansion_still_blocked", manifest["status"] === "recheck_complete_expansion_still_blocked"],

    // Phase gates — all must remain blocking
    ["phase_gates.phase6_1_entry_allowed = false", gates!["phase6_1_entry_allowed"] === false],
    ["phase_gates.activation_allowed = false", gates!["activation_allowed"] === false],
    ["phase_gates.batch_executable = false", gates!["batch_executable"] === false],
    ["phase_gates.crawler_allowed = false", gates!["crawler_allowed"] === false],
    ["phase_gates.renderer_allowed = false", gates!["renderer_allowed"] === false],
    ["phase_gates.recovery_allowed = false", gates!["recovery_allowed"] === false],
    ["phase_gates.web_requests_allowed = false", gates!["web_requests_allowed"] === false],
    ["phase_gates.ai_learning_generation_allowed = false", gates!["ai_learning_generation_allowed"] === false],

    // Item 13.3 review
    ["item_13_3_review.item_id = 13.3", item13Review!["item_id"] === "13.3"],
    ["item_13_3_review.title = 软件架构风格", item13Review!["title"] === "软件架构风格"],
    ["item_13_3_review.quarantine_decision.decision = QUARANTINE", quarantineDecision!["decision"] === "QUARANTINE"],
    ["item_13_3_review.quarantine_decision.quarantine_status = quarantined", quarantineDecision!["quarantine_status"] === "quarantined"],

    // Final decision boundary fields
    ["final_decision.recheck_complete = true", decision!["recheck_complete"] === true],
    ["final_decision.item_13_3_quarantined = true", decision!["item_13_3_quarantined"] === true],
    ["final_decision.expansion_execution_allowed = false", decision!["expansion_execution_allowed"] === false],
    ["final_decision.selected_batch_id = phase6_1_batch_001", decision!["selected_batch_id"] === "phase6_1_batch_001"],
  ];

  // 13.3 must not appear in selected_items
  const selectedItems = decision!["selected_items"] as string[] | undefined;
  checks.push(["13.3 not in selected_items", Array.isArray(selectedItems) && !selectedItems.includes("13.3")]);

  // 1.3 must appear in selected_items (proposed primary candidate)
  checks.push(["1.3 in selected_items", Array.isArray(selectedItems) && selectedItems.includes("1.3")]);
  checks.push(["selected_items = ['1.3']", Array.isArray(selectedItems) && selectedItems.length === 1 && selectedItems[0] === "1.3"]);

  // 9.1 must appear in deferred_items
  const deferredItems = decision!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in blocked_or_quarantined_items
  const blockedOrQuarantined = decision!["blocked_or_quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in blocked_or_quarantined_items", Array.isArray(blockedOrQuarantined) && blockedOrQuarantined.includes("13.3")]);

  // Validate item_status_after_quarantine
  if (Array.isArray(itemStatusAfterQuarantine)) {
    const item13_3 = itemStatusAfterQuarantine.find((item) => item["item_id"] === "13.3");
    checks.push(["item 13.3 exists in item_status_after_quarantine", !!item13_3]);
    checks.push(["item 13.3 status = quarantined", item13_3?.["status"] === "quarantined"]);
    checks.push(["item 13.3 quarantine_status = quarantined", item13_3?.["quarantine_status"] === "quarantined"]);
  } else {
    checks.push(["item_status_after_quarantine is array", false]);
  }

  // Validate selected_batch status
  const selectedBatch = updatedBatch!["selected_batch"] as Record<string, unknown> | undefined;
  checks.push(["selected_batch.status = proposed_inactive", selectedBatch?.["status"] === "proposed_inactive"]);

  // Validate batch items have execution_allowed = false
  const batchItems = selectedBatch ? (selectedBatch["items"] as Array<Record<string, unknown>> | undefined) : undefined;
  const allBatchItemsBlocked = Array.isArray(batchItems) && batchItems.every((i) => i["execution_allowed"] === false);
  checks.push(["all selected_batch items execution_allowed = false", allBatchItemsBlocked]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:gate-recheck-manifest] PASS: ${label}`);
    } else {
      console.error(`[validate:gate-recheck-manifest] FAIL: ${label}`);
      failed = true;
    }
  }

  if (failed) fail("One or more invariant checks failed");

  console.log(`[validate:gate-recheck-manifest] All ${checks.length} invariant checks passed`);
  console.log("[validate:gate-recheck-manifest] PASS");
}

main();
