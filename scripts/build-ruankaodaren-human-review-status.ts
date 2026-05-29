/**
 * Phase 4.5: Human review status builder.
 *
 * Builds a machine-readable pending-review signoff package for the three
 * official baseline Markdown documents. This script does not approve any
 * document, does not render Markdown, does not crawl, does not access the web,
 * does not OCR, and does not read raw HTML/XHR.
 *
 * Usage:
 *   pnpm build:human-review-status
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  RuankaoHumanReviewItem,
  RuankaoHumanReviewRequiredChecks,
  RuankaoHumanReviewStatus,
} from "../packages/domain-types/ruankaodaren-human-review-status.js";
import type { RuankaoRenderAs } from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const reviewDir = resolve(repoRoot, "reviews/ruankaodaren/baseline");
const checklistPath = resolve(generatedDir, "phase4_3_human_review_checklist.json");
const refinementReportPath = resolve(generatedDir, "phase4_4_renderer_policy_refinement_report.json");
const qualityAuditPath = resolve(generatedDir, "phase4_3_render_quality_audit.json");
const jsonOutputPath = resolve(reviewDir, "human-review-status.json");
const mdOutputPath = resolve(reviewDir, "human-review-status.md");

interface ChecklistItem {
  title: string;
  path: string;
  render_as: RuankaoRenderAs;
}

interface HumanReviewChecklist {
  checklist_count: number;
  items: ChecklistItem[];
}

interface QualityAudit {
  audited_doc_count: number;
  human_review_required_count: number;
}

interface RefinementReport {
  boundary_violations: number;
  recommended_next_phase: string;
}

function fail(message: string): never {
  console.error(`[build:human-review-status] ERROR: ${message}`);
  process.exit(1);
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function emptyRequiredChecks(): RuankaoHumanReviewRequiredChecks {
  return {
    content_correctness_checked: false,
    source_reference_checked: false,
    asset_review_checked: false,
    ruankao_alignment_checked: false,
    case_study_pattern_checked: false,
    paper_usage_checked: false,
    renderer_boundary_checked: false,
  };
}

function buildItem(item: ChecklistItem): RuankaoHumanReviewItem {
  const officialAbsPath = resolve(repoRoot, item.path);
  if (!existsSync(officialAbsPath)) fail(`official Markdown missing: ${item.path}`);

  return {
    title: item.title,
    official_doc_path: item.path,
    render_as: item.render_as,
    review_status: "pending_review",
    reviewer: null,
    reviewed_at: null,
    required_checks: emptyRequiredChecks(),
    manual_notes: [],
    release_decision: "not_ready",
  };
}

function writeMarkdown(status: RuankaoHumanReviewStatus): void {
  const lines = [
    "# Phase 4.5 Human Review Status",
    "",
    "This signoff package is intentionally pending. It does not auto-approve official Markdown, does not add content, does not OCR, does not reconstruct image tables, and does not access raw HTML/XHR or the web.",
    "",
    "## Summary",
    "",
    `- review_schema_version: \`${status.review_schema_version}\``,
    `- review_scope: \`${status.review_scope}\``,
    `- item_count: ${status.items.length}`,
    `- auto_approval: ${status.auto_approval}`,
    `- overall_status: \`${status.overall_status}\``,
    `- phase4_6_expansion_allowed: ${status.phase4_6_expansion_allowed}`,
    "",
    "## Source Reports",
    "",
    `- human_review_checklist: \`${status.source_reports.human_review_checklist}\``,
    `- quality_audit: \`${status.source_reports.quality_audit}\``,
    `- renderer_policy_refinement_report: \`${status.source_reports.renderer_policy_refinement_report}\``,
    "",
    "## Review Items",
    "",
  ];

  for (const item of status.items) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(`- official_doc_path: \`${item.official_doc_path}\``);
    lines.push(`- render_as: \`${item.render_as}\``);
    lines.push(`- review_status: \`${item.review_status}\``);
    lines.push(`- reviewer: ${item.reviewer}`);
    lines.push(`- reviewed_at: ${item.reviewed_at}`);
    lines.push(`- release_decision: \`${item.release_decision}\``);
    lines.push("");
    lines.push("#### Required Checks");
    lines.push("");
    for (const [key, value] of Object.entries(item.required_checks)) {
      lines.push(`- [${value ? "x" : " "}] ${key}`);
    }
    lines.push("");
    lines.push("#### Manual Notes");
    lines.push("");
    lines.push("- pending human reviewer input");
    lines.push("");
  }

  lines.push("## Gate Policy");
  lines.push("");
  lines.push("- All items start as `pending_review`.");
  lines.push("- All required checks start as `false`.");
  lines.push("- `auto_approval = false`.");
  lines.push("- `phase4_6_expansion_allowed = false` until a human reviewer explicitly completes all checks.");
  lines.push("");

  writeFileSync(mdOutputPath, lines.join("\n"), "utf8");
}

function main(): void {
  if (!existsSync(checklistPath)) fail("human review checklist missing; run pnpm build:human-review-checklist");
  if (!existsSync(refinementReportPath)) fail("Phase 4.4 refinement report missing");
  if (!existsSync(qualityAuditPath)) fail("quality audit missing");

  mkdirSync(reviewDir, { recursive: true });

  const checklist = readJson<HumanReviewChecklist>(checklistPath);
  const refinement = readJson<RefinementReport>(refinementReportPath);
  const qualityAudit = readJson<QualityAudit>(qualityAuditPath);
  if (checklist.checklist_count !== 3) fail(`expected checklist_count=3, got ${checklist.checklist_count}`);
  if (qualityAudit.audited_doc_count !== 3) fail(`expected audited_doc_count=3, got ${qualityAudit.audited_doc_count}`);
  if (qualityAudit.human_review_required_count !== 3) {
    fail(`expected human_review_required_count=3, got ${qualityAudit.human_review_required_count}`);
  }
  if (refinement.boundary_violations !== 0) fail("cannot build review status while boundary violations exist");

  const status: RuankaoHumanReviewStatus = {
    review_schema_version: "phase4.5",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    review_scope: "baseline_official_docs",
    auto_approval: false,
    source_reports: {
      human_review_checklist: toRepoPath(checklistPath),
      quality_audit: toRepoPath(qualityAuditPath),
      renderer_policy_refinement_report: toRepoPath(refinementReportPath),
    },
    items: checklist.items.map(buildItem),
    overall_status: "pending_review",
    phase4_6_expansion_allowed: false,
  };

  writeFileSync(jsonOutputPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");
  writeMarkdown(status);

  console.log("[build:human-review-status] Human review status generated");
  console.log(`  item_count:                  ${status.items.length}`);
  console.log(`  review_statuses:             ${[...new Set(status.items.map((item) => item.review_status))].join(", ")}`);
  console.log(`  auto_approval:               ${status.auto_approval}`);
  console.log(`  overall_status:              ${status.overall_status}`);
  console.log(`  phase4_6_expansion_allowed:  ${status.phase4_6_expansion_allowed}`);
  console.log(`  JSON:                        ${toRepoPath(jsonOutputPath)}`);
  console.log(`  MD:                          ${toRepoPath(mdOutputPath)}`);
}

main();
