/**
 * Phase 3.0 TypeScript domain types for ruankaodaren intermediate JSON documents.
 *
 * These types mirror schemas/ruankaodaren-intermediate.schema.json.
 * No Markdown generation, no OCR, no encrypt=1 decryption, no image table reconstruction.
 */

export type ContentSourceClassification =
  | "TEXT_DOM"
  | "HTML_RICH_TEXT"
  | "IMAGE_EMBEDDED"
  | "MIXED_TEXT_IMAGE"
  | "UNSTABLE_OR_INCOMPLETE";

export type ParserConfidence = "high" | "medium" | "low";

export type TextBlockType = "paragraph" | "heading" | "list_item" | "inline" | "root_text" | "unknown";

export type KeyTermKind = "underline_placeholder" | "strong" | "emphasis";

export type AssetStatus = "referenced_not_downloaded" | "downloaded" | "unavailable";

export type DetailEntryStrategy = "target_scoped" | "fallback" | "unknown";

export interface RuankaoRawPaths {
  metadata: string;
  outer_html: string;
  screenshot: string;
  dom_text: string;
  containers: string;
}

export interface RuankaoSourceInfo {
  source_name: "ruankaodaren";
  source_url: string;
  captured_at: string;
  /** Filename-safe timestamp: colons replaced with hyphens, e.g. "2026-05-26T09-40-21-903Z" */
  timestamp: string;
  raw_paths: RuankaoRawPaths;
}

export interface RuankaoNavigationContext {
  /** knowledge_node_click_text from crawler metadata */
  target_node_text: string;
  final_url: string;
  /** Hash route extracted from final_url, e.g. "konwledgeInfo" (note: not "knowledgeInfo") */
  route: string;
  detail_entry_strategy: DetailEntryStrategy;
  detail_entry_route_changed: boolean;
}

export interface RuankaoContentBlock {
  type: TextBlockType;
  text: string;
  order: number;
  source_selector: string;
  html: string;
}

export interface RuankaoKeyTerm {
  text: string;
  kind: KeyTermKind;
  order: number;
  source_selector: string;
}

export interface RuankaoImageRef {
  src: string;
  alt: string;
  title: string;
  order: number;
  /** Text of the nearest preceding paragraph */
  surrounding_text: string;
  asset_status: AssetStatus;
  requires_manual_review: boolean;
  manual_review_reason: string;
}

export interface RuankaoHtmlFragment {
  source_selector: string;
  outer_html: string;
  text_length: number;
  contains_direct_text?: boolean;
  contains_image: boolean;
  contains_table: boolean;
}

export interface RuankaoContentClassification {
  content_source_classification: ContentSourceClassification;
  parser_confidence: ParserConfidence;
  requires_manual_review: boolean;
  manual_review_reasons: string[];
}

/** Hard constraints — all values must always be false. */
export interface RuankaoConstraints {
  ocr_used: false;
  encrypted_xhr_decrypted: false;
  image_table_reconstructed: false;
  markdown_generated: false;
}

export interface RuankaoContent {
  /** Preferred: knowledge_node_click_text from crawler metadata. */
  title: string | null;
  text_blocks: RuankaoContentBlock[];
  key_terms: RuankaoKeyTerm[];
  image_refs: RuankaoImageRef[];
  html_fragments: RuankaoHtmlFragment[];
  /** SHA-256 hex of the raw .knowInfo.ql-editor outerHTML file */
  source_outer_html_hash: string;
}

export interface RuankaoIntermediateDocument {
  schema_version: string;
  source: RuankaoSourceInfo;
  navigation_context: RuankaoNavigationContext;
  content: RuankaoContent;
  classification: RuankaoContentClassification;
  constraints: RuankaoConstraints;
}
