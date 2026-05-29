/**
 * Phase 4.3: Renderer quality audit.
 *
 * Audits the three official baseline Markdown outputs for structure, boundary
 * statements, renderer-policy clarity, readability, and human-review markers.
 * This script reads only official Markdown, the Phase 4.2 trace, and the frozen
 * renderer input contract. It does not render, crawl, access the web, OCR,
 * decrypt, read raw HTML/XHR, or modify official Markdown.
 *
 * Usage:
 *   pnpm audit:render-quality
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  RuankaoRenderAs,
  RuankaoRendererInputContract,
  RuankaoRendererInputItem,
} from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const officialDir = resolve(repoRoot, "docs/ruankaodaren/baseline");
const contractPath = resolve(generatedDir, "phase3_25_renderer_input_contract.json");
const tracePath = resolve(generatedDir, "phase4_2_baseline_set_render_trace.json");
const jsonOutputPath = resolve(generatedDir, "phase4_3_render_quality_audit.json");
const mdOutputPath = resolve(generatedDir, "phase4_3_render_quality_audit.md");
const phase44BeforeJsonPath = resolve(generatedDir, "phase4_4_before_render_quality_audit.json");
const phase44BeforeMdPath = resolve(generatedDir, "phase4_4_before_render_quality_audit.md");
const phase44AfterJsonPath = resolve(generatedDir, "phase4_4_after_render_quality_audit.json");
const phase44AfterMdPath = resolve(generatedDir, "phase4_4_after_render_quality_audit.md");

const REQUIRED_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

const EXPECTED_DOC_PATHS = [
  "docs/ruankaodaren/baseline/1.3_指令系统CISC和RISC.md",
  "docs/ruankaodaren/baseline/13.3_软件架构风格.md",
  "docs/ruankaodaren/baseline/9.1_信息安全基础知识.md",
];

type QualityStatus = "pass" | "pass_with_warnings" | "fail";
type RecommendedAction =
  | "accept_as_baseline"
  | "revise_template"
  | "revise_renderer_policy"
  | "manual_review_required";

interface TraceItem {
  title: string;
  render_as: RuankaoRenderAs;
  official_output_path: string;
  intermediate_path: string;
  asset_manifest_path: string | null;
  sections_rendered: string[];
}

interface BaselineTrace {
  phase: "4.2";
  rendered_count: number;
  items: TraceItem[];
  forbidden_inputs_touched: string[];
}

interface DocumentAudit {
  title: string;
  path: string;
  render_as: RuankaoRenderAs;
  sections_present: string[];
  sections_missing: string[];
  boundary_violations: string[];
  asset_policy_violations: string[];
  short_card_policy_violations: string[];
  concept_card_policy_violations: string[];
  readability_warnings: string[];
  has_human_review_block: boolean;
  has_renderer_boundary_block: boolean;
  has_policy_specific_warning: boolean;
  has_manual_completion_guidance: boolean;
  human_review_required: boolean;
  quality_status: QualityStatus;
  recommended_action: RecommendedAction;
}

interface QualityAuditReport {
  phase: "4.3";
  created_at: string;
  audited_doc_count: number;
  pass_count: number;
  pass_with_warnings_count: number;
  fail_count: number;
  boundary_violation_count: number;
  human_review_required_count: number;
  documents_requiring_manual_review: string[];
  recommended_next_phase: string;
  documents: DocumentAudit[];
}

function fail(message: string): never {
  console.error(`[audit:render-quality] ERROR: ${message}`);
  process.exit(1);
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function snapshotBeforeAudit(): void {
  if (!existsSync(jsonOutputPath) || existsSync(phase44BeforeJsonPath)) return;
  copyFileSync(jsonOutputPath, phase44BeforeJsonPath);
  if (existsSync(mdOutputPath)) copyFileSync(mdOutputPath, phase44BeforeMdPath);
}

function safeTitle(title: string): string {
  return title
    .replace(/[\\/:*?"<>|#]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function sectionBody(markdown: string, section: string): string {
  const heading = `## ${section}`;
  const start = markdown.indexOf(heading);
  if (start === -1) return "";
  const afterHeading = start + heading.length;
  const nextHeading = markdown.indexOf("\n## ", afterHeading);
  return (nextHeading === -1 ? markdown.slice(afterHeading) : markdown.slice(afterHeading, nextHeading)).trim();
}

function sectionOrderIsValid(markdown: string, warnings: string[]): void {
  let lastIndex = -1;
  for (const section of REQUIRED_SECTIONS) {
    const index = markdown.indexOf(`## ${section}`);
    if (index !== -1 && index < lastIndex) {
      warnings.push(`section order differs from AGENTS.md near ${section}`);
    }
    if (index !== -1) lastIndex = index;
  }
}

function containsAny(markdown: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(markdown));
}

function detectBoundaryViolations(markdown: string): string[] {
  const violations: string[] = [];
  if (markdown.includes("sources/ruankaodaren/raw/html")) violations.push("raw HTML path found");
  if (markdown.includes("sources/ruankaodaren/raw/xhr")) violations.push("raw XHR path found");
  if (!markdown.includes("不补写缺失内容")) violations.push("missing no-content-supplementation statement");
  if (!markdown.includes("未 OCR")) violations.push("missing no-OCR statement");
  if (!markdown.includes("未还原图片表格")) violations.push("missing no-image-table-reconstruction statement");
  if (containsAny(markdown, [/根据图片内容可知/, /图片内容显示/, /从图片中可以看出/, /OCR\s*结果/i])) {
    violations.push("possible implicit OCR or image reconstruction wording found");
  }
  if (containsAny(markdown, [/在线来源显示/, /网页显示/, /联网获取/, /fetched\s+from\s+web/i])) {
    violations.push("possible web fetch or online source claim found");
  }
  return violations;
}

function detectReadabilityWarnings(markdown: string, sectionsPresent: string[]): string[] {
  const warnings: string[] = [];
  sectionOrderIsValid(markdown, warnings);

  for (const section of REQUIRED_SECTIONS) {
    if (!sectionsPresent.includes(section)) continue;
    if (sectionBody(markdown, section).length === 0) warnings.push(`${section} is empty`);
  }

  if (containsAny(markdown, [/\{\{[^}]+\}\}/, /\bTODO\b/i, /\bTBD\b/i])) {
    warnings.push("unreplaced template marker found");
  }

  const paragraphs = markdown.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const repeated = new Map<string, number>();
  for (const paragraph of paragraphs) {
    if (paragraph.length < 30) continue;
    const normalized = paragraph.replace(/\s+/g, " ");
    repeated.set(normalized, (repeated.get(normalized) ?? 0) + 1);
  }
  const repeatedCount = [...repeated.values()].filter((count) => count > 1).length;
  if (repeatedCount > 0) warnings.push(`possible repeated paragraph count: ${repeatedCount}`);

  const longParagraphCount = paragraphs.filter((paragraph) => paragraph.length > 500).length;
  if (longParagraphCount > 0) warnings.push(`long paragraph count over 500 chars: ${longParagraphCount}`);

  if (!markdown.includes("人工复核")) warnings.push("human review reminder is missing or weak");
  return warnings;
}

function auditAssetPolicy(markdown: string, renderAs: RuankaoRenderAs): string[] {
  if (renderAs !== "asset_card") return [];
  const violations: string[] = [];
  if (!markdown.includes("asset_ref")) violations.push("asset_card missing asset_ref");
  if (!markdown.includes("sha256")) violations.push("asset_card missing asset sha256");
  if (!markdown.includes("saved_path")) violations.push("asset_card missing saved_path");
  if (!markdown.includes("需要人工复核图片内容") && !markdown.includes("图片内容需人工复核")) {
    violations.push("asset_card missing manual review warning");
  }
  if (containsAny(markdown, [/根据图片内容可知/, /图片表格内容/, /图片中列出/])) {
    violations.push("asset_card appears to describe image or table content");
  }
  return violations;
}

function auditShortCardPolicy(markdown: string, renderAs: RuankaoRenderAs): string[] {
  if (renderAs !== "short_card") return [];
  const violations: string[] = [];
  if (!markdown.includes("短文本卡片")) violations.push("short_card missing short-card warning");
  if (!markdown.includes("不因内容短而补写")) violations.push("short_card missing no-padding warning");
  if (!markdown.includes("后续可人工补充")) violations.push("short_card missing manual supplementation marker");
  return violations;
}

function auditConceptCardPolicy(markdown: string, renderAs: RuankaoRenderAs): string[] {
  if (renderAs !== "concept_card") return [];
  const violations: string[] = [];
  if (!markdown.includes("intermediate JSON") && !markdown.includes("中间层")) {
    violations.push("concept_card missing intermediate-source boundary");
  }
  if (containsAny(markdown, [/考试必考/, /一定会考/, /论文可直接使用/]) ||
    (markdown.includes("可直接套用") && !markdown.includes("不生成可直接套用"))) {
    violations.push("concept_card may contain unsupported exam or paper conclusion");
  }
  if (!markdown.includes("不写未来源支持的考试结论")) {
    violations.push("concept_card missing unsupported-exam-conclusion warning");
  }
  return violations;
}

function hasPolicySpecificWarning(markdown: string, renderAs: RuankaoRenderAs): boolean {
  if (renderAs === "asset_card") {
    return markdown.includes("asset_ref 只是引用") &&
      markdown.includes("图片内容需人工复核") &&
      markdown.includes("不根据图片内容自动还原");
  }
  if (renderAs === "short_card") {
    return markdown.includes("短文本卡片") &&
      markdown.includes("不因内容短而扩写") &&
      markdown.includes("需人工补充");
  }
  if (renderAs === "concept_card") {
    return markdown.includes("只基于 intermediate") &&
      markdown.includes("不生成未来源支持的考试结论");
  }
  return markdown.includes("人工复核任务卡") && markdown.includes("不作为最终学习卡片");
}

function hasManualCompletionGuidance(markdown: string): boolean {
  return markdown.includes("是否需要补充定义") &&
    markdown.includes("是否需要补充案例分析答题点") &&
    markdown.includes("是否需要补充论文可用表达");
}

function qualityStatusFor(document: DocumentAudit): QualityStatus {
  const hardViolationCount =
    document.sections_missing.length +
    document.boundary_violations.length +
    document.asset_policy_violations.length +
    document.short_card_policy_violations.length +
    document.concept_card_policy_violations.length;
  if (hardViolationCount > 0) return "fail";
  if (
    !document.has_human_review_block ||
    !document.has_renderer_boundary_block ||
    !document.has_policy_specific_warning ||
    !document.has_manual_completion_guidance
  ) {
    return "pass_with_warnings";
  }
  if (document.readability_warnings.length > 0) return "pass_with_warnings";
  return "pass";
}

function recommendedActionFor(document: DocumentAudit): RecommendedAction {
  if (document.quality_status === "fail" && document.boundary_violations.length > 0) return "revise_renderer_policy";
  if (document.quality_status === "fail") return "revise_template";
  if (document.human_review_required || document.quality_status === "pass_with_warnings") return "manual_review_required";
  return "accept_as_baseline";
}

function auditDocument(
  item: RuankaoRendererInputItem,
  traceItem: TraceItem | undefined
): DocumentAudit {
  const docPath = traceItem?.official_output_path ?? `docs/ruankaodaren/baseline/${safeTitle(item.canonical_title)}.md`;
  const absPath = resolve(repoRoot, docPath);
  if (!existsSync(absPath)) fail(`official Markdown missing: ${docPath}`);

  const markdown = readFileSync(absPath, "utf8");
  const sectionsPresent = REQUIRED_SECTIONS.filter((section) => markdown.includes(`## ${section}`));
  const sectionsMissing = REQUIRED_SECTIONS.filter((section) => !sectionsPresent.includes(section));
  const boundaryViolations = detectBoundaryViolations(markdown);
  let readabilityWarnings = detectReadabilityWarnings(markdown, sectionsPresent);
  const hasHumanReviewBlock = markdown.includes("Human Review Checklist / 人工复核清单");
  const hasRendererBoundaryBlock = markdown.includes("Renderer Boundary / 渲染边界");
  const hasSpecificWarning = hasPolicySpecificWarning(markdown, item.renderer_policy.render_as);
  const hasManualGuidance = hasManualCompletionGuidance(markdown);

  if (hasHumanReviewBlock && hasRendererBoundaryBlock && hasSpecificWarning && hasManualGuidance) {
    readabilityWarnings = readabilityWarnings.filter((warning) => !warning.startsWith("long paragraph count"));
  }

  if (!markdown.includes("Renderer policy:")) readabilityWarnings.push("renderer policy label missing");
  if (!markdown.includes("renderer input contract path")) readabilityWarnings.push("renderer input contract path missing");
  if (!markdown.includes("intermediate JSON path")) readabilityWarnings.push("intermediate path missing");
  if (!markdown.includes("Source Reference / 来源引用")) boundaryViolations.push("Source Reference section missing");
  if (!hasHumanReviewBlock) readabilityWarnings.push("Human Review Checklist block missing");
  if (!hasRendererBoundaryBlock) readabilityWarnings.push("Renderer Boundary block missing");
  if (!hasSpecificWarning) readabilityWarnings.push("policy-specific warning missing or weak");
  if (!hasManualGuidance) readabilityWarnings.push("manual completion guidance missing or weak");

  const document: DocumentAudit = {
    title: item.canonical_title,
    path: docPath,
    render_as: item.renderer_policy.render_as,
    sections_present: sectionsPresent,
    sections_missing: sectionsMissing,
    boundary_violations: boundaryViolations,
    asset_policy_violations: auditAssetPolicy(markdown, item.renderer_policy.render_as),
    short_card_policy_violations: auditShortCardPolicy(markdown, item.renderer_policy.render_as),
    concept_card_policy_violations: auditConceptCardPolicy(markdown, item.renderer_policy.render_as),
    readability_warnings: readabilityWarnings,
    has_human_review_block: hasHumanReviewBlock,
    has_renderer_boundary_block: hasRendererBoundaryBlock,
    has_policy_specific_warning: hasSpecificWarning,
    has_manual_completion_guidance: hasManualGuidance,
    human_review_required: item.manual_review_required || markdown.includes("人工复核"),
    quality_status: "pass",
    recommended_action: "accept_as_baseline",
  };
  document.quality_status = qualityStatusFor(document);
  document.recommended_action = recommendedActionFor(document);
  return document;
}

function writeMarkdownReport(report: QualityAuditReport): void {
  const lines = [
    "# Phase 4.3 Render Quality Audit",
    "",
    "## Summary",
    "",
    "| Field | Value |",
    "|---|---|",
    `| audited_doc_count | ${report.audited_doc_count} |`,
    `| pass_count | ${report.pass_count} |`,
    `| pass_with_warnings_count | ${report.pass_with_warnings_count} |`,
    `| fail_count | ${report.fail_count} |`,
    `| boundary_violation_count | ${report.boundary_violation_count} |`,
    `| human_review_required_count | ${report.human_review_required_count} |`,
    `| recommended_next_phase | ${report.recommended_next_phase} |`,
    "",
    "## Documents",
    "",
  ];

  for (const doc of report.documents) {
    lines.push(`### ${doc.title}`);
    lines.push("");
    lines.push(`- path: \`${doc.path}\``);
    lines.push(`- render_as: \`${doc.render_as}\``);
    lines.push(`- quality_status: \`${doc.quality_status}\``);
    lines.push(`- recommended_action: \`${doc.recommended_action}\``);
    lines.push(`- human_review_required: ${doc.human_review_required}`);
    lines.push(`- has_human_review_block: ${doc.has_human_review_block}`);
    lines.push(`- has_renderer_boundary_block: ${doc.has_renderer_boundary_block}`);
    lines.push(`- has_policy_specific_warning: ${doc.has_policy_specific_warning}`);
    lines.push(`- has_manual_completion_guidance: ${doc.has_manual_completion_guidance}`);
    lines.push(`- sections_missing: ${doc.sections_missing.length === 0 ? "none" : doc.sections_missing.join(", ")}`);
    lines.push(`- boundary_violations: ${doc.boundary_violations.length === 0 ? "none" : doc.boundary_violations.join("; ")}`);
    lines.push(`- asset_policy_violations: ${doc.asset_policy_violations.length === 0 ? "none" : doc.asset_policy_violations.join("; ")}`);
    lines.push(`- short_card_policy_violations: ${doc.short_card_policy_violations.length === 0 ? "none" : doc.short_card_policy_violations.join("; ")}`);
    lines.push(`- concept_card_policy_violations: ${doc.concept_card_policy_violations.length === 0 ? "none" : doc.concept_card_policy_violations.join("; ")}`);
    lines.push(`- readability_warnings: ${doc.readability_warnings.length === 0 ? "none" : doc.readability_warnings.join("; ")}`);
    lines.push("");
  }

  lines.push("## Boundary");
  lines.push("");
  lines.push("- No raw HTML direct read was performed.");
  lines.push("- No raw XHR direct read was performed.");
  lines.push("- No OCR, decryption, image table reconstruction, web requests, or content invention was performed.");
  lines.push("- This audit did not modify official Markdown.");
  lines.push("");

  writeFileSync(mdOutputPath, lines.join("\n"), "utf8");
}

function main(): void {
  if (!existsSync(contractPath)) fail("renderer input contract missing");
  if (!existsSync(tracePath)) fail("Phase 4.2 aggregate trace missing");
  mkdirSync(generatedDir, { recursive: true });
  snapshotBeforeAudit();

  const contract = readJson<RuankaoRendererInputContract>(contractPath);
  const trace = readJson<BaselineTrace>(tracePath);
  if (trace.phase !== "4.2") fail("Phase 4.2 aggregate trace has unexpected phase");

  const documents = contract.baseline_items.map((item) => {
    const traceItem = trace.items.find((candidate) => candidate.title === item.canonical_title);
    return auditDocument(item, traceItem);
  });

  const report: QualityAuditReport = {
    phase: "4.3",
    created_at: new Date().toISOString(),
    audited_doc_count: documents.length,
    pass_count: documents.filter((doc) => doc.quality_status === "pass").length,
    pass_with_warnings_count: documents.filter((doc) => doc.quality_status === "pass_with_warnings").length,
    fail_count: documents.filter((doc) => doc.quality_status === "fail").length,
    boundary_violation_count: documents.reduce((sum, doc) => sum + doc.boundary_violations.length, 0),
    human_review_required_count: documents.filter((doc) => doc.human_review_required).length,
    documents_requiring_manual_review: documents.filter((doc) => doc.human_review_required).map((doc) => doc.title),
    recommended_next_phase: documents.some((doc) => doc.quality_status === "fail")
      ? "fix_render_quality_before_phase4_4"
      : documents.some((doc) => doc.quality_status === "pass_with_warnings")
        ? "phase4_4_renderer_policy_refinement"
        : "phase4_5_planning_candidate_after_human_review",
    documents,
  };

  writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeMarkdownReport(report);
  writeFileSync(phase44AfterJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  copyFileSync(mdOutputPath, phase44AfterMdPath);

  console.log("[audit:render-quality] Render quality audit generated");
  console.log(`  audited_doc_count:           ${report.audited_doc_count}`);
  console.log(`  pass_count:                  ${report.pass_count}`);
  console.log(`  pass_with_warnings_count:    ${report.pass_with_warnings_count}`);
  console.log(`  fail_count:                  ${report.fail_count}`);
  console.log(`  boundary_violation_count:    ${report.boundary_violation_count}`);
  console.log(`  human_review_required_count: ${report.human_review_required_count}`);
  console.log(`  recommended_next_phase:      ${report.recommended_next_phase}`);
  console.log(`  JSON:                        ${toRepoPath(jsonOutputPath)}`);
  console.log(`  MD:                          ${toRepoPath(mdOutputPath)}`);
}

main();
