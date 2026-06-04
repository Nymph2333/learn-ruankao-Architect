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
  "prompts",
  "prompts/ruankaodaren",
  "prompts/ruankaodaren/ai-learning",
  "schemas",
  "packages/domain-types",
  "docs",
  "docs/ruankaodaren",
  "docs/ruankaodaren/baseline",
  "docs/specs",
  "data/manifests",
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
  "schemas/ruankaodaren-ai-learning-prompt-contract.schema.json",
  "schemas/ruankaodaren-ai-learning-dry-run-contract.schema.json",
  "schemas/ruankaodaren-ai-learning-dry-run-request-manifest.schema.json",
  "schemas/ruankaodaren-ai-learning-dry-run-execution-contract.schema.json",
  "schemas/ruankaodaren-ai-learning-dry-run-readiness-check.schema.json",
  "schemas/ruankaodaren-ai-learning-human-review-request-package.schema.json",
  "packages/domain-types/ruankaodaren-human-review-status.ts",
  "packages/domain-types/ruankaodaren-dual-layer-document.ts",
  "packages/domain-types/ruankaodaren-source-packet.ts",
  "packages/domain-types/ruankaodaren-ai-learning-prompt-contract.ts",
  "packages/domain-types/ruankaodaren-ai-learning-dry-run-contract.ts",
  "packages/domain-types/ruankaodaren-ai-learning-dry-run-request-manifest.ts",
  "packages/domain-types/ruankaodaren-ai-learning-dry-run-execution-contract.ts",
  "packages/domain-types/ruankaodaren-ai-learning-dry-run-readiness-check.ts",
  "packages/domain-types/ruankaodaren-ai-learning-human-review-request-package.ts",
  "scripts/build-ruankaodaren-human-review-status.ts",
  "scripts/validate-ruankaodaren-human-review-status.ts",
  "scripts/build-ruankaodaren-controlled-expansion-plan.ts",
  "scripts/validate-ruankaodaren-controlled-expansion-plan.ts",
  "scripts/validate-ruankaodaren-dual-layer-contract.ts",
  "scripts/build-ruankaodaren-source-packets.ts",
  "scripts/validate-ruankaodaren-source-packets.ts",
  "scripts/build-ruankaodaren-ai-learning-prompt-contract.ts",
  "scripts/validate-ruankaodaren-ai-learning-prompt-contract.ts",
  "scripts/build-ruankaodaren-ai-learning-dry-run-contract.ts",
  "scripts/validate-ruankaodaren-ai-learning-dry-run-contract.ts",
  "scripts/build-ruankaodaren-ai-learning-dry-run-request-manifest.ts",
  "scripts/validate-ruankaodaren-ai-learning-dry-run-request-manifest.ts",
  "scripts/build-ruankaodaren-ai-learning-dry-run-execution-contract.ts",
  "scripts/validate-ruankaodaren-ai-learning-dry-run-execution-contract.ts",
  "scripts/build-ruankaodaren-ai-learning-dry-run-readiness-check.ts",
  "scripts/validate-ruankaodaren-ai-learning-dry-run-readiness-check.ts",
  "scripts/build-ruankaodaren-ai-learning-human-review-request-package.ts",
  "scripts/validate-ruankaodaren-ai-learning-human-review-request-package.ts",
  "scripts/build-ruankaodaren-ai-learning-human-review-approval-gate.ts",
  "scripts/validate-ruankaodaren-ai-learning-human-review-approval-gate.ts",
  "scripts/recover-ruankaodaren-baseline-source-artifacts.ts",
  "scripts/recheck-ruankaodaren-taxonomy.ts",
  "prompts/ruankaodaren/ai-learning/asset-card-ai-learning.prompt.md",
  "prompts/ruankaodaren/ai-learning/short-card-ai-learning.prompt.md",
  "prompts/ruankaodaren/ai-learning/concept-card-ai-learning.prompt.md",
  "prompts/ruankaodaren/ai-learning/manual-review-ai-learning.prompt.md",
  "verification/phase4_5_human_review_signoff_and_controlled_expansion_plan_check.md",
  "verification/phase5_0_source_ai_dual_layer_contract_check.md",
  "verification/phase5_1_source_packet_builder_and_taxonomy_recheck.md",
  "verification/phase5_2_source_artifact_recovery_and_taxonomy_live_recheck.md",
  "verification/phase5_3_baseline_detail_entry_recovery_contract_repair.md",
  "verification/phase5_4_compliance_addendum.md",
  "verification/phase5_4_ai_learning_prompt_contract_check.md",
  "verification/phase5_5_ai_learning_dry_run_contract_check.md",
  "verification/phase5_6_ai_learning_dry_run_request_manifest_check.md",
  "verification/phase5_7_ai_learning_dry_run_execution_contract_check.md",
  "verification/phase5_8_ai_learning_dry_run_readiness_check.md",
  "verification/phase5_9_ai_learning_human_review_request_package.md",
  "verification/phase5_10_ai_learning_human_review_approval_gate.md",
  "schemas/ruankaodaren-ai-learning-human-review-approval-gate.schema.json",
  "packages/domain-types/ruankaodaren-ai-learning-human-review-approval-gate.ts",
  "verification/generated/phase5_5_ai_learning_dry_run_contract.json",
  "verification/generated/phase5_5_ai_learning_dry_run_contract.md",
  "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json",
  "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.md",
  "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json",
  "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.md",
  "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json",
  "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.md",
  "verification/generated/phase5_9_ai_learning_human_review_request_package.json",
  "verification/generated/phase5_9_ai_learning_human_review_request_package.md",
  "verification/generated/phase5_10_ai_learning_human_review_approval_gate.json",
  "verification/generated/phase5_10_ai_learning_human_review_approval_gate.md",
  "verification/phase6_0_controlled_source_expansion_plan.md",
  "schemas/ruankaodaren-controlled-source-expansion-plan.schema.json",
  "packages/domain-types/ruankaodaren-controlled-source-expansion-plan.ts",
  "scripts/build-ruankaodaren-controlled-source-expansion-plan.ts",
  "scripts/validate-ruankaodaren-controlled-source-expansion-plan.ts",
  "verification/generated/phase6_0_controlled_source_expansion_plan.json",
  "verification/generated/phase6_0_controlled_source_expansion_plan.md",
  "docs/specs/010_phase6_1_batch_selection_manifest.md",
  "schemas/ruankaodaren-batch-selection-manifest.schema.json",
  "packages/domain-types/ruankaodaren-batch-selection-manifest.ts",
  "scripts/build-ruankaodaren-batch-selection-manifest.ts",
  "scripts/validate-ruankaodaren-batch-selection-manifest.ts",
  "data/manifests/phase6_1_batch_selection_manifest.json",
  "docs/specs/011_phase6_2_gate_recheck_and_taxonomy_quarantine.md",
  "schemas/ruankaodaren-gate-recheck-manifest.schema.json",
  "packages/domain-types/ruankaodaren-gate-recheck-manifest.ts",
  "scripts/validate-ruankaodaren-gate-recheck-manifest.ts",
  "data/manifests/phase6_2_gate_recheck_manifest.json",
  "docs/specs/012_phase6_3_batch_activation_readiness_preflight.md",
  "schemas/ruankaodaren-activation-readiness-preflight.schema.json",
  "packages/domain-types/ruankaodaren-activation-readiness-preflight.ts",
  "scripts/validate-ruankaodaren-activation-readiness-preflight.ts",
  "data/manifests/phase6_3_activation_readiness_preflight_manifest.json",
  "docs/specs/013_phase6_4_batch_activation_human_approval_request.md",
  "schemas/ruankaodaren-batch-activation-human-approval-request.schema.json",
  "packages/domain-types/ruankaodaren-batch-activation-human-approval-request.ts",
  "scripts/validate-ruankaodaren-batch-activation-human-approval-request.ts",
  "data/manifests/phase6_4_batch_activation_human_approval_request.json",
  "docs/specs/014_phase6_5_batch_activation_human_approval_decision.md",
  "schemas/ruankaodaren-batch-activation-human-approval-decision.schema.json",
  "packages/domain-types/ruankaodaren-batch-activation-human-approval-decision.ts",
  "scripts/validate-ruankaodaren-batch-activation-human-approval-decision.ts",
  "data/manifests/phase6_5_batch_activation_human_approval_decision.json",
  "docs/specs/015_phase6_6_batch_execution_readiness_preflight.md",
  "schemas/ruankaodaren-batch-execution-readiness-preflight.schema.json",
  "packages/domain-types/ruankaodaren-batch-execution-readiness-preflight.ts",
  "scripts/validate-ruankaodaren-batch-execution-readiness-preflight.ts",
  "data/manifests/phase6_6_batch_execution_readiness_preflight.json",
  "docs/specs/016_phase6_7_batch_execution_human_approval_request.md",
  "schemas/ruankaodaren-batch-execution-human-approval-request.schema.json",
  "packages/domain-types/ruankaodaren-batch-execution-human-approval-request.ts",
  "scripts/validate-ruankaodaren-batch-execution-human-approval-request.ts",
  "data/manifests/phase6_7_batch_execution_human_approval_request.json",
  "docs/specs/017_phase6_8_batch_execution_human_approval_decision.md",
  "schemas/ruankaodaren-batch-execution-human-approval-decision.schema.json",
  "packages/domain-types/ruankaodaren-batch-execution-human-approval-decision.ts",
  "scripts/validate-ruankaodaren-batch-execution-human-approval-decision.ts",
  "data/manifests/phase6_8_batch_execution_human_approval_decision.json",
  "docs/specs/018_phase6_9_controlled_batch_execution_plan.md",
  "schemas/ruankaodaren-controlled-batch-execution-plan.schema.json",
  "packages/domain-types/ruankaodaren-controlled-batch-execution-plan.ts",
  "scripts/validate-ruankaodaren-controlled-batch-execution-plan.ts",
  "data/manifests/phase6_9_controlled_batch_execution_plan.json",
  "docs/specs/019_phase6_10_operational_gate_approval_request.md",
  "schemas/ruankaodaren-operational-gate-approval-request.schema.json",
  "packages/domain-types/ruankaodaren-operational-gate-approval-request.ts",
  "scripts/validate-ruankaodaren-operational-gate-approval-request.ts",
  "data/manifests/phase6_10_operational_gate_approval_request.json",
  "docs/specs/020_phase6_11_operational_gate_approval_decision.md",
  "schemas/ruankaodaren-operational-gate-approval-decision.schema.json",
  "packages/domain-types/ruankaodaren-operational-gate-approval-decision.ts",
  "scripts/validate-ruankaodaren-operational-gate-approval-decision.ts",
  "data/manifests/phase6_11_operational_gate_approval_decision.json",
  "docs/specs/021_phase6_12_offline_batch_run_plan.md",
  "schemas/ruankaodaren-offline-batch-run-plan.schema.json",
  "packages/domain-types/ruankaodaren-offline-batch-run-plan.ts",
  "scripts/validate-ruankaodaren-offline-batch-run-plan.ts",
  "data/manifests/phase6_12_offline_batch_run_plan.json",
  "docs/specs/022_phase6_13_offline_batch_run_command_approval_request.md",
  "schemas/ruankaodaren-offline-batch-run-command-approval-request.schema.json",
  "packages/domain-types/ruankaodaren-offline-batch-run-command-approval-request.ts",
  "scripts/validate-ruankaodaren-offline-batch-run-command-approval-request.ts",
  "data/manifests/phase6_13_offline_batch_run_command_approval_request.json",
  "docs/specs/023_phase6_14_offline_batch_run_command_approval_decision.md",
  "schemas/ruankaodaren-offline-batch-run-command-approval-decision.schema.json",
  "packages/domain-types/ruankaodaren-offline-batch-run-command-approval-decision.ts",
  "scripts/validate-ruankaodaren-offline-batch-run-command-approval-decision.ts",
  "data/manifests/phase6_14_offline_batch_run_command_approval_decision.json",
  "docs/specs/024_phase6_15_offline_batch_dry_run_plan.md",
  "schemas/ruankaodaren-offline-batch-dry-run-plan.schema.json",
  "packages/domain-types/ruankaodaren-offline-batch-dry-run-plan.ts",
  "scripts/validate-ruankaodaren-offline-batch-dry-run-plan.ts",
  "data/manifests/phase6_15_offline_batch_dry_run_plan.json",
  "docs/specs/025_phase6_16_offline_batch_dry_run_approval_request.md",
  "schemas/ruankaodaren-offline-batch-dry-run-approval-request.schema.json",
  "packages/domain-types/ruankaodaren-offline-batch-dry-run-approval-request.ts",
  "scripts/validate-ruankaodaren-offline-batch-dry-run-approval-request.ts",
  "data/manifests/phase6_16_offline_batch_dry_run_approval_request.json",
  "docs/specs/026_phase6_17_offline_batch_dry_run_approval_decision.md",
  "schemas/ruankaodaren-offline-batch-dry-run-approval-decision.schema.json",
  "packages/domain-types/ruankaodaren-offline-batch-dry-run-approval-decision.ts",
  "scripts/validate-ruankaodaren-offline-batch-dry-run-approval-decision.ts",
  "data/manifests/phase6_17_offline_batch_dry_run_approval_decision.json"
];

