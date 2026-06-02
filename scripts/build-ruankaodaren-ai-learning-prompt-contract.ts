/**
 * Phase 5.4 AI Learning Layer prompt contract builder.
 *
 * Builds a prompt contract only. It does not generate AI learning content,
 * create dual-layer document instances, rewrite official Markdown, OCR,
 * decrypt encrypted XHR, reconstruct image tables, read raw HTML/XHR, or run a
 * renderer.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  RuankaoAiLearningPromptContract,
  RuankaoAiLearningPromptItem,
  RuankaoAiLearningPromptTemplateId,
  RuankaoAiLearningRenderAs,
} from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";
import type {
  RuankaoSourcePacket,
  RuankaoSourcePacketItem,
  RuankaoSourcePacketRenderAs,
} from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const dualLayerSchemaPath = "schemas/ruankaodaren-dual-layer-document.schema.json";
const humanReviewStatusPath = "reviews/ruankaodaren/baseline/human-review-status.json";
const generatedDir = resolve(repoRoot, "verification/generated");
const contractJsonPath = resolve(generatedDir, "phase5_4_ai_learning_prompt_contract.json");
const contractMdPath = resolve(generatedDir, "phase5_4_ai_learning_prompt_contract.md");

interface HumanReviewStatus {
  auto_approval: boolean;
  overall_status: string;
  phase4_6_expansion_allowed: boolean;
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  const absPath = resolve(repoRoot, relativePath);
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:ai-learning-prompt-contract] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function promptTemplateId(renderAs: RuankaoSourcePacketRenderAs): RuankaoAiLearningPromptTemplateId {
  if (renderAs === "asset_card") return "asset-card-ai-learning";
  if (renderAs === "short_card") return "short-card-ai-learning";
  if (renderAs === "concept_card") return "concept-card-ai-learning";
  return "manual-review-ai-learning";
}

function contentShape(item: RuankaoSourcePacketItem): string {
  const match = item.asset_requirement_reason.match(/content_shape=([A-Z_]+)/);
  if (match?.[1]) return match[1];
  if (item.render_as === "asset_card") return "MIXED_TEXT_IMAGE";
  if (item.render_as === "short_card") return "STATIC_LOW_TEXT_VERIFIED";
  if (item.render_as === "concept_card") return "HTML_RICH_TEXT";
  return "MANUAL_REVIEW_REQUIRED";
}

function requiredWarnings(item: RuankaoSourcePacketItem): string[] {
  const warnings = new Set<string>();
  if (item.render_as === "asset_card") {
    warnings.add("no_ocr");
    warnings.add("no_image_table_reconstruction");
    warnings.add("asset_manual_review_required");
  }
  if (item.render_as === "short_card") {
    warnings.add("verified_short_text");
  }
  if (item.taxonomy_suspect || item.title === "13.3 软件架构风格") {
    warnings.add("taxonomy_suspect");
    warnings.add("multi_card_sequence_possible");
    warnings.add("do_not_claim_complete");
  }
  return [...warnings];
}

function buildItem(item: RuankaoSourcePacketItem): RuankaoAiLearningPromptItem {
  return {
    title: item.title,
    source_packet_item_status: item.source_availability.source_packet_complete ? "complete" : "incomplete",
    render_as: item.render_as as RuankaoAiLearningRenderAs,
    content_shape: contentShape(item),
    taxonomy_suspect: item.taxonomy_suspect,
    ai_generation_allowed_for_item: false,
    allowed_ai_sections: [],
    required_warnings: requiredWarnings(item),
    prompt_template_id: promptTemplateId(item.render_as),
  };
}

function renderMarkdown(contract: RuankaoAiLearningPromptContract, humanReview: HumanReviewStatus): string {
  const lines = [
    "# Phase 5.4 AI Learning Prompt Contract",
    "",
    `Generated at: ${contract.created_at}`,
    "",
    "## Summary",
    "",
    `- contract_version: ${contract.contract_version}`,
    `- source_name: ${contract.source_name}`,
    `- contract_scope: ${contract.contract_scope}`,
    `- generation_allowed: ${contract.generation_allowed}`,
    `- item_count: ${contract.items.length}`,
    `- human_review_overall_status: ${humanReview.overall_status}`,
    `- human_review_auto_approval: ${humanReview.auto_approval}`,
    `- phase4_6_expansion_allowed: ${humanReview.phase4_6_expansion_allowed}`,
    "",
    "## Source Layer Binding",
    "",
    `- must_reference_source_packet: ${contract.source_layer_binding.must_reference_source_packet}`,
    `- must_preserve_source_text: ${contract.source_layer_binding.must_preserve_source_text}`,
    `- must_not_modify_source_layer: ${contract.source_layer_binding.must_not_modify_source_layer}`,
    `- must_separate_ai_layer: ${contract.source_layer_binding.must_separate_ai_layer}`,
    "",
    "## Forbidden Inputs",
    "",
    ...contract.input_policy.forbidden_inputs.map((input) => `- ${input}`),
    "",
    "## AI Learning Sections",
    "",
    ...contract.ai_learning_sections.map((section) =>
      `- ${section.title}: allowed=${section.allowed}, ai_label=${section.requires_ai_generated_label}, source_reference=${section.requires_source_reference}`
    ),
    "",
    "## Items",
    "",
  ];

  for (const item of contract.items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- source_packet_item_status: ${item.source_packet_item_status}`,
      `- render_as: ${item.render_as}`,
      `- content_shape: ${item.content_shape}`,
      `- taxonomy_suspect: ${item.taxonomy_suspect}`,
      `- ai_generation_allowed_for_item: ${item.ai_generation_allowed_for_item}`,
      `- prompt_template_id: ${item.prompt_template_id}`,
      "- required_warnings:",
      ...(item.required_warnings.length > 0 ? item.required_warnings.map((warning) => `  - ${warning}`) : ["  - (none)"]),
      "",
    );
  }

  lines.push(
    "## Constraints",
    "",
    "- This contract does not generate AI learning content.",
    "- This contract does not create dual-layer document instances.",
    "- This contract does not modify official Markdown or Source Layer artifacts.",
    "- Human review remains pending and automatic approval remains disabled.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  ensureInputExists(sourcePacketPath);
  ensureInputExists(dualLayerSchemaPath);
  ensureInputExists(humanReviewStatusPath);

  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  readJson<unknown>(dualLayerSchemaPath);
  const humanReview = readJson<HumanReviewStatus>(humanReviewStatusPath);

  const incompleteItems = sourcePacket.items.filter((item) => !item.source_availability.source_packet_complete);
  const completeCount = sourcePacket.items.length - incompleteItems.length;
  if (sourcePacket.overall_source_packet_status !== "complete" || incompleteItems.length > 0 || completeCount !== 3) {
    console.error("[build:ai-learning-prompt-contract] ERROR: source packet is incomplete; prompt contract was not generated");
    console.error(`  - overall_source_packet_status: ${sourcePacket.overall_source_packet_status}`);
    console.error(`  - complete_count: ${completeCount}`);
    for (const item of incompleteItems) {
      console.error(`  - ${item.title}: ${item.missing_artifacts.join(", ") || "incomplete source packet"}`);
    }
    process.exit(1);
  }

  const items = sourcePacket.items.map(buildItem);
  const affectedTitles = items
    .filter((item) => item.taxonomy_suspect || item.title === "13.3 软件架构风格")
    .map((item) => item.title);

  const contract: RuankaoAiLearningPromptContract = {
    contract_version: "phase5.4",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    generation_allowed: false,
    contract_scope: "prompt_contract_only",
    input_policy: {
      allowed_inputs: [
        "source_packet",
        "dual_layer_schema",
        "intermediate_json",
        "asset_manifest",
        "asset_metadata",
        "human_review_status",
      ],
      forbidden_inputs: [
        "raw_html_direct_read",
        "raw_xhr_direct_read",
        "web_requests",
        "ocr",
        "encrypted_xhr_decryption",
        "image_table_reconstruction",
        "source_layer_modification",
        "unmarked_ai_content",
      ],
    },
    source_layer_binding: {
      must_reference_source_packet: true,
      must_preserve_source_text: true,
      must_not_modify_source_layer: true,
      must_separate_ai_layer: true,
    },
    ai_learning_sections: [
      {
        section_id: "ai_explanation",
        title: "AI Explanation / AI解析",
        allowed: true,
        requires_ai_generated_label: true,
        requires_source_reference: true,
      },
      {
        section_id: "architecture_mapping",
        title: "Architecture Mapping / 架构师考点映射",
        allowed: true,
        requires_ai_generated_label: true,
        requires_source_reference: true,
      },
      {
        section_id: "case_study_pattern",
        title: "Case Study Pattern / 案例答题模式",
        allowed: true,
        requires_ai_generated_label: true,
        requires_source_reference: true,
      },
      {
        section_id: "paper_usage",
        title: "Paper Usage / 论文表达",
        allowed: true,
        requires_ai_generated_label: true,
        requires_source_reference: true,
      },
      {
        section_id: "misconceptions",
        title: "Misconceptions / 易错点",
        allowed: true,
        requires_ai_generated_label: true,
        requires_source_reference: true,
      },
      {
        section_id: "memory_hooks",
        title: "Memory Hooks / 记忆钩子",
        allowed: true,
        requires_ai_generated_label: true,
        requires_source_reference: true,
      },
    ],
    content_shape_policies: {
      asset_card: {
        can_explain_text_blocks: true,
        can_explain_asset_metadata: true,
        can_describe_image_content: false,
        requires_asset_manual_review: true,
        notes: [
          "image asset can only be referenced as asset_ref",
          "no image content interpretation without human review",
        ],
      },
      short_card: {
        can_expand_concepts: true,
        must_mark_source_as_short: true,
        must_not_claim_source_complete: true,
        requires_manual_review: true,
        notes: [
          "source is verified short text",
          "AI expansion must not claim complete topic coverage",
        ],
      },
      concept_card: {
        can_expand_from_text_blocks: true,
        can_map_to_exam_points: true,
        must_mark_ai_generated: true,
        requires_manual_review: true,
        notes: [
          "separate source-derived facts from AI expansion",
        ],
      },
      manual_review_card: {
        can_expand_concepts: false,
        must_mark_ai_generated: true,
        requires_manual_review: true,
        notes: [
          "use only when source packet or taxonomy state requires manual review before any learning content",
        ],
      },
    },
    taxonomy_policy: {
      taxonomy_suspect_handling: "restrict_generation",
      multi_card_sequence_handling: "do_not_claim_complete",
      parent_node_handling: "do_not_generate_as_leaf",
      affected_titles: affectedTitles,
    },
    review_policy: {
      ai_generation_status_default: "not_generated",
      ai_review_status_default: "pending_review",
      human_review_required: true,
      auto_approval: false,
    },
    items,
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  writeFileSync(contractMdPath, renderMarkdown(contract, humanReview), "utf8");

  console.log("[build:ai-learning-prompt-contract] Prompt contract built");
  console.log(`  contract_version:       ${contract.contract_version}`);
  console.log(`  generation_allowed:     ${contract.generation_allowed}`);
  console.log(`  item_count:             ${contract.items.length}`);
  console.log(`  affected_titles:        ${contract.taxonomy_policy.affected_titles.join(", ") || "(none)"}`);
  console.log(`  JSON report:            ${toRepoPath(contractJsonPath)}`);
  console.log(`  Markdown report:        ${toRepoPath(contractMdPath)}`);
}

main();
