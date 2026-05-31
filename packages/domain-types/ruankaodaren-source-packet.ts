/**
 * Phase 5.1 TypeScript domain types for ruankaodaren source packets.
 *
 * Source packets record artifact availability. They do not regenerate source
 * content, read raw XHR directly, or create AI learning content.
 */

export type RuankaoSourceLayerStatus =
  | "complete"
  | "incomplete"
  | "markdown_only"
  | "asset_missing"
  | "intermediate_missing";

export type RuankaoSourcePacketStatus =
  | "complete"
  | "incomplete";

export type RuankaoSourcePacketRecommendedAction =
  | "rebuild_source_artifact"
  | "reacquire_source"
  | "accept_source_packet"
  | "manual_review_required";

export type RuankaoSourcePacketRecoveryStatus =
  | "not_attempted"
  | "already_exists"
  | "recovered"
  | "partially_recovered"
  | "failed";

export type RuankaoSourcePacketRenderAs =
  | "short_card"
  | "asset_card"
  | "concept_card"
  | "manual_review_card";

export interface RuankaoSourceAvailability {
  official_markdown_exists: boolean;
  intermediate_json_exists: boolean;
  asset_manifest_exists: boolean;
  asset_files_exist: boolean;
  source_packet_complete: boolean;
}

export interface RuankaoSourcePacketConstraints {
  official_markdown_used_as_source_of_truth: false;
  ocr_used: false;
  encrypted_xhr_decrypted: false;
  image_table_reconstructed: false;
  raw_xhr_used: false;
  content_invented: false;
}

export interface RuankaoSourcePacketItem {
  title: string;
  render_as: RuankaoSourcePacketRenderAs;
  official_markdown_path: string;
  renderer_input_contract_path: string;
  baseline_manifest_path: string;
  canonical_sample_path: string;
  asset_manifest_path: string | null;
  effective_intermediate_path: string | null;
  recovered_intermediate_path: string | null;
  effective_asset_manifest_path: string | null;
  recovered_asset_manifest_path: string | null;
  asset_files: string[];
  source_availability: RuankaoSourceAvailability;
  missing_artifacts: string[];
  source_layer_status: RuankaoSourceLayerStatus;
  ai_learning_layer_status: "not_generated";
  constraints: RuankaoSourcePacketConstraints;
  recommended_action: RuankaoSourcePacketRecommendedAction;
  recovery_status: RuankaoSourcePacketRecoveryStatus;
  taxonomy_suspect: boolean;
  taxonomy_notes: string[];
  source_packet_recovered_at: string | null;
}

export interface RuankaoSourcePacket {
  packet_schema_version: "phase5.1";
  source_name: "ruankaodaren";
  created_at: string;
  scope: "baseline_official_docs";
  items: RuankaoSourcePacketItem[];
  overall_source_packet_status: RuankaoSourcePacketStatus;
  phase5_2_ai_generation_allowed: false;
}
