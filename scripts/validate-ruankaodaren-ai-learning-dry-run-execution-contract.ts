/**
 * Phase 5.7 AI Learning dry-run execution contract validator.
 *
 * Validates future execution construction, output format, status machine, and
 * isolation boundaries only. It does not generate AI learning content, generate
 * dry-run content, create formal dual-layer documents, rewrite official
 * Markdown, modify Source Layer artifacts, write source_content, OCR, decrypt
 * encrypted XHR, reconstruct image tables, read raw HTML/XHR, access webpages,
 * run a renderer, run a crawler, or run recovery.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAiLearningDryRunContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
import type { RuankaoAiLearningDryRunExecutionContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-execution-contract.js";
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
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-dry-run-execution-contract.schema.json");
const contractPath = resolve(repoRoot, "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json");
const sourcePacketPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");
const promptContractPath = resolve(repoRoot, "verification/generated/phase5_4_ai_learning_prompt_contract.json");
const dryRunContractPath = resolve(repoRoot, "verification/generated/phase5_5_ai_learning_dry_run_contract.json");
const requestManifestPath = resolve(repoRoot, "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json");
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
  console.error(`[validate:ai-learning-dry-run-execution-contract] ERROR: ${message}`);
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
  if (requestManifest.phase5_7_entry_allowed !== false) errors.push("Phase 5.6 phase5_7_entry_allowed must be false");
  return requestManifest;
}

function outputIsolationCheck(contract: RuankaoAiLearningDryRunExecutionContract, errors: string[]): void {
  requireExactSet(
    contract.output_isolation_policy.allowed_output_paths,
    ["verification/dry-run/ruankaodaren/", "drafts/ai-learning/ruankaodaren/"],
    "output_isolation_policy.allowed_output_paths",
    errors,
  );
  requireExactSet(
    contract.output_isolation_policy.forbidden_output_paths,
    ["docs/ruankaodaren/baseline/", "source-packets/", "source_content", "data/raw", "data/intermediate"],
    "output_isolation_policy.forbidden_output_paths",
    errors,
  );

  const forbiddenPrefixes = [
    "docs/ruankaodaren/baseline",
    "source-packets",
    "data/raw",
    "data/intermediate",
    "sources/ruankaodaren/raw",
  ];
  for (const item of contract.items) {
    const outputPath = item.future_execution_output_path.replace(/\\/g, "/");
    for (const prefix of forbiddenPrefixes) {
      if (outputPath.startsWith(prefix)) errors.push(`items[${item.title}].future_execution_output_path must not point to ${prefix}`);
    }
    if (outputPath.includes("source_content")) {
      errors.push(`items[${item.title}].future_execution_output_path must not point to source_content`);
    }
    if (!outputPath.startsWith("verification/dry-run/ruankaodaren/") &&
      !outputPath.startsWith("drafts/ai-learning/ruankaodaren/")) {
      errors.push(`items[${item.title}].future_execution_output_path must use an isolated ruankaodaren output root`);
    }
  }
}

function noKnowledgeBodyCheck(value: unknown, errors: string[], path = "contract"): void {
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
      if (forbiddenKeys.includes(key)) errors.push(`${path}.${key} must not exist in execution contract`);
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

function inputBundleCheck(contract: RuankaoAiLearningDryRunExecutionContract, errors: string[]): void {
  const input = contract.input_bundle_schema;
  const controls = input.execution_controls;
  if (input.source_packet_reference !== "source-packets/ruankaodaren/baseline/source-packet.json") errors.push("input_bundle_schema.source_packet_reference is invalid");
  if (input.prompt_contract_reference !== "verification/generated/phase5_4_ai_learning_prompt_contract.json") errors.push("input_bundle_schema.prompt_contract_reference is invalid");
  if (input.dry_run_contract_reference !== "verification/generated/phase5_5_ai_learning_dry_run_contract.json") errors.push("input_bundle_schema.dry_run_contract_reference is invalid");
  if (input.dry_run_request_manifest_reference !== "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json") errors.push("input_bundle_schema.dry_run_request_manifest_reference is invalid");
  if (controls.generation_allowed !== false) errors.push("input_bundle_schema.execution_controls.generation_allowed must be false");
  if (controls.dry_run_generation_allowed !== false) errors.push("input_bundle_schema.execution_controls.dry_run_generation_allowed must be false");
  if (controls.dry_run_execution_allowed !== false) errors.push("input_bundle_schema.execution_controls.dry_run_execution_allowed must be false");
  if (controls.formal_generation_allowed !== false) errors.push("input_bundle_schema.execution_controls.formal_generation_allowed must be false");
  if (controls.source_layer_write_allowed !== false) errors.push("input_bundle_schema.execution_controls.source_layer_write_allowed must be false");
  if (controls.official_markdown_write_allowed !== false) errors.push("input_bundle_schema.execution_controls.official_markdown_write_allowed must be false");
  if (controls.auto_approval !== false) errors.push("input_bundle_schema.execution_controls.auto_approval must be false");
}

function outputFormatCheck(contract: RuankaoAiLearningDryRunExecutionContract, errors: string[]): void {
  const format = contract.future_output_format;
  if (format.output_kind !== "dry_run_ai_learning_draft") errors.push("future_output_format.output_kind must be dry_run_ai_learning_draft");
  for (const [key, value] of Object.entries(format)) {
    if (key !== "output_kind" && value !== true) errors.push(`future_output_format.${key} must be true`);
  }
  requireExactSet(
    contract.future_dry_run_sections,
    [
      "Source Summary / 原文摘要",
      "AI Explanation / AI解析",
      "Architecture Mapping / 架构师考点映射",
      "Case Study Pattern / 案例答题模式",
      "Paper Usage / 论文表达",
      "Misconceptions / 易错点",
      "Memory Hooks / 记忆钩子",
      "Review Notes / 复核提示",
    ],
    "future_dry_run_sections",
    errors,
  );
}

function statusMachineCheck(contract: RuankaoAiLearningDryRunExecutionContract, errors: string[]): void {
  const machine = contract.execution_status_machine;
  requireExactSet(
    machine.allowed_statuses,
    [
      "not_executable",
      "execution_request_required",
      "execution_review_pending",
      "execution_ready",
      "execution_blocked",
      "dry_run_executed",
      "dry_run_review_pending",
      "dry_run_changes_requested",
      "dry_run_rejected",
      "dry_run_approved",
    ],
    "execution_status_machine.allowed_statuses",
    errors,
  );
  if (machine.default_status !== "not_executable") errors.push("execution_status_machine.default_status must be not_executable");
  if (machine.phase5_7_execution_ready_allowed !== false) errors.push("Phase 5.7 must not allow execution_ready");
  if (machine.phase5_7_dry_run_executed_allowed !== false) errors.push("Phase 5.7 must not allow dry_run_executed");
  if (machine.phase5_8_entry_allowed !== false) errors.push("Phase 5.7 must not allow Phase 5.8 entry");

  const transitions = new Map(machine.transition_rules.map((rule) => [`${rule.from}->${rule.to}`, rule.requires]));
  const expectedTransitions: Record<string, string[]> = {
    "not_executable->execution_request_required": ["item eligible_for_request = true"],
    "execution_request_required->execution_review_pending": ["human_review_request_created = true"],
    "execution_review_pending->execution_ready": [
      "human_review_approved = true",
      "output_path_isolated = true",
      "source_packet_reference_valid = true",
      "prompt_contract_reference_valid = true",
      "dry_run_contract_reference_valid = true",
      "request_manifest_reference_valid = true",
    ],
    "execution_ready->dry_run_executed": ["explicit Phase 5.8 entry approval"],
  };
  for (const [transition, requirements] of Object.entries(expectedTransitions)) {
    const actualRequirements = transitions.get(transition);
    if (!actualRequirements) {
      errors.push(`execution_status_machine.transition_rules must include ${transition}`);
      continue;
    }
    requireIncludes(actualRequirements, requirements, `execution_status_machine.transition_rules[${transition}].requires`, errors);
  }
}

function invariantCheck(contract: RuankaoAiLearningDryRunExecutionContract): string[] {
  const errors: string[] = [];
  const sourcePacket = sourcePacketGateCheck(errors);
  const promptContract = promptContractCheck(errors);
  const dryRunContract = dryRunContractCheck(errors);
  const requestManifest = requestManifestCheck(errors);
  gitCleanCheck(officialMarkdownDir, "official Markdown", errors);
  for (const sourceLayerDir of sourceLayerDirs) gitCleanCheck(sourceLayerDir, `Source Layer ${sourceLayerDir}`, errors);
  noKnowledgeBodyCheck(contract, errors);
  inputBundleCheck(contract, errors);
  outputFormatCheck(contract, errors);
  statusMachineCheck(contract, errors);
  outputIsolationCheck(contract, errors);

  if (contract.generation_allowed !== false) errors.push("generation_allowed must be false");
  if (contract.dry_run_generation_allowed !== false) errors.push("dry_run_generation_allowed must be false");
  if (contract.dry_run_execution_allowed !== false) errors.push("dry_run_execution_allowed must be false");
  if (contract.formal_ai_learning_generation_allowed !== false) errors.push("formal_ai_learning_generation_allowed must be false");
  if (contract.execution_mode !== "contract_only") errors.push("execution_mode must be contract_only");
  if (contract.review_gate_required !== true) errors.push("review_gate_required must be true");
  if (contract.auto_approval !== false) errors.push("auto_approval must be false");
  if (contract.phase5_8_entry_allowed !== false) errors.push("phase5_8_entry_allowed must be false");
  if (contract.source_layer_modification_allowed !== false) errors.push("source_layer_modification_allowed must be false");
  if (contract.official_markdown_modification_allowed !== false) errors.push("official_markdown_modification_allowed must be false");
  if (contract.source_content_write_allowed !== false) errors.push("source_content_write_allowed must be false");
  if (contract.item_count !== 3) errors.push("item_count must be 3");
  if (contract.item_count !== contract.items.length) errors.push("item_count must match items.length");

  if (contract.source_packet_prior_contract_gate.source_packet_exists !== true) errors.push("source_packet_prior_contract_gate.source_packet_exists must be true");
  if (contract.source_packet_prior_contract_gate.complete_count !== 3) errors.push("source_packet_prior_contract_gate.complete_count must be 3");
  if (contract.source_packet_prior_contract_gate.phase5_4_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_4_generation_allowed must be false");
  if (contract.source_packet_prior_contract_gate.phase5_5_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_5_generation_allowed must be false");
  if (contract.source_packet_prior_contract_gate.phase5_6_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_6_generation_allowed must be false");
  if (contract.source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed must be false");
  if (contract.source_packet_prior_contract_gate.gate_result !== "pass") errors.push("source_packet_prior_contract_gate.gate_result must be pass");

  requireExactSet(
    contract.artifact_commit_policy.commit_allowed,
    ["schema", "types", "builder", "validator", "verification_doc", "generated_execution_contract_json", "generated_execution_contract_md"],
    "artifact_commit_policy.commit_allowed",
    errors,
  );
  requireExactSet(
    contract.artifact_commit_policy.commit_forbidden,
    [
      "ai_learning_content",
      "dry_run_content",
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
  for (const item of contract.items) {
    if (!sourceTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by source packet item`);
    if (!promptTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.4 prompt contract item`);
    if (!dryRunTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.5 dry-run contract item`);
    if (!requestTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.6 request manifest item`);
    if (item.execution_status !== "not_executable") errors.push(`items[${item.title}].execution_status must be not_executable`);
    if (item.execution_allowed !== false) errors.push(`items[${item.title}].execution_allowed must be false`);
    if (item.dry_run_generation_allowed !== false) errors.push(`items[${item.title}].dry_run_generation_allowed must be false`);
    if (item.formal_generation_allowed !== false) errors.push(`items[${item.title}].formal_generation_allowed must be false`);
    if (item.unrestricted_execution_allowed !== false) errors.push(`items[${item.title}].unrestricted_execution_allowed must be false`);
    if (item.taxonomy_suspect && item.unrestricted_execution_allowed !== false) {
      errors.push(`items[${item.title}] taxonomy_suspect item cannot allow unrestricted execution`);
    }

    const sourceItem = sourcePacket?.items.find((candidate) => candidate.title === item.title);
    if (sourceItem && sourceItem.render_as !== item.render_as) errors.push(`items[${item.title}].render_as must match source packet`);

    if (item.title === "1.3 指令系统CISC和RISC") {
      if (item.render_as !== "asset_card") errors.push("1.3 render_as must be asset_card");
      if (item.eligible_for_request !== false) errors.push("1.3 eligible_for_request must be false");
      if (item.requires_manual_asset_review !== true) errors.push("1.3 requires_manual_asset_review must be true");
      if (item.requires_manual_review !== true) errors.push("1.3 requires_manual_review must be true");
      if (item.no_ocr !== true) errors.push("1.3 no_ocr must be true");
      if (item.no_image_table_reconstruction !== true) errors.push("1.3 no_image_table_reconstruction must be true");
      if (item.cannot_claim_image_content_recognized !== true) errors.push("1.3 cannot_claim_image_content_recognized must be true");
      requireExactSet(item.execution_blockers, ["asset_manual_review_required", "image_content_not_human_verified"], "1.3 execution_blockers", errors);
    }
    if (item.title === "13.3 软件架构风格") {
      if (item.render_as !== "short_card") errors.push("13.3 render_as must be short_card");
      if (item.taxonomy_suspect !== true) errors.push("13.3 taxonomy_suspect must be true");
      if (item.is_multi_card_sequence !== true) errors.push("13.3 is_multi_card_sequence must be true");
      if (item.eligible_for_request !== false) errors.push("13.3 eligible_for_request must be false");
      if (item.taxonomy_suspect_handling !== "restrict_execution") errors.push("13.3 taxonomy_suspect_handling must be restrict_execution");
      if (item.multi_card_sequence_handling !== "do_not_claim_complete") errors.push("13.3 multi_card_sequence_handling must be do_not_claim_complete");
      if (item.parent_node_handling !== "do_not_generate_as_leaf") errors.push("13.3 parent_node_handling must be do_not_generate_as_leaf");
      requireIncludes(item.required_warnings, ["taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"], "13.3 required_warnings", errors);
      requireExactSet(item.execution_blockers, ["taxonomy_suspect", "multi_card_sequence_possible", "parent_node_not_safe_as_leaf"], "13.3 execution_blockers", errors);
    }
    if (item.title === "9.1 信息安全基础知识") {
      if (item.render_as !== "concept_card") errors.push("9.1 render_as must be concept_card");
      if (item.eligible_for_request !== true) errors.push("9.1 eligible_for_request must be true");
      if (item.may_enter_future_execution_after_review !== true) errors.push("9.1 may_enter_future_execution_after_review must be true");
      if (item.requires_manual_review !== true) errors.push("9.1 requires_manual_review must be true");
      requireExactSet(
        item.execution_prerequisites,
        [
          "human_review_request",
          "human_review_approval",
          "isolated_output_path",
          "source_packet_reference",
          "prompt_contract_reference",
          "dry_run_contract_reference",
          "request_manifest_reference",
        ],
        "9.1 execution_prerequisites",
        errors,
      );
      if (item.execution_blockers.length !== 0) errors.push("9.1 execution_blockers must be empty");
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(contractPath)) {
    fail("dry-run execution contract JSON missing; run pnpm build:ai-learning-dry-run-execution-contract");
  }
  const contract = readJson<RuankaoAiLearningDryRunExecutionContract>(contractPath);
  const errors = [...buildSchemaValidator()(contract), ...invariantCheck(contract)];

  if (errors.length > 0) {
    console.error("[validate:ai-learning-dry-run-execution-contract] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:ai-learning-dry-run-execution-contract] Dry-run execution contract validation passed");
  console.log(`  contract_version:                  ${contract.contract_version}`);
  console.log(`  execution_mode:                    ${contract.execution_mode}`);
  console.log(`  generation_allowed:                ${contract.generation_allowed}`);
  console.log(`  dry_run_generation_allowed:        ${contract.dry_run_generation_allowed}`);
  console.log(`  dry_run_execution_allowed:         ${contract.dry_run_execution_allowed}`);
  console.log(`  formal_ai_learning_generation_allowed: ${contract.formal_ai_learning_generation_allowed}`);
  console.log(`  phase5_8_entry_allowed:            ${contract.phase5_8_entry_allowed}`);
  console.log(`  item_count:                        ${contract.item_count}`);
}

main();
