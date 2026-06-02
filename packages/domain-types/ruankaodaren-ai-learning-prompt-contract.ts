/**
 * Phase 5.4 TypeScript domain types for the ruankaodaren AI Learning Layer
 * prompt contract. These types define prompt boundaries only and do not
 * generate AI learning content.
 */

export type RuankaoAiLearningAllowedInput =
  | "source_packet"
  | "dual_layer_schema"
  | "intermediate_json"
  | "asset_manifest"
  | "asset_metadata"
  | "human_review_status";

export type RuankaoAiLearningForbiddenInput =
  | "raw_html_direct_read"
  | "raw_xhr_direct_read"
  | "web_requests"
  | "ocr"
  | "encrypted_xhr_decryption"
  | "image_table_reconstruction"
  | "source_layer_modification"
  | "unmarked_ai_content";

export type RuankaoAiLearningSectionId =
  | "ai_explanation"
  | "architecture_mapping"
  | "case_study_pattern"
  | "paper_usage"
  | "misconceptions"
  | "memory_hooks";

export type RuankaoAiLearningRenderAs =
  | "asset_card"
  | "short_card"
  | "concept_card"
  | "manual_review_card";

export type RuankaoAiLearningPromptTemplateId =
  | "asset-card-ai-learning"
  | "short-card-ai-learning"
  | "concept-card-ai-learning"
  | "manual-review-ai-learning";

export interface RuankaoAiLearningInputPolicy {
  allowed_inputs: RuankaoAiLearningAllowedInput[];
  forbidden_inputs: RuankaoAiLearningForbiddenInput[];
}

export interface RuankaoSourceLayerBinding {
  must_reference_source_packet: true;
  must_preserve_source_text: true;
  must_not_modify_source_layer: true;
  must_separate_ai_layer: true;
}

export interface RuankaoAiLearningSection {
  section_id: RuankaoAiLearningSectionId;
  title: string;
  allowed: boolean;
  requires_ai_generated_label: true;
  requires_source_reference: true;
}

export interface RuankaoContentShapeAiPolicy {
  can_explain_text_blocks?: boolean;
  can_explain_asset_metadata?: boolean;
  can_describe_image_content?: boolean;
  requires_asset_manual_review?: boolean;
  can_expand_concepts?: boolean;
  must_mark_source_as_short?: boolean;
  must_not_claim_source_complete?: boolean;
  requires_manual_review?: boolean;
  can_expand_from_text_blocks?: boolean;
  can_map_to_exam_points?: boolean;
  must_mark_ai_generated?: boolean;
  notes: string[];
}

export interface RuankaoContentShapeAiPolicies {
  asset_card: RuankaoContentShapeAiPolicy;
  short_card: RuankaoContentShapeAiPolicy;
  concept_card: RuankaoContentShapeAiPolicy;
  manual_review_card: RuankaoContentShapeAiPolicy;
}

export interface RuankaoTaxonomyAiPolicy {
  taxonomy_suspect_handling: "restrict_generation";
  multi_card_sequence_handling: "do_not_claim_complete";
  parent_node_handling: "do_not_generate_as_leaf";
  affected_titles: string[];
}

export interface RuankaoAiReviewPolicy {
  ai_generation_status_default: "not_generated";
  ai_review_status_default: "pending_review";
  human_review_required: true;
  auto_approval: false;
}

export interface RuankaoAiLearningPromptItem {
  title: string;
  source_packet_item_status: "complete" | "incomplete";
  render_as: RuankaoAiLearningRenderAs;
  content_shape: string;
  taxonomy_suspect: boolean;
  ai_generation_allowed_for_item: false;
  allowed_ai_sections: RuankaoAiLearningSectionId[];
  required_warnings: string[];
  prompt_template_id: RuankaoAiLearningPromptTemplateId;
}

export interface RuankaoAiLearningPromptContract {
  contract_version: "phase5.4";
  source_name: "ruankaodaren";
  created_at: string;
  generation_allowed: false;
  contract_scope: "prompt_contract_only";
  input_policy: RuankaoAiLearningInputPolicy;
  source_layer_binding: RuankaoSourceLayerBinding;
  ai_learning_sections: RuankaoAiLearningSection[];
  content_shape_policies: RuankaoContentShapeAiPolicies;
  taxonomy_policy: RuankaoTaxonomyAiPolicy;
  review_policy: RuankaoAiReviewPolicy;
  items: RuankaoAiLearningPromptItem[];
}
