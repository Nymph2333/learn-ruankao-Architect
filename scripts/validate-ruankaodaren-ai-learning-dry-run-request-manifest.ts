/**
 * Phase 5.6 AI Learning dry-run request manifest validator.
 *
 * Validates request eligibility and isolation boundaries only. It does not
 * generate AI learning content, generate dry-run content, create formal
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
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-dry-run-request-manifest.schema.json");
const manifestPath = resolve(repoRoot, "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json");
const promptContractPath = resolve(repoRoot, "verification/generated/phase5_4_ai_learning_prompt_contract.json");
const dryRunContractPath = resolve(repoRoot, "verification/generated/phase5_5_ai_learning_dry_run_contract.json");
const sourcePacketPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");
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
  console.error(`[validate:ai-learning-dry-run-request-manifest] ERROR: ${message}`);
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

function outputIsolationCheck(manifest: RuankaoAiLearningDryRunRequestManifest, errors: string[]): void {
  requireIncludes(
    manifest.output_isolation_policy.allowed_output_paths,
    ["verification/dry-run/ruankaodaren/", "drafts/ai-learning/ruankaodaren/"],
    "output_isolation_policy.allowed_output_paths",
    errors,
  );
  requireIncludes(
    manifest.output_isolation_policy.forbidden_output_paths,
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
  for (const item of manifest.items) {
    const outputPath = item.output_isolation_path.replace(/\\/g, "/");
    for (const prefix of forbiddenPrefixes) {
      if (outputPath.startsWith(prefix)) {
        errors.push(`items[${item.title}].output_isolation_path must not point to ${prefix}`);
      }
    }
    if (outputPath.includes("source_content")) {
      errors.push(`items[${item.title}].output_isolation_path must not point to source_content`);
    }
    if (!outputPath.startsWith("verification/dry-run/ruankaodaren/") &&
      !outputPath.startsWith("drafts/ai-learning/ruankaodaren/")) {
      errors.push(`items[${item.title}].output_isolation_path must use an isolated ruankaodaren output root`);
    }
  }
}

function noKnowledgeBodyCheck(value: unknown, errors: string[], path = "manifest"): void {
  const forbiddenKeys = [
    "knowledge_body",
    "ai_explanation",
    "generated_text",
    "generated_markdown",
    "learning_body",
    "content_body",
    "explanation_body",
    "source_content",
  ];
  const forbiddenBodySnippets = [
    "CISC is",
    "RISC is",
    "信息安全是",
    "软件架构风格是",
    "AI Explanation / AI解析",
    "Core Concept / 核心概念",
    "Case Study Answer Pattern / 案例分析答题模式",
    "Paper Usage / 论文可复用方式",
    "```",
  ];

  if (Array.isArray(value)) {
    value.forEach((item, index) => noKnowledgeBodyCheck(item, errors, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (forbiddenKeys.includes(key)) errors.push(`${path}.${key} must not exist in request manifest`);
      noKnowledgeBodyCheck(nested, errors, `${path}.${key}`);
    }
    return;
  }
  if (typeof value === "string") {
    for (const snippet of forbiddenBodySnippets) {
      if (value.includes(snippet)) errors.push(`${path} appears to contain AI learning or knowledge body text: ${snippet}`);
    }
  }
}

function invariantCheck(manifest: RuankaoAiLearningDryRunRequestManifest): string[] {
  const errors: string[] = [];
  const sourcePacket = sourcePacketGateCheck(errors);
  const promptContract = promptContractCheck(errors);
  const dryRunContract = dryRunContractCheck(errors);
  gitCleanCheck(officialMarkdownDir, "official Markdown", errors);
  for (const sourceLayerDir of sourceLayerDirs) gitCleanCheck(sourceLayerDir, `Source Layer ${sourceLayerDir}`, errors);
  outputIsolationCheck(manifest, errors);
  noKnowledgeBodyCheck(manifest, errors);

  if (manifest.generation_allowed !== false) errors.push("generation_allowed must be false");
  if (manifest.dry_run_generation_allowed !== false) errors.push("dry_run_generation_allowed must be false");
  if (manifest.formal_ai_learning_generation_allowed !== false) {
    errors.push("formal_ai_learning_generation_allowed must be false");
  }
  if (manifest.review_gate_required !== true) errors.push("review_gate_required must be true");
  if (manifest.auto_approval !== false) errors.push("auto_approval must be false");
  if (manifest.phase5_7_entry_allowed !== false) errors.push("phase5_7_entry_allowed must be false");
  if (manifest.source_layer_modification_allowed !== false) errors.push("source_layer_modification_allowed must be false");
  if (manifest.official_markdown_modification_allowed !== false) errors.push("official_markdown_modification_allowed must be false");
  if (manifest.source_content_write_allowed !== false) errors.push("source_content_write_allowed must be false");
  if (manifest.item_count !== 3) errors.push("item_count must be 3");
  if (manifest.item_count !== manifest.items.length) errors.push("item_count must match items.length");

  requireIncludes(
    manifest.review_prerequisite_policy.required_prerequisites,
    [
      "source_packet_complete",
      "prompt_contract_validated",
      "dry_run_contract_validated",
      "item_eligibility_checked",
      "output_path_isolated",
      "human_review_request_created",
      "no_source_layer_modification",
      "no_official_markdown_modification",
    ],
    "review_prerequisite_policy.required_prerequisites",
    errors,
  );
  requireIncludes(
    manifest.review_prerequisite_policy.blocking_conditions,
    [
      "source_packet_incomplete",
      "taxonomy_suspect_without_restriction",
      "asset_without_manual_review",
      "output_path_points_to_source_layer",
      "output_path_points_to_official_markdown",
      "generation_allowed_true",
      "auto_approval_true",
    ],
    "review_prerequisite_policy.blocking_conditions",
    errors,
  );
  if (manifest.review_prerequisite_policy.human_review_required !== true) {
    errors.push("review_prerequisite_policy.human_review_required must be true");
  }
  if (manifest.review_prerequisite_policy.auto_approval !== false) {
    errors.push("review_prerequisite_policy.auto_approval must be false");
  }

  requireIncludes(
    manifest.artifact_commit_policy.commit_allowed,
    ["schema", "types", "builder", "validator", "verification_doc", "generated_manifest_json", "generated_manifest_md"],
    "artifact_commit_policy.commit_allowed",
    errors,
  );
  requireIncludes(
    manifest.artifact_commit_policy.commit_forbidden,
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
  for (const item of manifest.items) {
    if (!sourceTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by source packet item`);
    if (!promptTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.4 prompt contract item`);
    if (!dryRunTitles.includes(item.title)) errors.push(`items[${item.title}] must be backed by Phase 5.5 dry-run contract item`);
    if (item.request_status !== "not_requested") errors.push(`items[${item.title}].request_status must be not_requested`);
    if (item.dry_run_generation_allowed !== false) errors.push(`items[${item.title}].dry_run_generation_allowed must be false`);
    if (item.formal_generation_allowed !== false) errors.push(`items[${item.title}].formal_generation_allowed must be false`);
    if (item.unrestricted_request_allowed !== false) errors.push(`items[${item.title}].unrestricted_request_allowed must be false`);

    const sourceItem = sourcePacket?.items.find((candidate) => candidate.title === item.title);
    if (sourceItem && sourceItem.render_as !== item.render_as) errors.push(`items[${item.title}].render_as must match source packet`);
    if (item.taxonomy_suspect && item.unrestricted_request_allowed !== false) {
      errors.push(`items[${item.title}] taxonomy_suspect item cannot allow unrestricted request`);
    }

    if (item.title === "1.3 指令系统CISC和RISC") {
      if (item.render_as !== "asset_card") errors.push("1.3 render_as must be asset_card");
      if (item.eligible_for_request !== false) errors.push("1.3 eligible_for_request must be false");
      if (item.requires_manual_asset_review !== true) errors.push("1.3 requires_manual_asset_review must be true");
      if (item.requires_manual_review !== true) errors.push("1.3 requires_manual_review must be true");
      if (item.no_ocr !== true) errors.push("1.3 no_ocr must be true");
      if (item.no_image_table_reconstruction !== true) errors.push("1.3 no_image_table_reconstruction must be true");
      if (item.cannot_claim_image_content_recognized !== true) errors.push("1.3 cannot_claim_image_content_recognized must be true");
      requireIncludes(item.eligibility_blockers, ["asset_manual_review_required", "image_content_not_human_verified"], "1.3 eligibility_blockers", errors);
    }
    if (item.title === "13.3 软件架构风格") {
      if (item.render_as !== "short_card") errors.push("13.3 render_as must be short_card");
      if (item.taxonomy_suspect !== true) errors.push("13.3 taxonomy_suspect must be true");
      if (item.is_multi_card_sequence !== true) errors.push("13.3 is_multi_card_sequence must be true");
      if (item.eligible_for_request !== false) errors.push("13.3 eligible_for_request must be false");
      if (item.taxonomy_suspect_handling !== "restrict_request") errors.push("13.3 taxonomy_suspect_handling must be restrict_request");
      if (item.multi_card_sequence_handling !== "do_not_claim_complete") errors.push("13.3 multi_card_sequence_handling must be do_not_claim_complete");
      if (item.parent_node_handling !== "do_not_generate_as_leaf") errors.push("13.3 parent_node_handling must be do_not_generate_as_leaf");
      requireIncludes(item.required_warnings, ["verified_short_text", "taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"], "13.3 required_warnings", errors);
      requireIncludes(item.eligibility_blockers, ["taxonomy_suspect", "multi_card_sequence_possible", "parent_node_not_safe_as_leaf"], "13.3 eligibility_blockers", errors);
    }
    if (item.title === "9.1 信息安全基础知识") {
      if (item.render_as !== "concept_card") errors.push("9.1 render_as must be concept_card");
      if (item.eligible_for_request !== true) errors.push("9.1 eligible_for_request must be true");
      if (item.may_request_future_dry_run_after_review !== true) errors.push("9.1 may_request_future_dry_run_after_review must be true");
      if (item.requires_manual_review !== true) errors.push("9.1 requires_manual_review must be true");
      requireIncludes(
        item.required_prerequisites,
        ["human_review_request", "isolated_output_path", "source_packet_reference", "prompt_contract_reference", "dry_run_contract_reference"],
        "9.1 required_prerequisites",
        errors,
      );
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(manifestPath)) {
    fail("dry-run request manifest JSON missing; run pnpm build:ai-learning-dry-run-request-manifest");
  }
  const manifest = readJson<RuankaoAiLearningDryRunRequestManifest>(manifestPath);
  const errors = [...buildSchemaValidator()(manifest), ...invariantCheck(manifest)];

  if (errors.length > 0) {
    console.error("[validate:ai-learning-dry-run-request-manifest] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:ai-learning-dry-run-request-manifest] Dry-run request manifest validation passed");
  console.log(`  manifest_version:                    ${manifest.manifest_version}`);
  console.log(`  generation_allowed:                  ${manifest.generation_allowed}`);
  console.log(`  dry_run_generation_allowed:          ${manifest.dry_run_generation_allowed}`);
  console.log(`  formal_ai_learning_generation_allowed: ${manifest.formal_ai_learning_generation_allowed}`);
  console.log(`  phase5_7_entry_allowed:              ${manifest.phase5_7_entry_allowed}`);
  console.log(`  item_count:                          ${manifest.item_count}`);
}

main();
