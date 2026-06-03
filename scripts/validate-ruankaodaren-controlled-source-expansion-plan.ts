/**
 * Phase 6.0 Controlled Source Expansion Plan validator.
 *
 * Validates the generated phase6_0_controlled_source_expansion_plan.json artifact
 * against its schema and checks all required invariants.
 *
 * Usage:
 *   pnpm validate:controlled-source-expansion-plan
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-controlled-source-expansion-plan.schema.json");
const sourcePacketPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");
const artifactPath = resolve(repoRoot, "verification/generated/phase6_0_controlled_source_expansion_plan.json");

function fail(message: string): never {
  console.error(`[validate:controlled-source-expansion-plan] ERROR: ${message}`);
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
  console.log("[validate:controlled-source-expansion-plan] Phase 6.0 Controlled Source Expansion Plan validator");

  // Check required files
  if (!existsSync(sourcePacketPath)) fail(`source-packet.json missing: ${sourcePacketPath}`);
  if (!existsSync(artifactPath)) fail(`generated artifact missing: ${artifactPath}`);

  // Load source packet to check baseline invariants
  const sourcePacket = readJson<{ items: Array<{ source_layer_status: string }>; overall_source_packet_status: string }>(sourcePacketPath);
  const itemCount = sourcePacket.items.length;
  const completeCount = sourcePacket.items.filter((i) => i.source_layer_status === "complete").length;
  if (itemCount !== 3) fail(`source-packet item_count must be 3, got ${itemCount}`);
  if (completeCount !== 3) fail(`source-packet complete_count must be 3, got ${completeCount}`);
  console.log(`[validate:controlled-source-expansion-plan] source-packet: item_count=${itemCount}, complete_count=${completeCount} OK`);

  // Load plan artifact
  const plan = readJson<Record<string, unknown>>(artifactPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(plan);
  if (schemaErrors.length > 0) {
    console.error("[validate:controlled-source-expansion-plan] Schema validation errors:");
    for (const err of schemaErrors) {
      console.error(`  - ${err}`);
    }
    fail("Schema validation failed");
  }
  console.log("[validate:controlled-source-expansion-plan] Schema validation: PASS");

  // Invariant checks
  const checks: Array<[string, boolean]> = [
    ["plan_version = phase6.0", plan["plan_version"] === "phase6.0"],
    ["plan_scope = controlled_source_expansion_plan_only", plan["plan_scope"] === "controlled_source_expansion_plan_only"],
    ["execution_allowed = false", plan["execution_allowed"] === false],
    ["crawler_allowed = false", plan["crawler_allowed"] === false],
    ["renderer_allowed = false", plan["renderer_allowed"] === false],
    ["recovery_allowed = false", plan["recovery_allowed"] === false],
    ["web_requests_allowed = false", plan["web_requests_allowed"] === false],
    ["raw_html_direct_read_allowed = false", plan["raw_html_direct_read_allowed"] === false],
    ["raw_xhr_direct_read_allowed = false", plan["raw_xhr_direct_read_allowed"] === false],
    ["ocr_allowed = false", plan["ocr_allowed"] === false],
    ["encrypted_xhr_decryption_allowed = false", plan["encrypted_xhr_decryption_allowed"] === false],
    ["image_table_reconstruction_allowed = false", plan["image_table_reconstruction_allowed"] === false],
    ["source_layer_modification_allowed = false", plan["source_layer_modification_allowed"] === false],
    ["official_markdown_modification_allowed = false", plan["official_markdown_modification_allowed"] === false],
    ["ai_learning_generation_allowed = false", plan["ai_learning_generation_allowed"] === false],
    ["phase6_1_entry_allowed = false", plan["phase6_1_entry_allowed"] === false],
  ];

  // Check coverage object
  const coverage = plan["current_source_coverage"] as Record<string, unknown> | undefined;
  if (!coverage) fail("current_source_coverage missing");
  checks.push(
    ["current_source_coverage.coverage_scope = baseline_only", coverage["coverage_scope"] === "baseline_only"],
    ["current_source_coverage.full_site_captured = false", coverage["full_site_captured"] === false],
    ["current_source_coverage.baseline_item_count = 3", coverage["baseline_item_count"] === 3],
    ["current_source_coverage.baseline_complete_count = 3", coverage["baseline_complete_count"] === 3],
  );

  // Check expansion_batch_size
  const strategy = plan["expansion_strategy"] as Record<string, unknown> | undefined;
  if (!strategy) fail("expansion_strategy missing");
  const batchSize = strategy["expansion_batch_size"] as Record<string, unknown> | undefined;
  if (!batchSize) fail("expansion_batch_size missing");
  const batchMin = batchSize["min"] as number;
  const batchMax = batchSize["max"] as number;
  checks.push(
    ["expansion_batch_size.min >= 1", batchMin >= 1],
    ["expansion_batch_size.max <= 10", batchMax <= 10],
    ["expansion_batch_size.min <= max", batchMin <= batchMax],
    ["no_full_site_bulk_capture = true", strategy["no_full_site_bulk_capture"] === true],
    ["no_unbounded_crawler = true", strategy["no_unbounded_crawler"] === true],
    ["no_renderer_bulk_run = true", strategy["no_renderer_bulk_run"] === true],
  );

  // Check 13.3 taxonomy policy
  const taxPolicy = plan["taxonomy_13_3_policy"] as Record<string, unknown> | undefined;
  if (!taxPolicy) fail("taxonomy_13_3_policy missing");
  checks.push(
    ["taxonomy_13_3_policy.taxonomy_suspect = true", taxPolicy["taxonomy_suspect"] === true],
    ["taxonomy_13_3_policy.is_multi_card_sequence_possible = true", taxPolicy["is_multi_card_sequence_possible"] === true],
    ["taxonomy_13_3_policy.must_recheck_children_before_leaf_modeling = true", taxPolicy["must_recheck_children_before_leaf_modeling"] === true],
    ["taxonomy_13_3_policy.must_not_claim_complete = true", taxPolicy["must_not_claim_complete"] === true],
    ["taxonomy_13_3_policy.expansion_blocked_until_recheck = true", taxPolicy["expansion_blocked_until_recheck"] === true],
  );

  // Check phase6_1_entry_gate
  const entryGate = plan["phase6_1_entry_gate"] as Record<string, unknown> | undefined;
  if (!entryGate) fail("phase6_1_entry_gate missing");
  checks.push(
    ["phase6_1_entry_gate.phase6_1_entry_allowed = false", entryGate["phase6_1_entry_allowed"] === false],
  );
  const prereqs = entryGate["required_before_phase6_1"] as unknown[] | undefined;
  checks.push(["phase6_1_entry_gate.required_before_phase6_1 is non-empty array", Array.isArray(prereqs) && prereqs.length > 0]);

  let allPass = true;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:controlled-source-expansion-plan]   PASS  ${label}`);
    } else {
      console.error(`[validate:controlled-source-expansion-plan]   FAIL  ${label}`);
      allPass = false;
    }
  }

  if (!allPass) fail("One or more invariant checks failed");
  console.log("[validate:controlled-source-expansion-plan] All checks passed.");
}

main();