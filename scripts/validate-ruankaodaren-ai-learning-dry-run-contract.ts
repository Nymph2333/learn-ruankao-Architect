/**
 * Phase 5.5 AI Learning Layer dry-run request and review gate contract
 * validator.
 *
 * Validates dry-run boundaries only. It does not generate AI learning content,
 * create formal dual-layer documents, rewrite official Markdown, modify Source
 * Layer artifacts, write source_content, OCR, decrypt encrypted XHR,
 * reconstruct image tables, read raw HTML/XHR, access webpages, run a renderer,
 * run a crawler, or run recovery.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAiLearningDryRunContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
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
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-dry-run-contract.schema.json");
const contractPath = resolve(repoRoot, "verification/generated/phase5_5_ai_learning_dry_run_contract.json");
const promptContractPath = resolve(repoRoot, "verification/generated/phase5_4_ai_learning_prompt_contract.json");
const sourcePacketPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");
const officialMarkdownDir = "docs/ruankaodaren/baseline";
const sourceLayerDirs = [
  "source-packets/ruankaodaren/baseline",
  "data/intermediate/ruankaodaren/samples",
  "sources/ruankaodaren/raw/assets/manifests",
  "sources/ruankaodaren/raw/assets/images",
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
  console.error(`[validate:ai-learning-dry-run-contract] ERROR: ${message}`);
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
  if (completeCount !== 3) {
    errors.push(`source packet gate failed: complete_count must be 3, got ${completeCount}`);
  }
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
  if (promptContract.generation_allowed !== false) {
    errors.push("Phase 5.4 prompt contract generation_allowed must be false");
  }
  return promptContract;
}

function outputPathCheck(contract: RuankaoAiLearningDryRunContract, errors: string[]): void {
  requireIncludes(
    contract.output_policy.allowed_output_roots,
    ["verification/dry-run", "drafts/ai-learning"],
    "output_policy.allowed_output_roots",
    errors,
  );
  requireIncludes(
    contract.output_policy.forbidden_output_roots,
    ["docs/ruankaodaren/baseline", "source_content"],
    "output_policy.forbidden_output_roots",
    errors,
  );

  for (const item of contract.items) {
    const outputPath = item.dry_run_output_path.replace(/\\/g, "/");
    if (outputPath.startsWith("docs/ruankaodaren/baseline")) {
      errors.push(`items[${item.title}].dry_run_output_path must not point to official Markdown`);
    }
    if (outputPath.includes("source_content")) {
      errors.push(`items[${item.title}].dry_run_output_path must not point to source_content`);
    }
    if (!outputPath.startsWith("verification/dry-run/") && !outputPath.startsWith("drafts/ai-learning/")) {
      errors.push(`items[${item.title}].dry_run_output_path must use an isolated dry-run output root`);
    }
  }
}

function invariantCheck(contract: RuankaoAiLearningDryRunContract): string[] {
  const errors: string[] = [];
  const sourcePacket = sourcePacketGateCheck(errors);
  const promptContract = promptContractCheck(errors);
  gitCleanCheck(officialMarkdownDir, "official Markdown", errors);
  for (const sourceLayerDir of sourceLayerDirs) {
    gitCleanCheck(sourceLayerDir, `Source Layer ${sourceLayerDir}`, errors);
  }
  outputPathCheck(contract, errors);

  if (contract.generation_allowed !== false) errors.push("generation_allowed must be false");
  if (contract.dry_run_allowed !== "request_only") errors.push("dry_run_allowed must be request_only");
  if (contract.review_gate_required !== true) errors.push("review_gate_required must be true");
  if (contract.auto_approval !== false) errors.push("auto_approval must be false");
  if (contract.source_layer_modification_allowed !== false) {
    errors.push("source_layer_modification_allowed must be false");
  }
  if (contract.official_markdown_modification_allowed !== false) {
    errors.push("official_markdown_modification_allowed must be false");
  }
  if (contract.source_content_write_allowed !== false) {
    errors.push("source_content_write_allowed must be false");
  }

  requireIncludes(
    contract.review_gate.allowed_statuses,
    [
      "not_requested",
      "dry_run_requested",
      "dry_run_generated",
      "human_review_pending",
      "human_review_changes_requested",
      "human_review_rejected",
      "human_review_approved",
    ],
    "review_gate.allowed_statuses",
    errors,
  );
  if (contract.review_gate.default_status !== "not_requested") errors.push("review_gate.default_status must be not_requested");
  if (contract.review_gate.human_review_approved !== false) errors.push("review_gate.human_review_approved must be false");
  if (contract.review_gate.auto_approval !== false) errors.push("review_gate.auto_approval must be false");
  if (contract.review_gate.phase5_6_generation_allowed !== false) {
    errors.push("review_gate.phase5_6_generation_allowed must be false");
  }
  const noApproval = contract.review_gate.without_human_review_approval;
  if (noApproval.formal_ai_learning_generation_allowed !== false) errors.push("formal AI generation must be blocked without human review");
  if (noApproval.docs_baseline_write_allowed !== false) errors.push("docs baseline writes must be blocked without human review");
  if (noApproval.official_markdown_modification_allowed !== false) errors.push("official Markdown modification must be blocked without human review");
  if (noApproval.phase5_6_entry_allowed !== false) errors.push("Phase 5.6 entry must be blocked without human review");

  const sourceTitles = sourcePacket?.items.map((item) => item.title) ?? [];
  const promptTitles = promptContract?.items.map((item) => item.title) ?? [];
  for (const item of contract.items) {
    if (!sourceTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by source packet item`);
    if (!promptTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.4 prompt item`);
    if (item.dry_run_generation_allowed !== false) {
      errors.push(`items[${item.title}].dry_run_generation_allowed must be false`);
    }
    if (item.unrestricted_dry_run_allowed !== false) {
      errors.push(`items[${item.title}].unrestricted_dry_run_allowed must be false`);
    }
    if (item.review_gate_status !== "not_requested") {
      errors.push(`items[${item.title}].review_gate_status must default to not_requested`);
    }
    if (item.human_review_approved !== false) {
      errors.push(`items[${item.title}].human_review_approved must be false`);
    }
    const sourceItem = sourcePacket?.items.find((candidate) => candidate.title === item.title);
    if (sourceItem && sourceItem.render_as !== item.render_as) {
      errors.push(`items[${item.title}].render_as must match source packet render_as`);
    }
    if (item.taxonomy_suspect && item.unrestricted_dry_run_allowed !== false) {
      errors.push(`items[${item.title}] taxonomy_suspect item cannot allow unrestricted dry-run`);
    }
    if (item.title === "1.3 指令系统CISC和RISC") {
      for (const warning of ["no_ocr", "no_image_table_reconstruction", "asset_manual_review_required", "cannot_claim_image_content_recognized"]) {
        if (!item.required_warnings.includes(warning)) errors.push(`items[${item.title}] must include warning ${warning}`);
      }
      if (item.requires_manual_asset_review !== true) errors.push(`items[${item.title}].requires_manual_asset_review must be true`);
      if (item.no_ocr !== true) errors.push(`items[${item.title}].no_ocr must be true`);
      if (item.no_image_table_reconstruction !== true) errors.push(`items[${item.title}].no_image_table_reconstruction must be true`);
      if (item.cannot_claim_image_content_recognized !== true) {
        errors.push(`items[${item.title}].cannot_claim_image_content_recognized must be true`);
      }
    }
    if (item.title === "13.3 软件架构风格") {
      if (item.taxonomy_suspect !== true) errors.push("13.3 软件架构风格 must be taxonomy_suspect");
      if (item.is_multi_card_sequence !== true) errors.push("13.3 软件架构风格 must be marked is_multi_card_sequence");
      if (item.taxonomy_suspect_handling !== "restrict_dry_run") {
        errors.push("13.3 软件架构风格 taxonomy_suspect_handling must be restrict_dry_run");
      }
      if (item.multi_card_sequence_handling !== "do_not_claim_complete") {
        errors.push("13.3 软件架构风格 multi_card_sequence_handling must be do_not_claim_complete");
      }
      if (item.parent_node_handling !== "do_not_generate_as_leaf") {
        errors.push("13.3 软件架构风格 parent_node_handling must be do_not_generate_as_leaf");
      }
      for (const warning of ["taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"]) {
        if (!item.required_warnings.includes(warning)) errors.push(`13.3 软件架构风格 must include warning ${warning}`);
      }
    }
    if (item.title === "9.1 信息安全基础知识") {
      if (item.may_enter_future_dry_run_after_review !== true) {
        errors.push("9.1 信息安全基础知识 may_enter_future_dry_run_after_review must be true");
      }
      if (item.requires_manual_review !== true) errors.push("9.1 信息安全基础知识 requires_manual_review must be true");
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(contractPath)) {
    fail("dry-run contract JSON missing; run pnpm build:ai-learning-dry-run-contract");
  }
  const contract = readJson<RuankaoAiLearningDryRunContract>(contractPath);
  const errors = [...buildSchemaValidator()(contract), ...invariantCheck(contract)];

  if (errors.length > 0) {
    console.error("[validate:ai-learning-dry-run-contract] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:ai-learning-dry-run-contract] Dry-run contract validation passed");
  console.log(`  contract_version:     ${contract.contract_version}`);
  console.log(`  dry_run_allowed:      ${contract.dry_run_allowed}`);
  console.log(`  generation_allowed:   ${contract.generation_allowed}`);
  console.log(`  review_gate_required: ${contract.review_gate_required}`);
  console.log(`  item_count:           ${contract.items.length}`);
}

main();
