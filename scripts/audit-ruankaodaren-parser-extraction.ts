/**
 * Phase 3.17: parser extraction audit for selected existing samples.
 *
 * Reads existing raw outerHTML and intermediate JSON only. It does not crawl,
 * run acquisition, decrypt encrypt=1 data, OCR images, reconstruct image
 * tables, generate Markdown knowledge documents, or enter Phase 4.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const detailBindingAuditPath = resolve(generatedDir, "phase3_16_detail_binding_audit.json");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");

type ParserLossStatus = "ok" | "moderate_loss" | "severe_loss";

interface DetailBindingTrace {
  target_title: string;
  crawl_timestamp: string | null;
  raw_outer_html?: {
    knowInfo_ql_editor_path?: string | null;
  };
  intermediate_path?: string | null;
}

interface DetailBindingAudit {
  traces?: DetailBindingTrace[];
}

interface ExtractionAuditItem {
  title: string;
  timestamp: string;
  outer_html_path: string | null;
  intermediate_path: string | null;
  outer_html_text_length: number;
  intermediate_text_length: number;
  text_loss_ratio: number;
  direct_root_text_detected: boolean;
  direct_text_node_count: number;
  inline_text_detected: boolean;
  root_text_block_present: boolean;
  parser_loss_status: ParserLossStatus;
  recommended_action: "reparse" | "inspect_container" | "keep_quarantined";
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function resolveRepoPath(repoPath: string | null | undefined): string | null {
  if (!repoPath) return null;
  return resolve(repoRoot, repoPath.replace(/\//g, "\\"));
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function textBlocksLength(doc: RuankaoIntermediateDocument | null): number {
  return (doc?.content?.text_blocks ?? []).reduce((sum, block) => sum + block.text.length, 0);
}

function parserLossStatus(lossRatio: number): ParserLossStatus {
  if (lossRatio > 0.5) return "severe_loss";
  if (lossRatio > 0.2) return "moderate_loss";
  return "ok";
}

function recommendedAction(status: ParserLossStatus): ExtractionAuditItem["recommended_action"] {
  if (status === "severe_loss") return "reparse";
  if (status === "moderate_loss") return "inspect_container";
  return "keep_quarantined";
}

function analyzeTrace(trace: DetailBindingTrace): ExtractionAuditItem {
  const timestamp = trace.crawl_timestamp ?? "";
  const outerHtmlRepoPath = trace.raw_outer_html?.knowInfo_ql_editor_path ?? null;
  const outerHtmlAbsPath = resolveRepoPath(outerHtmlRepoPath);
  const intermediateAbsPath =
    resolveRepoPath(trace.intermediate_path) ??
    (timestamp ? resolve(samplesDir, `${timestamp}.json`) : null);
  const rawHtml = outerHtmlAbsPath && existsSync(outerHtmlAbsPath)
    ? readFileSync(outerHtmlAbsPath, "utf8")
    : "";
  const $ = load(rawHtml);
  const root = $(".knowInfo.ql-editor").first();
  const outerTextLength = stripHtml(rawHtml).length;
  const directTextNodeCount = root
    .contents()
    .toArray()
    .filter((node) => node.type === "text" && (node as { data?: string }).data?.trim())
    .length;
  const inlineTextDetected = root.find("strong, em, span, a").toArray().some((node) => $(node).text().trim().length > 0);
  const intermediate = intermediateAbsPath && existsSync(intermediateAbsPath)
    ? readJson<RuankaoIntermediateDocument>(intermediateAbsPath)
    : null;
  const intermediateTextLength = textBlocksLength(intermediate);
  const textLossRatio = outerTextLength === 0
    ? 0
    : Math.max(0, (outerTextLength - intermediateTextLength) / outerTextLength);
  const status = parserLossStatus(textLossRatio);

  return {
    title: trace.target_title,
    timestamp,
    outer_html_path: outerHtmlRepoPath,
    intermediate_path: toRepoPath(intermediateAbsPath),
    outer_html_text_length: outerTextLength,
    intermediate_text_length: intermediateTextLength,
    text_loss_ratio: Number(textLossRatio.toFixed(4)),
    direct_root_text_detected: directTextNodeCount > 0,
    direct_text_node_count: directTextNodeCount,
    inline_text_detected: inlineTextDetected,
    root_text_block_present: (intermediate?.content?.text_blocks ?? []).some((block) => block.type === "root_text"),
    parser_loss_status: status,
    recommended_action: recommendedAction(status),
  };
}

function writeReports(items: ExtractionAuditItem[]): void {
  mkdirSync(generatedDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const report = {
    generated_at: generatedAt,
    phase: "3.17",
    source_report: "verification/generated/phase3_16_detail_binding_audit.json",
    sample_count: items.length,
    items,
    constraints: {
      no_crawl: true,
      no_acquisition: true,
      no_markdown_generated: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_full_site_crawl: true,
      phase4_not_entered: true,
    },
  };

  const jsonPath = resolve(generatedDir, "phase3_17_parser_extraction_audit.json");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    "# Phase 3.17 Parser Extraction Audit",
    "",
    `Generated at: ${generatedAt}`,
    "",
    "## Summary",
    "",
    "| Title | Timestamp | Outer text length | Intermediate text length | Loss ratio | Direct root text | Inline text | Root block | Status | Action |",
    "|---|---|---:|---:|---:|---|---|---|---|---|",
    ...items.map((item) =>
      `| ${item.title} | ${item.timestamp} | ${item.outer_html_text_length} | ${item.intermediate_text_length} | ${item.text_loss_ratio} | ${item.direct_root_text_detected} | ${item.inline_text_detected} | ${item.root_text_block_present} | ${item.parser_loss_status} | ${item.recommended_action} |`
    ),
    "",
    "## Constraints",
    "",
    "- No crawl performed.",
    "- No acquisition performed.",
    "- No Markdown knowledge documents generated.",
    "- No OCR used.",
    "- No encrypt=1 data decrypted.",
    "- No image table reconstructed.",
    "- No full-site batch crawl performed.",
    "- Phase 4 was not entered.",
    "",
  ];

  const mdPath = resolve(generatedDir, "phase3_17_parser_extraction_audit.md");
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log("[parser-extraction] Audit complete");
  for (const item of items) {
    console.log(
      `  ${item.title}: outer=${item.outer_html_text_length} intermediate=${item.intermediate_text_length} status=${item.parser_loss_status}`
    );
  }
  console.log(`  JSON report: ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report: ${toRepoPath(mdPath)}`);
}

function main(): void {
  if (!existsSync(detailBindingAuditPath)) {
    console.error("[parser-extraction] ERROR: detail binding audit missing:", detailBindingAuditPath);
    process.exit(1);
  }

  const audit = readJson<DetailBindingAudit>(detailBindingAuditPath);
  const traces = audit.traces ?? [];
  if (traces.length === 0) {
    console.error("[parser-extraction] ERROR: no traces found in detail binding audit.");
    process.exit(1);
  }

  writeReports(traces.map(analyzeTrace));
}

main();
