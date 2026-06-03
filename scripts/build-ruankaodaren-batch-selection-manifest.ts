/**
 * Phase 6.1 Batch Selection Manifest builder.
 *
 * Reads source-packet.json and the Phase 6.0 controlled source expansion plan
 * to produce a dormant batch selection manifest. All expansion gates remain
 * closed; this builder only records the proposed-inactive first batch intent.
 *
 * This builder does NOT:
 * - access web pages
 * - run the crawler
 * - run the renderer
 * - run recovery
 * - generate source artifacts
 * - modify the Source Layer
 * - generate AI learning content
 * - activate Phase 6.1 execution
 *
 * Usage:
 *   pnpm build:batch-selection-manifest
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { BatchSelectionManifest } from "../packages/domain-types/ruankaodaren-batch-selection-manifest.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const manifestsDir = resolve(repoRoot, "data/manifests");

const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";
const phase60PlanPath = "verification/generated/phase6_0_controlled_source_expansion_plan.json";
const manifestOutputPath = resolve(manifestsDir, "phase6_1_batch_selection_manifest.json");

function readJson<T>(relativePath: string): T {
  const absPath = resolve(repoRoot, relativePath);
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function ensureInputExists(relativePath: string): void {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    console.error(`[build:batch-selection-manifest] ERROR: missing required input: ${relativePath}`);
    process.exit(1);
  }
}

function fail(message: string): never {
  console.error(`[build:batch-selection-manifest] ERROR: ${message}`);
  process.exit(1);
}

function main(): void {
  console.log("[build:batch-selection-manifest] Phase 6.1 Batch Selection Manifest builder");

  // Check required inputs
  ensureInputExists(sourcePacketPath);
  ensureInputExists(phase60PlanPath);

  // Load source packet
  const sourcePacket = readJson<{
    items: Array<{ title: string; source_layer_status: string; taxonomy_suspect: boolean; render_as: string }>;
    overall_source_packet_status: string;
  }>(sourcePacketPath);
  const itemCount = sourcePacket.items.length;
  const completeCount = sourcePacket.items.filter((i) => i.source_layer_status === "complete").length;
  if (itemCount !== 3) fail(`baseline item_count must be 3, got ${itemCount}`);
  if (completeCount !== 3) fail(`baseline complete_count must be 3, got ${completeCount}`);
  console.log(`[build:batch-selection-manifest] Baseline: item_count=${itemCount}, complete_count=${completeCount} OK`);

  // Load Phase 6.0 plan and confirm gates remain blocked
  const plan = readJson<Record<string, unknown>>(phase60PlanPath);
  if (plan["phase6_1_entry_allowed"] !== false) fail("Phase 6.0 phase6_1_entry_allowed must be false");
  if (plan["execution_allowed"] !== false) fail("Phase 6.0 execution_allowed must be false");
  if (plan["crawler_allowed"] !== false) fail("Phase 6.0 crawler_allowed must be false");
  if (plan["ai_learning_generation_allowed"] !== false) fail("Phase 6.0 ai_learning_generation_allowed must be false");
  const taxonomy = plan["taxonomy_13_3_policy"] as Record<string, unknown> | undefined;
  if (!taxonomy) fail("Phase 6.0 taxonomy_13_3_policy missing");
  if (taxonomy["expansion_blocked_until_recheck"] !== true) fail("Phase 6.0 expansion_blocked_until_recheck must be true");
  if (taxonomy["taxonomy_suspect"] !== true) fail("Phase 6.0 taxonomy_suspect must be true");
  console.log("[build:batch-selection-manifest] Phase 6.0 gate check: all blocked flags confirmed OK");

  // Build manifest
  const manifest: BatchSelectionManifest = {
    manifest_version: "phase6.1",
    manifest_type: "controlled_source_expansion_batch_selection",
    status: "inactive_blocked",
    created_for_phase: "6.1",
    inherits_from_phase: "6.0",
    created_at: new Date().toISOString(),
    scope: {
      allowed: [
        "read_existing_phase6_0_plan",
        "read_existing_baseline_items",
        "read_existing_source_packets",
        "derive_batch_candidates",
        "write_batch_selection_manifest",
      ],
      forbidden: [
        "run_crawler",
        "run_renderer",
        "run_recovery",
        "make_web_requests",
        "modify_source_layer",
        "generate_ai_learning_content",
        "capture_assets",
        "create_raw_snapshots",
        "create_intermediate_json",
        "enter_phase6_1_execution",
      ],
    },
    phase_gates: {
      phase6_1_entry_allowed: false,
      expansion_blocked_until_recheck: true,
      taxonomy_suspect_13_3: true,
      human_review_required: true,
      activation_allowed: false,
    },
    batch_constraints: {
      min_batch_size: 1,
      max_batch_size: 5,
      actual_selected_count: 1,
      selection_mode: "proposed_only",
      execution_mode: "blocked_until_recheck",
    },
    baseline_context: {
      baseline_item_count: 3,
      baseline_complete_count: 3,
      full_site_captured: false,
    },
    candidate_items: [
      {
        item_id: "1.3",
        title: "指令系统CISC和RISC",
        candidate_status: "proposed_primary",
        risk_level: "low",
        reason:
          "Leaf item with limited expansion surface; suitable as first controlled expansion candidate after gates are reopened.",
        known_issue: "MIXED_TEXT_IMAGE",
        selection_allowed_now: false,
        proposed_for_first_batch: true,
      },
      {
        item_id: "9.1",
        title: "信息安全基础知识",
        candidate_status: "deferred_candidate",
        risk_level: "medium",
        reason:
          "Suspected internal multi-card topic; expansion should wait until boundary verification is complete.",
        known_issue: "suspect_leaf_or_internal_multi_card",
        selection_allowed_now: false,
        proposed_for_first_batch: false,
      },
      {
        item_id: "13.3",
        title: "软件架构风格",
        candidate_status: "blocked",
        risk_level: "high",
        reason: "Taxonomy suspect item; must not be selected before taxonomy recheck.",
        known_issue: "taxonomy_suspect_13_3",
        selection_allowed_now: false,
        proposed_for_first_batch: false,
      },
    ],
    proposed_batch: {
      batch_id: "phase6_1_batch_001",
      status: "proposed_inactive",
      items: [
        {
          item_id: "1.3",
          title: "指令系统CISC和RISC",
          selection_reason:
            "Smallest controllable expansion surface; lowest structural ambiguity among the three baseline items.",
          execution_allowed: false,
        },
      ],
    },
    activation_conditions: [
      "phase6_1_entry_allowed must be true",
      "expansion_blocked_until_recheck must be false",
      "taxonomy_suspect_13_3 must be resolved or explicitly quarantined",
      "human review gate must approve controlled expansion",
      "source packet validation must pass",
      "batch size must remain between 1 and 5",
      "no crawler or renderer may run during manifest validation",
    ],
    validation_expectations: {
      must_pass: [
        "validate:controlled-source-expansion-plan",
        "validate:source-packets",
        "validate:dual-layer-contract",
      ],
      must_not_trigger: [
        "crawler",
        "renderer",
        "recovery",
        "web_requests",
        "ai_learning_generation",
      ],
    },
    final_decision: {
      batch_selected: true,
      batch_executable: false,
      selected_batch_id: "phase6_1_batch_001",
      selected_items: ["1.3"],
      blocked_items: ["13.3"],
      deferred_items: ["9.1"],
    },
  };

  // Write manifest
  if (!existsSync(manifestsDir)) mkdirSync(manifestsDir, { recursive: true });
  writeFileSync(manifestOutputPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`[build:batch-selection-manifest] Written: data/manifests/phase6_1_batch_selection_manifest.json`);

  // Summary
  console.log("[build:batch-selection-manifest] ===");
  console.log(`[build:batch-selection-manifest] manifest_version:        ${manifest.manifest_version}`);
  console.log(`[build:batch-selection-manifest] status:                  ${manifest.status}`);
  console.log(`[build:batch-selection-manifest] phase6_1_entry_allowed:  ${manifest.phase_gates.phase6_1_entry_allowed}`);
  console.log(`[build:batch-selection-manifest] activation_allowed:      ${manifest.phase_gates.activation_allowed}`);
  console.log(`[build:batch-selection-manifest] batch_executable:        ${manifest.final_decision.batch_executable}`);
  console.log(`[build:batch-selection-manifest] selected_batch_id:       ${manifest.final_decision.selected_batch_id}`);
  console.log(`[build:batch-selection-manifest] selected_items:          ${manifest.final_decision.selected_items.join(", ")}`);
  console.log(`[build:batch-selection-manifest] blocked_items:           ${manifest.final_decision.blocked_items.join(", ")}`);
  console.log(`[build:batch-selection-manifest] deferred_items:          ${manifest.final_decision.deferred_items.join(", ")}`);
  console.log("[build:batch-selection-manifest] PASS");
}

main();
