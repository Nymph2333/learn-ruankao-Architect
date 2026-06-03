/**
 * Phase 6.0 Controlled Source Expansion Plan TypeScript types.
 *
 * Defines the structure of the controlled source expansion plan artifact.
 * This plan defines HOW source coverage may be expanded; it does NOT execute
 * any expansion.
 */

export type RuankaoControlledSourceExpansionPlan = {
  readonly plan_version: "phase6.0";
  readonly source_name: "ruankaodaren";
  readonly created_at: string;
  readonly plan_scope: "controlled_source_expansion_plan_only";
  readonly execution_allowed: false;
  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly raw_html_direct_read_allowed: false;
  readonly raw_xhr_direct_read_allowed: false;
  readonly ocr_allowed: false;
  readonly encrypted_xhr_decryption_allowed: false;
  readonly image_table_reconstruction_allowed: false;
  readonly source_layer_modification_allowed: false;
  readonly official_markdown_modification_allowed: false;
  readonly ai_learning_generation_allowed: false;
  readonly phase6_1_entry_allowed: false;
  readonly current_source_coverage: CurrentSourceCoverage;
  readonly expansion_strategy: ExpansionStrategy;
  readonly taxonomy_13_3_policy: Taxonomy133Policy;
  readonly detail_entry_test_gate: DetailEntryTestGate;
  readonly source_artifact_policy: SourceArtifactPolicy;
  readonly asset_manifest_policy: AssetManifestPolicy;
  readonly missing_record_policy: MissingRecordPolicy;
  readonly phase6_1_entry_gate: Phase61EntryGate;
  readonly artifact_commit_policy: ArtifactCommitPolicy;
};

export type CurrentSourceCoverage = {
  readonly coverage_scope: "baseline_only";
  readonly full_site_captured: false;
  readonly baseline_item_count: 3;
  readonly baseline_complete_count: 3;
  readonly items: readonly CoverageItem[];
  readonly coverage_boundary_notes: readonly string[];
};

export type CoverageItem = {
  readonly title: string;
  readonly source_layer_status: string;
  readonly taxonomy_suspect: boolean;
  readonly render_as: string;
};

export type ExpansionStrategy = {
  readonly candidate_groups: readonly CandidateGroup[];
  readonly expansion_batch_size: BatchSize;
  readonly first_batch_goal: string;
  readonly no_full_site_bulk_capture: true;
  readonly no_unbounded_crawler: true;
  readonly no_renderer_bulk_run: true;
};

export type CandidateGroup = {
  readonly group_name: string;
  readonly priority: "high" | "medium" | "low";
  readonly item_type_filter: string;
  readonly prerequisite: string;
};

export type BatchSize = {
  readonly min: number;
  readonly max: number;
  readonly rationale: string;
};

export type Taxonomy133Policy = {
  readonly title: "13.3 软件架构风格";
  readonly taxonomy_suspect: true;
  readonly is_multi_card_sequence_possible: true;
  readonly must_recheck_children_before_leaf_modeling: true;
  readonly suggested_recheck_targets: readonly string[];
  readonly must_not_claim_complete: true;
  readonly expansion_blocked_until_recheck: true;
};

export type DetailEntryTestGate = {
  readonly detail_entry_test_required_before_expansion: true;
  readonly rationale: string;
  readonly accepted_signals: readonly string[];
  readonly blocked_if: readonly string[];
};

export type SourceArtifactPolicy = {
  readonly required_artifacts: readonly string[];
  readonly forbidden_source_shortcuts: readonly string[];
};

export type AssetManifestPolicy = {
  readonly required_when: readonly string[];
  readonly not_required_when: readonly string[];
};

export type MissingRecordPolicy = {
  readonly if_source_artifact_missing: readonly string[];
};

export type Phase61EntryGate = {
  readonly phase6_1_entry_allowed: false;
  readonly required_before_phase6_1: readonly string[];
};

export type ArtifactCommitPolicy = {
  readonly commit_allowed: readonly string[];
  readonly commit_forbidden: readonly string[];
};