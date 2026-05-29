/**
 * Phase 4.4 renderer policy refinement report.
 *
 * Compares the Phase 4.3 render-quality audit with the post-refinement audit
 * and writes a summary for planning Phase 4.5. This script does not render,
 * crawl, access the web, read raw HTML/XHR, OCR, decrypt, or invent content.
 *
 * Usage:
 *   pnpm report:renderer-policy-refinement
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const beforeAuditPath = resolve(generatedDir, "phase4_4_before_render_quality_audit.json");
const afterAuditPath = resolve(generatedDir, "phase4_4_after_render_quality_audit.json");
const fallbackAfterAuditPath = resolve(generatedDir, "phase4_3_render_quality_audit.json");
const tracePath = resolve(generatedDir, "phase4_2_baseline_set_render_trace.json");
const jsonOutputPath = resolve(generatedDir, "phase4_4_renderer_policy_refinement_report.json");
const mdOutputPath = resolve(generatedDir, "phase4_4_renderer_policy_refinement_report.md");

interface AuditDocument {
  title: string;
  path: string;
  quality_status: string;
  readability_warnings: string[];
  boundary_violations: string[];
}

interface QualityAudit {
  audited_doc_count: number;
  pass_count: number;
  pass_with_warnings_count: number;
  fail_count: number;
  boundary_violation_count: number;
  human_review_required_count: number;
  recommended_next_phase: string;
  documents: AuditDocument[];
}

interface BaselineTrace {
  items: Array<{
    title: string;
    official_output_path: string;
    render_as: string;
  }>;
  forbidden_inputs_touched: string[];
}

interface RefinementReport {
  phase: "4.4";
  created_at: string;
  before_audit_path: string;
  after_audit_path: string;
  before_summary: Pick<
    QualityAudit,
    "audited_doc_count" | "pass_count" | "pass_with_warnings_count" | "fail_count" | "boundary_violation_count"
  >;
  after_summary: Pick<
    QualityAudit,
    "audited_doc_count" | "pass_count" | "pass_with_warnings_count" | "fail_count" | "boundary_violation_count"
  >;
  warning_delta: number;
  boundary_violations: number;
  files_re_rendered: string[];
  template_changes_summary: string[];
  eligible_for_phase4_5_planning: boolean;
  recommended_next_phase: string;
}

function fail(message: string): never {
  console.error(`[report:renderer-policy-refinement] ERROR: ${message}`);
  process.exit(1);
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function totalWarnings(audit: QualityAudit): number {
  return audit.documents.reduce((sum, doc) => sum + doc.readability_warnings.length, 0);
}

function summary(audit: QualityAudit): RefinementReport["before_summary"] {
  return {
    audited_doc_count: audit.audited_doc_count,
    pass_count: audit.pass_count,
    pass_with_warnings_count: audit.pass_with_warnings_count,
    fail_count: audit.fail_count,
    boundary_violation_count: audit.boundary_violation_count,
  };
}

function writeMarkdown(report: RefinementReport): void {
  const lines = [
    "# Phase 4.4 Renderer Policy Refinement Report",
    "",
    "## Summary",
    "",
    "| Field | Value |",
    "|---|---|",
    `| before_audit_path | ${report.before_audit_path} |`,
    `| after_audit_path | ${report.after_audit_path} |`,
    `| warning_delta | ${report.warning_delta} |`,
    `| boundary_violations | ${report.boundary_violations} |`,
    `| eligible_for_phase4_5_planning | ${report.eligible_for_phase4_5_planning} |`,
    `| recommended_next_phase | ${report.recommended_next_phase} |`,
    "",
    "## Before Audit Summary",
    "",
    `- audited_doc_count: ${report.before_summary.audited_doc_count}`,
    `- pass_count: ${report.before_summary.pass_count}`,
    `- pass_with_warnings_count: ${report.before_summary.pass_with_warnings_count}`,
    `- fail_count: ${report.before_summary.fail_count}`,
    `- boundary_violation_count: ${report.before_summary.boundary_violation_count}`,
    "",
    "## After Audit Summary",
    "",
    `- audited_doc_count: ${report.after_summary.audited_doc_count}`,
    `- pass_count: ${report.after_summary.pass_count}`,
    `- pass_with_warnings_count: ${report.after_summary.pass_with_warnings_count}`,
    `- fail_count: ${report.after_summary.fail_count}`,
    `- boundary_violation_count: ${report.after_summary.boundary_violation_count}`,
    "",
    "## Files Re-rendered",
    "",
    ...report.files_re_rendered.map((file) => `- \`${file}\``),
    "",
    "## Template Changes Summary",
    "",
    ...report.template_changes_summary.map((item) => `- ${item}`),
    "",
    "## Boundary",
    "",
    "- No new official Markdown beyond the three baseline files was generated.",
    "- No OCR, decrypt, image table reconstruction, raw HTML/XHR read, web requests, or content invention was performed.",
    "",
  ];
  writeFileSync(mdOutputPath, lines.join("\n"), "utf8");
}

function main(): void {
  if (!existsSync(beforeAuditPath)) {
    fail("before audit snapshot missing; run pnpm audit:render-quality after Phase 4.3 audit exists");
  }
  const resolvedAfterPath = existsSync(afterAuditPath) ? afterAuditPath : fallbackAfterAuditPath;
  if (!existsSync(resolvedAfterPath)) fail("after audit missing; run pnpm audit:render-quality");
  if (!existsSync(tracePath)) fail("Phase 4.2 baseline-set trace missing");

  mkdirSync(generatedDir, { recursive: true });
  const before = readJson<QualityAudit>(beforeAuditPath);
  const after = readJson<QualityAudit>(resolvedAfterPath);
  const trace = readJson<BaselineTrace>(tracePath);

  const warningDelta = totalWarnings(after) - totalWarnings(before);
  const eligible = after.boundary_violation_count === 0 && after.fail_count === 0 && trace.forbidden_inputs_touched.length === 0;

  const report: RefinementReport = {
    phase: "4.4",
    created_at: new Date().toISOString(),
    before_audit_path: toRepoPath(beforeAuditPath),
    after_audit_path: toRepoPath(resolvedAfterPath),
    before_summary: summary(before),
    after_summary: summary(after),
    warning_delta: warningDelta,
    boundary_violations: after.boundary_violation_count,
    files_re_rendered: trace.items.map((item) => item.official_output_path),
    template_changes_summary: [
      "Added fixed Human Review Checklist / 人工复核清单 block to renderer templates and output.",
      "Added fixed Renderer Boundary / 渲染边界 block to renderer templates and output.",
      "Strengthened asset_card, short_card, concept_card, and manual_review_card policy language.",
      "Kept renderer inputs restricted to the frozen contract, intermediate JSON, and asset manifests.",
    ],
    eligible_for_phase4_5_planning: eligible,
    recommended_next_phase: eligible ? "phase4_5_planning_candidate_after_human_review" : "continue_renderer_policy_refinement",
  };

  writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeMarkdown(report);

  console.log("[report:renderer-policy-refinement] Refinement report generated");
  console.log(`  warning_delta:                 ${report.warning_delta}`);
  console.log(`  boundary_violations:           ${report.boundary_violations}`);
  console.log(`  eligible_for_phase4_5_planning:${report.eligible_for_phase4_5_planning}`);
  console.log(`  recommended_next_phase:        ${report.recommended_next_phase}`);
  console.log(`  JSON:                          ${toRepoPath(jsonOutputPath)}`);
  console.log(`  MD:                            ${toRepoPath(mdOutputPath)}`);
}

main();
