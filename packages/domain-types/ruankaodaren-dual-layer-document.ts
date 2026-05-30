/**
 * Phase 5.0 TypeScript domain types for the ruankaodaren dual-layer document.
 *
 * These types define the boundary between source-preserved content and
 * AI-generated learning content. They do not generate learning material.
 */

export type RuankaoSourceContentType =
  | "text"
  | "image_asset"
  | "mixed"
  | "short_text"
  | "unknown";

export type RuankaoAiGenerationStatus =
  | "not_generated"
  | "draft"
  | "generated"
  | "reviewed";

export type RuankaoAiAllowedSection =
  | "AI Explanation / AI解析"
  | "Architecture Mapping / 架构师考点映射"
  | "Case Study Pattern / 案例答题模式"
  | "Paper Usage / 论文表达"
  | "Misconceptions / 易错点"
  | "Memory Hooks / 记忆钩子";

export type RuankaoAiReviewStatus =
  | "pending_review"
  | "reviewed"
  | "approved"
  | "rejected";

export type RuankaoReviewCheckStatus =
  | "pending"
  | "passed"
  | "failed";

export type RuankaoReleaseStatus =
  | "not_ready"
  | "ready"
  | "rejected";

export interface RuankaoTaxonomyChild {
  title: string;
  node_id: string | null;
  taxonomy_suspect: boolean;
}

export interface RuankaoTaxonomyInfo {
  chapter: string;
  section: string;
  parent_title: string | null;
  is_parent_node: boolean;
  taxonomy_suspect: boolean;
  children: RuankaoTaxonomyChild[];
}

export interface RuankaoSourceTextBlock {
  order: number;
  text: string;
  source_path: string;
}

export interface RuankaoSourceKeyTerm {
  order: number;
  text: string;
  kind?: string | null;
}

export interface RuankaoAssetRef {
  order: number;
  original_url?: string | null;
  saved_path: string;
  sha256?: string | null;
  content_type?: string | null;
  width?: number | null;
  height?: number | null;
  manual_review_required: boolean;
  manual_review_reason?: string | null;
}

export interface RuankaoSourcePaths {
  intermediate_json: string | null;
  asset_manifest: string | null;
  official_markdown: string | null;
  source_packet?: string | null;
}

export interface RuankaoSourceIntegrity {
  source_timestamp: string | null;
  content_hash: string | null;
  parser_version: string | null;
  source_available: boolean;
}

export interface RuankaoSourceConstraints {
  ocr_used: false;
  encrypted_xhr_decrypted: false;
  image_table_reconstructed: false;
  raw_html_used_by_renderer: false;
  raw_xhr_used_by_renderer: false;
}

export interface RuankaoSourceLayer {
  source_content_type: RuankaoSourceContentType;
  source_text_blocks: RuankaoSourceTextBlock[];
  source_key_terms: RuankaoSourceKeyTerm[];
  asset_refs: RuankaoAssetRef[];
  source_paths: RuankaoSourcePaths;
  source_integrity: RuankaoSourceIntegrity;
  constraints: RuankaoSourceConstraints;
}

export interface RuankaoAiSourceDependency {
  must_reference_source_layer: true;
  must_not_modify_source_layer: true;
}

export interface RuankaoAiLearningLayer {
  ai_generated: true;
  generation_status: RuankaoAiGenerationStatus;
  allowed_sections: RuankaoAiAllowedSection[];
  source_dependency: RuankaoAiSourceDependency;
  review_status: RuankaoAiReviewStatus;
}

export interface RuankaoDualLayerReview {
  source_fidelity_review: RuankaoReviewCheckStatus;
  ai_pedagogy_review: RuankaoReviewCheckStatus;
  release_status: RuankaoReleaseStatus;
}

export interface RuankaoDualLayerDocument {
  schema_version: "phase5.0";
  source_name: "ruankaodaren";
  title: string;
  node_id: string;
  taxonomy: RuankaoTaxonomyInfo;
  source_layer: RuankaoSourceLayer;
  ai_learning_layer: RuankaoAiLearningLayer;
  review: RuankaoDualLayerReview;
}
