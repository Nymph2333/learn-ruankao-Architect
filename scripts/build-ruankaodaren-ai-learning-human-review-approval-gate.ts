/**
 * Phase 5.10 AI Learning dry-run human review approval gate builder.
 *
 * Builds a human review approval gate only. It does not execute approval, does
 * not generate AI learning content, does not generate dry-run content, does not
 * generate input bundle instances, does not create formal dual-layer documents,
 * does not rewrite official Markdown, does not modify Source Layer artifacts,
 * does not write source_content, does not OCR, does not decrypt encrypted XHR,
 * does not reconstruct image tables, does not read raw HTML/XHR, does not
 * access webpages, does not run a renderer, does not run a crawler, and does
 * not run recovery.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAiLearningPromptContract } from "../packages/domain-types/ruankaodaren-ai-learning-prompt-contract.js";
import type { RuankaoAiLearningDryRunContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.js";
import type { RuankaoAiLearningDryRunRequestManifest } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.js";
import type { RuankaoAiLearningDryRunExecutionContract } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-execution-contract.js";
import type { RuankaoAiLearningDryRunReadinessCheck } from "../packages/domain-types/ruankaodaren-ai-learning-dry-run-readiness-check.js";
import type { RuankaoAiLearningHumanReviewRequestPackage } from "../packages/domain-types/ruankaodaren-ai-learning-human-review-request-package.js";
import type { RuankaoAiLearningHumanReviewApprovalGate } from "../packages/domain-types/ruankaodaren-ai-learning-human-review-approval-gate.js";
import type { RuankaoSourcePacket } from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const promptContractPath = "verification/generated/phase5_4_ai_learning_prompt_contract.json";
const dryRunContractPath = "verification/generated/phase5_5_ai_learning_dry_run_contract.json";
const requestManifestPath = "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json";
const executionContractPath = "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json";
const readinessCheckPath = "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json";
const humanReviewPackagePath = "verification/generated/phase5_9_ai_learning_human_review_request_package.json";
const generatedDir = resolve(repoRoot, "verification/generated");
const approvalGateJsonPath = resolve(generatedDir, "phase5_10_ai_learning_human_review_approval_gate.json");
const approvalGateMdPath = resolve(generatedDir, "phase5_10_ai_learning_human_review_approval_gate.md");

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:ai-learning-human-review-approval-gate] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function fail(message: string): never {
  console.error(`[build:ai-learning-human-review-approval-gate] ERROR: ${message}`);
  process.exit(1);
}

function main(): void {
  console.log("[build:ai-learning-human-review-approval-gate] Phase 5.10 AI Learning Human Review Approval Gate builder");

  // Check all input dependencies
  console.log("[build:ai-learning-human-review-approval-gate] Checking input dependencies...");
  ensureInputExists(sourcePacketPath);
  ensureInputExists(promptContractPath);
  ensureInputExists(dryRunContractPath);
  ensureInputExists(requestManifestPath);
  ensureInputExists(executionContractPath);
  ensureInputExists(readinessCheckPath);
  ensureInputExists(humanReviewPackagePath);

  // Read all contracts
  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  const promptContract = readJson<RuankaoAiLearningPromptContract>(promptContractPath);
  const dryRunContract = readJson<RuankaoAiLearningDryRunContract>(dryRunContractPath);
  const requestManifest = readJson<RuankaoAiLearningDryRunRequestManifest>(requestManifestPath);
  const executionContract = readJson<RuankaoAiLearningDryRunExecutionContract>(executionContractPath);
  const readinessCheck = readJson<RuankaoAiLearningDryRunReadinessCheck>(readinessCheckPath);
  const humanReviewPackage = readJson<RuankaoAiLearningHumanReviewRequestPackage>(humanReviewPackagePath);

  // Gate compliance checks
  const completeCount = sourcePacket.items.filter((item) => item.source_availability.source_packet_complete).length;
  if (completeCount !== 3) {
    fail(`source packet complete_count must be 3, got ${completeCount}`);
  }

  if (promptContract.generation_allowed !== false) {
    fail("Phase 5.4 prompt contract generation_allowed must be false");
  }

  if (dryRunContract.generation_allowed !== false) {
    fail("Phase 5.5 dry-run contract generation_allowed must be false");
  }

  if (requestManifest.generation_allowed !== false) {
    fail("Phase 5.6 request manifest generation_allowed must be false");
  }

  if (requestManifest.dry_run_generation_allowed !== false) {
    fail("Phase 5.6 request manifest dry_run_generation_allowed must be false");
  }

  if (executionContract.dry_run_execution_allowed !== false) {
    fail("Phase 5.7 execution contract dry_run_execution_allowed must be false");
  }

  if (readinessCheck.phase5_9_entry_allowed !== false) {
    fail("Phase 5.8 readiness check phase5_9_entry_allowed must be false");
  }

  if (humanReviewPackage.review_request_allowed !== true) {
    fail("Phase 5.9 human review package review_request_allowed must be true");
  }

  if (humanReviewPackage.selected_item.title !== "9.1 信息安全基础知识") {
    fail("Phase 5.9 selected item must be 9.1 信息安全基础知识");
  }

  if (humanReviewPackage.reviewer_decision.decision !== "pending") {
    fail("Phase 5.9 reviewer_decision must be pending");
  }

  if (humanReviewPackage.human_review_approved !== false) {
    fail("Phase 5.9 human_review_approved must be false");
  }

  console.log("[build:ai-learning-human-review-approval-gate] Prior contract gate checks passed");

  // Build approval gate artifact
  const approvalGate: RuankaoAiLearningHumanReviewApprovalGate = {
    gate_version: "phase5.10",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    gate_scope: "dry_run_human_review_approval_gate_only",
    generation_allowed: false,
    dry_run_generation_allowed: false,
    dry_run_execution_allowed: false,
    formal_ai_learning_generation_allowed: false,
    approval_gate_defined: true,
    approval_executed: false,
    reviewer_decision: "pending",
    human_review_required: true,
    human_review_approved: false,
    auto_approval: false,
    source_layer_modification_allowed: false,
    official_markdown_modification_allowed: false,
    phase5_11_entry_allowed: false,
    source_packet_prior_contract_gate: {
      source_packet_exists: true,
      complete_count: 3,
      phase5_4_generation_allowed: false,
      phase5_5_generation_allowed: false,
      phase5_6_generation_allowed: false,
      phase5_6_dry_run_generation_allowed: false,
      phase5_7_dry_run_execution_allowed: false,
      phase5_8_phase5_9_entry_allowed: false,
      phase5_9_review_request_allowed: true,
      phase5_9_reviewer_decision: "pending",
      phase5_9_human_review_approved: false,
      gate_result: "pass",
    },
    reviewer_decision_schema: {
      current_decision: "pending",
      allowed_values: [
        "pending",
        "approve_for_phase5_11_dry_run_execution",
        "request_changes",
        "reject",
      ],
      decision_executed: false,
      decided_by: null,
      decided_at: null,
      notes: null,
      decision_behavior: {
        pending: {
          phase5_11_entry_allowed: false,
          dry_run_execution_allowed: false,
        },
        approve_for_phase5_11_dry_run_execution: {
          requires: [
            "explicit_user_approval",
            "reviewer_identity",
            "decided_at",
            "approval_evidence",
            "all_references_valid",
          ],
          may_allow_future_phase5_11_entry: true,
        },
        request_changes: {
          blocks_phase5_11: true,
          requires_change_request_notes: true,
          dry_run_execution_allowed: false,
        },
        reject: {
          blocks_phase5_11: true,
          requires_rejection_reason: true,
          dry_run_execution_allowed: false,
        },
      },
    },
    approval_evidence_requirements: [
      "reviewer_identity_required",
      "reviewer_decision_required",
      "decided_at_required",
      "selected_item_confirmed",
      "source_packet_reference_verified",
      "prompt_contract_reference_verified",
      "dry_run_contract_reference_verified",
      "request_manifest_reference_verified",
      "execution_contract_reference_verified",
      "readiness_check_reference_verified",
      "human_review_request_package_reference_verified",
      "output_path_isolated_verified",
      "official_markdown_write_forbidden_confirmed",
      "source_layer_write_forbidden_confirmed",
      "no_ocr_confirmed",
      "no_raw_html_or_xhr_confirmed",
      "no_ai_content_in_source_content_confirmed",
      "no_formal_generation_before_approval_confirmed",
    ],
    selected_item_approval_gate: {
      title: "9.1 信息安全基础知识",
      render_as: "concept_card",
      selected_for_human_review_request: true,
      selected_for_approval_gate: true,
      approval_status: "pending",
      reviewer_decision: "pending",
      human_review_approved: false,
      dry_run_generation_allowed: false,
      dry_run_execution_allowed: false,
      formal_generation_allowed: false,
      output_path_isolated: true,
      default_future_output_path: "verification/dry-run/ruankaodaren/baseline/9.1_信息安全基础知识/",
    },
    excluded_items_approval_policy: [
      {
        title: "1.3 指令系统CISC和RISC",
        excluded_from_approval_gate: true,
        exclusion_reason: [
          "asset_manual_review_required",
          "image_content_not_human_verified",
        ],
        dry_run_generation_allowed: false,
        dry_run_execution_allowed: false,
        formal_generation_allowed: false,
      },
      {
        title: "13.3 软件架构风格",
        excluded_from_approval_gate: true,
        exclusion_reason: [
          "taxonomy_suspect",
          "multi_card_sequence_possible",
          "parent_node_not_safe_as_leaf",
        ],
        taxonomy_suspect: true,
        is_multi_card_sequence: true,
        required_warnings: [
          "verified_short_text",
          "taxonomy_suspect",
          "multi_card_sequence_possible",
          "do_not_claim_complete",
        ],
        dry_run_generation_allowed: false,
        dry_run_execution_allowed: false,
        formal_generation_allowed: false,
      },
    ],
    phase5_11_entry_policy: {
      phase5_11_entry_allowed: false,
      required_before_entry: [
        "explicit_user_approval",
        "reviewer_decision_approve_for_phase5_11_dry_run_execution",
        "human_review_approved",
        "approval_evidence_complete",
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
        "approval_evidence_missing",
      ],
    },
    artifact_commit_policy: {
      commit_allowed: [
        "schema",
        "types",
        "builder",
        "validator",
        "verification_doc",
        "generated_approval_gate_json",
        "generated_approval_gate_md",
      ],
      commit_forbidden: [
        "ai_learning_content",
        "dry_run_content",
        "approval_result_instance",
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

  // Write JSON
  if (!existsSync(generatedDir)) {
    mkdirSync(generatedDir, { recursive: true });
  }

  writeFileSync(approvalGateJsonPath, JSON.stringify(approvalGate, null, 2) + "\n", "utf8");
  console.log(`[build:ai-learning-human-review-approval-gate] JSON written: ${toRepoPath(approvalGateJsonPath)}`);

  // Write Markdown
  const md = `# Phase 5.10 AI Learning Human Review Approval Gate

## Gate Summary

- **gate_version**: ${approvalGate.gate_version}
- **source_name**: ${approvalGate.source_name}
- **gate_scope**: ${approvalGate.gate_scope}
- **generation_allowed**: ${approvalGate.generation_allowed}
- **dry_run_generation_allowed**: ${approvalGate.dry_run_generation_allowed}
- **dry_run_execution_allowed**: ${approvalGate.dry_run_execution_allowed}
- **formal_ai_learning_generation_allowed**: ${approvalGate.formal_ai_learning_generation_allowed}
- **approval_gate_defined**: ${approvalGate.approval_gate_defined}
- **approval_executed**: ${approvalGate.approval_executed}
- **reviewer_decision**: ${approvalGate.reviewer_decision}
- **human_review_required**: ${approvalGate.human_review_required}
- **human_review_approved**: ${approvalGate.human_review_approved}
- **auto_approval**: ${approvalGate.auto_approval}
- **phase5_11_entry_allowed**: ${approvalGate.phase5_11_entry_allowed}

## Reviewer Decision Schema

- **current_decision**: ${approvalGate.reviewer_decision_schema.current_decision}
- **decision_executed**: ${approvalGate.reviewer_decision_schema.decision_executed}
- **allowed_values**:
${approvalGate.reviewer_decision_schema.allowed_values.map((v) => `  - ${v}`).join("\n")}

## Approval Evidence Requirements

${approvalGate.approval_evidence_requirements.map((r) => `- ${r}`).join("\n")}

## Selected Item Approval Gate

- **title**: ${approvalGate.selected_item_approval_gate.title}
- **render_as**: ${approvalGate.selected_item_approval_gate.render_as}
- **approval_status**: ${approvalGate.selected_item_approval_gate.approval_status}
- **reviewer_decision**: ${approvalGate.selected_item_approval_gate.reviewer_decision}
- **human_review_approved**: ${approvalGate.selected_item_approval_gate.human_review_approved}
- **dry_run_generation_allowed**: ${approvalGate.selected_item_approval_gate.dry_run_generation_allowed}
- **dry_run_execution_allowed**: ${approvalGate.selected_item_approval_gate.dry_run_execution_allowed}
- **formal_generation_allowed**: ${approvalGate.selected_item_approval_gate.formal_generation_allowed}
- **output_path_isolated**: ${approvalGate.selected_item_approval_gate.output_path_isolated}

## Excluded Items

${approvalGate.excluded_items_approval_policy.map((item) => `
### ${item.title}

- **excluded_from_approval_gate**: ${item.excluded_from_approval_gate}
- **exclusion_reason**: ${item.exclusion_reason.join(", ")}
${item.taxonomy_suspect !== undefined ? `- **taxonomy_suspect**: ${item.taxonomy_suspect}` : ""}
${item.is_multi_card_sequence !== undefined ? `- **is_multi_card_sequence**: ${item.is_multi_card_sequence}` : ""}
`).join("")}

## Phase 5.11 Entry Policy

- **phase5_11_entry_allowed**: ${approvalGate.phase5_11_entry_policy.phase5_11_entry_allowed}
- **required_before_entry**:
${approvalGate.phase5_11_entry_policy.required_before_entry.map((r) => `  - ${r}`).join("\n")}
- **prohibited_before_entry**:
${approvalGate.phase5_11_entry_policy.prohibited_before_entry.map((p) => `  - ${p}`).join("\n")}

## Artifact Commit Policy

- **commit_allowed**:
${approvalGate.artifact_commit_policy.commit_allowed.map((a) => `  - ${a}`).join("\n")}
- **commit_forbidden**:
${approvalGate.artifact_commit_policy.commit_forbidden.map((f) => `  - ${f}`).join("\n")}
`;

  writeFileSync(approvalGateMdPath, md, "utf8");
  console.log(`[build:ai-learning-human-review-approval-gate] Markdown written: ${toRepoPath(approvalGateMdPath)}`);

  console.log("[build:ai-learning-human-review-approval-gate] Phase 5.10 approval gate built successfully");
  console.log("[build:ai-learning-human-review-approval-gate] IMPORTANT: This is approval gate definition only.");
  console.log("[build:ai-learning-human-review-approval-gate] Approval has NOT been executed.");
  console.log("[build:ai-learning-human-review-approval-gate] reviewer_decision remains pending.");
  console.log("[build:ai-learning-human-review-approval-gate] human_review_approved remains false.");
  console.log("[build:ai-learning-human-review-approval-gate] phase5_11_entry_allowed remains false.");
}

main();