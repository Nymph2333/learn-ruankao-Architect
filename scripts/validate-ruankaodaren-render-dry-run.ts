/**
 * Phase 4.0 dry-run renderer validator.
 *
 * Validates the latest phase4_0_dry_run_*.md and matching trace JSON in
 * verification/generated. This script only reads dry-run outputs and does not
 * render, crawl, OCR, or inspect raw HTML/XHR.
 *
 * Usage:
 *   pnpm validate:render-dry-run
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");

const REQUIRED_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

interface RenderTrace {
  title: string;
  render_as: string;
  input_contract_path: string;
  intermediate_path: string;
  asset_manifest_path: string | null;
  output_markdown_path: string;
  allowed_inputs_used: string[];
  forbidden_inputs_touched: string[];
  sections_rendered: string[];
  asset_refs_preserved: boolean;
  ocr_used: boolean;
  image_table_reconstructed: boolean;
  content_invented: boolean;
  raw_html_read: boolean;
  raw_xhr_read: boolean;
  web_requests_used?: boolean;
  markdown_generated_to_docs?: boolean;
}

function fail(message: string): never {
  console.error(`[validate:render-dry-run] ERROR: ${message}`);
  process.exit(1);
}

function findLatestTrace(): string {
  if (!existsSync(generatedDir)) fail("verification/generated directory does not exist");
  const traceFiles = readdirSync(generatedDir)
    .filter((file) => file.startsWith("phase4_0_dry_run_") && file.endsWith(".json"))
    .map((file) => resolve(generatedDir, file));

  if (traceFiles.length === 0) {
    fail("no phase4_0_dry_run_*.json trace found; run pnpm render:dry-run first");
  }

  traceFiles.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return traceFiles[0];
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function invariantCheck(trace: RenderTrace, markdown: string): string[] {
  const errors: string[] = [];

  if (trace.ocr_used !== false) errors.push("trace.ocr_used must be false");
  if (trace.image_table_reconstructed !== false) errors.push("trace.image_table_reconstructed must be false");
  if (trace.content_invented !== false) errors.push("trace.content_invented must be false");
  if (trace.raw_html_read !== false) errors.push("trace.raw_html_read must be false");
  if (trace.raw_xhr_read !== false) errors.push("trace.raw_xhr_read must be false");
  if (trace.web_requests_used !== false) errors.push("trace.web_requests_used must be false");
  if (trace.markdown_generated_to_docs !== false) errors.push("trace.markdown_generated_to_docs must be false");
  if (trace.forbidden_inputs_touched.length !== 0) {
    errors.push(`forbidden_inputs_touched must be empty, got ${trace.forbidden_inputs_touched.join(", ")}`);
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!trace.sections_rendered.includes(section)) {
      errors.push(`sections_rendered missing ${section}`);
    }
    if (!markdown.includes(section)) {
      errors.push(`Markdown missing section ${section}`);
    }
  }

  if (!markdown.includes("Source Reference / 来源引用")) {
    errors.push("Markdown must contain Source Reference / 来源引用");
  }
  if (!markdown.includes("不补写缺失内容")) {
    errors.push("Markdown must include a no-content-supplementation statement");
  }

  if (trace.render_as === "asset_card") {
    if (trace.asset_refs_preserved !== true) errors.push("asset_card must preserve asset_refs");
    if (!markdown.includes("asset_ref")) errors.push("asset_card Markdown must include asset_ref entries");
    if (!markdown.includes("sha256")) errors.push("asset_card Markdown must include asset sha256");
    if (!markdown.includes("manual_review_required")) {
      errors.push("asset_card Markdown must include manual_review_required");
    }
  }

  return errors;
}

function main(): void {
  const tracePath = findLatestTrace();
  const trace = readJson<RenderTrace>(tracePath);
  const markdownPath = resolve(repoRoot, trace.output_markdown_path);

  if (!existsSync(markdownPath)) fail(`dry-run Markdown not found: ${trace.output_markdown_path}`);
  const markdown = readFileSync(markdownPath, "utf8");
  const errors = invariantCheck(trace, markdown);

  if (errors.length > 0) {
    console.error("[validate:render-dry-run] Dry-run validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:render-dry-run] Dry-run validation passed");
  console.log(`  title:                    ${trace.title}`);
  console.log(`  render_as:                ${trace.render_as}`);
  console.log(`  markdown:                 ${trace.output_markdown_path}`);
  console.log(`  trace:                    ${tracePath.replace(/\\/g, "/")}`);
  console.log(`  sections_rendered:        ${trace.sections_rendered.length}`);
  console.log(`  allowed_inputs_used:      ${trace.allowed_inputs_used.join(", ")}`);
  console.log(`  forbidden_inputs_touched: ${trace.forbidden_inputs_touched.length}`);
  console.log(`  asset_refs_preserved:     ${trace.asset_refs_preserved}`);
}

main();
