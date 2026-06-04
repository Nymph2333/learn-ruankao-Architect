/**
 * Phase 6.6 Batch Execution Readiness Preflight validator.
 *
 * Validates the generated phase6_6_batch_execution_readiness_preflight.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - readiness_status is not execution_candidate
 * - execution_approval_status is not not_requested
 * - batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not false
 * - execution_allowed is not false
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - 13.3 appears in approved_items
 * - 13.3 is not quarantined
 * - 9.1 is not deferred
 * - Any expansion execution, crawler output, renderer output, AI generation,
 *   source mutation, web requests, or asset capture is claimed
 *
 * Usage:
 *   pnpm validate:batch-execution-readiness-preflight
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-batch-execution-readiness-preflight.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_6_batch_execution_readiness_preflight.json");

function fail(message: string): never {
  console.error(`[validate:batch-execution-readiness-preflight] ERROR: ${message}`);
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
  console.log("[validate:batch-execution-readiness-preflight] Phase 6.6 Batch Execution Readiness Preflight validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:batch-execution-readiness-preflight] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:batch-execution-readiness-preflight] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const preflightMeta = manifest["preflight_metadata"] as Record<string, unknown> | undefined;
  if (!preflightMeta) fail("preflight_metadata missing");

  const batchSummary = manifest["batch_summary"] as Record<string, unknown> | undefined;
  if (!batchSummary) fail("batch_summary missing");

  const finalDecision = manifest["final_decision"] as Record<string, unknown> | undefined;
  if (!finalDecision) fail("final_decision missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.6", manifest["manifest_version"] === "phase6.6"],
    ["manifest_type = batch_execution_readiness_preflight", manifest["manifest_type"] === "batch_execution_readiness_preflight"],
    ["preflight_type = batch_execution_readiness", manifest["preflight_type"] === "batch_execution_readiness"],
    ["status = execution_readiness_assessed", manifest["status"] === "execution_readiness_assessed"],

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
    ["phase_gates.approval_granted = true", gates!["approval_granted"] === true],

    // Preflight metadata
    ["preflight_metadata.preflight_type = batch_execution_readiness", preflightMeta!["preflight_type"] === "batch_execution_readiness"],
    ["preflight_metadata.batch_id = phase6_1_batch_001", preflightMeta!["batch_id"] === "phase6_1_batch_001"],
    ["preflight_metadata.readiness_status = execution_candidate", preflightMeta!["readiness_status"] === "execution_candidate"],
    ["preflight_metadata.requires_execution_approval = true", preflightMeta!["requires_execution_approval"] === true],

    // execution_approval_status must be not_requested or explicitly_denied
    ["preflight_metadata.execution_approval_status is not_requested or explicitly_denied",
      preflightMeta!["execution_approval_status"] === "not_requested" ||
      preflightMeta!["execution_approval_status"] === "explicitly_denied"
    ],

    // Batch summary
    ["batch_summary.batch_id = phase6_1_batch_001", batchSummary!["batch_id"] === "phase6_1_batch_001"],
    ["batch_summary.item_count = 1", batchSummary!["item_count"] === 1],
    ["batch_summary.batch_size_within_limits = true", batchSummary!["batch_size_within_limits"] === true],
    ["batch_summary.readiness_status = execution_candidate", batchSummary!["readiness_status"] === "execution_candidate"],

    // Final decision
    ["final_decision.preflight_completed = true", finalDecision!["preflight_completed"] === true],
    ["final_decision.readiness_status = execution_candidate", finalDecision!["readiness_status"] === "execution_candidate"],
    ["final_decision.batch_id = phase6_1_batch_001", finalDecision!["batch_id"] === "phase6_1_batch_001"],
    ["final_decision.phase6_1_entry_allowed = true", finalDecision!["phase6_1_entry_allowed"] === true],
    ["final_decision.activation_allowed = true", finalDecision!["activation_allowed"] === true],
    ["final_decision.batch_executable = false", finalDecision!["batch_executable"] === false],
    ["final_decision.execution_allowed = false", finalDecision!["execution_allowed"] === false],

    // final_decision.execution_approval_status check
    ["final_decision.execution_approval_status is not_requested or explicitly_denied",
      finalDecision!["execution_approval_status"] === "not_requested" ||
      finalDecision!["execution_approval_status"] === "explicitly_denied"
    ],
  ];

  // approved_items must be exactly ["1.3"] in batch_summary
  const approvedItems = batchSummary!["approved_items"] as string[] | undefined;
  checks.push(["batch_summary.approved_items = ['1.3']", Array.isArray(approvedItems) && approvedItems.length === 1 && approvedItems[0] === "1.3"]);

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

  // Operational boundary validation checks
  const operationalChecks = manifest["preflight_checks"] as Record<string, unknown> | undefined;
  if (operationalChecks) {
    const opBoundary = operationalChecks["operational_boundary_validation"] as Record<string, unknown> | undefined;
    if (opBoundary) {
      checks.push(["operational_boundary.expansion_execution_claimed = false", opBoundary["expansion_execution_claimed"] === false]);
      checks.push(["operational_boundary.crawler_output_claimed = false", opBoundary["crawler_output_claimed"] === false]);
      checks.push(["operational_boundary.renderer_output_claimed = false", opBoundary["renderer_output_claimed"] === false]);
      checks.push(["operational_boundary.ai_learning_generation_claimed = false", opBoundary["ai_learning_generation_claimed"] === false]);
      checks.push(["operational_boundary.source_layer_mutation_declared = false", opBoundary["source_layer_mutation_declared"] === false]);
      checks.push(["operational_boundary.web_requests_declared = false", opBoundary["web_requests_declared"] === false]);
      checks.push(["operational_boundary.raw_snapshots_created = false", opBoundary["raw_snapshots_created"] === false]);
      checks.push(["operational_boundary.intermediate_json_created = false", opBoundary["intermediate_json_created"] === false]);
      checks.push(["operational_boundary.assets_captured = false", opBoundary["assets_captured"] === false]);
    }

    const execGateChecks = operationalChecks["execution_gate_validation"] as Record<string, unknown> | undefined;
    if (execGateChecks) {
      checks.push(["execution_gate.batch_executable = false", execGateChecks["batch_executable"] === false]);
      checks.push(["execution_gate.execution_allowed = false", execGateChecks["execution_allowed"] === false]);
      checks.push(["execution_gate.crawler_allowed = false", execGateChecks["crawler_allowed"] === false]);
      checks.push(["execution_gate.renderer_allowed = false", execGateChecks["renderer_allowed"] === false]);
      checks.push(["execution_gate.recovery_allowed = false", execGateChecks["recovery_allowed"] === false]);
      checks.push(["execution_gate.web_requests_allowed = false", execGateChecks["web_requests_allowed"] === false]);
      checks.push(["execution_gate.ai_learning_generation_allowed = false", execGateChecks["ai_learning_generation_allowed"] === false]);
    }
  }

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:batch-execution-readiness-preflight] PASS: ${label}`);
    } else {
      console.error(`[validate:batch-execution-readiness-preflight] FAIL: ${label}`);
      failed = true;
    }
  }

  if (failed) fail("One or more invariant checks failed");

  console.log(`[validate:batch-execution-readiness-preflight] All ${checks.length} invariant checks passed`);
  console.log("[validate:batch-execution-readiness-preflight] PASS");
}

main();
