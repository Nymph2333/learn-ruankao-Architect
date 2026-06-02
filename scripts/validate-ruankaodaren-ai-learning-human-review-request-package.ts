/**
 * Phase 5.9 AI Learning dry-run human review request package validator.
 *
 * Validates the human review request package only. It does not generate AI
 * learning content, generate dry-run content, generate input bundle instances,
 * create formal dual-layer documents, rewrite official Markdown, modify Source
 * Layer artifacts, write source_content, OCR, decrypt encrypted XHR,
 * reconstruct image tables, read raw HTML/XHR, access webpages, run a renderer,
 * run a crawler, or run recovery.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAiLearningDryRunContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
import type { RuankaoAiLearningDryRunExecutionContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-execution-contract.js";
import type { RuankaoAiLearningDryRunReadinessCheck } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-readiness-check.js";
import type { RuankaoAiLearningDryRunRequestManifest } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.js";
import type { RuankaoAiLearningHumanReviewRequestPackage } from "../packages/domain-types/ruankaodaren-ai-learning-human-review-request-package.js";
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

const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-human-review-request-package.schema.json");
const packagePath = resolve(repoRoot, "verification/generated/phase5_9_ai_learning_human_review_request_package.json");
const sourcePacketPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");
const promptContractPath = resolve(repoRoot, "verification/generated/phase5_4_ai_learning_prompt_contract.json");
const dryRunContractPath = resolve(repoRoot, "verification/generated/phase5_5_ai_learning_dry_run_contract.json");
const requestManifestPath = resolve(repoRoot, "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json");
const executionContractPath = resolve(repoRoot, "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json");
const readinessCheckPath = resolve(repoRoot, "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json");
const humanReviewStatusPath = resolve(repoRoot, "reviews/ruankaodaren/baseline/human-review-status.json");

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

interface HumanReviewStatusLike {
  auto_approval: boolean;
  overall_status: string;
  phase4_6_expansion_allowed: boolean;
  items: Array<{
    title: string;
    review_status: string;
    reviewed_at: string | null;
    release_decision: string;
  }>;
}

function fail(message: string): never {
  console.error(`[validate:ai-learning-human-review-request-package] ERROR: ${message}`);
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

function requireIncludes(values: string[], required: string[], label: string, errors: string[]): void {
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
  if (executionContract.dry_run_execution_allowed !== false) errors.push("Phase 5.7 dry_run_execution_allowed must be false");
  return executionContract;
}

function readinessCheckCheck(errors: string[]): RuankaoAiLearningDryRunReadinessCheck | null {
  if (!existsSync(readinessCheckPath)) {
    errors.push("Phase 5.8 dry-run readiness check missing");
    return null;
  }
  const readinessCheck = readJson<RuankaoAiLearningDryRunReadinessCheck>(readinessCheckPath);
  if (readinessCheck.phase5_9_entry_allowed !== false) errors.push("Phase 5.8 phase5_9_entry_allowed must be false");
  return readinessCheck;
}

function humanReviewStatusCheck(errors: string[]): void {
  if (!existsSync(humanReviewStatusPath)) {
    errors.push("human-review-status.json missing");
    return;
  }
  const humanReviewStatus = readJson<HumanReviewStatusLike>(humanReviewStatusPath);
  if (humanReviewStatus.auto_approval !== false) errors.push("human review status auto_approval must be false");
  if (humanReviewStatus.overall_status !== "pending_review") errors.push("human review overall_status must remain pending_review");
  if (humanReviewStatus.phase4_6_expansion_allowed !== false) errors.push("phase4_6_expansion_allowed must remain false");
  const selected = humanReviewStatus.items.find((item) => item.title === "9.1 信息安全基础知识");
  if (!selected) {
    errors.push("human review status must contain 9.1 item");
    return;
  }
  if (selected.review_status !== "pending_review") errors.push("9.1 human review status must remain pending_review");
  if (selected.reviewed_at !== null) errors.push("9.1 reviewed_at must remain null");
  if (selected.release_decision !== "not_ready") errors.push("9.1 release_decision must remain not_ready");
}

function noKnowledgeBodyCheck(value: unknown, errors: string[], path = "package"): void {
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
    "source_content_body",
    "item_level_ai_explanation",
    "knowledge_explanation",
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
    "Source Summary / 原文摘要",
    "AI Explanation / AI解析",
    "Architecture Mapping / 架构师考点映射",
    "Case Study Pattern / 案例答题模式",
    "Paper Usage / 论文表达",
    "Misconceptions / 易错点",
    "Memory Hooks / 记忆钩子",
    "```",
  ];

  if (Array.isArray(value)) {
    value.forEach((item, index) => noKnowledgeBodyCheck(item, errors, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (forbiddenKeys.includes(key)) errors.push(`${path}.${key} must not exist in human review request package`);
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

function outputIsolationCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  const outputPath = reviewPackage.selected_item.default_future_output_path.replace(/\\/g, "/");
  const forbiddenPrefixes = [
    "docs/ruankaodaren/baseline",
    "source-packets",
    "data/raw",
    "data/intermediate",
    "sources/ruankaodaren/raw",
  ];
  for (const prefix of forbiddenPrefixes) {
    if (outputPath.startsWith(prefix)) errors.push(`selected_item.default_future_output_path must not point to ${prefix}`);
  }
  if (outputPath.includes("source_content")) errors.push("selected_item.default_future_output_path must not point to source_content");
  if (outputPath !== "verification/dry-run/ruankaodaren/baseline/9.1_信息安全基础知识/") {
    errors.push("selected_item.default_future_output_path must use the isolated 9.1 dry-run path");
  }
}

function contractReferenceCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  const references = reviewPackage.selected_item.contract_references;
  const expectedReferences: Record<string, string> = {
    source_packet: "source-packets/ruankaodaren/baseline/source-packet.json",
    prompt_contract: "verification/generated/phase5_4_ai_learning_prompt_contract.json",
    dry_run_contract: "verification/generated/phase5_5_ai_learning_dry_run_contract.json",
    request_manifest: "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json",
    execution_contract: "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json",
    readiness_check: "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json",
  };
  for (const [key, expected] of Object.entries(expectedReferences)) {
    const actual = references[key as keyof typeof references];
    if (actual !== expected) errors.push(`selected_item.contract_references.${key} must be ${expected}`);
    if (!existsSync(resolve(repoRoot, expected))) errors.push(`selected_item.contract_references.${key} target missing: ${expected}`);
  }
}

function topLevelInvariantCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  if (reviewPackage.package_version !== "phase5.9") errors.push("package_version must be phase5.9");
  if (reviewPackage.source_name !== "ruankaodaren") errors.push("source_name must be ruankaodaren");
  if (reviewPackage.package_scope !== "dry_run_human_review_request_only") errors.push("package_scope must be dry_run_human_review_request_only");
  if (reviewPackage.generation_allowed !== false) errors.push("generation_allowed must be false");
  if (reviewPackage.dry_run_generation_allowed !== false) errors.push("dry_run_generation_allowed must be false");
  if (reviewPackage.dry_run_execution_allowed !== false) errors.push("dry_run_execution_allowed must be false");
  if (reviewPackage.formal_ai_learning_generation_allowed !== false) errors.push("formal_ai_learning_generation_allowed must be false");
  if (reviewPackage.review_request_allowed !== true) errors.push("review_request_allowed must be true");
  if (reviewPackage.human_review_required !== true) errors.push("human_review_required must be true");
  if (reviewPackage.human_review_approved !== false) errors.push("human_review_approved must be false");
  if (reviewPackage.auto_approval !== false) errors.push("auto_approval must be false");
  if (reviewPackage.source_layer_modification_allowed !== false) errors.push("source_layer_modification_allowed must be false");
  if (reviewPackage.official_markdown_modification_allowed !== false) errors.push("official_markdown_modification_allowed must be false");
  if (reviewPackage.source_content_write_allowed !== false) errors.push("source_content_write_allowed must be false");
  if (reviewPackage.phase5_10_entry_allowed !== false) errors.push("phase5_10_entry_allowed must be false");
  if (reviewPackage.selected_item_count !== 1) errors.push("selected_item_count must be 1");
  if (reviewPackage.excluded_item_count !== 2) errors.push("excluded_item_count must be 2");
  if (reviewPackage.excluded_items.length !== 2) errors.push("excluded_items length must be 2");
}

function priorContractGateCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  const gate = reviewPackage.source_packet_prior_contract_gate;
  if (gate.source_packet_exists !== true) errors.push("source_packet_prior_contract_gate.source_packet_exists must be true");
  if (gate.complete_count !== 3) errors.push("source_packet_prior_contract_gate.complete_count must be 3");
  if (gate.phase5_4_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_4_generation_allowed must be false");
  if (gate.phase5_5_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_5_generation_allowed must be false");
  if (gate.phase5_6_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_6_generation_allowed must be false");
  if (gate.phase5_6_dry_run_generation_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed must be false");
  if (gate.phase5_7_dry_run_execution_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_7_dry_run_execution_allowed must be false");
  if (gate.phase5_8_phase5_9_entry_allowed !== false) errors.push("source_packet_prior_contract_gate.phase5_8_phase5_9_entry_allowed must be false");
  if (gate.gate_result !== "pass") errors.push("source_packet_prior_contract_gate.gate_result must be pass");
}

function selectedItemCheck(
  reviewPackage: RuankaoAiLearningHumanReviewRequestPackage,
  sourcePacket: SourcePacketLike | null,
  promptContract: RuankaoAiLearningPromptContract | null,
  dryRunContract: RuankaoAiLearningDryRunContract | null,
  requestManifest: RuankaoAiLearningDryRunRequestManifest | null,
  executionContract: RuankaoAiLearningDryRunExecutionContract | null,
  readinessCheck: RuankaoAiLearningDryRunReadinessCheck | null,
  errors: string[],
): void {
  const selected = reviewPackage.selected_item;
  if (selected.title !== "9.1 信息安全基础知识") errors.push("selected item must be 9.1 信息安全基础知识");
  if (selected.render_as !== "concept_card") errors.push("selected 9.1 render_as must be concept_card");
  if (selected.selected_for_human_review_request !== true) errors.push("selected 9.1 selected_for_human_review_request must be true");
  if (selected.review_status !== "human_review_pending") errors.push("selected 9.1 review_status must be human_review_pending");
  if (selected.human_review_approved !== false) errors.push("selected 9.1 human_review_approved must be false");
  if (selected.eligible_for_request !== true) errors.push("selected 9.1 eligible_for_request must be true");
  if (selected.dry_run_generation_allowed !== false) errors.push("selected 9.1 dry_run_generation_allowed must be false");
  if (selected.dry_run_execution_allowed !== false) errors.push("selected 9.1 dry_run_execution_allowed must be false");
  if (selected.formal_generation_allowed !== false) errors.push("selected 9.1 formal_generation_allowed must be false");
  if (selected.requires_manual_review !== true) errors.push("selected 9.1 requires_manual_review must be true");
  if (selected.output_path_isolated !== true) errors.push("selected 9.1 output_path_isolated must be true");
  if (selected.source_packet_reference_required !== true) errors.push("selected 9.1 source_packet_reference_required must be true");
  if (selected.prompt_contract_reference_required !== true) errors.push("selected 9.1 prompt_contract_reference_required must be true");
  if (selected.dry_run_contract_reference_required !== true) errors.push("selected 9.1 dry_run_contract_reference_required must be true");
  if (selected.request_manifest_reference_required !== true) errors.push("selected 9.1 request_manifest_reference_required must be true");
  if (selected.execution_contract_reference_required !== true) errors.push("selected 9.1 execution_contract_reference_required must be true");
  if (selected.readiness_check_reference_required !== true) errors.push("selected 9.1 readiness_check_reference_required must be true");

  if (!sourcePacket?.items.some((item) => item.title === selected.title && item.render_as === selected.render_as)) {
    errors.push("selected 9.1 must be backed by matching source packet item");
  }
  if (!promptContract?.items.some((item) => item.title === selected.title && item.ai_generation_allowed_for_item === false)) {
    errors.push("selected 9.1 must be backed by Phase 5.4 prompt contract with item generation disabled");
  }
  if (!dryRunContract?.items.some((item) => item.title === selected.title && item.dry_run_generation_allowed === false && item.human_review_approved === false)) {
    errors.push("selected 9.1 must be backed by Phase 5.5 dry-run contract with review pending");
  }
  if (!requestManifest?.items.some((item) => item.title === selected.title && item.eligible_for_request === true && item.dry_run_generation_allowed === false)) {
    errors.push("selected 9.1 must be backed by Phase 5.6 request manifest as eligible but generation-disabled");
  }
  if (!executionContract?.items.some((item) => item.title === selected.title && item.execution_allowed === false && item.dry_run_generation_allowed === false)) {
    errors.push("selected 9.1 must be backed by Phase 5.7 execution contract with execution disabled");
  }
  if (!readinessCheck?.items.some((item) => item.title === selected.title && item.current_status === "review_required")) {
    errors.push("selected 9.1 must be backed by Phase 5.8 readiness check as review_required");
  }
}

function excludedItemsCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  const item13 = reviewPackage.excluded_items.find((item) => item.title === "1.3 指令系统CISC和RISC");
  const item133 = reviewPackage.excluded_items.find((item) => item.title === "13.3 软件架构风格");
  if (!item13) errors.push("excluded_items must include 1.3 指令系统CISC和RISC");
  if (!item133) errors.push("excluded_items must include 13.3 软件架构风格");

  for (const item of reviewPackage.excluded_items) {
    if (item.selected_for_human_review_request !== false) errors.push(`${item.title} selected_for_human_review_request must be false`);
    if (item.review_status !== "not_requested") errors.push(`${item.title} review_status must be not_requested`);
    if (item.excluded_from_phase5_9 !== true) errors.push(`${item.title} excluded_from_phase5_9 must be true`);
    if (item.human_review_approved !== false) errors.push(`${item.title} human_review_approved must be false`);
    if (item.eligible_for_request !== false) errors.push(`${item.title} eligible_for_request must be false`);
    if (item.dry_run_generation_allowed !== false) errors.push(`${item.title} dry_run_generation_allowed must be false`);
    if (item.dry_run_execution_allowed !== false) errors.push(`${item.title} dry_run_execution_allowed must be false`);
    if (item.formal_generation_allowed !== false) errors.push(`${item.title} formal_generation_allowed must be false`);
  }

  if (item13) {
    if (item13.render_as !== "asset_card") errors.push("1.3 render_as must be asset_card");
    requireExactSet(
      item13.exclusion_reason,
      ["asset_manual_review_required", "image_content_not_human_verified"],
      "1.3 exclusion_reason",
      errors,
    );
  }

  if (item133) {
    if (item133.render_as !== "short_card") errors.push("13.3 render_as must be short_card");
    if (item133.taxonomy_suspect !== true) errors.push("13.3 taxonomy_suspect must be true");
    if (item133.is_multi_card_sequence !== true) errors.push("13.3 is_multi_card_sequence must be true");
    requireIncludes(
      item133.required_warnings ?? [],
      ["verified_short_text", "taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"],
      "13.3 required_warnings",
      errors,
    );
    requireExactSet(
      item133.exclusion_reason,
      ["taxonomy_suspect", "multi_card_sequence_possible", "parent_node_not_safe_as_leaf"],
      "13.3 exclusion_reason",
      errors,
    );
  }
}

function humanReviewChecklistCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  requireExactSet(
    reviewPackage.human_review_checklist,
    [
      "source_packet_reference_verified",
      "prompt_contract_reference_verified",
      "dry_run_contract_reference_verified",
      "request_manifest_reference_verified",
      "execution_contract_reference_verified",
      "readiness_check_reference_verified",
      "output_path_isolated",
      "official_markdown_write_forbidden",
      "source_layer_write_forbidden",
      "no_ocr",
      "no_raw_html_or_xhr",
      "no_ai_content_in_source_content",
      "no_formal_generation_before_approval",
    ],
    "human_review_checklist",
    errors,
  );
}

function reviewerDecisionCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  const decision = reviewPackage.reviewer_decision;
  if (decision.decision !== "pending") errors.push("reviewer_decision.decision must be pending");
  requireExactSet(
    decision.allowed_values,
    ["pending", "approve_for_phase5_10_dry_run_execution", "request_changes", "reject"],
    "reviewer_decision.allowed_values",
    errors,
  );
  if (decision.decided_by !== null) errors.push("reviewer_decision.decided_by must be null");
  if (decision.decided_at !== null) errors.push("reviewer_decision.decided_at must be null");
  if (decision.notes !== null) errors.push("reviewer_decision.notes must be null");
}

function phase510EntryPolicyCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  const policy = reviewPackage.phase5_10_entry_policy;
  if (policy.phase5_10_entry_allowed !== false) errors.push("phase5_10_entry_policy.phase5_10_entry_allowed must be false");
  requireExactSet(
    policy.required_before_entry,
    [
      "explicit_user_approval",
      "reviewer_decision_approve_for_phase5_10_dry_run_execution",
      "human_review_approved",
      "selected_item_is_9.1",
      "output_path_isolated",
      "all_contract_references_valid",
      "no_source_layer_modification",
      "no_official_markdown_modification",
    ],
    "phase5_10_entry_policy.required_before_entry",
    errors,
  );
  requireExactSet(
    policy.prohibited_before_entry,
    [
      "auto_approval_true",
      "generation_allowed_true",
      "dry_run_execution_without_review",
      "source_layer_modification",
      "official_markdown_modification",
      "selected_item_taxonomy_suspect",
      "selected_item_asset_unreviewed",
    ],
    "phase5_10_entry_policy.prohibited_before_entry",
    errors,
  );
}

function artifactCommitPolicyCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage, errors: string[]): void {
  requireExactSet(
    reviewPackage.artifact_commit_policy.commit_allowed,
    [
      "schema",
      "types",
      "builder",
      "validator",
      "verification_doc",
      "generated_human_review_request_package_json",
      "generated_human_review_request_package_md",
    ],
    "artifact_commit_policy.commit_allowed",
    errors,
  );
  requireExactSet(
    reviewPackage.artifact_commit_policy.commit_forbidden,
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
}

function invariantCheck(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage): string[] {
  const errors: string[] = [];
  const sourcePacket = sourcePacketGateCheck(errors);
  const promptContract = promptContractCheck(errors);
  const dryRunContract = dryRunContractCheck(errors);
  const requestManifest = requestManifestCheck(errors);
  const executionContract = executionContractCheck(errors);
  const readinessCheck = readinessCheckCheck(errors);

  gitCleanCheck(officialMarkdownDir, "official Markdown", errors);
  for (const sourceLayerDir of sourceLayerDirs) gitCleanCheck(sourceLayerDir, `Source Layer ${sourceLayerDir}`, errors);
  gitCleanCheck("reviews/ruankaodaren/baseline", "human review status", errors);
  humanReviewStatusCheck(errors);
  noKnowledgeBodyCheck(reviewPackage, errors);
  topLevelInvariantCheck(reviewPackage, errors);
  priorContractGateCheck(reviewPackage, errors);
  outputIsolationCheck(reviewPackage, errors);
  contractReferenceCheck(reviewPackage, errors);
  selectedItemCheck(
    reviewPackage,
    sourcePacket,
    promptContract,
    dryRunContract,
    requestManifest,
    executionContract,
    readinessCheck,
    errors,
  );
  excludedItemsCheck(reviewPackage, errors);
  humanReviewChecklistCheck(reviewPackage, errors);
  reviewerDecisionCheck(reviewPackage, errors);
  phase510EntryPolicyCheck(reviewPackage, errors);
  artifactCommitPolicyCheck(reviewPackage, errors);

  return errors;
}

function main(): void {
  if (!existsSync(packagePath)) {
    fail("human review request package JSON missing; run pnpm build:ai-learning-human-review-request-package");
  }
  const reviewPackage = readJson<RuankaoAiLearningHumanReviewRequestPackage>(packagePath);
  const errors = [...buildSchemaValidator()(reviewPackage), ...invariantCheck(reviewPackage)];

  if (errors.length > 0) {
    console.error("[validate:ai-learning-human-review-request-package] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:ai-learning-human-review-request-package] Human review request package validation passed");
  console.log(`  package_version:                  ${reviewPackage.package_version}`);
  console.log(`  package_scope:                    ${reviewPackage.package_scope}`);
  console.log(`  selected_item_count:              ${reviewPackage.selected_item_count}`);
  console.log(`  selected_item:                    ${reviewPackage.selected_item.title}`);
  console.log(`  review_status:                    ${reviewPackage.selected_item.review_status}`);
  console.log(`  generation_allowed:               ${reviewPackage.generation_allowed}`);
  console.log(`  dry_run_generation_allowed:       ${reviewPackage.dry_run_generation_allowed}`);
  console.log(`  dry_run_execution_allowed:        ${reviewPackage.dry_run_execution_allowed}`);
  console.log(`  phase5_10_entry_allowed:          ${reviewPackage.phase5_10_entry_allowed}`);
}

main();