const requiredContent: Record<string, string[]> = {
  "AGENTS.md": ["Non-Negotiable Output Structure"],
  "package.json": ["auth:ruankaodaren", "crawl:ruankaodaren", "parse:ruankaodaren", "validate:intermediate", "capture:assets", "validate:assets", "report:sample-coverage", "run:sample-acquisition", "audit:sample-quality", "audit:semantic-alignment", "audit:detail-binding", "audit:parser-extraction", "reparse:selected-samples", "preflight:sample", "test:catalog-resolver", "test:live-replay", "test:baseline-detail-entry", "diagnose:target-reachability", "catalog:reachable-leaves", "list:leaf-candidates", "select:content-ready-candidates", "probe:content-rich-candidates", "apply:probe-recommendations", "test:detail-stabilization", "discover:detail-interactions", "probe:secondary-interactions", "audit:renderer-readiness", "build:renderer-baseline", "build:renderer-input-contract", "validate:renderer-input-contract", "render:dry-run", "validate:render-dry-run", "render:single-baseline", "validate:single-baseline-render", "render:baseline-set", "validate:baseline-set-render", "audit:render-quality", "build:human-review-checklist", "validate:render-quality-audit", "report:renderer-policy-refinement", "build:human-review-status", "validate:human-review-status", "build:controlled-expansion-plan", "validate:controlled-expansion-plan", "validate:dual-layer-contract", "build:source-packets", "validate:source-packets", "build:ai-learning-prompt-contract", "validate:ai-learning-prompt-contract", "build:ai-learning-dry-run-contract", "validate:ai-learning-dry-run-contract", "build:ai-learning-dry-run-request-manifest", "validate:ai-learning-dry-run-request-manifest", "build:ai-learning-dry-run-execution-contract", "validate:ai-learning-dry-run-execution-contract", "build:ai-learning-dry-run-readiness-check", "validate:ai-learning-dry-run-readiness-check", "build:ai-learning-human-review-request-package", "validate:ai-learning-human-review-request-package", "build:ai-learning-human-review-approval-gate", "validate:ai-learning-human-review-approval-gate", "build:controlled-source-expansion-plan", "validate:controlled-source-expansion-plan", "build:batch-selection-manifest", "validate:batch-selection-manifest", "validate:gate-recheck-manifest", "validate:activation-readiness-preflight", "validate:batch-activation-human-approval-request", "validate:batch-activation-human-approval-decision", "validate:batch-execution-readiness-preflight", "validate:batch-execution-human-approval-request", "validate:batch-execution-human-approval-decision", "validate:controlled-batch-execution-plan", "validate:operational-gate-approval-request", "validate:operational-gate-approval-decision", "validate:offline-batch-run-plan", "validate:offline-batch-run-command-approval-request", "validate:offline-batch-run-command-approval-decision", "validate:offline-batch-dry-run-plan", "validate:offline-batch-dry-run-approval-request", "validate:offline-batch-dry-run-approval-decision", "recover:baseline-source-artifacts", "recheck:taxonomy", "run:third-baseline-promotion"],
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
  "verification/phase5_4_ai_learning_prompt_contract_check.md": [
    "# Phase 5.4 AI Learning Layer Prompt Contract",
    "## 4. Source Layer Binding",
    "## 5. AI Learning Sections",
    "## 6. Content Shape Policies",
    "## 7. Taxonomy-suspect Policy",
    "pnpm build:ai-learning-prompt-contract",
    "pnpm validate:ai-learning-prompt-contract"
  ],
  "verification/phase5_4_compliance_addendum.md": [
    "# Phase 5.4 Compliance Addendum",
    "## 1. Source Packet Gate Audit",
    "complete_count: 3",
    "source packet repair attempted: false",
    "## 4. Validator Coverage Addendum",
    "## 5. Git Status Audit"
  ],
  "verification/phase5_5_ai_learning_dry_run_contract_check.md": [
    "# Phase 5.5 AI Learning Dry-run Contract",
    "## 4. Dry-run Contract Policy",
    "## 5. Output Isolation Policy",
    "## 6. Review Gate State Machine",
    "pnpm build:ai-learning-dry-run-contract",
    "pnpm validate:ai-learning-dry-run-contract"
  ],
  "verification/generated/phase5_5_ai_learning_dry_run_contract.json": [
    "\"contract_version\": \"phase5.5\"",
    "\"dry_run_allowed\": \"request_only\"",
    "\"generation_allowed\": false",
    "\"review_gate_required\": true",
    "\"auto_approval\": false"
  ],
  "verification/generated/phase5_5_ai_learning_dry_run_contract.md": [
    "# Phase 5.5 AI Learning Dry-run Contract",
    "dry_run_allowed: request_only",
    "generation_allowed: false",
    "review_gate_required: true",
    "phase5_6_generation_allowed: false"
  ],
  "verification/phase5_6_ai_learning_dry_run_request_manifest_check.md": [
    "# Phase 5.6 AI Learning Dry-run Request Manifest",
    "## 4. Manifest Policy",
    "## 5. Item Eligibility Policy",
    "## 7. Output Isolation Policy",
    "pnpm build:ai-learning-dry-run-request-manifest",
    "pnpm validate:ai-learning-dry-run-request-manifest"
  ],
  "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json": [
    "\"manifest_version\": \"phase5.6\"",
    "\"manifest_scope\": \"dry_run_request_manifest_only\"",
    "\"generation_allowed\": false",
    "\"dry_run_generation_allowed\": false",
    "\"phase5_7_entry_allowed\": false"
  ],
  "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.md": [
    "# Phase 5.6 AI Learning Dry-run Request Manifest",
    "manifest_version: phase5.6",
    "generation_allowed: false",
    "dry_run_generation_allowed: false",
    "phase5_7_entry_allowed: false"
  ],
  "verification/phase5_7_ai_learning_dry_run_execution_contract_check.md": [
    "# Phase 5.7 AI Learning Dry-run Execution Contract",
    "## 3. Execution Input Bundle Contract",
    "## 4. Execution Output Format Contract",
    "## 5. Execution Status Machine",
    "pnpm build:ai-learning-dry-run-execution-contract",
    "pnpm validate:ai-learning-dry-run-execution-contract"
  ],
  "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json": [
    "\"contract_version\": \"phase5.7\"",
    "\"contract_scope\": \"dry_run_execution_contract_only\"",
    "\"generation_allowed\": false",
    "\"dry_run_execution_allowed\": false",
    "\"phase5_8_entry_allowed\": false"
  ],
  "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.md": [
    "# Phase 5.7 AI Learning Dry-run Execution Contract",
    "contract_version: phase5.7",
    "execution_mode: contract_only",
    "generation_allowed: false",
    "dry_run_execution_allowed: false",
    "phase5_8_entry_allowed: false"
  ],
  "verification/phase5_8_ai_learning_dry_run_readiness_check.md": [
    "# Phase 5.8 AI Learning Dry-run Execution Readiness Check",
    "## 3. Readiness Item Policy",
    "## 4. Input Bundle Constructability",
    "## 6. Phase 5.9 Entry Policy",
    "pnpm build:ai-learning-dry-run-readiness-check",
    "pnpm validate:ai-learning-dry-run-readiness-check"
  ],
  "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json": [
    "\"check_version\": \"phase5.8\"",
    "\"check_scope\": \"dry_run_execution_readiness_check_only\"",
    "\"generation_allowed\": false",
    "\"dry_run_execution_allowed\": false",
    "\"phase5_9_entry_allowed\": false"
  ],
  "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.md": [
    "# Phase 5.8 AI Learning Dry-run Execution Readiness Check",
    "check_version: phase5.8",
    "readiness_mode: check_only",
    "generation_allowed: false",
    "dry_run_execution_allowed: false",
    "phase5_9_entry_allowed: false"
  ],
  "verification/phase5_9_ai_learning_human_review_request_package.md": [
    "# Phase 5.9 AI Learning Human Review Request Package",
    "## 3. Source Packet / Prior Contract Gate",
    "## 4. Selected Item Policy",
    "## 7. Phase 5.10 Entry Policy",
    "pnpm build:ai-learning-human-review-request-package",
    "pnpm validate:ai-learning-human-review-request-package"
  ],
  "verification/generated/phase5_9_ai_learning_human_review_request_package.json": [
    "\"package_version\": \"phase5.9\"",
    "\"package_scope\": \"dry_run_human_review_request_only\"",
    "\"generation_allowed\": false",
    "\"dry_run_execution_allowed\": false",
    "\"review_status\": \"human_review_pending\"",
    "\"phase5_10_entry_allowed\": false"
  ],
  "verification/generated/phase5_9_ai_learning_human_review_request_package.md": [
    "# Phase 5.9 AI Learning Human Review Request Package",
    "package_version: phase5.9",
    "package_scope: dry_run_human_review_request_only",
    "generation_allowed: false",
    "dry_run_execution_allowed: false",
    "review_status: human_review_pending",
    "phase5_10_entry_allowed: false"
  ],
  "prompts/ruankaodaren/ai-learning/asset-card-ai-learning.prompt.md": [
    "AI-generated",
    "Do not OCR",
    "Do not reconstruct image tables",
    "Source Summary / 原文摘要",
    "Review Notes / 复核提示"
  ],
  "prompts/ruankaodaren/ai-learning/short-card-ai-learning.prompt.md": [
    "AI-generated",
    "verified short text",
    "Do not claim the source covered all topic details",
    "Source Summary / 原文摘要",
    "Review Notes / 复核提示"
  ],
  "prompts/ruankaodaren/ai-learning/concept-card-ai-learning.prompt.md": [
    "AI-generated",
    "Separate source-derived facts from AI expansion",
    "Source Summary / 原文摘要",
    "Review Notes / 复核提示"
  ],
  "prompts/ruankaodaren/ai-learning/manual-review-ai-learning.prompt.md": [
    "AI-generated",
    "Do not OCR",
    "Do not access webpages",
    "Source Summary / 原文摘要",
    "Review Notes / 复核提示"
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
