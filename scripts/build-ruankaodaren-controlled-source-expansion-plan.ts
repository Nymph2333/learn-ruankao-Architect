/**
 * Phase 6.0 Controlled Source Expansion Plan builder.
 *
 * Reads source-packet.json and Phase 5.4–5.10 generated contracts to produce
 * the controlled source expansion plan artifact.
 *
 * This builder does NOT:
 * - access web pages
 * - run the crawler
 * - run the renderer
 * - run recovery
 * - generate source artifacts
 * - generate source packets
 * - modify Source Layer artifacts
 * - generate AI learning content
 * - execute human review approval
 *
 * Usage:
 *   pnpm build:controlled-source-expansion-plan
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoSourcePacket } from "../packages/domain-types/ruankaodaren-source-packet.js";
import type { RuankaoAiLearningHumanReviewApprovalGate } from "../packages/domain-types/ruankaodaren-ai-learning-human-review-approval-gate.js";
import type { RuankaoControlledSourceExpansionPlan } from "../packages/domain-types/ruankaodaren-controlled-source-expansion-plan.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");

const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const approvalGatePath = "verification/generated/phase5_10_ai_learning_human_review_approval_gate.json";
const jsonOutputPath = resolve(generatedDir, "phase6_0_controlled_source_expansion_plan.json");
const mdOutputPath = resolve(generatedDir, "phase6_0_controlled_source_expansion_plan.md");

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  const absPath = resolve(repoRoot, relativePath);
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:controlled-source-expansion-plan] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function fail(message: string): never {
  console.error(`[build:controlled-source-expansion-plan] ERROR: ${message}`);
  process.exit(1);
}

function main(): void {
  console.log("[build:controlled-source-expansion-plan] Phase 6.0 Controlled Source Expansion Plan builder");

  // Check inputs
  console.log("[build:controlled-source-expansion-plan] Checking input dependencies...");
  ensureInputExists(sourcePacketPath);
  ensureInputExists(approvalGatePath);

  const sourcePacket = readJson<RuankaoSourcePacket>(sourcePacketPath);
  const approvalGate = readJson<RuankaoAiLearningHumanReviewApprovalGate>(approvalGatePath);

  // Gate check: baseline coverage
  const itemCount = sourcePacket.items.length;
  const completeCount = sourcePacket.items.filter((i) => i.source_layer_status === "complete").length;
  if (itemCount !== 3) fail(`baseline item_count must be 3, got ${itemCount}`);
  if (completeCount !== 3) fail(`baseline complete_count must be 3, got ${completeCount}`);
  console.log(`[build:controlled-source-expansion-plan] Baseline: item_count=${itemCount}, complete_count=${completeCount} OK`);

  // Gate check: Phase 5.10 approval gate remains pending
  const gate = (approvalGate as unknown) as Record<string, unknown>;
  if (gate["approval_executed"] !== false) fail("Phase 5.10 approval_executed must be false");
  if (gate["human_review_approved"] !== false) fail("Phase 5.10 human_review_approved must be false");
  if (gate["phase5_11_entry_allowed"] !== false) fail("Phase 5.10 phase5_11_entry_allowed must be false");
  if (gate["generation_allowed"] !== false) fail("Phase 5.10 generation_allowed must be false");
  console.log("[build:controlled-source-expansion-plan] Phase 5.10 gate check: all pending flags confirmed OK");

  // Build coverage item list from source-packet
  const coverageItems = sourcePacket.items.map((item) => ({
    title: item.title,
    source_layer_status: item.source_layer_status,
    taxonomy_suspect: item.taxonomy_suspect,
    render_as: item.render_as,
  }));

  const plan: RuankaoControlledSourceExpansionPlan = {
    plan_version: "phase6.0",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    plan_scope: "controlled_source_expansion_plan_only",
    execution_allowed: false,
    crawler_allowed: false,
    renderer_allowed: false,
    recovery_allowed: false,
    web_requests_allowed: false,
    raw_html_direct_read_allowed: false,
    raw_xhr_direct_read_allowed: false,
    ocr_allowed: false,
    encrypted_xhr_decryption_allowed: false,
    image_table_reconstruction_allowed: false,
    source_layer_modification_allowed: false,
    official_markdown_modification_allowed: false,
    ai_learning_generation_allowed: false,
    phase6_1_entry_allowed: false,
    current_source_coverage: {
      coverage_scope: "baseline_only",
      full_site_captured: false,
      baseline_item_count: 3,
      baseline_complete_count: 3,
      items: coverageItems,
      coverage_boundary_notes: [
        "Only 3 items from the ruankaodaren knowledge base have been captured: 1.3, 13.3, 9.1",
        "The site contains many more knowledge points across multiple exam subjects and chapters",
        "No section-level or full-site crawl has been executed; coverage is sample-only",
        "13.3 remains taxonomy_suspect; its status cannot be resolved without live taxonomy recheck",
        "Coverage cannot be claimed as representative of any exam chapter or subject area",
      ],
    },
    expansion_strategy: {
      candidate_groups: [
        {
          group_name: "confirmed_concept_card_items",
          priority: "high",
          item_type_filter: "taxonomy_suspect=false AND render_as=concept_card",
          prerequisite: "detail_entry_test passes for selected item; no taxonomy ambiguity",
        },
        {
          group_name: "confirmed_asset_card_items_after_manual_image_review",
          priority: "medium",
          item_type_filter: "taxonomy_suspect=false AND render_as=asset_card AND image_refs_count>0",
          prerequisite: "detail_entry_test passes; image download confirmed; asset manifest produced",
        },
        {
          group_name: "taxonomy_suspect_items_after_recheck",
          priority: "low",
          item_type_filter: "taxonomy_suspect=true",
          prerequisite: "live taxonomy recheck confirms leaf node status; children enumerated or confirmed absent",
        },
      ],
      expansion_batch_size: {
        min: 1,
        max: 5,
        rationale: "Small batches (1-5) limit risk from taxonomy errors, auth state expiry, or crawler breakage; each batch must be validated before proceeding to next",
      },
      first_batch_goal:
        "Capture 1-3 additional concept_card items from the same exam subject areas (e.g., Chapter 1 or Chapter 9) where taxonomy_suspect=false and detail_entry_test can be verified",
      no_full_site_bulk_capture: true,
      no_unbounded_crawler: true,
      no_renderer_bulk_run: true,
    },
    taxonomy_13_3_policy: {
      title: "13.3 软件架构风格",
      taxonomy_suspect: true,
      is_multi_card_sequence_possible: true,
      must_recheck_children_before_leaf_modeling: true,
      suggested_recheck_targets: [
        "Navigate to 13.3 in the live site taxonomy tree and enumerate child nodes",
        "Confirm whether 13.3 is a leaf node or a parent with child knowledge points",
        "If children exist (e.g., 13.3.1, 13.3.2, …), capture each child as a separate item",
        "Do not assume the current short_card is the complete content for 13.3",
        "Re-run detail_entry_test for 13.3 to confirm content shape and text length",
      ],
      must_not_claim_complete: true,
      expansion_blocked_until_recheck: true,
    },
    detail_entry_test_gate: {
      detail_entry_test_required_before_expansion: true,
      rationale:
        "Phase 2.11 confirmed that detail_entry_route_changed=true but body_text_length_after=521 < before=687, indicating the detail page may not have fully rendered. Any new item must pass a detail_entry_test before being accepted into the expansion batch.",
      accepted_signals: [
        "detail_entry_success=true",
        "detail_entry_route_changed=true",
        "body_text_length_after > 200 AND contains recognizable knowledge content",
        "XHR or DOM confirms non-trivial content loaded",
      ],
      blocked_if: [
        "body_text_length_after < body_text_length_before (content may not have rendered)",
        "detail_entry_success=false",
        "detail_entry_route_changed=false",
        "auth_state expired or missing",
        "XHR returns only encrypt=1 with no DOM fallback",
      ],
    },
    source_artifact_policy: {
      required_artifacts: [
        "raw snapshot (HTML or DOM text) from detail entry page",
        "intermediate JSON with extracted text and content shape classification",
        "asset manifest if image_refs_count > 0 or asset_refs_count > 0",
        "asset image files if asset_refs_count > 0",
        "official Markdown document in docs/ruankaodaren/baseline/",
        "source-packet.json entry for the item with all required fields",
      ],
      forbidden_source_shortcuts: [
        "Do not fabricate source_content from official Markdown",
        "Do not backfill intermediate JSON from official Markdown",
        "Do not use OCR as sole source of content",
        "Do not decrypt or reverse-engineer encrypted XHR",
        "Do not reconstruct image tables without verified source data",
        "Do not invent content when raw snapshot is missing or empty",
        "Do not reuse another item's intermediate JSON as a proxy",
      ],
    },
    asset_manifest_policy: {
      required_when: [
        "image_refs_count > 0",
        "asset_refs_count > 0",
        "renderer_policy requires asset_card",
        "content_shape = MIXED_TEXT_IMAGE",
      ],
      not_required_when: [
        "image_refs_count = 0 AND asset_refs_count = 0",
        "content_shape = STATIC_LOW_TEXT_VERIFIED",
        "render_as = short_card",
        "render_as = concept_card AND no image refs detected",
      ],
    },
    missing_record_policy: {
      if_source_artifact_missing: [
        "Record the missing artifact in the item's missing_artifacts array in source-packet.json",
        "Do NOT fabricate the missing artifact",
        "Do NOT backfill from official Markdown",
        "Do NOT generate AI learning layer for an item with missing source artifacts",
        "Set item source_layer_status = missing",
        "Do NOT claim source_packet_complete = true for items with missing_artifacts",
      ],
    },
    phase6_1_entry_gate: {
      phase6_1_entry_allowed: false,
      required_before_phase6_1: [
        "explicit_user_approval of Phase 6.0 expansion plan",
        "selected_batch_scope defined (which specific items to capture)",
        "taxonomy_recheck_plan confirmed for 13.3 before expanding chapter 13",
        "auth_state_confirmed if web access is required",
        "no_dirty_worktree (git status clean)",
        "crawler_scope_limited to selected batch items only",
        "renderer_scope_limited to selected batch items only",
        "source_artifact_policy_validated for each selected item",
        "missing_record_policy_validated and understood",
      ],
    },
    artifact_commit_policy: {
      commit_allowed: [
        "schemas/ruankaodaren-controlled-source-expansion-plan.schema.json",
        "packages/domain-types/ruankaodaren-controlled-source-expansion-plan.ts",
        "scripts/build-ruankaodaren-controlled-source-expansion-plan.ts",
        "scripts/validate-ruankaodaren-controlled-source-expansion-plan.ts",
        "verification/phase6_0_controlled_source_expansion_plan.md",
        "verification/generated/phase6_0_controlled_source_expansion_plan.json",
        "verification/generated/phase6_0_controlled_source_expansion_plan.md",
        "package.json (script additions only)",
        "scripts/verify-structure.ts (Phase 6.0 file additions only)",
      ],
      commit_forbidden: [
        "Crawled raw snapshots",
        "Recovered source artifacts",
        "Intermediate generated artifacts from new items",
        "Asset images from new items",
        "Official Markdown rewrite",
        "AI learning content",
        "Dry-run content",
        ".auth files",
        "node_modules",
        "pnpm-workspace.yaml",
        "Any file from stash@{0}",
        "Approval result instance",
      ],
    },
  };

  // Write JSON output
  if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true });
  writeFileSync(jsonOutputPath, JSON.stringify(plan, null, 2), "utf8");
  console.log(`[build:controlled-source-expansion-plan] Written: ${toRepoPath(jsonOutputPath)}`);

  // Build Markdown report
  const md = buildMarkdown(plan);
  writeFileSync(mdOutputPath, md, "utf8");
  console.log(`[build:controlled-source-expansion-plan] Written: ${toRepoPath(mdOutputPath)}`);

  console.log("[build:controlled-source-expansion-plan] Phase 6.0 Controlled Source Expansion Plan complete.");
  console.log(`[build:controlled-source-expansion-plan] phase6_1_entry_allowed: ${String(plan.phase6_1_entry_allowed)}`);
  console.log(`[build:controlled-source-expansion-plan] execution_allowed: ${String(plan.execution_allowed)}`);
  console.log(`[build:controlled-source-expansion-plan] crawler_allowed: ${String(plan.crawler_allowed)}`);
}

function buildMarkdown(plan: RuankaoControlledSourceExpansionPlan): string {
  const lines: string[] = [
    "# Phase 6.0 Controlled Source Expansion Plan",
    "",
    `**plan_version**: ${plan.plan_version}`,
    `**source_name**: ${plan.source_name}`,
    `**created_at**: ${plan.created_at}`,
    `**plan_scope**: ${plan.plan_scope}`,
    "",
    "## Execution Flags (all false)",
    "",
    `- execution_allowed: ${String(plan.execution_allowed)}`,
    `- crawler_allowed: ${String(plan.crawler_allowed)}`,
    `- renderer_allowed: ${String(plan.renderer_allowed)}`,
    `- recovery_allowed: ${String(plan.recovery_allowed)}`,
    `- web_requests_allowed: ${String(plan.web_requests_allowed)}`,
    `- raw_html_direct_read_allowed: ${String(plan.raw_html_direct_read_allowed)}`,
    `- raw_xhr_direct_read_allowed: ${String(plan.raw_xhr_direct_read_allowed)}`,
    `- ocr_allowed: ${String(plan.ocr_allowed)}`,
    `- encrypted_xhr_decryption_allowed: ${String(plan.encrypted_xhr_decryption_allowed)}`,
    `- image_table_reconstruction_allowed: ${String(plan.image_table_reconstruction_allowed)}`,
    `- source_layer_modification_allowed: ${String(plan.source_layer_modification_allowed)}`,
    `- official_markdown_modification_allowed: ${String(plan.official_markdown_modification_allowed)}`,
    `- ai_learning_generation_allowed: ${String(plan.ai_learning_generation_allowed)}`,
    `- phase6_1_entry_allowed: ${String(plan.phase6_1_entry_allowed)}`,
    "",
    "## Current Source Coverage",
    "",
    `- coverage_scope: ${plan.current_source_coverage.coverage_scope}`,
    `- full_site_captured: ${String(plan.current_source_coverage.full_site_captured)}`,
    `- baseline_item_count: ${plan.current_source_coverage.baseline_item_count}`,
    `- baseline_complete_count: ${plan.current_source_coverage.baseline_complete_count}`,
    "",
    "### Baseline Items",
    "",
  ];
  for (const item of plan.current_source_coverage.items) {
    lines.push(
      `- **${item.title}**: source_layer_status=${item.source_layer_status}, taxonomy_suspect=${String(item.taxonomy_suspect)}, render_as=${item.render_as}`
    );
  }
  lines.push("", "### Coverage Boundary Notes", "");
  for (const note of plan.current_source_coverage.coverage_boundary_notes) {
    lines.push(`- ${note}`);
  }
  lines.push(
    "",
    "## Expansion Strategy",
    "",
    `- first_batch_goal: ${plan.expansion_strategy.first_batch_goal}`,
    `- expansion_batch_size: min=${plan.expansion_strategy.expansion_batch_size.min}, max=${plan.expansion_strategy.expansion_batch_size.max}`,
    `- no_full_site_bulk_capture: ${String(plan.expansion_strategy.no_full_site_bulk_capture)}`,
    `- no_unbounded_crawler: ${String(plan.expansion_strategy.no_unbounded_crawler)}`,
    `- no_renderer_bulk_run: ${String(plan.expansion_strategy.no_renderer_bulk_run)}`,
    "",
    "### Candidate Groups",
    ""
  );
  for (const group of plan.expansion_strategy.candidate_groups) {
    lines.push(
      `#### ${group.group_name}`,
      `- priority: ${group.priority}`,
      `- item_type_filter: ${group.item_type_filter}`,
      `- prerequisite: ${group.prerequisite}`,
      ""
    );
  }
  lines.push(
    "## 13.3 Taxonomy Policy",
    "",
    `- taxonomy_suspect: ${String(plan.taxonomy_13_3_policy.taxonomy_suspect)}`,
    `- is_multi_card_sequence_possible: ${String(plan.taxonomy_13_3_policy.is_multi_card_sequence_possible)}`,
    `- must_recheck_children_before_leaf_modeling: ${String(plan.taxonomy_13_3_policy.must_recheck_children_before_leaf_modeling)}`,
    `- must_not_claim_complete: ${String(plan.taxonomy_13_3_policy.must_not_claim_complete)}`,
    `- expansion_blocked_until_recheck: ${String(plan.taxonomy_13_3_policy.expansion_blocked_until_recheck)}`,
    "",
    "### Suggested Recheck Targets",
    ""
  );
  for (const target of plan.taxonomy_13_3_policy.suggested_recheck_targets) {
    lines.push(`- ${target}`);
  }
  lines.push(
    "",
    "## Detail Entry Test Gate",
    "",
    `- detail_entry_test_required_before_expansion: ${String(plan.detail_entry_test_gate.detail_entry_test_required_before_expansion)}`,
    `- rationale: ${plan.detail_entry_test_gate.rationale}`,
    "",
    "## Phase 6.1 Entry Gate",
    "",
    `- phase6_1_entry_allowed: ${String(plan.phase6_1_entry_gate.phase6_1_entry_allowed)}`,
    "",
    "### Required Before Phase 6.1",
    ""
  );
  for (const req of plan.phase6_1_entry_gate.required_before_phase6_1) {
    lines.push(`- ${req}`);
  }
  lines.push("", "## Artifact Commit Policy", "", "### Commit Allowed", "");
  for (const item of plan.artifact_commit_policy.commit_allowed) {
    lines.push(`- ${item}`);
  }
  lines.push("", "### Commit Forbidden", "");
  for (const item of plan.artifact_commit_policy.commit_forbidden) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  return lines.join("\n");
}

main();