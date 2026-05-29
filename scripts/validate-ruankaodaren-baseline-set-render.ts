/**
 * Phase 4.2 baseline-set render validator.
 *
 * Validates the three official baseline Markdown outputs and the aggregate
 * render trace. This script does not crawl, access the web, read raw HTML/XHR,
 * OCR, decrypt, or render.
 *
 * Usage:
 *   pnpm validate:baseline-set-render
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const officialDir = resolve(repoRoot, "docs/ruankaodaren/baseline");
const tracePath = resolve(repoRoot, "verification/generated/phase4_2_baseline_set_render_trace.json");

const REQUIRED_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

const EXPECTED_DOCS = [
  "1.3_指令系统CISC和RISC.md",
  "13.3_软件架构风格.md",
  "9.1_信息安全基础知识.md",
];

interface TraceItem {
  title: string;
  render_as: string;
  official_output_path: string;
  intermediate_path: string;
  asset_manifest_path: string | null;
  sections_rendered: string[];
  asset_refs_preserved: boolean;
  source_reference_rendered: boolean;
  ocr_used: boolean;
  image_table_reconstructed: boolean;
  content_invented: boolean;
  raw_html_read: boolean;
  raw_xhr_read: boolean;
  web_requests_used: boolean;
}

interface BaselineSetTrace {
  phase: string;
  rendered_count: number;
  batch_render: boolean;
  controlled_baseline_set_render: boolean;
  input_contract_path: string;
  official_output_dir: string;
  items: TraceItem[];
  allowed_inputs_used: string[];
  forbidden_inputs_touched: string[];
  constraints: {
    ocr_used: boolean;
    encrypted_xhr_decrypted: boolean;
    image_table_reconstructed: boolean;
    content_invented: boolean;
    raw_html_read: boolean;
    raw_xhr_read: boolean;
    web_requests_used: boolean;
  };
}

function fail(message: string): never {
  console.error(`[validate:baseline-set-render] ERROR: ${message}`);
  process.exit(1);
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function requireMarkdownContains(markdown: string, snippet: string, errors: string[], context: string): void {
  if (!markdown.includes(snippet)) errors.push(`${context} missing required snippet: ${snippet}`);
}

function validateTrace(trace: BaselineSetTrace): string[] {
  const errors: string[] = [];
  if (trace.phase !== "4.2") errors.push("trace.phase must be 4.2");
  if (trace.rendered_count !== 3) errors.push(`trace.rendered_count must be 3, got ${trace.rendered_count}`);
  if (trace.controlled_baseline_set_render !== true) errors.push("controlled_baseline_set_render must be true");
  if (trace.batch_render !== false) errors.push("batch_render must be false");
  if (trace.forbidden_inputs_touched.length !== 0) errors.push("forbidden_inputs_touched must be empty");
  if (trace.constraints.ocr_used !== false) errors.push("constraints.ocr_used must be false");
  if (trace.constraints.encrypted_xhr_decrypted !== false) {
    errors.push("constraints.encrypted_xhr_decrypted must be false");
  }
  if (trace.constraints.image_table_reconstructed !== false) {
    errors.push("constraints.image_table_reconstructed must be false");
  }
  if (trace.constraints.content_invented !== false) errors.push("constraints.content_invented must be false");
  if (trace.constraints.raw_html_read !== false) errors.push("constraints.raw_html_read must be false");
  if (trace.constraints.raw_xhr_read !== false) errors.push("constraints.raw_xhr_read must be false");
  if (trace.constraints.web_requests_used !== false) errors.push("constraints.web_requests_used must be false");
  if (trace.items.length !== 3) errors.push(`trace.items length must be 3, got ${trace.items.length}`);

  for (const item of trace.items) {
    for (const section of REQUIRED_SECTIONS) {
      if (!item.sections_rendered.includes(section)) {
        errors.push(`${item.title} trace missing section ${section}`);
      }
    }
    if (item.source_reference_rendered !== true) errors.push(`${item.title} source_reference_rendered must be true`);
    if (item.raw_html_read !== false) errors.push(`${item.title} raw_html_read must be false`);
    if (item.raw_xhr_read !== false) errors.push(`${item.title} raw_xhr_read must be false`);
    if (item.ocr_used !== false) errors.push(`${item.title} ocr_used must be false`);
    if (item.image_table_reconstructed !== false) {
      errors.push(`${item.title} image_table_reconstructed must be false`);
    }
    if (item.content_invented !== false) errors.push(`${item.title} content_invented must be false`);
    if (item.web_requests_used !== false) errors.push(`${item.title} web_requests_used must be false`);
  }

  return errors;
}

function validateMarkdown(fileName: string, traceItem: TraceItem | undefined): string[] {
  const errors: string[] = [];
  const absPath = resolve(officialDir, fileName);
  if (!existsSync(absPath)) {
    errors.push(`official Markdown missing: ${fileName}`);
    return errors;
  }

  const markdown = readFileSync(absPath, "utf8");
  const context = fileName;

  for (const section of REQUIRED_SECTIONS) {
    requireMarkdownContains(markdown, section, errors, context);
  }
  requireMarkdownContains(markdown, "Source Reference / 来源引用", errors, context);
  requireMarkdownContains(markdown, "Human Review Checklist / 人工复核清单", errors, context);
  requireMarkdownContains(markdown, "Renderer Boundary / 渲染边界", errors, context);
  requireMarkdownContains(markdown, "不补写缺失内容", errors, context);
  requireMarkdownContains(markdown, "未 OCR", errors, context);
  requireMarkdownContains(markdown, "未解密", errors, context);
  requireMarkdownContains(markdown, "encrypt=1", errors, context);
  requireMarkdownContains(markdown, "未还原图片表格", errors, context);
  requireMarkdownContains(markdown, "未读取 raw HTML", errors, context);
  requireMarkdownContains(markdown, "未读取 raw XHR", errors, context);
  requireMarkdownContains(markdown, "未访问网页", errors, context);
  requireMarkdownContains(markdown, "未补写缺失内容", errors, context);
  requireMarkdownContains(markdown, "Renderer policy:", errors, context);
  requireMarkdownContains(markdown, "intermediate JSON path", errors, context);
  requireMarkdownContains(markdown, "renderer input contract path", errors, context);

  if (markdown.includes("sources/ruankaodaren/raw/html")) errors.push(`${context} must not contain raw HTML path`);
  if (markdown.includes("sources/ruankaodaren/raw/xhr")) errors.push(`${context} must not contain raw XHR path`);

  if (!traceItem) {
    errors.push(`${context} missing matching trace item`);
    return errors;
  }

  if (traceItem.render_as === "asset_card") {
    requireMarkdownContains(markdown, "sha256", errors, context);
    requireMarkdownContains(markdown, "saved_path", errors, context);
    requireMarkdownContains(markdown, "asset_ref", errors, context);
    requireMarkdownContains(markdown, "图片内容需人工复核", errors, context);
    requireMarkdownContains(markdown, "不根据图片内容自动还原", errors, context);
    if (traceItem.asset_refs_preserved !== true) errors.push(`${context} asset_refs_preserved must be true`);
  }

  if (traceItem.render_as === "short_card") {
    requireMarkdownContains(markdown, "short_card", errors, context);
    requireMarkdownContains(markdown, "短文本卡片", errors, context);
    requireMarkdownContains(markdown, "不因内容短而补写", errors, context);
    requireMarkdownContains(markdown, "不因内容短而扩写", errors, context);
    requireMarkdownContains(markdown, "需人工补充", errors, context);
  }

  if (traceItem.render_as === "concept_card") {
    requireMarkdownContains(markdown, "只基于 intermediate", errors, context);
    requireMarkdownContains(markdown, "不生成未来源支持的考试结论", errors, context);
  }

  return errors;
}

function main(): void {
  if (!existsSync(officialDir)) fail("official baseline directory missing: docs/ruankaodaren/baseline");
  if (!existsSync(tracePath)) {
    fail("aggregate trace missing: verification/generated/phase4_2_baseline_set_render_trace.json");
  }

  const actualMdFiles = readdirSync(officialDir).filter((file) => file.endsWith(".md")).sort();
  const expectedMdFiles = [...EXPECTED_DOCS].sort();
  const errors: string[] = [];

  for (const expected of expectedMdFiles) {
    if (!actualMdFiles.includes(expected)) errors.push(`expected official Markdown missing: ${expected}`);
  }
  for (const actual of actualMdFiles) {
    if (!expectedMdFiles.includes(actual)) errors.push(`unexpected official Markdown found: ${actual}`);
  }

  const trace = readJson<BaselineSetTrace>(tracePath);
  errors.push(...validateTrace(trace));

  for (const expected of expectedMdFiles) {
    const title = expected.replace(/_/g, " ").replace(/\.md$/, "");
    const traceItem = trace.items.find((item) => item.official_output_path.endsWith(expected) || item.title === title);
    errors.push(...validateMarkdown(expected, traceItem));
  }

  if (errors.length > 0) {
    console.error("[validate:baseline-set-render] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:baseline-set-render] Baseline set validation passed");
  console.log(`  rendered_count:                 ${trace.rendered_count}`);
  console.log(`  controlled_baseline_set_render: ${trace.controlled_baseline_set_render}`);
  console.log(`  batch_render:                   ${trace.batch_render}`);
  console.log(`  official_docs:                  ${actualMdFiles.join(", ")}`);
  console.log(`  forbidden_inputs_touched:       ${trace.forbidden_inputs_touched.length}`);
}

main();
