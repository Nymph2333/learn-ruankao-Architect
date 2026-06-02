/**
 * Phase 5.7 AI Learning dry-run execution contract builder.
 *
 * Builds an execution contract artifact only. It does not generate AI learning
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
  RuankaoAiLearningDryRunExecutionContract,
  RuankaoAiLearningDryRunExecutionContractItem,
  RuankaoAiLearningDryRunExecutionPrerequisite,
} from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-execution-contract.js";
import type { RuankaoAiLearningDryRunRequestManifest } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.js";
import type { RuankaoAiLearningPromptContract } from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";
import type { RuankaoSourcePacket, RuankaoSourcePacketItem } from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const promptContractPath = "verification/generated/phase5_4_ai_learning_prompt_contract.json";
const dryRunContractPath = "verification/generated/phase5_5_ai_learning_dry_run_contract.json";
const requestManifestPath = "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json";
const generatedDir = resolve(repoRoot, "verification/generated");
const contractJsonPath = resolve(generatedDir, "phase5_7_ai_learning_dry_run_execution_contract.json");
const contractMdPath = resolve(generatedDir, "phase5_7_ai_learning_dry_run_execution_contract.md");

const futureDryRunSections = [
  "Source Summary / 原文摘要",
  "AI Explanation / AI解析",
  "Architecture Mapping / 架构师考点映射",
  "Case Study Pattern / 案例答题模式",
  "Paper Usage / 论文表达",
  "Misconceptions / 易错点",
  "Memory Hooks / 记忆钩子",
  "Review Notes / 复核提示",
];

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:ai-learning-dry-run-execution-contract] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function safeTitle(title: string): string {
  return title.replace(/[\\/:*?"<>|]/g, "_");
}

function baseExecutionPrerequisites(): RuankaoAiLearningDryRunExecutionPrerequisite[] {
  return [
    "human_review_request",
    "human_review_approval",
    "isolated_output_path",
    "source_packet_reference",
    "prompt_contract_reference",
    "dry_run_contract_reference",
    "request_manifest_reference",
  ];
}

function futureExecutionOutputPath(title: string): string {
  return `verification/dry-run/ruankaodaren/baseline/${safeTitle(title)}.execution-contract.json`;
}

function buildItem(
  sourceItem: RuankaoSourcePacketItem,
  requestManifest: RuankaoAiLearningDryRunRequestManifest,
): RuankaoAiLearningDryRunExecutionContractItem {
  const requestItem = requestManifest.items.find((item) => item.title === sourceItem.title);
  if (!requestItem) {
    console.error(`[build:ai-learning-dry-run-execution-contract] ERROR: missing Phase 5.6 request item: ${sourceItem.title}`);
    process.exit(1);
  }

  const item: RuankaoAiLearningDryRunExecutionContractItem = {
    title: sourceItem.title,
    render_as: sourceItem.render_as,
    eligible_for_request: requestItem.eligible_for_request,
    execution_status: "not_executable",
    execution_allowed: false,
    dry_run_generation_allowed: false,
    formal_generation_allowed: false,
    unrestricted_execution_allowed: false,
    taxonomy_suspect: requestItem.taxonomy_suspect,
    is_multi_card_sequence: requestItem.is_multi_card_sequence,
    requires_manual_asset_review: requestItem.requires_manual_asset_review,
    requires_manual_review: requestItem.requires_manual_review,
    no_ocr: requestItem.no_ocr,
    no_image_table_reconstruction: requestItem.no_image_table_reconstruction,
    cannot_claim_image_content_recognized: requestItem.cannot_claim_image_content_recognized,
    may_enter_future_execution_after_review: false,
    required_warnings: [...requestItem.required_warnings],
    execution_blockers: [...requestItem.eligibility_blockers],
    execution_prerequisites: baseExecutionPrerequisites(),
    future_execution_output_path: futureExecutionOutputPath(sourceItem.title),
  };

  if (sourceItem.title === "1.3 指令系统CISC和RISC") {
    item.eligible_for_request = false;
    item.requires_manual_asset_review = true;
    item.requires_manual_review = true;
    item.no_ocr = true;
    item.no_image_table_reconstruction = true;
    item.cannot_claim_image_content_recognized = true;
    item.execution_blockers = [
      "asset_manual_review_required",
      "image_content_not_human_verified",
    ];
    item.execution_prerequisites = [
      ...baseExecutionPrerequisites(),
      "manual_asset_review",
      "human_image_content_verification",
    ];
  }

  if (sourceItem.title === "13.3 软件架构风格") {
    item.eligible_for_request = false;
    item.taxonomy_suspect = true;
    item.is_multi_card_sequence = true;
    item.taxonomy_suspect_handling = "restrict_execution";
    item.multi_card_sequence_handling = "do_not_claim_complete";
    item.parent_node_handling = "do_not_generate_as_leaf";
    item.execution_blockers = [
      "taxonomy_suspect",
      "multi_card_sequence_possible",
      "parent_node_not_safe_as_leaf",
    ];
    item.execution_prerequisites = [
      ...baseExecutionPrerequisites(),
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
    item.may_enter_future_execution_after_review = true;
    item.execution_blockers = [];
    item.execution_prerequisites = baseExecutionPrerequisites();
  }

  return item;
}

function renderMarkdown(contract: RuankaoAiLearningDryRunExecutionContract): string {
  const lines = [
    "# Phase 5.7 AI Learning Dry-run Execution Contract",
    "",
    `Generated at: ${contract.created_at}`,
    "",
    "## Summary",
    "",
    `- contract_version: ${contract.contract_version}`,
    `- source_name: ${contract.source_name}`,
    `- contract_scope: ${contract.contract_scope}`,
    `- execution_mode: ${contract.execution_mode}`,
    `- generation_allowed: ${contract.generation_allowed}`,
    `- dry_run_generation_allowed: ${contract.dry_run_generation_allowed}`,
    `- dry_run_execution_allowed: ${contract.dry_run_execution_allowed}`,
    `- formal_ai_learning_generation_allowed: ${contract.formal_ai_learning_generation_allowed}`,
    `- review_gate_required: ${contract.review_gate_required}`,
    `- auto_approval: ${contract.auto_approval}`,
    `- phase5_8_entry_allowed: ${contract.phase5_8_entry_allowed}`,
    `- item_count: ${contract.item_count}`,
    "",
    "## Source Packet / Prior Contract Gate",
    "",
    `- source_packet_exists: ${contract.source_packet_prior_contract_gate.source_packet_exists}`,
    `- complete_count: ${contract.source_packet_prior_contract_gate.complete_count}`,
    `- Phase 5.4 generation_allowed: ${contract.source_packet_prior_contract_gate.phase5_4_generation_allowed}`,
    `- Phase 5.5 generation_allowed: ${contract.source_packet_prior_contract_gate.phase5_5_generation_allowed}`,
    `- Phase 5.6 generation_allowed: ${contract.source_packet_prior_contract_gate.phase5_6_generation_allowed}`,
    `- Phase 5.6 dry_run_generation_allowed: ${contract.source_packet_prior_contract_gate.phase5_6_dry_run_generation_allowed}`,
    `- gate_result: ${contract.source_packet_prior_contract_gate.gate_result}`,
    "",
    "## Execution Input Bundle Contract",
    "",
    `- fields: ${Object.keys(contract.input_bundle_schema).join(", ")}`,
    `- execution_controls: ${Object.entries(contract.input_bundle_schema.execution_controls).map(([key, value]) => `${key}=${value}`).join(", ")}`,
    "",
    "## Execution Output Format Contract",
    "",
    `- output_kind: ${contract.future_output_format.output_kind}`,
    `- future_dry_run_sections: ${contract.future_dry_run_sections.join(", ")}`,
    "- future_dry_run_sections are names only; no section body is generated.",
    "",
    "## Execution Status Machine",
    "",
    `- allowed_statuses: ${contract.execution_status_machine.allowed_statuses.join(", ")}`,
    `- default_status: ${contract.execution_status_machine.default_status}`,
    `- phase5_8_entry_allowed: ${contract.execution_status_machine.phase5_8_entry_allowed}`,
    "",
    "## Output Isolation Policy",
    "",
    `- default_future_output_path: ${contract.output_isolation_policy.default_future_output_path}`,
    `- allowed_output_paths: ${contract.output_isolation_policy.allowed_output_paths.join(", ")}`,
    `- forbidden_output_paths: ${contract.output_isolation_policy.forbidden_output_paths.join(", ")}`,
    `- source_layer_write_allowed: ${contract.output_isolation_policy.source_layer_write_allowed}`,
    `- official_markdown_write_allowed: ${contract.output_isolation_policy.official_markdown_write_allowed}`,
    "",
    "## Artifact Commit Policy",
    "",
    `- commit_allowed: ${contract.artifact_commit_policy.commit_allowed.join(", ")}`,
    `- commit_forbidden: ${contract.artifact_commit_policy.commit_forbidden.join(", ")}`,
    "",
    "## Items",
    "",
  ];

  for (const item of contract.items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- render_as: ${item.render_as}`,
      `- eligible_for_request: ${item.eligible_for_request}`,
      `- execution_status: ${item.execution_status}`,
      `- execution_allowed: ${item.execution_allowed}`,
      `- dry_run_generation_allowed: ${item.dry_run_generation_allowed}`,
      `- formal_generation_allowed: ${item.formal_generation_allowed}`,
      `- required_warnings: ${item.required_warnings.join(", ") || "(none)"}`,
      `- execution_blockers: ${item.execution_blockers.join(", ") || "(none)"}`,
      `- execution_prerequisites: ${item.execution_prerequisites.join(", ")}`,
      `- future_execution_output_path: ${item.future_execution_output_path}`,
      "",
    );
  }

  lines.push(
    "## Constraints",
    "",
    "- This contract does not generate AI learning content.",
    "- This contract does not generate dry-run content.",
    "- This contract does not create formal dual-layer document instances.",
    "- This contract does not modify official Markdown, Source Layer artifacts, or source_content.",
    "- Phase 5.8 entry remains disallowed.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  ensureInputExists(sourcePacketPath);
  ensureInputExists(promptContractPath);
  ensureInputExists(dryRunContractPath);
  ensureInputExists(requestManifestPath);

  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  const promptContract = readJson<RuankaoAiLearningPromptContract>(promptContractPath);
  const dryRunContract = readJson<RuankaoAiLearningDryRunContract>(dryRunContractPath);
  const requestManifest = readJson<RuankaoAiLearningDryRunRequestManifest>(requestManifestPath);
  const completeCount = sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;

  if (sourcePacket.overall_source_packet_status !== "complete" || completeCount !== 3) {
    console.error("[build:ai-learning-dry-run-execution-contract] ERROR: source packet gate failed; contract was not generated");
    console.error(`  - overall_source_packet_status: ${sourcePacket.overall_source_packet_status}`);
    console.error(`  - complete_count: ${completeCount}`);
    process.exit(1);
  }
  if (promptContract.generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-execution-contract] ERROR: Phase 5.4 generation_allowed must be false");
    process.exit(1);
  }
  if (dryRunContract.generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-execution-contract] ERROR: Phase 5.5 generation_allowed must be false");
    process.exit(1);
  }
  if (requestManifest.generation_allowed !== false || requestManifest.dry_run_generation_allowed !== false) {
    console.error("[build:ai-learning-dry-run-execution-contract] ERROR: Phase 5.6 generation gates must be false");
    process.exit(1);
  }

  const contract: RuankaoAiLearningDryRunExecutionContract = {
    contract_version: "phase5.7",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    contract_scope: "dry_run_execution_contract_only",
    generation_allowed: false,
    dry_run_generation_allowed: false,
    dry_run_execution_allowed: false,
    formal_ai_learning_generation_allowed: false,
    execution_mode: "contract_only",
    review_gate_required: true,
    auto_approval: false,
    source_layer_modification_allowed: false,
    official_markdown_modification_allowed: false,
    source_content_write_allowed: false,
    phase5_8_entry_allowed: false,
    item_count: 3,
    source_packet_prior_contract_gate: {
      source_packet_exists: true,
      complete_count: 3,
      phase5_4_generation_allowed: false,
      phase5_5_generation_allowed: false,
      phase5_6_generation_allowed: false,
      phase5_6_dry_run_generation_allowed: false,
      gate_result: "pass",
    },
    input_bundle_schema: {
      source_packet_reference: sourcePacketPath,
      prompt_contract_reference: promptContractPath,
      dry_run_contract_reference: dryRunContractPath,
      dry_run_request_manifest_reference: requestManifestPath,
      item_identity: "title",
      item_render_as: "render_as",
      item_content_shape: "render_as_bound_content_shape",
      source_layer_refs: "source_availability",
      allowed_prompt_template_id: "prompt_template_id",
      output_isolation_target: "future_execution_output_path",
      review_request_reference: "human_review_request",
      execution_controls: {
        generation_allowed: false,
        dry_run_generation_allowed: false,
        dry_run_execution_allowed: false,
        formal_generation_allowed: false,
        source_layer_write_allowed: false,
        official_markdown_write_allowed: false,
        auto_approval: false,
      },
    },
    future_output_format: {
      output_kind: "dry_run_ai_learning_draft",
      ai_generated_label_required: true,
      dry_run_label_required: true,
      not_human_approved_label_required: true,
      source_packet_reference_required: true,
      prompt_contract_reference_required: true,
      dry_run_contract_reference_required: true,
      request_manifest_reference_required: true,
      source_layer_modification_forbidden: true,
      official_markdown_modification_forbidden: true,
    },
    future_dry_run_sections: futureDryRunSections,
    execution_status_machine: {
      allowed_statuses: [
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
      default_status: "not_executable",
      transition_rules: [
        {
          from: "not_executable",
          to: "execution_request_required",
          requires: ["item eligible_for_request = true"],
        },
        {
          from: "execution_request_required",
          to: "execution_review_pending",
          requires: ["human_review_request_created = true"],
        },
        {
          from: "execution_review_pending",
          to: "execution_ready",
          requires: [
            "human_review_approved = true",
            "output_path_isolated = true",
            "source_packet_reference_valid = true",
            "prompt_contract_reference_valid = true",
            "dry_run_contract_reference_valid = true",
            "request_manifest_reference_valid = true",
          ],
        },
        {
          from: "execution_ready",
          to: "dry_run_executed",
          requires: ["explicit Phase 5.8 entry approval"],
        },
      ],
      phase5_7_execution_ready_allowed: false,
      phase5_7_dry_run_executed_allowed: false,
      phase5_8_entry_allowed: false,
    },
    output_isolation_policy: {
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
    artifact_commit_policy: {
      commit_allowed: [
        "schema",
        "types",
        "builder",
        "validator",
        "verification_doc",
        "generated_execution_contract_json",
        "generated_execution_contract_md",
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
    items: sourcePacket.items.map((item) => buildItem(item, requestManifest)),
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  writeFileSync(contractMdPath, renderMarkdown(contract), "utf8");

  console.log("[build:ai-learning-dry-run-execution-contract] Dry-run execution contract built");
  console.log(`  contract_version:                ${contract.contract_version}`);
  console.log(`  execution_mode:                  ${contract.execution_mode}`);
  console.log(`  generation_allowed:              ${contract.generation_allowed}`);
  console.log(`  dry_run_generation_allowed:      ${contract.dry_run_generation_allowed}`);
  console.log(`  dry_run_execution_allowed:       ${contract.dry_run_execution_allowed}`);
  console.log(`  phase5_8_entry_allowed:          ${contract.phase5_8_entry_allowed}`);
  console.log(`  item_count:                      ${contract.item_count}`);
  console.log(`  JSON report:                     ${toRepoPath(contractJsonPath)}`);
  console.log(`  Markdown report:                 ${toRepoPath(contractMdPath)}`);
}

main();
