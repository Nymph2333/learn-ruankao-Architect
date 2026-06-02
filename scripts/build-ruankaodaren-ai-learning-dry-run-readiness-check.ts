/**
 * Phase 5.8 AI Learning dry-run execution readiness check builder.
 *
 * Builds a readiness check artifact only. It does not generate AI learning
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
import type {
  RuankaoAiLearningDryRunReadinessCheck,
  RuankaoAiLearningDryRunReadinessItem,
  RuankaoAiLearningDryRunReadinessPrerequisite,
} from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-readiness-check.js";
import type { RuankaoAiLearningDryRunRequestManifest } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.js";
import type { RuankaoAiLearningPromptContract } from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";
import type { RuankaoSourcePacket, RuankaoSourcePacketItem } from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const promptContractPath = "verification/generated/phase5_4_ai_learning_prompt_contract.json";
const dryRunContractPath = "verification/generated/phase5_5_ai_learning_dry_run_contract.json";
const requestManifestPath = "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json";
const executionContractPath = "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json";
const generatedDir = resolve(repoRoot, "verification/generated");
const readinessJsonPath = resolve(generatedDir, "phase5_8_ai_learning_dry_run_readiness_check.json");
const readinessMdPath = resolve(generatedDir, "phase5_8_ai_learning_dry_run_readiness_check.md");

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:ai-learning-dry-run-readiness-check] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function safeTitle(title: string): string {
  return title.replace(/[\\/:*?"<>|]/g, "_");
}

function baseReadinessPrerequisites(): RuankaoAiLearningDryRunReadinessPrerequisite[] {
  return [
    "human_review_request",
    "human_review_approval",
    "isolated_output_path",
    "source_packet_reference",
    "prompt_contract_reference",
    "dry_run_contract_reference",
    "request_manifest_reference",
    "execution_contract_reference",
  ];
}

function readinessOutputPath(title: string): string {
  return `verification/dry-run/ruankaodaren/baseline/${safeTitle(title)}.readiness-check.json`;
}

function buildItem(
  sourceItem: RuankaoSourcePacketItem,
  requestManifest: RuankaoAiLearningDryRunRequestManifest,
  executionContract: RuankaoAiLearningDryRunExecutionContract,
): RuankaoAiLearningDryRunReadinessItem {
  const requestItem = requestManifest.items.find((item) => item.title === sourceItem.title);
  const executionItem = executionContract.items.find((item) => item.title === sourceItem.title);
  if (!requestItem || !executionItem) {
    console.error(`[build:ai-learning-dry-run-readiness-check] ERROR: missing Phase 5.6 or 5.7 item: ${sourceItem.title}`);
    process.exit(1);
  }

  const item: RuankaoAiLearningDryRunReadinessItem = {
    title: sourceItem.title,
    render_as: sourceItem.render_as,
    current_status: "not_ready",
    eligible_for_request: requestItem.eligible_for_request,
    phase5_9_candidate: false,
    current_execution_allowed: false,
    current_dry_run_generation_allowed: false,
    current_formal_generation_allowed: false,
    taxonomy_suspect: executionItem.taxonomy_suspect,
    is_multi_card_sequence: executionItem.is_multi_card_sequence,
    requires_manual_asset_review: executionItem.requires_manual_asset_review,
    requires_manual_review: executionItem.requires_manual_review,
    no_ocr: executionItem.no_ocr,
    no_image_table_reconstruction: executionItem.no_image_table_reconstruction,
    cannot_claim_image_content_recognized: executionItem.cannot_claim_image_content_recognized,
    may_become_phase5_9_candidate_after_review: false,
    required_warnings: [...executionItem.required_warnings],
    readiness_blockers: [...executionItem.execution_blockers],
    readiness_prerequisites: baseReadinessPrerequisites(),
    readiness_result: "blocked",
    readiness_output_path: readinessOutputPath(sourceItem.title),
  };

  if (sourceItem.title === "1.3 指令系统CISC和RISC") {
    item.current_status = "not_ready";
    item.eligible_for_request = false;
    item.requires_manual_asset_review = true;
    item.requires_manual_review = true;
    item.no_ocr = true;
    item.no_image_table_reconstruction = true;
    item.cannot_claim_image_content_recognized = true;
    item.readiness_blockers = [
      "asset_manual_review_required",
      "image_content_not_human_verified",
    ];
    item.readiness_prerequisites = [
      ...baseReadinessPrerequisites(),
      "manual_asset_review",
      "human_image_content_verification",
    ];
    item.readiness_result = "blocked";
  }

  if (sourceItem.title === "13.3 软件架构风格") {
    item.current_status = "not_ready";
    item.eligible_for_request = false;
    item.taxonomy_suspect = true;
    item.is_multi_card_sequence = true;
    item.taxonomy_suspect_handling = "restrict_readiness";
    item.multi_card_sequence_handling = "do_not_claim_complete";
    item.parent_node_handling = "do_not_generate_as_leaf";
    item.readiness_blockers = [
      "taxonomy_suspect",
      "multi_card_sequence_possible",
      "parent_node_not_safe_as_leaf",
    ];
    item.readiness_prerequisites = [
      ...baseReadinessPrerequisites(),
      "taxonomy_restriction_review",
      "parent_node_review",
    ];
    item.readiness_result = "blocked";
    for (const warning of ["verified_short_text", "taxonomy_suspect", "multi_card_sequence_possible", "do_not_claim_complete"]) {
      if (!item.required_warnings.includes(warning)) item.required_warnings.push(warning);
    }
  }

  if (sourceItem.title === "9.1 信息安全基础知识") {
    item.current_status = "review_required";
    item.eligible_for_request = true;
    item.may_become_phase5_9_candidate_after_review = true;
    item.requires_manual_review = true;
    item.readiness_blockers = ["human_review_not_approved"];
    item.readiness_prerequisites = baseReadinessPrerequisites();
    item.readiness_result = "blocked_until_human_review";
  }

  return item;
}

function renderMarkdown(check: RuankaoAiLearningDryRunReadinessCheck): string {
  const lines = [
    "# Phase 5.8 AI Learning Dry-run Execution Readiness Check",
    "",
    `Generated at: ${check.created_at}`,
    "",
    "## Summary",
    "",
    `- check_version: ${check.check_version}`,
    `- source_name: ${check.source_name}`,
    `- check_scope: ${check.check_scope}`,
    `- readiness_mode: ${check.readiness_mode}`,
    `- generation_allowed: ${check.generation_allowed}`,
    `- dry_run_generation_allowed: ${check.dry_run_generation_allowed}`,
    `- dry_run_execution_allowed: ${check.dry_run_execution_allowed}`,
    `- formal_ai_learning_generation_allowed: ${check.formal_ai_learning_generation_allowed}`,
    `- review_gate_required: ${check.review_gate_required}`,
    `- auto_approval: ${check.auto_approval}`,
    `- phase5_9_entry_allowed: ${check.phase5_9_entry_allowed}`,
    `- item_count: ${check.item_count}`,
    "",
    "## Source Packet / Prior Contract Gate",
    "",
    `- source_packet_exists: ${check.source_packet_prior_contract_gate.source_packet_exists}`,
    `- complete_count: ${check.source_packet_prior_contract_gate.complete_count}`,
    `- Phase 5.4 generation_allowed: ${check.source_packet_prior_contract_gate.phase5_4_generation_allowed}`,
    `- Phase 5.5 generation_allowed: ${check.source_packet_prior_contract_gate.phase5_5_generation_allowed}`,
    `- Phase 5.6 generation_allowed: ${check.source_packet_prior_contract_gate.phase5_6_generation_allowed}`,
    `- Phase 5.6 dry_run_generation_allowed: ${check.source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed}`,
    `- Phase 5.7 dry_run_execution_allowed: ${check.source_packet_prior_contract_gate.phase5_7_dry_run_execution_allowed}`,
    `- gate_result: ${check.source_packet_prior_contract_gate.gate_result}`,
    "",
    "## Input Bundle Constructability",
    "",
    `- constructable_now: ${check.input_bundle_constructability.constructable_now}`,
    `- future_constructable_after_review: ${check.input_bundle_constructability.future_constructable_after_review}`,
    `- reason: ${check.input_bundle_constructability.reason}`,
    `- required_references: ${check.input_bundle_constructability.required_references.join(", ")}`,
    `- isolated_output_target_valid: ${check.input_bundle_constructability.isolated_output_target_valid}`,
    `- source_layer_write_allowed: ${check.input_bundle_constructability.source_layer_write_allowed}`,
    `- official_markdown_write_allowed: ${check.input_bundle_constructability.official_markdown_write_allowed}`,
    "",
    "## Output Isolation Readiness",
    "",
    `- default_future_output_path: ${check.output_isolation_readiness.default_future_output_path}`,
    `- allowed_output_paths: ${check.output_isolation_readiness.allowed_output_paths.join(", ")}`,
    `- forbidden_output_paths: ${check.output_isolation_readiness.forbidden_output_paths.join(", ")}`,
    `- source_layer_write_allowed: ${check.output_isolation_readiness.source_layer_write_allowed}`,
    `- official_markdown_write_allowed: ${check.output_isolation_readiness.official_markdown_write_allowed}`,
    "",
    "## Phase 5.9 Entry Policy",
    "",
    `- phase5_9_entry_allowed: ${check.phase5_9_entry_policy.phase5_9_entry_allowed}`,
    `- required_before_entry: ${check.phase5_9_entry_policy.required_before_entry.join(", ")}`,
    `- prohibited_before_entry: ${check.phase5_9_entry_policy.prohibited_before_entry.join(", ")}`,
    "",
    "## Artifact Commit Policy",
    "",
    `- commit_allowed: ${check.artifact_commit_policy.commit_allowed.join(", ")}`,
    `- commit_forbidden: ${check.artifact_commit_policy.commit_forbidden.join(", ")}`,
    "",
    "## Items",
    "",
  ];

  for (const item of check.items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- render_as: ${item.render_as}`,
      `- current_status: ${item.current_status}`,
      `- eligible_for_request: ${item.eligible_for_request}`,
      `- phase5_9_candidate: ${item.phase5_9_candidate}`,
      `- current_execution_allowed: ${item.current_execution_allowed}`,
      `- current_dry_run_generation_allowed: ${item.current_dry_run_generation_allowed}`,
      `- current_formal_generation_allowed: ${item.current_formal_generation_allowed}`,
      `- required_warnings: ${item.required_warnings.join(", ") || "(none)"}`,
      `- readiness_blockers: ${item.readiness_blockers.join(", ") || "(none)"}`,
      `- readiness_prerequisites: ${item.readiness_prerequisites.join(", ")}`,
      `- readiness_result: ${item.readiness_result}`,
      "",
    );
  }

  lines.push(
    "## Constraints",
    "",
    "- This readiness check does not generate AI learning content.",
    "- This readiness check does not generate dry-run content.",
    "- This readiness check does not generate input bundle instances.",
    "- This readiness check does not create formal dual-layer document instances.",
    "- Phase 5.9 entry remains disallowed.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  ensureInputExists(sourcePacketPath);
  ensureInputExists(promptContractPath);
  ensureInputExists(dryRunContractPath);
  ensureInputExists(requestManifestPath);
  ensureInputExists(executionContractPath);

  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  const promptContract = readJson<RuankaoAiLearningPromptContract>(promptContractPath);
  const dryRunContract = readJson<RuankaoAiLearningDryRunContract>(dryRunContractPath);
  const requestManifest = readJson<RuankaoAiLearningDryRunRequestManifest>(requestManifestPath);
  const executionContract = readJson<RuankaoAiLearningDryRunExecutionContract>(executionContractPath);
  const completeCount = sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;

  if (sourcePacket.overall_source_packet_status !== "complete" || completeCount !== 3) {
    console.error("[build:ai-learning-dry-run-readiness-check] ERROR: source packet gate failed; check was not generated");
    console.error(`  - overall_source_packet_status: ${sourcePacket.overall_source_packet_status}`);
    console.error(`  - complete_count: ${completeCount}`);
    process.exit(1);
  }
  if (promptContract.generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-readiness-check] ERROR: Phase 5.4 generation_allowed must be false");
    process.exit(1);
  }
  if (dryRunContract.generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-readiness-check] ERROR: Phase 5.5 generation_allowed must be false");
    process.exit(1);
  }
  if (requestManifest.generation_allowed !== false || requestManifest.dry_run_generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-readiness-check] ERROR: Phase 5.6 generation gates must be false");
    process.exit(1);
  }
  if (executionContract.generation_allowed !== false || executionContract.dry_run_execution_allowed !== false) {
    console.error("[build:ai-learning-dry-run-readiness-check] ERROR: Phase 5.7 execution gates must be false");
    process.exit(1);
  }

  const check: RuankaoAiLearningDryRunReadinessCheck = {
    check_version: "phase5.8",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    check_scope: "dry_run_execution_readiness_check_only",
    generation_allowed: false,
    dry_run_generation_allowed: false,
    dry_run_execution_allowed: false,
    formal_ai_learning_generation_allowed: false,
    readiness_mode: "check_only",
    review_gate_required: true,
    auto_approval: false,
    source_layer_modification_allowed: false,
    official_markdown_modification_allowed: false,
    source_content_write_allowed: false,
    phase5_9_entry_allowed: false,
    item_count: 3,
    source_packet_prior_contract_gate: {
      source_packet_exists: true,
      complete_count: 3,
      phase5_4_generation_allowed: false,
      phase5_5_generation_allowed: false,
      phase5_6_generation_allowed: false,
      phase5_6_dry_run_generation_allowed: false,
      phase5_7_generation_allowed: false,
      phase5_7_dry_run_execution_allowed: false,
      gate_result: "pass",
    },
    input_bundle_constructability: {
      constructable_now: false,
      reason: "human_review_not_approved",
      required_references: [
        "source_packet",
        "prompt_contract",
        "dry_run_contract",
        "request_manifest",
        "execution_contract",
      ],
      isolated_output_target_valid: true,
      source_layer_write_allowed: false,
      official_markdown_write_allowed: false,
      future_constructable_after_review: true,
    },
    output_isolation_readiness: {
      default_future_output_path: "verification/dry-run/ruankaodaren/baseline/",
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
    phase5_9_entry_policy: {
      phase5_9_entry_allowed: false,
      required_before_entry: [
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
      prohibited_before_entry: [
        "source_layer_modification",
        "official_markdown_modification",
        "generation_allowed_true",
        "auto_approval_true",
        "taxonomy_suspect_unrestricted_generation",
        "asset_without_manual_review",
      ],
    },
    artifact_commit_policy: {
      commit_allowed: [
        "schema",
        "types",
        "builder",
        "validator",
        "verification_doc",
        "generated_readiness_check_json",
        "generated_readiness_check_md",
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
    items: sourcePacket.items.map((item) => buildItem(item, requestManifest, executionContract)),
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(readinessJsonPath, `${JSON.stringify(check, null, 2)}\n`, "utf8");
  writeFileSync(readinessMdPath, renderMarkdown(check), "utf8");

  console.log("[build:ai-learning-dry-run-readiness-check] Dry-run readiness check built");
  console.log(`  check_version:                  ${check.check_version}`);
  console.log(`  readiness_mode:                 ${check.readiness_mode}`);
  console.log(`  generation_allowed:             ${check.generation_allowed}`);
  console.log(`  dry_run_generation_allowed:     ${check.dry_run_generation_allowed}`);
  console.log(`  dry_run_execution_allowed:      ${check.dry_run_execution_allowed}`);
  console.log(`  phase5_9_entry_allowed:         ${check.phase5_9_entry_allowed}`);
  console.log(`  item_count:                     ${check.item_count}`);
  console.log(`  JSON report:                    ${toRepoPath(readinessJsonPath)}`);
  console.log(`  Markdown report:                ${toRepoPath(readinessMdPath)}`);
}

main();
