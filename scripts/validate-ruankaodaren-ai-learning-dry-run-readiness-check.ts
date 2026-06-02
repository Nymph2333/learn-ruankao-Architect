/**
 * Phase 5.8 AI Learning dry-run execution readiness check validator.
 *
 * Validates readiness state only. It does not generate AI learning content,
 * generate dry-run content, generate input bundle instances, create formal
 * dual-layer documents, rewrite official Markdown, modify Source Layer
 * artifacts, write source_content, OCR, decrypt encrypted XHR, reconstruct image
 * tables, read raw HTML/XHR, access webpages, run a renderer, run a crawler, or
 * run recovery.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAiLearningDryRunContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
import type { RuankaoAiLearningDryRunExecutionContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-execution-contract.js";
import type { RuankaoAiLearningDryRunReadinessCheck } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-readiness-check.js";
import type { RuankaoAiLearningDryRunRequestManifest } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.js";
import type { RuankaoAiLearningPromptContract } from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";

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
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-dry-run-readiness-check.schema.json");
const readinessPath = resolve(repoRoot, "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json");
const sourcePacketPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");
const promptContractPath = resolve(repoRoot, "verification/generated/phase5_4_ai_learning_prompt_contract.json");
const dryRunContractPath = resolve(repoRoot, "verification/generated/phase5_5_ai_learning_dry_run_contract.json");
const requestManifestPath = resolve(repoRoot, "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json");
const executionContractPath = resolve(repoRoot, "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json");
const officialMarkdownDir = "docs/ruankaodaren/baseline";
const sourceLayerDirs = [
  "source-packets",
  "data/intermediate",
  "sources/ruankaodaren/raw",
];

interface SourcePacketItemLike {
  title: string;
  render_as: string;
  source_availability: {
    source_packet_complete: boolean;
  };
}

interface SourcePacketLike {
  overall_source_packet_status: string;
  items: SourcePacketItemLike[];
}

function fail(message: string): never {
  console.error(`[validate:ai-learning-dry-run-readiness-check] ERROR: ${message}`);
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
    if (validate(data)) return [];
    return (validate.errors ?? []).map((error) => `schema: ${error.instancePath || "root"} ${error.message ?? "invalid"}`);
  };
}

function requireIncludes<T extends string>(values: T[], required: T[], label: string, errors: string[]): void {
  for (const value of required) {
    if (!values.includes(value)) errors.push(`${label} must include ${value}`);
  }
}

function requireExactSet(values: string[], required: string[], label: string, errors: string[]): void {
  requireIncludes(values, required, label, errors);
  if (values.length !== required.length) errors.push(`${label} must contain exactly ${required.length} values`);
}

function gitCleanCheck(relativePath: string, label: string, errors: string[]): void {
  const result = spawnSync("git", ["status", "--short", relativePath], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    errors.push(`${label} audit failed: git status exited ${result.status ?? "null"} ${result.stderr ?? ""}`.trim());
    return;
  }
  const output = result.stdout.trim();
  if (output.length > 0) errors.push(`${label} audit failed: Git changes detected: ${output}`);
}

function sourcePacketGateCheck(errors: string[]): SourcePacketLike | null {
  if (!existsSync(sourcePacketPath)) {
    errors.push("source packet gate failed: source-packets/ruankaodaren/baseline/source-packet.json is missing");
    return null;
  }
  const sourcePacket = readJson<SourcePacketLike>(sourcePacketPath);
  const completeCount = sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;
  if (completeCount !== 3) errors.push(`source packet gate failed: complete_count must be 3, got ${completeCount}`);
  if (sourcePacket.overall_source_packet_status !== "complete") {
    errors.push(`source packet gate failed: overall_source_packet_status must be complete, got ${sourcePacket.overall_source_packet_status}`);
  }
  return sourcePacket;
}

function promptContractCheck(errors: string[]): RuankaoAiLearningPromptContract | null {
  if (!existsSync(promptContractPath)) {
    errors.push("Phase 5.4 prompt contract missing");
    return null;
  }
  const promptContract = readJson<RuankaoAiLearningPromptContract>(promptContractPath);
  if (promptContract.generation_allowed !== false) errors.push("Phase 5.4 generation_allowed must be false");
  return promptContract;
}

function dryRunContractCheck(errors: string[]): RuankaoAiLearningDryRunContract | null {
  if (!existsSync(dryRunContractPath)) {
    errors.push("Phase 5.5 dry-run contract missing");
    return null;
  }
  const dryRunContract = readJson<RuankaoAiLearningDryRunContract>(dryRunContractPath);
  if (dryRunContract.generation_allowed !== false) errors.push("Phase 5.5 generation_allowed must be false");
  return dryRunContract;
}

function requestManifestCheck(errors: string[]): RuankaoAiLearningDryRunRequestManifest | null {
  if (!existsSync(requestManifestPath)) {
    errors.push("Phase 5.6 dry-run request manifest missing");
    return null;
  }
  const requestManifest = readJson<RuankaoAiLearningDryRunRequestManifest>(requestManifestPath);
  if (requestManifest.generation_allowed !== false) errors.push("Phase 5.6 generation_allowed must be false");
  if (requestManifest.dry_run_generation_allowed !== false) errors.push("Phase 5.6 dry_run_generation_allowed must be false");
  return requestManifest;
}

function executionContractCheck(errors: string[]): RuankaoAiLearningDryRunExecutionContract | null {
  if (!existsSync(executionContractPath)) {
    errors.push("Phase 5.7 dry-run execution contract missing");
    return null;
  }
  const executionContract = readJson<RuankaoAiLearningDryRunExecutionContract>(executionContractPath);
  if (executionContract.generation_allowed !== false) errors.push("Phase 5.7 generation_allowed must be false");
  if (executionContract.dry_run_execution_allowed !== false) errors.push("Phase 5.7 dry_run_execution_allowed must be false");
  return executionContract;
}

function noKnowledgeBodyCheck(value: unknown, errors: string[], path = "readiness"): void {
  const forbiddenKeys = [
    "knowledge_body",
    "ai_explanation",
    "generated_text",
    "generated_markdown",
    "learning_body",
    "content_body",
    "explanation_body",
    "section_content",
    "dry_run_body",
    "output_body",
    "input_bundle_instance",
    "source_content",
  ];
  const forbiddenBodySnippets = [
    "CISC is",
    "RISC is",
    "CISC 是",
    "RISC 是",
    "信息安全是",
    "软件架构风格是",
    "软件架构风格指",
    "核心概念：",
    "案例答题：",
    "论文表达：",
    "```",
  ];

  if (Array.isArray(value)) {
    value.forEach((item, index) => noKnowledgeBodyCheck(item, errors, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (forbiddenKeys.includes(key)) errors.push(`${path}.${key} must not exist in readiness check`);
      noKnowledgeBodyCheck(nested, errors, `${path}.${key}`);
    }
    return;
  }
  if (typeof value === "string") {
    for (const snippet of forbiddenBodySnippets) {
      if (value.includes(snippet)) errors.push(`${path} appears to contain AI learning or dry-run body text: ${snippet}`);
    }
  }
}

function outputIsolationCheck(check: RuankaoAiLearningDryRunReadinessCheck, errors: string[]): void {
  requireExactSet(
    check.output_isolation_readiness.allowed_output_paths,
    ["verification/dry-run/ruankaodaren/", "drafts/ai-learning/ruankaodaren/"],
    "output_isolation_readiness.allowed_output_paths",
    errors,
  );
  requireExactSet(
    check.output_isolation_readiness.forbidden_output_paths,
    ["docs/ruankaodaren/baseline/", "source-packets/", "source_content", "data/raw", "data/intermediate"],
    "output_isolation_readiness.forbidden_output_paths",
    errors,
  );

  const forbiddenPrefixes = [
    "docs/ruankaodaren/baseline",
    "source-packets",
    "data/raw",
    "data/intermediate",
    "sources/ruankaodaren/raw",
  ];
  for (const item of check.items) {
    const outputPath = item.readiness_output_path.replace(/\\/g, "/");
    for (const prefix of forbiddenPrefixes) {
      if (outputPath.startsWith(prefix)) errors.push(`items[${item.title}].readiness_output_path must not point to ${prefix}`);
    }
    if (outputPath.includes("source_content")) {
      errors.push(`items[${item.title}].readiness_output_path must not point to source_content`);
    }
    if (!outputPath.startsWith("verification/dry-run/ruankaodaren/") &&
      !outputPath.startsWith("drafts/ai-learning/ruankaodaren/")) {
      errors.push(`items[${item.title}].readiness_output_path must use an isolated ruankaodaren output root`);
    }
  }
}

function inputBundleConstructabilityCheck(check: RuankaoAiLearningDryRunReadinessCheck, errors: string[]): void {
  const constructability = check.input_bundle_constructability;
  if (constructability.constructable_now !== false) errors.push("input_bundle_constructability.constructable_now must be false");
  if (constructability.reason !== "human_review_not_approved") errors.push("input_bundle_constructability.reason must be human_review_not_approved");
  requireExactSet(
    constructability.required_references,
    ["source_packet", "prompt_contract", "dry_run_contract", "request_manifest", "execution_contract"],
    "input_bundle_constructability.required_references",
    errors,
  );
  if (constructability.isolated_output_target_valid !== true) errors.push("input_bundle_constructability.isolated_output_target_valid must be true");
  if (constructability.source_layer_write_allowed !== false) errors.push("input_bundle_constructability.source_layer_write_allowed must be false");
  if (constructability.official_markdown_write_allowed !== false) errors.push("input_bundle_constructability.official_markdown_write_allowed must be false");
  if (constructability.future_constructable_after_review !== true) errors.push("input_bundle_constructability.future_constructable_after_review must be true");
}

function phase59EntryPolicyCheck(check: RuankaoAiLearningDryRunReadinessCheck, errors: string[]): void {
  const policy = check.phase5_9_entry_policy;
  if (policy.phase5_9_entry_allowed !== false) errors.push("phase5_9_entry_policy.phase5_9_entry_allowed must be false");
  requireExactSet(
    policy.required_before_entry,
    [
      "explicit_user_approval",
      "human_review_request_created",
      "human_review_approved",
      "selected_item_is_phase5_9_candidate",
      "output_path_isolated",
      "source_packet_reference_valid",
      "prompt_contract_reference_valid",
      "dry_run_contract_reference_valid",
      "request_manifest_reference_valid",
      "execution_contract_reference_valid",
    ],
    "phase5_9_entry_policy.required_before_entry",
    errors,
  );
  requireExactSet(
    policy.prohibited_before_entry,
    [
      "source_layer_modification",
      "official_markdown_modification",
      "generation_allowed_true",
      "auto_approval_true",
      "taxonomy_suspect_unrestricted_generation",
      "asset_without_manual_review",
    ],
    "phase5_9_entry_policy.prohibited_before_entry",
    errors,
  );
}

function invariantCheck(check: RuankaoAiLearningDryRunReadinessCheck): string[] {
  const errors: string[] = [];
  const sourcePacket = sourcePacketGateCheck(errors);
  const promptContract = promptContractCheck(errors);
  const dryRunContract = dryRunContractCheck(errors);
  const requestManifest = requestManifestCheck(errors);
  const executionContract = executionContractCheck(errors);
  gitCleanCheck(officialMarkdownDir, "official Markdown", errors);
  for (const sourceLayerDir of sourceLayerDirs) gitCleanCheck(sourceLayerDir, `Source Layer ${sourceLayerDir}`, errors);
  noKnowledgeBodyCheck(check, errors);
  outputIsolationCheck(check, errors);
  inputBundleConstructabilityCheck(check, errors);
  phase59EntryPolicyCheck(check, errors);

  if (check.check_version !== "phase5.8") errors.push("check_version must be phase5.8");
  if (check.generation_allowed !== false) errors.push("generation_allowed must be false");
  if (check.dry_run_generation_allowed !== false) errors.push("dry_run_generation_allowed must be false");
  if (check.dry_run_execution_allowed !== false) errors.push("dry_run_execution_allowed must be false");
  if (check.formal_ai_learning_generation_allowed !== false) errors.push("formal_ai_learning_generation_allowed must be false");
  if (check.readiness_mode !== "check_only") errors.push("readiness_mode must be check_only");
  if (check.review_gate_required !== true) errors.push("review_gate_required must be true");
  if (check.auto_approval !== false) errors.push("auto_approval must be false");
  if (check.source_layer_modification_allowed !== false) errors.push("source_layer_modification_allowed must be false");
  if (check.official_markdown_modification_allowed !== false) errors.push("official_markdown_modification_allowed must be false");
  if (check.source_content_write_allowed !== false) errors.push("source_content_write_allowed must be false");
  if (check.phase5_9_entry_allowed !== false) errors.push("phase5_9_entry_allowed must be false");
  if (check.item_count !== 3) errors.push("item_count must be 3");
  if (check.item_count !== check.items.length) errors.push("item_count must match items.length");

  if (check.source_packet_prior_contract_gate.source_packet_exists !== true) errors.push("source_packet_prior_contract_gate.source_packet_exists must be true");
  if (check.source_packet_prior_contract_gate.complete_count !== 3) errors.push("source_packet_prior_contract_gate.complete_count must be 3");
  if (check.source_packet_prior_contract_gate.phase5_4_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_4_generation_allowed must be false");
  if (check.source_packet_prior_contract_gate.phase5_5_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_5_generation_allowed must be false");
  if (check.source_packet_prior_contract_gate.phase5_6_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_6_generation_allowed must be false");
  if (check.source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed must be false");
  if (check.source_packet_prior_contract_gate.phase5_7_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_7_generation_allowed must be false");
  if (check.source_packet_prior_contract_gate.phase5_7_dry_run_execution_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_7_dry_run_execution_allowed must be false");
  if (check.source_packet_prior_contract_gate.gate_result !== "pass") errors.push("source_packet_prior_contract_gate.gate_result must be pass");

  requireExactSet(
    check.artifact_commit_policy.commit_allowed,
    ["schema", "types", "builder", "validator", "verification_doc", "generated_readiness_check_json", "generated_readiness_check_md"],
    "artifact_commit_policy.commit_allowed",
    errors,
  );
  requireExactSet(
    check.artifact_commit_policy.commit_forbidden,
    [
      "ai_learning_content",
      "dry_run_content",
      "input_bundle_instance",
      "official_markdown_rewrite",
      "source_layer_modifications",
      "raw_snapshots",
      "intermediate_generated_artifacts",
      "asset_images",
      ".auth",
      "node_modules",
      "pnpm-workspace.yaml",
    ],
    "artifact_commit_policy.commit_forbidden",
    errors,
  );

  const sourceTitles = sourcePacket?.items.map((item) => item.title) ?? [];
  const promptTitles = promptContract?.items.map((item) => item.title) ?? [];
  const dryRunTitles = dryRunContract?.items.map((item) => item.title) ?? [];
  const requestTitles = requestManifest?.items.map((item) => item.title) ?? [];
  const executionTitles = executionContract?.items.map((item) => item.title) ?? [];

  for (const item of check.items) {
    if (!sourceTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by source packet item`);
    if (!promptTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.4 prompt contract item`);
    if (!dryRunTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.5 dry-run contract item`);
    if (!requestTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.6 request manifest item`);
    if (!executionTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.7 execution contract item`);
    if (item.phase5_9_candidate !== false) errors.push(`items[${item.title}].phase5_9_candidate must be false`);
    if (item.current_execution_allowed !== false) errors.push(`items[${item.title}].current_execution_allowed must be false`);
    if (item.current_dry_run_generation_allowed !== false) errors.push(`items[${item.title}].current_dry_run_generation_allowed must be false`);
    if (item.current_formal_generation_allowed !== false) errors.push(`items[${item.title}].current_formal_generation_allowed must be false`);
    const currentStatus = item.current_status as string;
    if (currentStatus === "execution_ready") errors.push(`items[${item.title}].current_status must not be execution_ready`);
    if (currentStatus === "dry_run_executed") errors.push(`items[${item.title}].current_status must not be dry_run_executed`);
    if (item.taxonomy_suspect && item.phase5_9_candidate !== false) {
      errors.push(`items[${item.title}] taxonomy_suspect item cannot become Phase 5.9 candidate`);
    }
    if (item.render_as === "asset_card" && item.requires_manual_asset_review && item.phase5_9_candidate !== false) {
      errors.push(`items[${item.title}] asset_card without manual asset review cannot become Phase 5.9 candidate`);
    }

    const sourceItem = sourcePacket?.items.find((candidate) => candidate.title === item.title);
    if (sourceItem && sourceItem.render_as !== item.render_as) errors.push(`items[${item.title}].render_as must match source packet`);

    if (item.title === "1.3 指令系统CISC和RISC") {
      if (item.render_as !== "asset_card") errors.push("1.3 render_as must be asset_card");
      if (item.current_status !== "not_ready") errors.push("1.3 current_status must be not_ready");
      if (item.eligible_for_request !== false) errors.push("1.3 eligible_for_request must be false");
      if (item.requires_manual_asset_review !== true) errors.push("1.3 requires_manual_asset_review must be true");
      if (item.requires_manual_review !== true) errors.push("1.3 requires_manual_review must be true");
      if (item.no_ocr !== true) errors.push("1.3 no_ocr must be true");
      if (item.no_image_table_reconstruction !== true) errors.push("1.3 no_image_table_reconstruction must be true");
      if (item.cannot_claim_image_content_recognized !== true) errors.push("1.3 cannot_claim_image_content_recognized must be true");
      requireExactSet(item.readiness_blockers, ["asset_manual_review_required", "image_content_not_human_verified"], "1.3 readiness_blockers", errors);
      if (item.readiness_result !== "blocked") errors.push("1.3 readiness_result must be blocked");
    }
    if (item.title === "13.3 软件架构风格") {
      if (item.render_as !== "short_card") errors.push("13.3 render_as must be short_card");
      if (item.current_status !== "not_ready") errors.push("13.3 current_status must be not_ready");
      if (item.eligible_for_request !== false) errors.push("13.3 eligible_for_request must be false");
      if (item.taxonomy_suspect !== true) errors.push("13.3 taxonomy_suspect must be true");
      if (item.is_multi_card_sequence !== true) errors.push("13.3 is_multi_card_sequence must be true");
      if (item.taxonomy_suspect_handling !== "restrict_readiness") errors.push("13.3 taxonomy_suspect_handling must be restrict_readiness");
      if (item.multi_card_sequence_handling !== "do_not_claim_complete") errors.push("13.3 multi_card_sequence_handling must be do_not_claim_complete");
      if (item.parent_node_handling !== "do_not_generate_as_leaf") errors.push("13.3 parent_node_handling must be do_not_generate_as_leaf");
      requireIncludes(item.required_warnings, ["verified_short_text", "taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"], "13.3 required_warnings", errors);
      requireExactSet(item.readiness_blockers, ["taxonomy_suspect", "multi_card_sequence_possible", "parent_node_not_safe_as_leaf"], "13.3 readiness_blockers", errors);
      if (item.readiness_result !== "blocked") errors.push("13.3 readiness_result must be blocked");
    }
    if (item.title === "9.1 信息安全基础知识") {
      if (item.render_as !== "concept_card") errors.push("9.1 render_as must be concept_card");
      if (item.current_status !== "review_required") errors.push("9.1 current_status must be review_required");
      if (item.eligible_for_request !== true) errors.push("9.1 eligible_for_request must be true");
      if (item.may_become_phase5_9_candidate_after_review !== true) errors.push("9.1 may_become_phase5_9_candidate_after_review must be true");
      if (item.requires_manual_review !== true) errors.push("9.1 requires_manual_review must be true");
      requireExactSet(
        item.readiness_prerequisites,
        [
          "human_review_request",
          "human_review_approval",
          "isolated_output_path",
          "source_packet_reference",
          "prompt_contract_reference",
          "dry_run_contract_reference",
          "request_manifest_reference",
          "execution_contract_reference",
        ],
        "9.1 readiness_prerequisites",
        errors,
      );
      requireExactSet(item.readiness_blockers, ["human_review_not_approved"], "9.1 readiness_blockers", errors);
      if (item.readiness_result !== "blocked_until_human_review") errors.push("9.1 readiness_result must be blocked_until_human_review");
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(readinessPath)) {
    fail("dry-run readiness check JSON missing; run pnpm build:ai-learning-dry-run-readiness-check");
  }
  const check = readJson<RuankaoAiLearningDryRunReadinessCheck>(readinessPath);
  const errors = [...buildSchemaValidator()(check), ...invariantCheck(check)];

  if (errors.length > 0) {
    console.error("[validate:ai-learning-dry-run-readiness-check] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:ai-learning-dry-run-readiness-check] Dry-run readiness check validation passed");
  console.log(`  check_version:                      ${check.check_version}`);
  console.log(`  readiness_mode:                     ${check.readiness_mode}`);
  console.log(`  generation_allowed:                 ${check.generation_allowed}`);
  console.log(`  dry_run_generation_allowed:         ${check.dry_run_generation_allowed}`);
  console.log(`  dry_run_execution_allowed:          ${check.dry_run_execution_allowed}`);
  console.log(`  formal_ai_learning_generation_allowed: ${check.formal_ai_learning_generation_allowed}`);
  console.log(`  phase5_9_entry_allowed:             ${check.phase5_9_entry_allowed}`);
  console.log(`  item_count:                         ${check.item_count}`);
}

main();
