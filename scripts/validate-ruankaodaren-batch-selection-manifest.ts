/**
 * Phase 6.1 Batch Selection Manifest validator.
 *
 * Validates the generated phase6_1_batch_selection_manifest.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if any execution flag is true, if 13.3 is selected,
 * if batch is executable, or if phase gates are open.
 *
 * Usage:
 *   pnpm validate:batch-selection-manifest
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-batch-selection-manifest.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_1_batch_selection_manifest.json");

function fail(message: string): never {
  console.error(`[validate:batch-selection-manifest] ERROR: ${message}`);
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
  console.log("[validate:batch-selection-manifest] Phase 6.1 Batch Selection Manifest validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:batch-selection-manifest] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:batch-selection-manifest] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const constraints = manifest["batch_constraints"] as Record<string, unknown> | undefined;
  if (!constraints) fail("batch_constraints missing");

  const decision = manifest["final_decision"] as Record<string, unknown> | undefined;
  if (!decision) fail("final_decision missing");

  const baseline = manifest["baseline_context"] as Record<string, unknown> | undefined;
  if (!baseline) fail("baseline_context missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.1", manifest["manifest_version"] === "phase6.1"],
    ["manifest_type = controlled_source_expansion_batch_selection", manifest["manifest_type"] === "controlled_source_expansion_batch_selection"],
    ["status = inactive_blocked", manifest["status"] === "inactive_blocked"],

    // Phase gates — all must be blocking
    ["phase_gates.phase6_1_entry_allowed = false", gates!["phase6_1_entry_allowed"] === false],
    ["phase_gates.expansion_blocked_until_recheck = true", gates!["expansion_blocked_until_recheck"] === true],
    ["phase_gates.taxonomy_suspect_13_3 = true", gates!["taxonomy_suspect_13_3"] === true],
    ["phase_gates.human_review_required = true", gates!["human_review_required"] === true],
    ["phase_gates.activation_allowed = false", gates!["activation_allowed"] === false],

    // Batch constraints
    ["batch_constraints.min_batch_size >= 1", (constraints!["min_batch_size"] as number) >= 1],
    ["batch_constraints.max_batch_size <= 5", (constraints!["max_batch_size"] as number) <= 5],
    ["batch_constraints.selection_mode = proposed_only", constraints!["selection_mode"] === "proposed_only"],
    ["batch_constraints.execution_mode = blocked_until_recheck", constraints!["execution_mode"] === "blocked_until_recheck"],

    // Baseline context
    ["baseline_context.baseline_item_count = 3", baseline!["baseline_item_count"] === 3],
    ["baseline_context.baseline_complete_count = 3", baseline!["baseline_complete_count"] === 3],
    ["baseline_context.full_site_captured = false", baseline!["full_site_captured"] === false],

    // Final decision boundary fields
    ["final_decision.batch_executable = false", decision!["batch_executable"] === false],
    ["final_decision.batch_selected = true", decision!["batch_selected"] === true],
  ];

  // 13.3 must not appear in selected_items
  const selectedItems = decision!["selected_items"] as string[] | undefined;
  checks.push(["13.3 not in selected_items", Array.isArray(selectedItems) && !selectedItems.includes("13.3")]);

  // 13.3 must appear in blocked_items
  const blockedItems = decision!["blocked_items"] as string[] | undefined;
  checks.push(["13.3 in blocked_items", Array.isArray(blockedItems) && blockedItems.includes("13.3")]);

  // 1.3 must appear in selected_items (proposed primary candidate)
  checks.push(["1.3 in selected_items", Array.isArray(selectedItems) && selectedItems.includes("1.3")]);

  // 9.1 must appear in deferred_items
  const deferredItems = decision!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // Validate all candidate items have selection_allowed_now = false
  const candidates = manifest["candidate_items"] as Array<Record<string, unknown>> | undefined;
  const allCandidatesBlocked = Array.isArray(candidates) && candidates.every((c) => c["selection_allowed_now"] === false);
  checks.push(["all candidate_items.selection_allowed_now = false", allCandidatesBlocked]);

  // Validate proposed_batch items have execution_allowed = false
  const proposedBatch = manifest["proposed_batch"] as Record<string, unknown> | undefined;
  const batchItems = proposedBatch ? (proposedBatch["items"] as Array<Record<string, unknown>> | undefined) : undefined;
  const allBatchItemsBlocked = Array.isArray(batchItems) && batchItems.every((i) => i["execution_allowed"] === false);
  checks.push(["all proposed_batch items execution_allowed = false", allBatchItemsBlocked]);
  checks.push(["proposed_batch.status = proposed_inactive", proposedBatch?.["status"] === "proposed_inactive"]);

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:batch-selection-manifest] PASS: ${label}`);
    } else {
      console.error(`[validate:batch-selection-manifest] FAIL: ${label}`);
      failed = true;
    }
  }

  if (failed) fail("One or more invariant checks failed");

  console.log(`[validate:batch-selection-manifest] All ${checks.length} invariant checks passed`);
  console.log("[validate:batch-selection-manifest] PASS");
}

main();
