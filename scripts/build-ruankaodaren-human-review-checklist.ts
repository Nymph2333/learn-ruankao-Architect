/**
 * Phase 4.3: Human review checklist builder.
 *
 * Builds a per-document checklist from the render quality audit, aggregate
 * trace, and renderer input contract. It does not render Markdown docs, crawl,
 * use the web, OCR, decrypt, read raw HTML/XHR, or infer missing content.
 *
 * Usage:
 *   pnpm build:human-review-checklist
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoRendererInputContract } from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const auditPath = resolve(generatedDir, "phase4_3_render_quality_audit.json");
const tracePath = resolve(generatedDir, "phase4_2_baseline_set_render_trace.json");
const contractPath = resolve(generatedDir, "phase3_25_renderer_input_contract.json");
const jsonOutputPath = resolve(generatedDir, "phase4_3_human_review_checklist.json");
const mdOutputPath = resolve(generatedDir, "phase4_3_human_review_checklist.md");

type ReleaseDecision =
  | "accept"
  | "accept_with_manual_notes"
  | "revise_renderer_template"
  | "reject_from_batch_baseline";

interface QualityAuditDocument {
  title: string;
  path: string;
  render_as: string;
  quality_status: "pass" | "pass_with_warnings" | "fail";
  readability_warnings: string[];
  human_review_required: boolean;
  recommended_action: string;
}

interface QualityAuditReport {
  audited_doc_count: number;
  documents: QualityAuditDocument[];
}

interface TraceItem {
  title: string;
  official_output_path: string;
  asset_manifest_path: string | null;
}

interface BaselineTrace {
  items: TraceItem[];
}

interface ChecklistItem {
  title: string;
  path: string;
  render_as: string;
  quality_status: string;
  content_correctness: string[];
  asset_review: string[];
  ruankao_alignment_review: string[];
  renderer_policy_review: string[];
  release_decision_options: ReleaseDecision[];
  suggested_release_decision: ReleaseDecision;
}

interface HumanReviewChecklist {
  phase: "4.3";
  created_at: string;
  source_reports: {
    quality_audit: string;
    aggregate_trace: string;
    renderer_input_contract: string;
  };
  checklist_count: number;
  items: ChecklistItem[];
  constraints: {
    no_new_official_markdown: true;
    ocr_used: false;
    encrypted_xhr_decrypted: false;
    image_table_reconstructed: false;
    raw_html_read: false;
    raw_xhr_read: false;
    web_requests_used: false;
    content_invented: false;
  };
}

function fail(message: string): never {
  console.error(`[build:human-review-checklist] ERROR: ${message}`);
  process.exit(1);
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function releaseDecisionFor(doc: QualityAuditDocument): ReleaseDecision {
  if (doc.quality_status === "fail") return "revise_renderer_template";
  if (doc.human_review_required || doc.quality_status === "pass_with_warnings") return "accept_with_manual_notes";
  return "accept";
}

function buildItem(
  doc: QualityAuditDocument,
  trace: BaselineTrace,
  contract: RuankaoRendererInputContract
): ChecklistItem {
  const baselineItem = contract.baseline_items.find((item) => item.canonical_title === doc.title);
  const traceItem = trace.items.find((item) => item.title === doc.title);
  const hasAssetManifest = Boolean(baselineItem?.asset_manifest_path ?? traceItem?.asset_manifest_path);
  const isAssetCard = doc.render_as === "asset_card";

  return {
    title: doc.title,
    path: doc.path,
    render_as: doc.render_as,
    quality_status: doc.quality_status,
    content_correctness: [
      "标题是否正确。",
      "已抽取文本是否可信。",
      "是否需要人工补充正式教材定义。",
      "是否需要人工补充考试考点。",
    ],
    asset_review: [
      `是否存在图片资产：${hasAssetManifest ? "是" : "否"}。`,
      `图片是否需要人工阅读：${isAssetCard ? "是" : "按需"}。`,
      "禁止 OCR / 自动还原图片表格。",
      "asset_ref 是否能打开 / 找到。",
    ],
    ruankao_alignment_review: [
      "是否需要人工补充选择题考点。",
      "是否需要人工补充案例分析答题点。",
      "是否需要人工补充论文可用段落。",
    ],
    renderer_policy_review: [
      `当前 renderer policy 是否合适：${doc.render_as}。`,
      "是否应转为 manual_review_card。",
      "是否需要 Phase 4.4 refinement 调整模板表达。",
    ],
    release_decision_options: [
      "accept",
      "accept_with_manual_notes",
      "revise_renderer_template",
      "reject_from_batch_baseline",
    ],
    suggested_release_decision: releaseDecisionFor(doc),
  };
}

function writeMarkdown(checklist: HumanReviewChecklist): void {
  const lines = [
    "# Phase 4.3 Human Review Checklist",
    "",
    "This checklist is for human review only. It does not add content, perform OCR, reconstruct image tables, read raw HTML/XHR, or access the web.",
    "",
    "## Summary",
    "",
    `- checklist_count: ${checklist.checklist_count}`,
    `- quality_audit: \`${checklist.source_reports.quality_audit}\``,
    `- aggregate_trace: \`${checklist.source_reports.aggregate_trace}\``,
    `- renderer_input_contract: \`${checklist.source_reports.renderer_input_contract}\``,
    "",
  ];

  for (const item of checklist.items) {
    lines.push(`## ${item.title}`);
    lines.push("");
    lines.push(`- path: \`${item.path}\``);
    lines.push(`- render_as: \`${item.render_as}\``);
    lines.push(`- quality_status: \`${item.quality_status}\``);
    lines.push(`- suggested_release_decision: \`${item.suggested_release_decision}\``);
    lines.push("");
    lines.push("### Content correctness / 内容正确性");
    lines.push("");
    lines.push(...item.content_correctness.map((entry) => `- [ ] ${entry}`));
    lines.push("");
    lines.push("### Asset review / 资产复核");
    lines.push("");
    lines.push(...item.asset_review.map((entry) => `- [ ] ${entry}`));
    lines.push("");
    lines.push("### Ruankao alignment review / 软考映射复核");
    lines.push("");
    lines.push(...item.ruankao_alignment_review.map((entry) => `- [ ] ${entry}`));
    lines.push("");
    lines.push("### Renderer policy review / 渲染策略复核");
    lines.push("");
    lines.push(...item.renderer_policy_review.map((entry) => `- [ ] ${entry}`));
    lines.push("");
    lines.push("### Release decision / 发布判断");
    lines.push("");
    lines.push(...item.release_decision_options.map((entry) => `- [ ] ${entry}`));
    lines.push("");
  }

  writeFileSync(mdOutputPath, lines.join("\n"), "utf8");
}

function main(): void {
  if (!existsSync(auditPath)) fail("quality audit JSON missing; run pnpm audit:render-quality first");
  if (!existsSync(tracePath)) fail("Phase 4.2 aggregate trace missing");
  if (!existsSync(contractPath)) fail("renderer input contract missing");
  mkdirSync(generatedDir, { recursive: true });

  const audit = readJson<QualityAuditReport>(auditPath);
  const trace = readJson<BaselineTrace>(tracePath);
  const contract = readJson<RuankaoRendererInputContract>(contractPath);
  const items = audit.documents.map((doc) => buildItem(doc, trace, contract));

  const checklist: HumanReviewChecklist = {
    phase: "4.3",
    created_at: new Date().toISOString(),
    source_reports: {
      quality_audit: toRepoPath(auditPath),
      aggregate_trace: toRepoPath(tracePath),
      renderer_input_contract: toRepoPath(contractPath),
    },
    checklist_count: items.length,
    items,
    constraints: {
      no_new_official_markdown: true,
      ocr_used: false,
      encrypted_xhr_decrypted: false,
      image_table_reconstructed: false,
      raw_html_read: false,
      raw_xhr_read: false,
      web_requests_used: false,
      content_invented: false,
    },
  };

  writeFileSync(jsonOutputPath, `${JSON.stringify(checklist, null, 2)}\n`, "utf8");
  writeMarkdown(checklist);

  console.log("[build:human-review-checklist] Human review checklist generated");
  console.log(`  checklist_count: ${checklist.checklist_count}`);
  console.log(`  JSON:            ${toRepoPath(jsonOutputPath)}`);
  console.log(`  MD:              ${toRepoPath(mdOutputPath)}`);
}

main();
