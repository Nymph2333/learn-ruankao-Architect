/**
 * Phase 5.6 AI Learning dry-run request manifest builder.
 *
 * Builds a request manifest artifact only. It does not generate AI learning
 * content, generate dry-run content, create formal dual-layer documents,
 * rewrite official Markdown, modify Source Layer artifacts, write
 * source_content, OCR, decrypt encrypted XHR, reconstruct image tables, read raw
 * HTML/XHR, access webpages, run a renderer, run a crawler, or run recovery.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAiLearningDryRunContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
import type {
  RuankaoAiLearningDryRunRequestManifest,
  RuankaoAiLearningDryRunRequestManifestItem,
  RuankaoAiLearningItemPrerequisite,
} from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.js";
import type { RuankaoAiLearningPromptContract } from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";
import type { RuankaoSourcePacket, RuankaoSourcePacketItem } from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const promptContractPath = "verification/generated/phase5_4_ai_learning_prompt_contract.json";
const dryRunContractPath = "verification/generated/phase5_5_ai_learning_dry_run_contract.json";
const generatedDir = resolve(repoRoot, "verification/generated");
const manifestJsonPath = resolve(generatedDir, "phase5_6_ai_learning_dry_run_request_manifest.json");
const manifestMdPath = resolve(generatedDir, "phase5_6_ai_learning_dry_run_request_manifest.md");

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:ai-learning-dry-run-request-manifest] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function safeTitle(title: string): string {
  return title.replace(/[\\/:*?"<>|]/g, "_");
}

function basePrerequisites(): RuankaoAiLearningItemPrerequisite[] {
  return [
    "human_review_request",
    "isolated_output_path",
    "source_packet_reference",
    "prompt_contract_reference",
    "dry_run_contract_reference",
  ];
}

function promptWarnings(promptContract: RuankaoAiLearningPromptContract, title: string): string[] {
  return promptContract.items.find((item) => item.title === title)?.required_warnings ?? [];
}

function dryRunOutputPath(title: string): string {
  return `verification/dry-run/ruankaodaren/baseline/${safeTitle(title)}.request-manifest.json`;
}

function buildItem(
  sourceItem: RuankaoSourcePacketItem,
  promptContract: RuankaoAiLearningPromptContract,
  dryRunContract: RuankaoAiLearningDryRunContract,
): RuankaoAiLearningDryRunRequestManifestItem {
  const warnings = new Set(promptWarnings(promptContract, sourceItem.title));
  const dryRunItem = dryRunContract.items.find((item) => item.title === sourceItem.title);
  for (const warning of dryRunItem?.required_warnings ?? []) warnings.add(warning);

  const item: RuankaoAiLearningDryRunRequestManifestItem = {
    title: sourceItem.title,
    render_as: sourceItem.render_as,
    request_status: "not_requested",
    eligible_for_request: false,
    dry_run_generation_allowed: false,
    formal_generation_allowed: false,
    unrestricted_request_allowed: false,
    taxonomy_suspect: sourceItem.taxonomy_suspect,
    is_multi_card_sequence: false,
    requires_manual_asset_review: false,
    requires_manual_review: true,
    no_ocr: false,
    no_image_table_reconstruction: false,
    cannot_claim_image_content_recognized: false,
    may_request_future_dry_run_after_review: false,
    required_warnings: [...warnings],
    eligibility_blockers: [],
    required_prerequisites: basePrerequisites(),
    output_isolation_path: dryRunOutputPath(sourceItem.title),
  };

  if (sourceItem.title === "1.3 指令系统CISC和RISC") {
    item.eligible_for_request = false;
    item.requires_manual_asset_review = true;
    item.requires_manual_review = true;
    item.no_ocr = true;
    item.no_image_table_reconstruction = true;
    item.cannot_claim_image_content_recognized = true;
    item.eligibility_blockers = [
      "asset_manual_review_required",
      "image_content_not_human_verified",
    ];
    item.required_prerequisites = [
      ...basePrerequisites(),
      "manual_asset_review",
      "human_image_content_verification",
    ];
    for (const warning of ["asset_manual_review_required", "no_ocr", "no_image_table_reconstruction", "cannot_claim_image_content_recognized"]) {
      if (!item.required_warnings.includes(warning)) item.required_warnings.push(warning);
    }
  }

  if (sourceItem.title === "13.3 软件架构风格") {
    item.eligible_for_request = false;
    item.taxonomy_suspect = true;
    item.is_multi_card_sequence = true;
    item.taxonomy_suspect_handling = "restrict_request";
    item.multi_card_sequence_handling = "do_not_claim_complete";
    item.parent_node_handling = "do_not_generate_as_leaf";
    item.eligibility_blockers = [
      "taxonomy_suspect",
      "multi_card_sequence_possible",
      "parent_node_not_safe_as_leaf",
    ];
    item.required_prerequisites = [
      ...basePrerequisites(),
      "taxonomy_restriction_review",
      "parent_node_review",
    ];
    for (const warning of ["verified_short_text", "taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"]) {
      if (!item.required_warnings.includes(warning)) item.required_warnings.push(warning);
    }
  }

  if (sourceItem.title === "9.1 信息安全基础知识") {
    item.eligible_for_request = true;
    item.requires_manual_review = true;
    item.may_request_future_dry_run_after_review = true;
    item.eligibility_blockers = [];
    item.required_prerequisites = basePrerequisites();
  }

  return item;
}

function renderMarkdown(manifest: RuankaoAiLearningDryRunRequestManifest): string {
  const lines = [
    "# Phase 5.6 AI Learning Dry-run Request Manifest",
    "",
    `Generated at: ${manifest.created_at}`,
    "",
    "## Summary",
    "",
    `- manifest_version: ${manifest.manifest_version}`,
    `- source_name: ${manifest.source_name}`,
    `- manifest_scope: ${manifest.manifest_scope}`,
    `- generation_allowed: ${manifest.generation_allowed}`,
    `- dry_run_generation_allowed: ${manifest.dry_run_generation_allowed}`,
    `- formal_ai_learning_generation_allowed: ${manifest.formal_ai_learning_generation_allowed}`,
    `- review_gate_required: ${manifest.review_gate_required}`,
    `- auto_approval: ${manifest.auto_approval}`,
    `- phase5_7_entry_allowed: ${manifest.phase5_7_entry_allowed}`,
    `- item_count: ${manifest.items.length}`,
    "",
    "## Source Packet Gate",
    "",
    `- source_packet_exists: ${manifest.source_packet_gate.source_packet_exists}`,
    `- complete_count: ${manifest.source_packet_gate.complete_count}`,
    `- overall_source_packet_status: ${manifest.source_packet_gate.overall_source_packet_status}`,
    `- gate_result: ${manifest.source_packet_gate.gate_result}`,
    "",
    "## Output Isolation Policy",
    "",
    `- default_output_path: ${manifest.output_isolation_policy.default_output_path}`,
    `- allowed_output_paths: ${manifest.output_isolation_policy.allowed_output_paths.join(", ")}`,
    `- forbidden_output_paths: ${manifest.output_isolation_policy.forbidden_output_paths.join(", ")}`,
    `- source_layer_write_allowed: ${manifest.output_isolation_policy.source_layer_write_allowed}`,
    `- official_markdown_write_allowed: ${manifest.output_isolation_policy.official_markdown_write_allowed}`,
    "",
    "## Review Prerequisite Policy",
    "",
    `- required_prerequisites: ${manifest.review_prerequisite_policy.required_prerequisites.join(", ")}`,
    `- blocking_conditions: ${manifest.review_prerequisite_policy.blocking_conditions.join(", ")}`,
    `- human_review_required: ${manifest.review_prerequisite_policy.human_review_required}`,
    `- auto_approval: ${manifest.review_prerequisite_policy.auto_approval}`,
    "",
    "## Artifact Commit Policy",
    "",
    `- commit_allowed: ${manifest.artifact_commit_policy.commit_allowed.join(", ")}`,
    `- commit_forbidden: ${manifest.artifact_commit_policy.commit_forbidden.join(", ")}`,
    "",
    "## Items",
    "",
  ];

  for (const item of manifest.items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- render_as: ${item.render_as}`,
      `- eligible_for_request: ${item.eligible_for_request}`,
      `- request_status: ${item.request_status}`,
      `- dry_run_generation_allowed: ${item.dry_run_generation_allowed}`,
      `- formal_generation_allowed: ${item.formal_generation_allowed}`,
      `- output_isolation_path: ${item.output_isolation_path}`,
      `- required_warnings: ${item.required_warnings.join(", ") || "(none)"}`,
      `- eligibility_blockers: ${item.eligibility_blockers.join(", ") || "(none)"}`,
      `- required_prerequisites: ${item.required_prerequisites.join(", ")}`,
      "",
    );
  }

  lines.push(
    "## Constraints",
    "",
    "- This manifest does not generate AI learning content.",
    "- This manifest does not generate dry-run content.",
    "- This manifest does not create formal dual-layer document instances.",
    "- This manifest does not modify official Markdown, Source Layer artifacts, or source_content.",
    "- Phase 5.7 entry remains disallowed.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  ensureInputExists(sourcePacketPath);
  ensureInputExists(promptContractPath);
  ensureInputExists(dryRunContractPath);

  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  const promptContract = readJson<RuankaoAiLearningPromptContract>(promptContractPath);
  const dryRunContract = readJson<RuankaoAiLearningDryRunContract>(dryRunContractPath);
  const completeCount = sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;

  if (sourcePacket.overall_source_packet_status !== "complete" || completeCount !== 3) {
    console.error("[build:ai-learning-dry-run-request-manifest] ERROR: source packet gate failed; manifest was not generated");
    console.error(`  - overall_source_packet_status: ${sourcePacket.overall_source_packet_status}`);
    console.error(`  - complete_count: ${completeCount}`);
    process.exit(1);
  }
  if (promptContract.generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-request-manifest] ERROR: Phase 5.4 generation_allowed must be false");
    process.exit(1);
  }
  if (dryRunContract.generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-request-manifest] ERROR: Phase 5.5 generation_allowed must be false");
    process.exit(1);
  }

  const manifest: RuankaoAiLearningDryRunRequestManifest = {
    manifest_version: "phase5.6",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    manifest_scope: "dry_run_request_manifest_only",
    generation_allowed: false,
    dry_run_generation_allowed: false,
    formal_ai_learning_generation_allowed: false,
    review_gate_required: true,
    auto_approval: false,
    source_layer_modification_allowed: false,
    official_markdown_modification_allowed: false,
    source_content_write_allowed: false,
    phase5_7_entry_allowed: false,
    item_count: 3,
    source_packet_gate: {
      source_packet_exists: true,
      complete_count: 3,
      overall_source_packet_status: "complete",
      gate_result: "pass",
    },
    output_isolation_policy: {
      default_output_path: "verification/dry-run/ruankaodaren/baseline/",
      allowed_output_paths: [
        "verification/dry-run/ruankaodaren/",
        "drafts/ai-learning/ruankaodaren/",
      ],
      forbidden_output_paths: [
        "docs/ruankaodaren/baseline/",
        "source-packets/",
        "source_content",
        "data/raw",
        "data/intermediate",
      ],
      source_layer_write_allowed: false,
      official_markdown_write_allowed: false,
      source_content_write_allowed: false,
    },
    review_prerequisite_policy: {
      required_prerequisites: [
        "source_packet_complete",
        "prompt_contract_validated",
        "dry_run_contract_validated",
        "item_eligibility_checked",
        "output_path_isolated",
        "human_review_request_created",
        "no_source_layer_modification",
        "no_official_markdown_modification",
      ],
      blocking_conditions: [
        "source_packet_incomplete",
        "taxonomy_suspect_without_restriction",
        "asset_without_manual_review",
        "output_path_points_to_source_layer",
        "output_path_points_to_official_markdown",
        "generation_allowed_true",
        "auto_approval_true",
      ],
      human_review_required: true,
      auto_approval: false,
    },
    artifact_commit_policy: {
      commit_allowed: [
        "schema",
        "types",
        "builder",
        "validator",
        "verification_doc",
        "generated_manifest_json",
        "generated_manifest_md",
      ],
      commit_forbidden: [
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
    },
    items: sourcePacket.items.map((item) => buildItem(item, promptContract, dryRunContract)),
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(manifestJsonPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  writeFileSync(manifestMdPath, renderMarkdown(manifest), "utf8");

  console.log("[build:ai-learning-dry-run-request-manifest] Dry-run request manifest built");
  console.log(`  manifest_version:       ${manifest.manifest_version}`);
  console.log(`  generation_allowed:     ${manifest.generation_allowed}`);
  console.log(`  dry_run_generation_allowed: ${manifest.dry_run_generation_allowed}`);
  console.log(`  phase5_7_entry_allowed: ${manifest.phase5_7_entry_allowed}`);
  console.log(`  item_count:             ${manifest.item_count}`);
  console.log(`  JSON report:            ${toRepoPath(manifestJsonPath)}`);
  console.log(`  Markdown report:        ${toRepoPath(manifestMdPath)}`);
}

main();
