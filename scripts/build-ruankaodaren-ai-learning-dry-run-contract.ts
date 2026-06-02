/**
 * Phase 5.5 AI Learning Layer dry-run request and review gate contract builder.
 *
 * Builds a dry-run contract artifact only. It does not generate AI learning
 * content, create formal dual-layer documents, rewrite official Markdown,
 * modify Source Layer artifacts, write source_content, OCR, decrypt encrypted
 * XHR, reconstruct image tables, read raw HTML/XHR, access webpages, run a
 * renderer, run a crawler, or run recovery.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  RuankaoAiLearningDryRunContract,
  RuankaoAiLearningDryRunItemPolicy,
  RuankaoAiLearningDryRunRenderAs,
  RuankaoAiLearningDryRunReviewGateStatus,
} from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
import type { RuankaoAiLearningPromptContract } from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";
import type { RuankaoSourcePacket, RuankaoSourcePacketItem } from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const promptContractPath = "verification/generated/phase5_4_ai_learning_prompt_contract.json";
const generatedDir = resolve(repoRoot, "verification/generated");
const contractJsonPath = resolve(generatedDir, "phase5_5_ai_learning_dry_run_contract.json");
const contractMdPath = resolve(generatedDir, "phase5_5_ai_learning_dry_run_contract.md");

const allowedStatuses: RuankaoAiLearningDryRunReviewGateStatus[] = [
  "not_requested",
  "dry_run_requested",
  "dry_run_generated",
  "human_review_pending",
  "human_review_changes_requested",
  "human_review_rejected",
  "human_review_approved",
];

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  const absPath = resolve(repoRoot, relativePath);
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:ai-learning-dry-run-contract] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function outputPathFor(title: string): string {
  const safeTitle = title.replace(/[\\/:*?"<>|]/g, "_");
  return `verification/dry-run/ruankaodaren/baseline/${safeTitle}.dry-run-request.json`;
}

function promptItemFor(promptContract: RuankaoAiLearningPromptContract, title: string) {
  return promptContract.items.find((item) => item.title === title);
}

function buildItem(
  sourceItem: RuankaoSourcePacketItem,
  promptContract: RuankaoAiLearningPromptContract,
): RuankaoAiLearningDryRunItemPolicy {
  const promptItem = promptItemFor(promptContract, sourceItem.title);
  const baseWarnings = new Set(promptItem?.required_warnings ?? []);

  if (sourceItem.title === "1.3 指令系统CISC和RISC") {
    baseWarnings.add("no_ocr");
    baseWarnings.add("no_image_table_reconstruction");
    baseWarnings.add("asset_manual_review_required");
    baseWarnings.add("cannot_claim_image_content_recognized");
  }
  if (sourceItem.title === "13.3 软件架构风格") {
    baseWarnings.add("taxonomy_suspect");
    baseWarnings.add("multi_card_sequence_possible");
    baseWarnings.add("do_not_claim_complete");
  }

  const item: RuankaoAiLearningDryRunItemPolicy = {
    title: sourceItem.title,
    source_packet_item_status: sourceItem.source_availability.source_packet_complete ? "complete" : "incomplete",
    render_as: sourceItem.render_as as RuankaoAiLearningDryRunRenderAs,
    content_shape: promptItem?.content_shape ?? sourceItem.asset_requirement_reason,
    taxonomy_suspect: sourceItem.taxonomy_suspect || sourceItem.title === "13.3 软件架构风格",
    is_multi_card_sequence: sourceItem.title === "13.3 软件架构风格",
    dry_run_generation_allowed: false,
    unrestricted_dry_run_allowed: false,
    review_gate_status: "not_requested",
    human_review_approved: false,
    dry_run_output_path: outputPathFor(sourceItem.title),
    required_warnings: [...baseWarnings],
    requires_manual_review: sourceItem.title !== "1.3 指令系统CISC和RISC",
    requires_manual_asset_review: sourceItem.title === "1.3 指令系统CISC和RISC",
    no_ocr: sourceItem.title === "1.3 指令系统CISC和RISC",
    no_image_table_reconstruction: sourceItem.title === "1.3 指令系统CISC和RISC",
    cannot_claim_image_content_recognized: sourceItem.title === "1.3 指令系统CISC和RISC",
    may_enter_future_dry_run_after_review: sourceItem.title === "9.1 信息安全基础知识",
  };

  if (sourceItem.title === "13.3 软件架构风格") {
    item.taxonomy_suspect_handling = "restrict_dry_run";
    item.multi_card_sequence_handling = "do_not_claim_complete";
    item.parent_node_handling = "do_not_generate_as_leaf";
    item.requires_manual_review = true;
  }

  return item;
}

function renderMarkdown(contract: RuankaoAiLearningDryRunContract, sourcePacket: RuankaoSourcePacket): string {
  const completeCount = sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;
  const lines = [
    "# Phase 5.5 AI Learning Dry-run Contract",
    "",
    `Generated at: ${contract.created_at}`,
    "",
    "## Summary",
    "",
    `- contract_version: ${contract.contract_version}`,
    `- source_name: ${contract.source_name}`,
    `- dry_run_allowed: ${contract.dry_run_allowed}`,
    `- generation_allowed: ${contract.generation_allowed}`,
    `- contract_scope: ${contract.contract_scope}`,
    `- review_gate_required: ${contract.review_gate_required}`,
    `- auto_approval: ${contract.auto_approval}`,
    `- item_count: ${contract.items.length}`,
    "",
    "## Source Packet Gate",
    "",
    `- source_packet_exists: true`,
    `- complete_count: ${completeCount}`,
    `- overall_source_packet_status: ${sourcePacket.overall_source_packet_status}`,
    `- gate_result: ${completeCount === 3 && sourcePacket.overall_source_packet_status === "complete" ? "pass" : "fail"}`,
    "",
    "## Review Gate",
    "",
    `- allowed_statuses: ${contract.review_gate.allowed_statuses.join(", ")}`,
    `- default_status: ${contract.review_gate.default_status}`,
    `- human_review_required: ${contract.review_gate.human_review_required}`,
    `- human_review_approved: ${contract.review_gate.human_review_approved}`,
    `- phase5_6_generation_allowed: ${contract.review_gate.phase5_6_generation_allowed}`,
    "",
    "## Items",
    "",
  ];

  for (const item of contract.items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- render_as: ${item.render_as}`,
      `- dry_run_generation_allowed: ${item.dry_run_generation_allowed}`,
      `- taxonomy_suspect: ${item.taxonomy_suspect}`,
      `- review_gate_status: ${item.review_gate_status}`,
      `- dry_run_output_path: \`${item.dry_run_output_path}\``,
      "- required_warnings:",
      ...(item.required_warnings.length > 0 ? item.required_warnings.map((warning) => `  - ${warning}`) : ["  - (none)"]),
      "",
    );
  }

  lines.push(
    "## Constraints",
    "",
    "- This contract does not generate AI learning content.",
    "- This contract does not generate formal dual-layer document instances.",
    "- This contract does not modify official Markdown, Source Layer artifacts, or source_content.",
    "- No human review approval means no formal AI Learning Layer generation, no docs baseline writes, no official Markdown modification, and no Phase 5.6 entry.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  ensureInputExists(sourcePacketPath);
  ensureInputExists(promptContractPath);

  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  const promptContract = readJson<RuankaoAiLearningPromptContract>(promptContractPath);
  const completeCount = sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;

  if (sourcePacket.overall_source_packet_status !== "complete" || completeCount !== 3) {
    console.error("[build:ai-learning-dry-run-contract] ERROR: source packet gate failed; dry-run contract was not generated");
    console.error(`  - overall_source_packet_status: ${sourcePacket.overall_source_packet_status}`);
    console.error(`  - complete_count: ${completeCount}`);
    process.exit(1);
  }
  if (promptContract.generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-contract] ERROR: Phase 5.4 prompt contract generation_allowed must be false");
    process.exit(1);
  }

  const contract: RuankaoAiLearningDryRunContract = {
    contract_version: "phase5.5",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    dry_run_allowed: "request_only",
    generation_allowed: false,
    contract_scope: "dry_run_request_and_review_gate_only",
    review_gate_required: true,
    auto_approval: false,
    human_review_required: true,
    source_layer_modification_allowed: false,
    official_markdown_modification_allowed: false,
    source_content_write_allowed: false,
    output_policy: {
      default_output_root: "verification/dry-run/ruankaodaren/baseline",
      allowed_output_roots: ["verification/dry-run", "drafts/ai-learning"],
      forbidden_output_roots: ["docs/ruankaodaren/baseline", "source_content"],
      must_not_point_to_official_markdown: true,
      must_not_point_to_source_content: true,
      must_use_isolated_output_root: true,
    },
    review_gate: {
      allowed_statuses: allowedStatuses,
      default_status: "not_requested",
      human_review_required: true,
      human_review_approved: false,
      auto_approval: false,
      phase5_6_generation_allowed: false,
      without_human_review_approval: {
        formal_ai_learning_generation_allowed: false,
        docs_baseline_write_allowed: false,
        official_markdown_modification_allowed: false,
        phase5_6_entry_allowed: false,
      },
    },
    items: sourcePacket.items.map((item) => buildItem(item, promptContract)),
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  writeFileSync(contractMdPath, renderMarkdown(contract, sourcePacket), "utf8");

  console.log("[build:ai-learning-dry-run-contract] Dry-run contract built");
  console.log(`  contract_version:       ${contract.contract_version}`);
  console.log(`  dry_run_allowed:        ${contract.dry_run_allowed}`);
  console.log(`  generation_allowed:     ${contract.generation_allowed}`);
  console.log(`  review_gate_required:   ${contract.review_gate_required}`);
  console.log(`  item_count:             ${contract.items.length}`);
  console.log(`  JSON report:            ${toRepoPath(contractJsonPath)}`);
  console.log(`  Markdown report:        ${toRepoPath(contractMdPath)}`);
}

main();
