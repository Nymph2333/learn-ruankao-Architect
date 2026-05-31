import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type CheckResult = {
  label: string;
  ok: boolean;
  detail?: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const requiredDirectories = [
  "sources",
  "sources/ruankaodaren/raw/html",
  "sources/ruankaodaren/raw/xhr",
  "sources/ruankaodaren/raw/screenshots",
  "sources/ruankaodaren/raw/screenshots/debug",
  "sources/ruankaodaren/raw/metadata",
  "sources/ruankaodaren/raw/dom-text",
  "sources/ruankaodaren/raw/containers",
  "sources/ruankaodaren/raw/accessibility",
  "sources/ruankaodaren/raw/storage",
  "sources/ruankaodaren/raw/outer-html",
  "sources/ruankaodaren/raw/network",
  "sources/ruankaodaren/raw/console",
  "sources/ruankaodaren/raw/assets",
  "sources/ruankaodaren/raw/assets/images",
  "sources/ruankaodaren/raw/assets/manifests",
  "data",
  "data/intermediate/ruankaodaren/samples",
  "data/intermediate/ruankaodaren/quarantine",
  "data/intermediate/ruankaodaren/diagnostics",
  "data/intermediate/ruankaodaren/probes",
  "rendered",
  "rendered/ruankaodaren",
  "rendered/ruankaodaren/dry-runs",
  "source-packets",
  "source-packets/ruankaodaren",
  "source-packets/ruankaodaren/baseline",
  "schemas",
  "packages/domain-types",
  "docs",
  "docs/ruankaodaren",
  "docs/ruankaodaren/baseline",
  "reviews/ruankaodaren/baseline",
  "templates",
  "templates/renderer",
  "scripts",
  "verification",
  "verification/generated",
  "verification/generated/phase3_14_live_replay_debug",
  "config"
];

const requiredFiles = [
  "AGENTS.md",
  "README.md",
  "config/crawler.yaml",
  "config/sources.yaml",
  "config/taxonomy.yaml",
  "templates/concept-card.md",
  "templates/case-analysis-card.md",
  "templates/paper-template.md",
  "verification/phase0-structure-check.md",
  "verification/phase2-crawler-check.md",
  "verification/phase2_6_auth_state_check.md",
  "verification/phase2_7_context_selection_check.md",
  "verification/phase2_9_interactive_content_harvesting_check.md",
  "verification/phase2_11_detail_entry_harvesting_check.md",
  "verification/phase2_12_detail_entry_snapshot_inspection.md",
  "verification/phase2_13_target_scoped_detail_entry_check.md",
  "verification/phase2_14_matched_detail_snapshot_inspection.md",
  "verification/phase3_0_parser_contract_check.md",
  "verification/phase3_1_intermediate_validation_check.md",
  "verification/phase2_15_asset_capture_check.md",
  "verification/phase3_2_multi_sample_parser_validation_check.md",
  "verification/phase3_3_controlled_multi_sample_acquisition_check.md",
  "verification/phase3_4_sample_quality_audit_check.md",
  "verification/phase3_5_leaf_level_target_acquisition_check.md",
  "verification/phase3_6_content_ready_leaf_acquisition_check.md",
  "verification/phase3_7_semantic_alignment_quarantine_check.md",
  "verification/phase3_8_aligned_leaf_acquisition_repair_check.md",
  "verification/phase3_9_preflight_gated_renderer_baseline_acquisition_check.md",
  "verification/phase3_10_deterministic_target_resolver_check.md",
  "verification/phase3_11_reachable_leaf_catalog_check.md",
  "verification/phase3_12_reachable_leaf_acquisition_check.md",
  "verification/phase3_13_catalog_backed_resolver_parity_check.md",
  "verification/phase3_14_live_dom_replay_parity_check.md",
  "verification/phase3_15_live_replay_verified_acquisition_check.md",
  "verification/phase3_16_detail_body_binding_audit_check.md",
  "verification/phase3_17_parser_semantic_evidence_hardening_check.md",
  "schemas/ruankaodaren-intermediate.schema.json",
  "schemas/ruankaodaren-asset-manifest.schema.json",
  "packages/domain-types/ruankaodaren-intermediate.ts",
  "packages/domain-types/ruankaodaren-asset-manifest.ts",
  "scripts/parse-ruankaodaren-outer-html.ts",
  "scripts/validate-ruankaodaren-intermediate.ts",
  "config/ruankaodaren-sample-targets.yaml",
  "scripts/run-ruankaodaren-sample-acquisition.ts",
  "scripts/audit-ruankaodaren-sample-quality.ts",
  "scripts/audit-ruankaodaren-semantic-alignment.ts",
  "scripts/audit-ruankaodaren-detail-binding.ts",
  "scripts/audit-ruankaodaren-parser-extraction.ts",
  "scripts/reparse-ruankaodaren-selected-samples.ts",
  "scripts/preflight-ruankaodaren-sample.ts",
  "scripts/lib/ruankaodaren-target-resolution.ts",
  "scripts/lib/ruankaodaren-dom-explorer.ts",
  "scripts/test-ruankaodaren-catalog-resolver.ts",
  "scripts/test-ruankaodaren-live-replay.ts",
  "scripts/test-ruankaodaren-baseline-detail-entry.ts",
  "scripts/diagnose-ruankaodaren-target-reachability.ts",
  "scripts/catalog-ruankaodaren-reachable-leaves.ts",
  "scripts/list-ruankaodaren-leaf-candidates.ts",
  "scripts/select-ruankaodaren-content-ready-candidates.ts",
  "data/intermediate/ruankaodaren/quarantine/.gitkeep",
  "data/intermediate/ruankaodaren/diagnostics/.gitkeep",
  "data/intermediate/ruankaodaren/probes/.gitkeep",
  "scripts/probe-ruankaodaren-content-rich-candidates.ts",
  "scripts/apply-ruankaodaren-probe-recommendations.ts",
  "verification/phase3_18_content_rich_candidate_probe_check.md",
  "scripts/report-ruankaodaren-sample-coverage.ts",
  "scripts/capture-ruankaodaren-assets.ts",
  "scripts/validate-ruankaodaren-assets.ts",
  "scripts/auth-ruankaodaren.ts",
  "scripts/crawl-ruankaodaren.ts",
  "scripts/verify-structure.ts",
  "scripts/test-ruankaodaren-detail-stabilization.ts",
  "verification/phase3_19_detail_content_stabilization_check.md",
  "scripts/discover-ruankaodaren-detail-interactions.ts",
  "scripts/probe-ruankaodaren-secondary-interactions.ts",
  "verification/phase3_20_detail_interaction_surface_discovery_check.md",
  "package.json",
  "tsconfig.json",
  ".gitignore",
  "scripts/audit-ruankaodaren-renderer-readiness.ts",
  "verification/phase3_21_renderer_readiness_threshold_recalibration_check.md",
  "verification/phase3_22_static_low_text_promotion_check.md",
  "scripts/build-ruankaodaren-renderer-baseline.ts",
  "verification/phase3_23_unique_renderer_baseline_manifest_check.md",
  "scripts/run-ruankaodaren-third-baseline-promotion.ts",
  "verification/phase3_24_third_unique_renderer_baseline_promotion_check.md",
  "schemas/ruankaodaren-renderer-input-contract.schema.json",
  "packages/domain-types/ruankaodaren-renderer-input-contract.ts",
  "scripts/build-ruankaodaren-renderer-input-contract.ts",
  "scripts/validate-ruankaodaren-renderer-input-contract.ts",
  "verification/phase3_25_renderer_input_contract_freeze_check.md",
  "templates/renderer/concept-card-renderer.md",
  "templates/renderer/short-card-renderer.md",
  "templates/renderer/asset-card-renderer.md",
  "templates/renderer/manual-review-card-renderer.md",
  "scripts/render-ruankaodaren-markdown-dry-run.ts",
  "scripts/validate-ruankaodaren-render-dry-run.ts",
  "verification/phase4_0_markdown_renderer_scaffold_check.md",
  "scripts/render-ruankaodaren-single-baseline.ts",
  "scripts/validate-ruankaodaren-single-baseline-render.ts",
  "verification/phase4_1_single_baseline_official_render_check.md",
  "scripts/render-ruankaodaren-baseline-set.ts",
  "scripts/validate-ruankaodaren-baseline-set-render.ts",
  "verification/phase4_2_three_baseline_official_render_check.md",
  "scripts/audit-ruankaodaren-render-quality.ts",
  "scripts/build-ruankaodaren-human-review-checklist.ts",
  "scripts/validate-ruankaodaren-render-quality-audit.ts",
  "verification/phase4_3_renderer_quality_audit_check.md",
  "scripts/report-ruankaodaren-renderer-policy-refinement.ts",
  "verification/phase4_4_renderer_policy_refinement_check.md",
  "schemas/ruankaodaren-human-review-status.schema.json",
  "schemas/ruankaodaren-dual-layer-document.schema.json",
  "schemas/ruankaodaren-source-packet.schema.json",
  "packages/domain-types/ruankaodaren-human-review-status.ts",
  "packages/domain-types/ruankaodaren-dual-layer-document.ts",
  "packages/domain-types/ruankaodaren-source-packet.ts",
  "scripts/build-ruankaodaren-human-review-status.ts",
  "scripts/validate-ruankaodaren-human-review-status.ts",
  "scripts/build-ruankaodaren-controlled-expansion-plan.ts",
  "scripts/validate-ruankaodaren-controlled-expansion-plan.ts",
  "scripts/validate-ruankaodaren-dual-layer-contract.ts",
  "scripts/build-ruankaodaren-source-packets.ts",
  "scripts/validate-ruankaodaren-source-packets.ts",
  "scripts/recover-ruankaodaren-baseline-source-artifacts.ts",
  "scripts/recheck-ruankaodaren-taxonomy.ts",
  "verification/phase4_5_human_review_signoff_and_controlled_expansion_plan_check.md",
  "verification/phase5_0_source_ai_dual_layer_contract_check.md",
  "verification/phase5_1_source_packet_builder_and_taxonomy_recheck.md",
  "verification/phase5_2_source_artifact_recovery_and_taxonomy_live_recheck.md",
  "verification/phase5_3_baseline_detail_entry_recovery_contract_repair.md"
];

const requiredContent: Record<string, string[]> = {
  "AGENTS.md": ["Non-Negotiable Output Structure"],
  "package.json": ["auth:ruankaodaren", "crawl:ruankaodaren", "parse:ruankaodaren", "validate:intermediate", "capture:assets", "validate:assets", "report:sample-coverage", "run:sample-acquisition", "audit:sample-quality", "audit:semantic-alignment", "audit:detail-binding", "audit:parser-extraction", "reparse:selected-samples", "preflight:sample", "test:catalog-resolver", "test:live-replay", "test:baseline-detail-entry", "diagnose:target-reachability", "catalog:reachable-leaves", "list:leaf-candidates", "select:content-ready-candidates", "probe:content-rich-candidates", "apply:probe-recommendations", "test:detail-stabilization", "discover:detail-interactions", "probe:secondary-interactions", "audit:renderer-readiness", "build:renderer-baseline", "build:renderer-input-contract", "validate:renderer-input-contract", "render:dry-run", "validate:render-dry-run", "render:single-baseline", "validate:single-baseline-render", "render:baseline-set", "validate:baseline-set-render", "audit:render-quality", "build:human-review-checklist", "validate:render-quality-audit", "report:renderer-policy-refinement", "build:human-review-status", "validate:human-review-status", "build:controlled-expansion-plan", "validate:controlled-expansion-plan", "validate:dual-layer-contract", "build:source-packets", "validate:source-packets", "recover:baseline-source-artifacts", "recheck:taxonomy", "run:third-baseline-promotion"],
  "verification/phase5_0_source_ai_dual_layer_contract_check.md": [
    "# Phase 5.0 Source + AI Learning Dual-layer Renderer Contract",
    "## 4. Source Layer Policy",
    "## 5. AI Learning Layer Policy",
    "## 6. Source Artifact Retention Policy",
    "## 7. Taxonomy Correction Policy",
    "## 8. Forbidden Actions",
    "Phase 5.1 Source Packet Builder and Taxonomy Recheck"
  ],
  "verification/phase5_1_source_packet_builder_and_taxonomy_recheck.md": [
    "# Phase 5.1 Source Packet Builder and Taxonomy Recheck",
    "## 4. Source Packet Policy",
    "## 5. Taxonomy Recheck Policy",
    "pnpm build:source-packets",
    "pnpm validate:source-packets",
    "pnpm recheck:taxonomy"
  ],
  "verification/phase5_2_source_artifact_recovery_and_taxonomy_live_recheck.md": [
    "# Phase 5.2 Source Artifact Recovery and Taxonomy Live Recheck",
    "## 3. Recovery Report",
    "## 4. Source Packet Refresh",
    "## 5. Taxonomy Live Recheck",
    "pnpm exec playwright install chromium",
    "pnpm recover:baseline-source-artifacts",
    "phase5_2_ai_generation_allowed",
    "No AI learning content generation"
  ],
  "verification/phase5_3_baseline_detail_entry_recovery_contract_repair.md": [
    "# Phase 5.3 Baseline Detail-entry Recovery Contract Repair",
    "## 1. Background",
    "## 2. Objective",
    "## 4. Parser Contract Requirements",
    "## 5. Detail Entry Binding Policy",
    "pnpm test:baseline-detail-entry",
    "No raw XHR direct read"
  ],
  "templates/concept-card.md": [
    "# <Concept English> / <中文术语>",
    "## 1. Core Concept / 核心概念",
    "## 2. Architectural Topology & Visualization / 架构拓扑与可视化",
    "```mermaid",
    "## 3. Deterministic Constraints / 决定论约束",
    "## 4. Trade-off Analysis / 权衡分析",
    "## 5. Failure Modes / 失效模式",
    "## 6. Ruankao Alignment / 软考考点映射",
    "Case Study Answer Pattern / 案例分析答题模式",
    "Paper Usage / 论文可复用方式",
    "## 7. Source Reference / 来源引用"
  ],
  "templates/case-analysis-card.md": [
    "## 1. Problem Background / 问题背景",
    "## 2. Current Architecture / 架构现状",
    "## 3. Key Constraints / 关键约束",
    "## 4. Failure Cause / 失效原因",
    "## 5. Improvement Plan / 改造方案",
    "## 6. Exam Answer Structure / 考试答题结构"
  ],
  "templates/paper-template.md": [
    "## 1. Project Background / 项目背景",
    "## 2. Architectural Problem / 架构问题",
    "## 3. Technology Selection / 技术选型",
    "## 4. Design Process / 设计过程",
    "## 5. Quality Attributes / 质量属性",
    "## 6. Effect Evaluation / 效果评估",
    "## 7. Reusable Expression / 可复用表达"
  ]
};

function pathFromRoot(relativePath: string): string {
  return resolve(repoRoot, relativePath);
}

function checkDirectory(relativePath: string): CheckResult {
  const absolutePath = pathFromRoot(relativePath);

  if (!existsSync(absolutePath)) {
    return {
      label: `directory ${relativePath}/`,
      ok: false,
      detail: "missing"
    };
  }

  if (!statSync(absolutePath).isDirectory()) {
    return {
      label: `directory ${relativePath}/`,
      ok: false,
      detail: "exists but is not a directory"
    };
  }

  return { label: `directory ${relativePath}/`, ok: true };
}

function checkFile(relativePath: string): CheckResult {
  const absolutePath = pathFromRoot(relativePath);

  if (!existsSync(absolutePath)) {
    return {
      label: `file ${relativePath}`,
      ok: false,
      detail: "missing"
    };
  }

  if (!statSync(absolutePath).isFile()) {
    return {
      label: `file ${relativePath}`,
      ok: false,
      detail: "exists but is not a file"
    };
  }

  return { label: `file ${relativePath}`, ok: true };
}

function checkContent(relativePath: string, snippets: string[]): CheckResult[] {
  const absolutePath = pathFromRoot(relativePath);

  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    return snippets.map((snippet) => ({
      label: `content ${relativePath} contains "${snippet}"`,
      ok: false,
      detail: "file missing"
    }));
  }

  const content = readFileSync(absolutePath, "utf8");

  return snippets.map((snippet) => ({
    label: `content ${relativePath} contains "${snippet}"`,
    ok: content.includes(snippet),
    detail: content.includes(snippet) ? undefined : "snippet missing"
  }));
}

function printResult(result: CheckResult): void {
  const marker = result.ok ? "[PASS]" : "[FAIL]";
  const detail = result.detail ? ` - ${result.detail}` : "";
  console.log(`${marker} ${result.label}${detail}`);
}

const results = [
  ...requiredDirectories.map(checkDirectory),
  ...requiredFiles.map(checkFile),
  ...Object.entries(requiredContent).flatMap(([relativePath, snippets]) =>
    checkContent(relativePath, snippets)
  )
];

for (const result of results) {
  printResult(result);
}

const failures = results.filter((result) => !result.ok);

if (failures.length > 0) {
  console.error(`\nStructure verification failed: ${failures.length} check(s) failed.`);
  process.exit(1);
}

console.log("\nStructure verification passed.");
