/**
 * Phase 6.3 Activation Readiness Preflight validator.
 *
 * Validates the generated phase6_3_activation_readiness_preflight_manifest.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - Any execution flag is true
 * - 13.3 appears in selected_items
 * - 13.3 is not quarantined
 * - Batch is executable or activated
 * - Readiness status is not activation_candidate
 *
 * Usage:
 *   pnpm validate:activation-readiness-preflight
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-activation-readiness-preflight.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_3_activation_readiness_preflight_manifest.json");

function fail(message: string): never {
  console.error(`[validate:activation-readiness-preflight] ERROR: ${message}`);
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
  console.log("[validate:activation-readiness-preflight] Phase 6.3 Activation Readiness Preflight validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:activation-readiness-preflight] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:activation-readiness-preflight] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const decision = manifest["final_decision"] as Record<string, unknown> | undefined;
  if (!decision) fail("final_decision missing");

  const assessment = manifest["batch_structural_assessment"] as Record<string, unknown> | undefined;
  if (!assessment) fail("batch_structural_assessment missing");

  const readinessDecision = manifest["readiness_decision"] as Record<string, unknown> | undefined;
  if (!readinessDecision) fail("readiness_decision missing");

  const updatedBatch = manifest["updated_batch_status"] as Record<string, unknown> | undefined;
  if (!updatedBatch) fail("updated_batch_status missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.3", manifest["manifest_version"] === "phase6.3"],
    ["manifest_type = batch_activation_readiness_preflight", manifest["manifest_type"] === "batch_activation_readiness_preflight"],
    ["status = preflight_complete_approval_pending", manifest["status"] === "preflight_complete_approval_pending"],

    // Phase gates — all execution gates must remain closed
    ["phase_gates.phase6_1_entry_allowed = false", gates!["phase6_1_entry_allowed"] === false],
    ["phase_gates.activation_allowed = false", gates!["activation_allowed"] === false],
    ["phase_gates.batch_executable = false", gates!["batch_executable"] === false],
    ["phase_gates.crawler_allowed = false", gates!["crawler_allowed"] === false],
    ["phase_gates.renderer_allowed = false", gates!["renderer_allowed"] === false],
    ["phase_gates.recovery_allowed = false", gates!["recovery_allowed"] === false],
    ["phase_gates.web_requests_allowed = false", gates!["web_requests_allowed"] === false],
    ["phase_gates.ai_learning_generation_allowed = false", gates!["ai_learning_generation_allowed"] === false],
    ["phase_gates.taxonomy_suspect_13_3_quarantined = true", gates!["taxonomy_suspect_13_3_quarantined"] === true],

    // Batch structural assessment
    ["batch_structural_assessment.batch_id = phase6_1_batch_001", assessment!["batch_id"] === "phase6_1_batch_001"],

    // Readiness decision
    ["readiness_decision.structural_eligibility = PASS", readinessDecision!["structural_eligibility"] === "PASS"],
    ["readiness_decision.risk_profile = ACCEPTABLE", readinessDecision!["risk_profile"] === "ACCEPTABLE"],
    ["readiness_decision.readiness_status = activation_candidate", readinessDecision!["readiness_status"] === "activation_candidate"],

    // Final decision boundary fields
    ["final_decision.preflight_complete = true", decision!["preflight_complete"] === true],
    ["final_decision.batch_id = phase6_1_batch_001", decision!["batch_id"] === "phase6_1_batch_001"],
    ["final_decision.readiness_status = activation_candidate", decision!["readiness_status"] === "activation_candidate"],
    ["final_decision.batch_executable = false", decision!["batch_executable"] === false],
    ["final_decision.activation_allowed = false", decision!["activation_allowed"] === false],
  ];

  // selected_items must be exactly ["1.3"]
  const selectedItems = decision!["selected_items"] as string[] | undefined;
  checks.push(["selected_items = ['1.3']", Array.isArray(selectedItems) && selectedItems.length === 1 && selectedItems[0] === "1.3"]);

  // 13.3 must not appear in selected_items
  checks.push(["13.3 not in selected_items", Array.isArray(selectedItems) && !selectedItems.includes("13.3")]);

  // 9.1 must appear in deferred_items
  const deferredItems = decision!["deferred_items"] as string[] | undefined;
  checks.push(["9.1 in deferred_items", Array.isArray(deferredItems) && deferredItems.includes("9.1")]);

  // 13.3 must appear in quarantined_items
  const quarantinedItems = decision!["quarantined_items"] as string[] | undefined;
  checks.push(["13.3 in quarantined_items", Array.isArray(quarantinedItems) && quarantinedItems.includes("13.3")]);

  // Validate updated_batch_status
  const batchMetadata = updatedBatch!["batch_metadata"] as Record<string, unknown> | undefined;
  checks.push(["batch_metadata.readiness_status = activation_candidate", batchMetadata?.["readiness_status"] === "activation_candidate"]);
  checks.push(["batch_metadata.batch_executable = false", batchMetadata?.["batch_executable"] === false]);
  checks.push(["batch_metadata.activation_allowed = false", batchMetadata?.["activation_allowed"] === false]);

  // Validate batch items have execution_allowed = false
  const batchItems = batchMetadata ? (batchMetadata["items"] as Array<Record<string, unknown>> | undefined) : undefined;
  const allBatchItemsBlocked = Array.isArray(batchItems) && batchItems.every((i) => i["execution_allowed"] === false);
  checks.push(["all batch items execution_allowed = false", allBatchItemsBlocked]);

  // Validate item_status_summary
  const itemStatusSummary = updatedBatch!["item_status_summary"] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(itemStatusSummary)) {
    const item13_3 = itemStatusSummary.find((item) => item["item_id"] === "13.3");
    checks.push(["item 13.3 status = quarantined", item13_3?.["status"] === "quarantined"]);
    checks.push(["item 13.3 readiness = ineligible", item13_3?.["readiness"] === "ineligible"]);

    const item1_3 = itemStatusSummary.find((item) => item["item_id"] === "1.3");
    checks.push(["item 1.3 status = proposed_primary", item1_3?.["status"] === "proposed_primary"]);
    checks.push(["item 1.3 readiness = ready_pending_approval", item1_3?.["readiness"] === "ready_pending_approval"]);

    const item9_1 = itemStatusSummary.find((item) => item["item_id"] === "9.1");
    checks.push(["item 9.1 status = deferred_candidate", item9_1?.["status"] === "deferred_candidate"]);
  } else {
    checks.push(["item_status_summary is array", false]);
  }

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:activation-readiness-preflight] PASS: ${label}`);
    } else {
      console.error(`[validate:activation-readiness-preflight] FAIL: ${label}`);
      failed = true;
    }
  }

  if (failed) fail("One or more invariant checks failed");

  console.log(`[validate:activation-readiness-preflight] All ${checks.length} invariant checks passed`);
  console.log("[validate:activation-readiness-preflight] PASS");
}

main();
