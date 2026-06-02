/**
 * Phase 5.4 AI Learning Layer prompt contract validator.
 *
 * Validates prompt-contract boundaries only. It does not generate AI learning
 * content, create dual-layer documents, rewrite official Markdown, OCR,
 * decrypt encrypted XHR, reconstruct image tables, read raw HTML/XHR, or run a
 * renderer.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-ai-learning-prompt-contract.schema.json");
const contractPath = resolve(repoRoot, "verification/generated/phase5_4_ai_learning_prompt_contract.json");
const sourcePacketPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");
const officialMarkdownDir = "docs/ruankaodaren/baseline";
const promptTemplatePaths: Record<string, string> = {
  "asset-card-ai-learning": "prompts/ruankaodaren/ai-learning/asset-card-ai-learning.prompt.md",
  "short-card-ai-learning": "prompts/ruankaodaren/ai-learning/short-card-ai-learning.prompt.md",
  "concept-card-ai-learning": "prompts/ruankaodaren/ai-learning/concept-card-ai-learning.prompt.md",
  "manual-review-ai-learning": "prompts/ruankaodaren/ai-learning/manual-review-ai-learning.prompt.md",
};

interface SourcePacketItemLike {
  title: string;
  official_markdown_path: string;
  source_availability: {
    source_packet_complete: boolean;
  };
}

interface SourcePacketLike {
  overall_source_packet_status: string;
  items: SourcePacketItemLike[];
}

function fail(message: string): never {
  console.error(`[validate:ai-learning-prompt-contract] ERROR: ${message}`);
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

function officialMarkdownCleanCheck(errors: string[]): void {
  const result = spawnSync("git", ["status", "--short", officialMarkdownDir], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    errors.push(`official Markdown audit failed: git status exited ${result.status ?? "null"} ${result.stderr ?? ""}`.trim());
    return;
  }
  const output = result.stdout.trim();
  if (output.length > 0) {
    errors.push(`official Markdown audit failed: baseline docs have Git changes: ${output}`);
  }
}

function templateComplianceCheck(errors: string[]): void {
  const requiredTemplateSnippets = [
    "Source Layer",
    "Source Packet",
    "AI-generated",
    "Do not modify the Source Layer",
    "Do not OCR",
    "Do not reconstruct image tables",
    "Do not decrypt encrypted XHR",
    "Do not directly read raw HTML or raw XHR",
    "Do not access webpages",
    "Do not claim image content has been identified unless a human reviewer provided that interpretation",
    "Source Summary / 原文摘要",
    "AI Explanation / AI解析",
    "Architecture Mapping / 架构师考点映射",
    "Case Study Pattern / 案例答题模式",
    "Paper Usage / 论文表达",
    "Misconceptions / 易错点",
    "Memory Hooks / 记忆钩子",
    "Review Notes / 复核提示",
  ];
  const forbiddenKnowledgeSnippets = [
    "1.3 指令系统CISC和RISC",
    "13.3 软件架构风格",
    "9.1 信息安全基础知识",
    "CISC",
    "RISC",
    "软件架构风格",
    "信息安全基础知识",
    "具体示例",
    "示例：",
    "Example:",
  ];

  for (const [templateId, templatePath] of Object.entries(promptTemplatePaths)) {
    const absPath = resolve(repoRoot, templatePath);
    if (!existsSync(absPath)) {
      errors.push(`prompt template missing: ${templateId} -> ${templatePath}`);
      continue;
    }
    const content = readFileSync(absPath, "utf8");
    for (const snippet of requiredTemplateSnippets) {
      if (!content.includes(snippet)) {
        errors.push(`prompt template ${templateId} must contain boundary/output snippet: ${snippet}`);
      }
    }
    for (const snippet of forbiddenKnowledgeSnippets) {
      if (content.includes(snippet)) {
        errors.push(`prompt template ${templateId} appears to contain concrete source knowledge/example text: ${snippet}`);
      }
    }
  }
}

function invariantCheck(contract: RuankaoAiLearningPromptContract): string[] {
  const errors: string[] = [];
  const sourcePacket = sourcePacketGateCheck(errors);
  officialMarkdownCleanCheck(errors);
  templateComplianceCheck(errors);

  if (contract.generation_allowed !== false) errors.push("generation_allowed must be false");
  if (contract.source_layer_binding.must_not_modify_source_layer !== true) {
    errors.push("source_layer_binding.must_not_modify_source_layer must be true");
  }
  if (contract.source_layer_binding.must_reference_source_packet !== true) {
    errors.push("source_layer_binding.must_reference_source_packet must be true");
  }
  requireIncludes(
    contract.input_policy.forbidden_inputs,
    [
      "ocr",
      "image_table_reconstruction",
      "encrypted_xhr_decryption",
      "raw_html_direct_read",
      "raw_xhr_direct_read",
      "web_requests",
      "source_layer_modification",
      "unmarked_ai_content",
    ],
    "input_policy.forbidden_inputs",
    errors,
  );

  for (const section of contract.ai_learning_sections) {
    if (section.requires_ai_generated_label !== true) {
      errors.push(`ai_learning_sections[${section.section_id}].requires_ai_generated_label must be true`);
    }
    if (section.requires_source_reference !== true) {
      errors.push(`ai_learning_sections[${section.section_id}].requires_source_reference must be true`);
    }
  }

  if (contract.content_shape_policies.asset_card.can_describe_image_content !== false) {
    errors.push("asset_card policy can_describe_image_content must be false");
  }
  if (contract.content_shape_policies.asset_card.requires_asset_manual_review !== true) {
    errors.push("asset_card policy requires_asset_manual_review must be true");
  }
  if (contract.review_policy.auto_approval !== false) {
    errors.push("review_policy.auto_approval must be false");
  }

  const itemTitles = contract.items.map((item) => item.title);
  const sourcePacketTitles = sourcePacket?.items.map((item) => item.title) ?? [];
  for (const title of itemTitles) {
    if (!sourcePacketTitles.includes(title)) {
      errors.push(`items[${title}] must be backed by source packet item`);
    }
  }
  if (itemTitles.includes("13.3 软件架构风格") &&
    !contract.taxonomy_policy.affected_titles.includes("13.3 软件架构风格")) {
    errors.push("13.3 软件架构风格 must appear in taxonomy_policy.affected_titles");
  }

  for (const item of contract.items) {
    if (item.ai_generation_allowed_for_item !== false) {
      errors.push(`items[${item.title}].ai_generation_allowed_for_item must be false`);
    }
    const templatePath = promptTemplatePaths[item.prompt_template_id];
    if (!templatePath) {
      errors.push(`items[${item.title}] has unknown prompt_template_id ${item.prompt_template_id}`);
    } else if (!existsSync(resolve(repoRoot, templatePath))) {
      errors.push(`prompt template missing for ${item.prompt_template_id}: ${templatePath}`);
    }
    if (item.render_as === "asset_card" && !item.required_warnings.includes("asset_manual_review_required")) {
      errors.push(`items[${item.title}] asset_card must warn asset_manual_review_required`);
    }
    if (item.title === "13.3 软件架构风格") {
      for (const warning of ["taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"]) {
        if (!item.required_warnings.includes(warning)) {
          errors.push(`items[${item.title}] must include warning ${warning}`);
        }
      }
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(contractPath)) {
    fail("prompt contract JSON missing; run pnpm build:ai-learning-prompt-contract");
  }
  const contract = readJson<RuankaoAiLearningPromptContract>(contractPath);
  const errors = [...buildSchemaValidator()(contract), ...invariantCheck(contract)];

  if (errors.length > 0) {
    console.error("[validate:ai-learning-prompt-contract] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:ai-learning-prompt-contract] Prompt contract validation passed");
  console.log(`  contract_version:   ${contract.contract_version}`);
  console.log(`  generation_allowed: ${contract.generation_allowed}`);
  console.log(`  item_count:         ${contract.items.length}`);
  console.log(`  affected_titles:    ${contract.taxonomy_policy.affected_titles.join(", ") || "(none)"}`);
}

main();
