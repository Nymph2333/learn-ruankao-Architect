/**
 * Phase 6.5 Batch Activation Human Approval Decision validator.
 *
 * Validates the generated phase6_5_batch_activation_human_approval_decision.json artifact
 * against its schema and checks all required boundary invariants.
 *
 * The validator FAILS if:
 * - approval_status is not activation_approved
 * - approved_decision is not approve_activation
 * - approved_batch_id is not phase6_1_batch_001
 * - approved_items is not exactly ["1.3"]
 * - approval_scope is not activation_only
 * - phase6_1_entry_allowed is not true
 * - activation_allowed is not true
 * - batch_executable is not false
 * - execution_allowed is not false
 * - Any operational gate is true (crawler, renderer, recovery, web, ai)
 * - 13.3 appears in approved_items
 * - 13.3 is not quarantined
 * - 9.1 is not deferred
 * - Any expansion execution, AI generation, or source mutation is claimed
 *
 * Usage:
 *   pnpm validate:batch-activation-human-approval-decision
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-batch-activation-human-approval-decision.schema.json");
const manifestPath = resolve(repoRoot, "data/manifests/phase6_5_batch_activation_human_approval_decision.json");

function fail(message: string): never {
  console.error(`[validate:batch-activation-human-approval-decision] ERROR: ${message}`);
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
  console.log("[validate:batch-activation-human-approval-decision] Phase 6.5 Batch Activation Human Approval Decision validator");

  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = readJson<Record<string, unknown>>(manifestPath);

  // Schema validation
  const schemaValidator = buildSchemaValidator();
  const schemaErrors = schemaValidator(manifest);
  if (schemaErrors.length > 0) {
    console.error("[validate:batch-activation-human-approval-decision] Schema validation errors:");
    for (const err of schemaErrors) console.error(`  - ${err}`);
    fail("Schema validation failed");
  }
  console.log("[validate:batch-activation-human-approval-decision] Schema validation: PASS");

  // Invariant checks
  const gates = manifest["phase_gates"] as Record<string, unknown> | undefined;
  if (!gates) fail("phase_gates missing");

  const decisionMeta = manifest["decision_metadata"] as Record<string, unknown> | undefined;
  if (!decisionMeta) fail("decision_metadata missing");

  const batchSummary = manifest["batch_summary"] as Record<string, unknown> | undefined;
  if (!batchSummary) fail("batch_summary missing");

  const finalDecision = manifest["final_decision"] as Record<string, unknown> | undefined;
  if (!finalDecision) fail("final_decision missing");

  const operationalAssertions = manifest["operational_assertions"] as Record<string, unknown> | undefined;
  if (!operationalAssertions) fail("operational_assertions missing");

  const checks: Array<[string, boolean]> = [
    // Top-level identity
    ["manifest_version = phase6.5", manifest["manifest_version"] === "phase6.5"],
    ["manifest_type = batch_activation_human_approval_decision", manifest["manifest_type"] === "batch_activation_human_approval_decision"],
    ["status = activation_approved", manifest["status"] === "activation_approved"],

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

    // Decision metadata
    ["decision_metadata.decision_type = human_activation_approval", decisionMeta!["decision_type"] === "human_activation_approval"],
    ["decision_metadata.approval_status = activation_approved", decisionMeta!["approval_status"] === "activation_approved"],
    ["decision_metadata.approved_decision = approve_activation", decisionMeta!["approved_decision"] === "approve_activation"],
    ["decision_metadata.approved_batch_id = phase6_1_batch_001", decisionMeta!["approved_batch_id"] === "phase6_1_batch_001"],
    ["decision_metadata.approval_scope = activation_only", decisionMeta!["approval_scope"] === "activation_only"],

    // execution_approval_status must be not_requested or explicitly_denied
    ["decision_metadata.execution_approval_status is not_requested or explicitly_denied",
      decisionMeta!["execution_approval_status"] === "not_requested" ||
      decisionMeta!["execution_approval_status"] === "explicitly_denied"
    ],

    ["decision_metadata.requires_execution_approval = true", decisionMeta!["requires_execution_approval"] === true],

    // Batch summary
    ["batch_summary.batch_id = phase6_1_batch_001", batchSummary!["batch_id"] === "phase6_1_batch_001"],
    ["batch_summary.item_count = 1", batchSummary!["item_count"] === 1],
    ["batch_summary.readiness_status = activation_approved", batchSummary!["readiness_status"] === "activation_approved"],

    // Final decision
    ["final_decision.decision_recorded = true", finalDecision!["decision_recorded"] === true],
    ["final_decision.approval_status = activation_approved", finalDecision!["approval_status"] === "activation_approved"],
    ["final_decision.approved_decision = approve_activation", finalDecision!["approved_decision"] === "approve_activation"],
    ["final_decision.batch_id = phase6_1_batch_001", finalDecision!["batch_id"] === "phase6_1_batch_001"],
    ["final_decision.approval_scope = activation_only", finalDecision!["approval_scope"] === "activation_only"],
    ["final_decision.phase6_1_entry_allowed = true", finalDecision!["phase6_1_entry_allowed"] === true],
    ["final_decision.activation_allowed = true", finalDecision!["activation_allowed"] === true],
    ["final_decision.batch_executable = false", finalDecision!["batch_executable"] === false],
    ["final_decision.execution_allowed = false", finalDecision!["execution_allowed"] === false],

    // Operational assertions — no execution, generation, or mutation claimed
    ["operational_assertions.expansion_execution_claimed = false", operationalAssertions!["expansion_execution_claimed"] === false],
    ["operational_assertions.ai_learning_generation_claimed = false", operationalAssertions!["ai_learning_generation_claimed"] === false],
    ["operational_assertions.source_layer_mutation_declared = false", operationalAssertions!["source_layer_mutation_declared"] === false],
  ];

  // approved_items must be exactly ["1.3"]
  const approvedItems = batchSummary!["approved_items"] as string[] | undefined;
  checks.push(["approved_items = ['1.3']", Array.isArray(approvedItems) && approvedItems.length === 1 && approvedItems[0] === "1.3"]);

  // selected_items must be exactly ["1.3"]
  const selectedItems = batchSummary!["selected_items"] as string[] | undefined;
  checks.push(["selected_items = ['1.3']", Array.isArray(selectedItems) && selectedItems.length === 1 && selectedItems[0] === "1.3"]);

  // 13.3 must not appear in approved_items
  checks.push(["13.3 not in approved_items", Array.isArray(approvedItems) && !approvedItems.includes("13.3")]);

  // 13.3 must not appear in selected_items
  checks.push(["13.3 not in selected_items", Array.isArray(selectedItems) && !selectedItems.includes("13.3")]);

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

  // Item constraints checks
  const itemConstraints = manifest["item_constraints"] as Record<string, unknown> | undefined;
  if (itemConstraints) {
    const icApproved = itemConstraints["approved_items"] as string[] | undefined;
    checks.push(["item_constraints.approved_items = ['1.3']", Array.isArray(icApproved) && icApproved.length === 1 && icApproved[0] === "1.3"]);

    const icDeferred = itemConstraints["deferred_items"] as string[] | undefined;
    checks.push(["item_constraints.deferred_items includes 9.1", Array.isArray(icDeferred) && icDeferred.includes("9.1")]);

    const icQuarantined = itemConstraints["quarantined_items"] as string[] | undefined;
    checks.push(["item_constraints.quarantined_items includes 13.3", Array.isArray(icQuarantined) && icQuarantined.includes("13.3")]);
  }

  let failed = false;
  for (const [label, result] of checks) {
    if (result) {
      console.log(`[validate:batch-activation-human-approval-decision] PASS: ${label}`);
    } else {
      console.error(`[validate:batch-activation-human-approval-decision] FAIL: ${label}`);
      failed = true;
    }
  }

  if (failed) fail("One or more invariant checks failed");

  console.log(`[validate:batch-activation-human-approval-decision] All ${checks.length} invariant checks passed`);
  console.log("[validate:batch-activation-human-approval-decision] PASS");
}

main();
