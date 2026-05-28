/**
 * Phase 3.25 TypeScript domain types for the ruankaodaren renderer input contract.
 *
 * This contract freezes what Phase 4 may consume. It does not implement a
 * Markdown renderer and does not generate knowledge documents.
 */

export type RuankaoRendererAllowedInput =
  | "renderer_baseline_manifest"
  | "intermediate_json"
  | "asset_manifest"
  | "asset_files";

export type RuankaoRendererForbiddenInput =
  | "raw_html_direct_read"
  | "raw_xhr_direct_read"
  | "web_requests"
  | "ocr"
  | "encrypted_xhr_decryption"
  | "image_table_reconstruction"
  | "content_invention";

export type RuankaoRenderAs =
  | "short_card"
  | "asset_card"
  | "concept_card"
  | "manual_review_card";

export interface RuankaoRendererInputPolicy {
  allowed_inputs: RuankaoRendererAllowedInput[];
  forbidden_inputs: RuankaoRendererForbiddenInput[];
  baseline_unit: "unique_title";
  manual_review_required_for_asset_cards: true;
}

export interface RuankaoRendererPolicy {
  render_as: RuankaoRenderAs;
  preserve_asset_refs: boolean;
  allow_markdown_generation_later: boolean;
  notes: string[];
}

export interface RuankaoRendererConstraints {
  ocr_used: false;
  encrypted_xhr_decrypted: false;
  image_table_reconstructed: false;
  markdown_generated: false;
}

export interface RuankaoRendererInputItem {
  canonical_title: string;
  canonical_sample_path: string;
  timestamp: string;
  readiness_class: string;
  content_shape: string;
  renderer_policy: RuankaoRendererPolicy;
  asset_manifest_path: string | null;
  manual_review_required: boolean;
  required_renderer_sections: string[];
  constraints: RuankaoRendererConstraints;
}

export interface RuankaoPhase4EntryConditions {
  unique_baseline_titles_min: 3;
  unique_baseline_titles_actual: number;
  renderer_baseline_manifest_ready: boolean;
  all_items_have_renderer_policy: boolean;
  all_constraints_safe: boolean;
}

export interface RuankaoRendererInputContract {
  contract_version: "phase3.25";
  source_name: "ruankaodaren";
  created_at: string;
  phase4_allowed: boolean;
  renderer_input_policy: RuankaoRendererInputPolicy;
  baseline_manifest_path: string;
  baseline_items: RuankaoRendererInputItem[];
  phase4_entry_conditions: RuankaoPhase4EntryConditions;
}
