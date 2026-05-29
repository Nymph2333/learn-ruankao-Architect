/**
 * Phase 4.1 official single-baseline render validator.
 *
 * Validates the one official Markdown output and its trace. This script does
 * not crawl, access the web, read raw HTML/XHR, OCR, decrypt, or render.
 *
 * Usage:
 *   pnpm validate:single-baseline-render
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const officialDir = resolve(repoRoot, "docs/ruankaodaren/baseline");
const officialOutputPath = resolve(officialDir, "1.3_指令系统CISC和RISC.md");
const tracePath = resolve(repoRoot, "verification/generated/phase4_1_single_baseline_render_trace.json");

const REQUIRED_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

interface OfficialRenderTrace {
  phase: string;
  title: string;
  render_as: string;
  official_output_path: string;
  input_contract_path: string;
  intermediate_path: string;
  asset_manifest_path: string | null;
  allowed_inputs_used: string[];
  forbidden_inputs_touched: string[];
  sections_rendered: string[];
  asset_refs_preserved: boolean;
  source_reference_rendered: boolean;
  ocr_used: boolean;
  image_table_reconstructed: boolean;
  content_invented: boolean;
  raw_html_read: boolean;
  raw_xhr_read: boolean;
  web_requests_used: boolean;
  batch_render: boolean;
}

function fail(message: string): never {
  console.error(`[validate:single-baseline-render] ERROR: ${message}`);
  process.exit(1);
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function collectErrors(trace: OfficialRenderTrace, markdown: string): string[] {
  const errors: string[] = [];

  if (trace.phase !== "4.1") errors.push("trace.phase must be 4.1");
  if (trace.title !== "1.3 指令系统CISC和RISC") errors.push("trace.title must be 1.3 指令系统CISC和RISC");
  if (trace.render_as !== "asset_card") errors.push("trace.render_as must be asset_card");
  if (trace.batch_render !== false) errors.push("trace.batch_render must be false");
  if (trace.forbidden_inputs_touched.length !== 0) errors.push("trace.forbidden_inputs_touched must be empty");
  if (trace.ocr_used !== false) errors.push("trace.ocr_used must be false");
  if (trace.image_table_reconstructed !== false) errors.push("trace.image_table_reconstructed must be false");
  if (trace.content_invented !== false) errors.push("trace.content_invented must be false");
  if (trace.raw_html_read !== false) errors.push("trace.raw_html_read must be false");
  if (trace.raw_xhr_read !== false) errors.push("trace.raw_xhr_read must be false");
  if (trace.web_requests_used !== false) errors.push("trace.web_requests_used must be false");
  if (trace.asset_refs_preserved !== true) errors.push("trace.asset_refs_preserved must be true");
  if (trace.source_reference_rendered !== true) errors.push("trace.source_reference_rendered must be true");

  for (const section of REQUIRED_SECTIONS) {
    if (!trace.sections_rendered.includes(section)) errors.push(`trace.sections_rendered missing ${section}`);
    if (!markdown.includes(section)) errors.push(`official Markdown missing ${section}`);
  }

  if (!markdown.includes("Source Reference / 来源引用")) errors.push("Markdown must include Source Reference / 来源引用");
  if (!markdown.includes("不补写缺失内容")) errors.push("Markdown must include no-content-supplementation statement");
  if (!markdown.includes("未 OCR")) errors.push("Markdown must include 未 OCR");
  if (!markdown.includes("未还原图片表格")) errors.push("Markdown must include 未还原图片表格");
  if (!markdown.includes("sha256")) errors.push("Markdown must include asset sha256");
  if (!markdown.includes("saved_path")) errors.push("Markdown must include asset saved_path");
  if (!markdown.includes("asset_ref")) errors.push("Markdown must preserve asset_ref");
  if (markdown.includes("sources/ruankaodaren/raw/html")) errors.push("Markdown must not contain raw HTML path");
  if (markdown.includes("sources/ruankaodaren/raw/xhr")) errors.push("Markdown must not contain raw XHR path");

  const officialMdFiles = readdirSync(officialDir).filter((file) => file.endsWith(".md"));
  if (officialMdFiles.length !== 1) {
    errors.push(`Phase 4.1 must have exactly one official Markdown file, found ${officialMdFiles.length}`);
  }

  return errors;
}

function main(): void {
  if (!existsSync(officialOutputPath)) {
    fail("official output missing: docs/ruankaodaren/baseline/1.3_指令系统CISC和RISC.md");
  }
  if (!existsSync(tracePath)) {
    fail("official trace missing: verification/generated/phase4_1_single_baseline_render_trace.json");
  }

  const markdown = readFileSync(officialOutputPath, "utf8");
  const trace = readJson<OfficialRenderTrace>(tracePath);
  const errors = collectErrors(trace, markdown);

  if (errors.length > 0) {
    console.error("[validate:single-baseline-render] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:single-baseline-render] Official single baseline validation passed");
  console.log(`  title:                    ${trace.title}`);
  console.log(`  render_as:                ${trace.render_as}`);
  console.log(`  official_output_path:     ${trace.official_output_path}`);
  console.log(`  sections_rendered:        ${trace.sections_rendered.length}`);
  console.log(`  allowed_inputs_used:      ${trace.allowed_inputs_used.join(", ")}`);
  console.log(`  forbidden_inputs_touched: ${trace.forbidden_inputs_touched.length}`);
  console.log(`  batch_render:             ${trace.batch_render}`);
  console.log(`  asset_refs_preserved:     ${trace.asset_refs_preserved}`);
}

main();
