/**
 * Phase 4.5 TypeScript domain types for ruankaodaren human review signoff.
 *
 * These types model the manual review gate after official baseline rendering.
 * They do not approve documents automatically and do not permit Phase 4.6
 * expansion until a human reviewer explicitly completes the checks.
 */

import type { RuankaoRenderAs } from "./ruankaodaren-renderer-input-contract.js";

export type RuankaoReviewStatus =
  | "pending_review"
  | "accepted"
  | "accepted_with_notes"
  | "needs_revision"
  | "rejected";

export type RuankaoReleaseDecision =
  | "not_ready"
  | "accept"
  | "accept_with_manual_notes"
  | "revise_renderer_template"
  | "reject_from_batch_baseline";

export interface RuankaoHumanReviewRequiredChecks {
  content_correctness_checked: boolean;
  source_reference_checked: boolean;
  asset_review_checked: boolean;
  ruankao_alignment_checked: boolean;
  case_study_pattern_checked: boolean;
  paper_usage_checked: boolean;
  renderer_boundary_checked: boolean;
}

export interface RuankaoHumanReviewItem {
  title: string;
  official_doc_path: string;
  render_as: RuankaoRenderAs;
  review_status: RuankaoReviewStatus;
  reviewer: string | null;
  reviewed_at: string | null;
  required_checks: RuankaoHumanReviewRequiredChecks;
  manual_notes: string[];
  release_decision: RuankaoReleaseDecision;
}

export interface RuankaoHumanReviewStatus {
  review_schema_version: "phase4.5";
  source_name: "ruankaodaren";
  created_at: string;
  review_scope: "baseline_official_docs";
  auto_approval: false;
  source_reports: {
    human_review_checklist: string;
    quality_audit: string;
    renderer_policy_refinement_report: string;
  };
  items: RuankaoHumanReviewItem[];
  overall_status: RuankaoReviewStatus;
  phase4_6_expansion_allowed: boolean;
}
