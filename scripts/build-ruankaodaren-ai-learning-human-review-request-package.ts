/**
 * Phase 5.9 AI Learning dry-run human review request package builder.
 *
 * Builds a human review request package only. It does not generate AI learning
 * content, generate dry-run content, generate input bundle instances, create
 * formal dual-layer documents, rewrite official Markdown, modify Source Layer
 * artifacts, write source_content, OCR, decrypt encrypted XHR, reconstruct
 * image tables, read raw HTML/XHR, access webpages, run a renderer, run a
 * crawler, or run recovery.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAiLearningDryRunContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
import type { RuankaoAiLearningDryRunExecutionContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-execution-contract.js";
import type { RuankaoAiLearningDryRunReadinessCheck } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-readiness-check.js";
import type { RuankaoAiLearningDryRunRequestManifest } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.js";
import type {
  RuankaoAiLearningHumanReviewExcludedItem,
  RuankaoAiLearningHumanReviewRequestPackage,
} from "../packages/domain-types/ruankaodaren-ai-learning-human-review-request-package.js";
import type { RuankaoAiLearningPromptContract } from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";
import type { RuankaoSourcePacket } from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const promptContractPath = "verification/generated/phase5_4_ai_learning_prompt_contract.json";
const dryRunContractPath = "verification/generated/phase5_5_ai_learning_dry_run_contract.json";
const requestManifestPath = "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json";
const executionContractPath = "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json";
const readinessCheckPath = "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json";
const generatedDir = resolve(repoRoot, "verification/generated");
const packageJsonPath = resolve(generatedDir, "phase5_9_ai_learning_human_review_request_package.json");
const packageMdPath = resolve(generatedDir, "phase5_9_ai_learning_human_review_request_package.md");

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:ai-learning-human-review-request-package] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function fail(message: string): never {
  console.error(`[build:ai-learning-human-review-request-package] ERROR: ${message}`);
  process.exit(1);
}

function completeCount(sourcePacket: RuankaoSourcePacket): number {
  return sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;
}

function buildExcludedItems(): RuankaoAiLearningHumanReviewExcludedItem[] {
  return [
    {
      title: "1.3 指令系统CISC和RISC",
      render_as: "asset_card",
      selected_for_human_review_request: false,
      review_status: "not_requested",
      excluded_from_phase5_9: true,
      human_review_approved: false,
      eligible_for_request: false,
      dry_run_generation_allowed: false,
      dry_run_execution_allowed: false,
      formal_generation_allowed: false,
      exclusion_reason: [
        "asset_manual_review_required",
        "image_content_not_human_verified",
      ],
    },
    {
      title: "13.3 软件架构风格",
      render_as: "short_card",
      selected_for_human_review_request: false,
      review_status: "not_requested",
      excluded_from_phase5_9: true,
      human_review_approved: false,
      eligible_for_request: false,
      dry_run_generation_allowed: false,
      dry_run_execution_allowed: false,
      formal_generation_allowed: false,
      taxonomy_suspect: true,
      is_multi_card_sequence: true,
      required_warnings: [
        "verified_short_text",
        "taxonomy_suspect",
        "multi_card_sequence_possible",
        "do_not_claim_complete",
      ],
      exclusion_reason: [
        "taxonomy_suspect",
        "multi_card_sequence_possible",
        "parent_node_not_safe_as_leaf",
      ],
    },
  ];
}

function renderMarkdown(reviewPackage: RuankaoAiLearningHumanReviewRequestPackage): string {
  const selected = reviewPackage.selected_item;
  const lines = [
    "# Phase 5.9 AI Learning Human Review Request Package",
    "",
    `Generated at: ${reviewPackage.created_at}`,
    "",
    "## Summary",
    "",
    `- package_version: ${reviewPackage.package_version}`,
    `- source_name: ${reviewPackage.source_name}`,
    `- package_scope: ${reviewPackage.package_scope}`,
    `- generation_allowed: ${reviewPackage.generation_allowed}`,
    `- dry_run_generation_allowed: ${reviewPackage.dry_run_generation_allowed}`,
    `- dry_run_execution_allowed: ${reviewPackage.dry_run_execution_allowed}`,
    `- formal_ai_learning_generation_allowed: ${reviewPackage.formal_ai_learning_generation_allowed}`,
    `- review_request_allowed: ${reviewPackage.review_request_allowed}`,
    `- human_review_required: ${reviewPackage.human_review_required}`,
    `- human_review_approved: ${reviewPackage.human_review_approved}`,
    `- auto_approval: ${reviewPackage.auto_approval}`,
    `- source_layer_modification_allowed: ${reviewPackage.source_layer_modification_allowed}`,
    `- official_markdown_modification_allowed: ${reviewPackage.official_markdown_modification_allowed}`,
    `- source_content_write_allowed: ${reviewPackage.source_content_write_allowed}`,
    `- phase5_10_entry_allowed: ${reviewPackage.phase5_10_entry_allowed}`,
    "",
    "## Source Packet / Prior Contract Gate",
    "",
    `- source_packet_exists: ${reviewPackage.source_packet_prior_contract_gate.source_packet_exists}`,
    `- complete_count: ${reviewPackage.source_packet_prior_contract_gate.complete_count}`,
    `- Phase 5.4 generation_allowed: ${reviewPackage.source_packet_prior_contract_gate.phase5_4_generation_allowed}`,
    `- Phase 5.5 generation_allowed: ${reviewPackage.source_packet_prior_contract_gate.phase5_5_generation_allowed}`,
    `- Phase 5.6 generation_allowed: ${reviewPackage.source_packet_prior_contract_gate.phase5_6_generation_allowed}`,
    `- Phase 5.6 dry_run_generation_allowed: ${reviewPackage.source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed}`,
    `- Phase 5.7 dry_run_execution_allowed: ${reviewPackage.source_packet_prior_contract_gate.phase5_7_dry_run_execution_allowed}`,
    `- Phase 5.8 phase5_9_entry_allowed: ${reviewPackage.source_packet_prior_contract_gate.phase5_8_phase5_9_entry_allowed}`,
    `- gate_result: ${reviewPackage.source_packet_prior_contract_gate.gate_result}`,
    "",
    "## Selected Item",
    "",
    `- title: ${selected.title}`,
    `- render_as: ${selected.render_as}`,
    `- selected_for_human_review_request: ${selected.selected_for_human_review_request}`,
    `- review_status: ${selected.review_status}`,
    `- human_review_approved: ${selected.human_review_approved}`,
    `- eligible_for_request: ${selected.eligible_for_request}`,
    `- dry_run_generation_allowed: ${selected.dry_run_generation_allowed}`,
    `- dry_run_execution_allowed: ${selected.dry_run_execution_allowed}`,
    `- formal_generation_allowed: ${selected.formal_generation_allowed}`,
    `- requires_manual_review: ${selected.requires_manual_review}`,
    `- output_path_isolated: ${selected.output_path_isolated}`,
    `- default_future_output_path: ${selected.default_future_output_path}`,
    "",
    "## Contract References",
    "",
    `- source_packet: ${selected.contract_references.source_packet}`,
    `- prompt_contract: ${selected.contract_references.prompt_contract}`,
    `- dry_run_contract: ${selected.contract_references.dry_run_contract}`,
    `- request_manifest: ${selected.contract_references.request_manifest}`,
    `- execution_contract: ${selected.contract_references.execution_contract}`,
    `- readiness_check: ${selected.contract_references.readiness_check}`,
    "",
    "## Excluded Items",
    "",
  ];

  for (const item of reviewPackage.excluded_items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- render_as: ${item.render_as}`,
      `- selected_for_human_review_request: ${item.selected_for_human_review_request}`,
      `- review_status: ${item.review_status}`,
      `- excluded_from_phase5_9: ${item.excluded_from_phase5_9}`,
      `- exclusion_reason: ${item.exclusion_reason.join(", ")}`,
      `- dry_run_generation_allowed: ${item.dry_run_generation_allowed}`,
      `- dry_run_execution_allowed: ${item.dry_run_execution_allowed}`,
      `- formal_generation_allowed: ${item.formal_generation_allowed}`,
      "",
    );
  }

  lines.push(
    "## Human Review Checklist",
    "",
    ...reviewPackage.human_review_checklist.map((item) => `- ${item}`),
    "",
    "## Reviewer Decision",
    "",
    `- decision: ${reviewPackage.reviewer_decision.decision}`,
    `- allowed_values: ${reviewPackage.reviewer_decision.allowed_values.join(", ")}`,
    `- decided_by: ${reviewPackage.reviewer_decision.decided_by}`,
    `- decided_at: ${reviewPackage.reviewer_decision.decided_at}`,
    `- notes: ${reviewPackage.reviewer_decision.notes}`,
    "",
    "## Phase 5.10 Entry Policy",
    "",
    `- phase5_10_entry_allowed: ${reviewPackage.phase5_10_entry_policy.phase5_10_entry_allowed}`,
    `- required_before_entry: ${reviewPackage.phase5_10_entry_policy.required_before_entry.join(", ")}`,
    `- prohibited_before_entry: ${reviewPackage.phase5_10_entry_policy.prohibited_before_entry.join(", ")}`,
    "",
    "## Artifact Commit Policy",
    "",
    `- commit_allowed: ${reviewPackage.artifact_commit_policy.commit_allowed.join(", ")}`,
    `- commit_forbidden: ${reviewPackage.artifact_commit_policy.commit_forbidden.join(", ")}`,
    "",
    "## Constraints",
    "",
    "- This package is a human review request package only.",
    "- This package does not contain AI learning content.",
    "- This package does not contain dry-run content.",
    "- This package does not contain item-level AI explanation.",
    "- This package does not authorize Phase 5.10 entry.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  for (const input of [
    sourcePacketPath,
    promptContractPath,
    dryRunContractPath,
    requestManifestPath,
    executionContractPath,
    readinessCheckPath,
  ]) {
    ensureInputExists(input);
  }

  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  const promptContract = readJson<RuankaoAiLearningPromptContract>(promptContractPath);
  const dryRunContract = readJson<RuankaoAiLearningDryRunContract>(dryRunContractPath);
  const requestManifest = readJson<RuankaoAiLearningDryRunRequestManifest>(requestManifestPath);
  const executionContract = readJson<RuankaoAiLearningDryRunExecutionContract>(executionContractPath);
  const readinessCheck = readJson<RuankaoAiLearningDryRunReadinessCheck>(readinessCheckPath);
  const sourcePacketCompleteCount = completeCount(sourcePacket);

  if (sourcePacket.overall_source_packet_status !== "complete" || sourcePacketCompleteCount !== 3) {
    fail(`source packet gate failed: overall=${sourcePacket.overall_source_packet_status}, complete_count=${sourcePacketCompleteCount}`);
  }
  if (promptContract.generation_allowed !== false) fail("Phase 5.4 generation_allowed must be false");
  if (dryRunContract.generation_allowed !== false) fail("Phase 5.5 generation_allowed must be false");
  if (requestManifest.generation_allowed !== false) fail("Phase 5.6 generation_allowed must be false");
  if (requestManifest.dry_run_generation_allowed !== false) fail("Phase 5.6 dry_run_generation_allowed must be false");
  if (executionContract.dry_run_execution_allowed !== false) fail("Phase 5.7 dry_run_execution_allowed must be false");
  if (readinessCheck.phase5_9_entry_allowed !== false) fail("Phase 5.8 phase5_9_entry_allowed must be false");

  const requestItem = requestManifest.items.find((item) => item.title === "9.1 信息安全基础知识");
  const readinessItem = readinessCheck.items.find((item) => item.title === "9.1 信息安全基础知识");
  if (!requestItem || !requestItem.eligible_for_request) fail("9.1 must be the only eligible Phase 5.9 review request item");
  if (!readinessItem || readinessItem.current_status !== "review_required") fail("9.1 readiness state must be review_required");

  const reviewPackage: RuankaoAiLearningHumanReviewRequestPackage = {
    package_version: "phase5.9",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    package_scope: "dry_run_human_review_request_only",
    generation_allowed: false,
    dry_run_generation_allowed: false,
    dry_run_execution_allowed: false,
    formal_ai_learning_generation_allowed: false,
    review_request_allowed: true,
    human_review_required: true,
    human_review_approved: false,
    auto_approval: false,
    source_layer_modification_allowed: false,
    official_markdown_modification_allowed: false,
    source_content_write_allowed: false,
    phase5_10_entry_allowed: false,
    source_packet_prior_contract_gate: {
      source_packet_exists: true,
      complete_count: 3,
      phase5_4_generation_allowed: false,
      phase5_5_generation_allowed: false,
      phase5_6_generation_allowed: false,
      phase5_6_dry_run_generation_allowed: false,
      phase5_7_dry_run_execution_allowed: false,
      phase5_8_phase5_9_entry_allowed: false,
      gate_result: "pass",
    },
    selected_item_count: 1,
    excluded_item_count: 2,
    selected_item: {
      title: "9.1 信息安全基础知识",
      render_as: "concept_card",
      selected_for_human_review_request: true,
      review_status: "human_review_pending",
      human_review_approved: false,
      eligible_for_request: true,
      dry_run_generation_allowed: false,
      dry_run_execution_allowed: false,
      formal_generation_allowed: false,
      requires_manual_review: true,
      output_path_isolated: true,
      default_future_output_path: "verification/dry-run/ruankaodaren/baseline/9.1_信息安全基础知识/",
      source_packet_reference_required: true,
      prompt_contract_reference_required: true,
      dry_run_contract_reference_required: true,
      request_manifest_reference_required: true,
      execution_contract_reference_required: true,
      readiness_check_reference_required: true,
      contract_references: {
        source_packet: sourcePacketPath,
        prompt_contract: promptContractPath,
        dry_run_contract: dryRunContractPath,
        request_manifest: requestManifestPath,
        execution_contract: executionContractPath,
        readiness_check: readinessCheckPath,
      },
    },
    excluded_items: buildExcludedItems(),
    human_review_checklist: [
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
    reviewer_decision: {
      decision: "pending",
      allowed_values: [
        "pending",
        "approve_for_phase5_10_dry_run_execution",
        "request_changes",
        "reject",
      ],
      decided_by: null,
      decided_at: null,
      notes: null,
    },
    phase5_10_entry_policy: {
      phase5_10_entry_allowed: false,
      required_before_entry: [
        "explicit_user_approval",
        "reviewer_decision_approve_for_phase5_10_dry_run_execution",
        "human_review_approved",
        "selected_item_is_9.1",
        "output_path_isolated",
        "all_contract_references_valid",
        "no_source_layer_modification",
        "no_official_markdown_modification",
      ],
      prohibited_before_entry: [
        "auto_approval_true",
        "generation_allowed_true",
        "dry_run_execution_without_review",
        "source_layer_modification",
        "official_markdown_modification",
        "selected_item_taxonomy_suspect",
        "selected_item_asset_unreviewed",
      ],
    },
    artifact_commit_policy: {
      commit_allowed: [
        "schema",
        "types",
        "builder",
        "validator",
        "verification_doc",
        "generated_human_review_request_package_json",
        "generated_human_review_request_package_md",
      ],
      commit_forbidden: [
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
    },
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(packageJsonPath, `${JSON.stringify(reviewPackage, null, 2)}\n`, "utf8");
  writeFileSync(packageMdPath, renderMarkdown(reviewPackage), "utf8");

  console.log("[build:ai-learning-human-review-request-package] Human review request package built");
  console.log(`  package_version:               ${reviewPackage.package_version}`);
  console.log(`  package_scope:                 ${reviewPackage.package_scope}`);
  console.log(`  selected_item_count:           ${reviewPackage.selected_item_count}`);
  console.log(`  selected_item:                 ${reviewPackage.selected_item.title}`);
  console.log(`  generation_allowed:            ${reviewPackage.generation_allowed}`);
  console.log(`  dry_run_generation_allowed:    ${reviewPackage.dry_run_generation_allowed}`);
  console.log(`  dry_run_execution_allowed:     ${reviewPackage.dry_run_execution_allowed}`);
  console.log(`  phase5_10_entry_allowed:       ${reviewPackage.phase5_10_entry_allowed}`);
  console.log(`  JSON report:                   ${toRepoPath(packageJsonPath)}`);
  console.log(`  Markdown report:               ${toRepoPath(packageMdPath)}`);
}

main();
