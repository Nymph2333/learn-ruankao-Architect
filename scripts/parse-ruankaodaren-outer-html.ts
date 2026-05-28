/**
 * Phase 3.0: raw-to-intermediate parser for ruankaodaren .knowInfo.ql-editor outerHTML
 *
 * Input:  sources/ruankaodaren/raw/outer-html/<timestamp>-knowInfo_ql-editor.html
 * Output: data/intermediate/ruankaodaren/samples/<timestamp>.json
 *
 * HARD CONSTRAINTS (never violated):
 *   - No OCR
 *   - No encrypt=1 decryption
 *   - No Markdown generation
 *   - No image table reconstruction
 *   - Images stored as asset_refs with requires_manual_review = true
 *
 * Usage:
 *   pnpm parse:ruankaodaren
 *   pnpm parse:ruankaodaren -- --timestamp 2026-05-26T09-40-21-903Z
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import type {
  RuankaoIntermediateDocument,
  RuankaoContentBlock,
  RuankaoKeyTerm,
  RuankaoImageRef,
  RuankaoHtmlFragment,
  ContentSourceClassification,
  ParserConfidence,
  DetailEntryStrategy,
} from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { timestamp?: string; latestSuccess?: boolean } {
  const args = process.argv.slice(2);
  if (args.includes("--latest-success")) {
    return { latestSuccess: true };
  }
  const idx = args.indexOf("--timestamp");
  if (idx !== -1 && args[idx + 1]) {
    return { timestamp: args[idx + 1] };
  }
  return {};
}

// ---------------------------------------------------------------------------
// Metadata discovery
// ---------------------------------------------------------------------------

interface CrawlerMetadata {
  final_url?: string;
  source_url?: string;
  captured_at?: string;
  detail_entry_strategy?: string;
  detail_entry_route_changed?: boolean;
  knowledge_node_click_text?: string;
  outer_html_paths?: string[];
  dom_text_path?: string;
  screenshot_path?: string;
  container_text_path?: string;
  [key: string]: unknown;
}

function loadMetadata(metaDir: string, filename: string): CrawlerMetadata {
  return JSON.parse(readFileSync(resolve(metaDir, filename), "utf8")) as CrawlerMetadata;
}

function isSuccessfulMetadata(meta: CrawlerMetadata): boolean {
  return (
    typeof meta.final_url === "string" &&
    meta.final_url.includes("konwledgeInfo") &&
    meta.detail_entry_strategy === "target_scoped" &&
    meta.detail_entry_route_changed === true &&
    typeof meta.knowledge_node_click_text === "string" &&
    meta.knowledge_node_click_text.length > 0 &&
    Array.isArray(meta.outer_html_paths) &&
    meta.outer_html_paths.some((p) => p.includes("knowInfo_ql-editor"))
  );
}

interface MetadataSelection {
  ts: string;
  meta: CrawlerMetadata;
  metadataPath: string;
  selectedReason: "timestamp_strict" | "latest_success_auto" | "auto_success";
}

function findLatestSuccessfulMetadata(
  timestamp?: string,
  selectedReason: "latest_success_auto" | "auto_success" = "auto_success"
): MetadataSelection {
  const metaDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");

  if (!existsSync(metaDir)) {
    console.error("[parser] ERROR: metadata directory not found:", metaDir);
    process.exit(1);
  }

  const files = readdirSync(metaDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("[parser] ERROR: no metadata files found in", metaDir);
    process.exit(1);
  }

  if (timestamp) {
    const fname = `${timestamp}.json`;
    if (!files.includes(fname)) {
      console.error(`[parser] ERROR: metadata file not found for timestamp: ${timestamp}`);
      console.error(`[parser] Available files: ${files.slice(0, 5).join(", ")}`);
      process.exit(1);
    }
    const meta = loadMetadata(metaDir, fname);
    if (!isSuccessfulMetadata(meta)) {
      console.error(`[parser] ERROR: metadata at ${timestamp} does not satisfy success criteria`);
      console.error("[parser] Required: final_url contains konwledgeInfo, detail_entry_strategy=target_scoped,");
      console.error("[parser]          detail_entry_route_changed=true, knowledge_node_click_text set,");
      console.error("[parser]          outer_html_paths contains knowInfo_ql-editor");
      process.exit(1);
    }
    return {
      ts: timestamp,
      meta,
      metadataPath: resolve(metaDir, fname),
      selectedReason: "timestamp_strict",
    };
  }

  // Auto-discover latest successful metadata
  for (const fname of files) {
    const meta = loadMetadata(metaDir, fname);
    if (isSuccessfulMetadata(meta)) {
      const ts = fname.replace(".json", "");
      console.log(`[parser] auto-selected timestamp: ${ts}`);
      return {
        ts,
        meta,
        metadataPath: resolve(metaDir, fname),
        selectedReason,
      };
    }
  }

  console.error("[parser] ERROR: no successful matched metadata found");
  console.error("[parser] Checked", files.length, "metadata file(s). None satisfy all criteria.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// outerHTML loading
// ---------------------------------------------------------------------------

function findOuterHtmlRelPath(meta: CrawlerMetadata): string {
  const paths = meta.outer_html_paths ?? [];
  const p = paths.find((p) => p.includes("knowInfo_ql-editor"));
  if (!p) {
    console.error("[parser] ERROR: outer_html_paths does not contain a knowInfo_ql-editor path");
    console.error("[parser] Available paths:", paths);
    process.exit(1);
  }
  return p;
}

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

type CheerioApi = ReturnType<typeof load>;
type CheerioNode = {
  type?: string;
  name?: string;
  data?: string;
  children?: CheerioNode[];
};

interface ExtractionDiagnostics {
  root_text_length: number;
  total_text_length: number;
  direct_text_node_count: number;
  extracted_text_block_count: number;
  contains_direct_text: boolean;
}

function normalizeInlineText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeComparableText(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

function selectorHint($: CheerioApi, node: CheerioNode, fallback: string): string {
  if (node.type === "text") return fallback;
  const $node = $(node as never);
  const name = node.name ?? "unknown";
  const id = $node.attr("id");
  const className = ($node.attr("class") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(".");
  if (id) return `${name}#${id}`;
  if (className) return `${name}.${className}`;
  return name;
}

function isBlockElementName(name: string | undefined): boolean {
  return Boolean(name && /^(p|li|h[1-6]|table|blockquote|pre)$/i.test(name));
}

function blockTypeForName(name: string | undefined): RuankaoContentBlock["type"] {
  if (!name) return "unknown";
  if (/^h[1-6]$/i.test(name)) return "heading";
  if (name.toLowerCase() === "li") return "list_item";
  return "paragraph";
}

function extractTextBlocks(
  $: CheerioApi,
  rootSel: string
): { blocks: RuankaoContentBlock[]; diagnostics: ExtractionDiagnostics } {
  const rootEl = $(rootSel).first();
  const rootNode = rootEl.get(0) as CheerioNode | undefined;
  const rootText = normalizeInlineText(rootEl.text());
  const directTextNodeCount = rootEl
    .contents()
    .toArray()
    .filter((node) => node.type === "text" && normalizeInlineText((node as CheerioNode).data ?? "").length > 0)
    .length;
  const candidates: Array<Omit<RuankaoContentBlock, "order"> & { order_hint: number }> = [];
  let orderHint = 0;

  function candidateCovered(text: string): boolean {
    const comparable = normalizeComparableText(text);
    if (!comparable) return true;
    return candidates.some((candidate) => {
      const candidateComparable = normalizeComparableText(candidate.text);
      return candidateComparable === comparable || candidateComparable.includes(comparable);
    });
  }

  function addCandidate(
    type: RuankaoContentBlock["type"],
    text: string,
    sourceSelector: string,
    html: string,
    hint = orderHint++
  ): void {
    const normalizedText = normalizeInlineText(text);
    if (!normalizedText) return;
    const comparable = normalizeComparableText(normalizedText);
    if (!comparable) return;
    if (candidates.some((candidate) => normalizeComparableText(candidate.text) === comparable)) return;
    candidates.push({
      type,
      text: normalizedText,
      source_selector: sourceSelector,
      html,
      order_hint: hint,
    });
  }

  function walk(node: CheerioNode | undefined): void {
    if (!node?.children) return;

    for (const child of node.children) {
      if (child.type === "text") {
        const text = normalizeInlineText(child.data ?? "");
        if (text) {
          addCandidate("root_text", text, `${rootSel}::text`, text);
        }
        continue;
      }

      if (child.type !== "tag") continue;

      const name = child.name?.toLowerCase();
      if (isBlockElementName(name)) {
        addCandidate(
          blockTypeForName(name),
          $(child as never).text(),
          selectorHint($, child, name ?? "unknown"),
          $.html(child as never) ?? ""
        );
        continue;
      }

      walk(child);
    }
  }

  walk(rootNode);

  const capturedTextLength = candidates.reduce((sum, candidate) => sum + candidate.text.length, 0);
  const shouldAddWholeRootText =
    rootText.length > 0 &&
    (directTextNodeCount > 0 || candidates.length === 0) &&
    rootText.length > capturedTextLength + 20 &&
    !candidateCovered(rootText);

  if (shouldAddWholeRootText) {
    addCandidate("root_text", rootText, rootSel, $.html(rootEl) ?? "", -1);
  }

  const inlineElements = $(`${rootSel} strong, ${rootSel} em, ${rootSel} span, ${rootSel} a`);
  for (let index = 0; index < inlineElements.length; index += 1) {
    const $el = inlineElements.eq(index);
    const text = normalizeInlineText($el.text());
    if (!text || candidateCovered(text)) continue;
    addCandidate("inline", text, selectorHint($, $el.get(0) as CheerioNode, "inline"), $.html($el) ?? "");
  }

  const blocks = candidates
    .sort((a, b) => a.order_hint - b.order_hint)
    .map(({ order_hint: _orderHint, ...block }, order) => ({
      ...block,
      order,
    }));

  return {
    blocks,
    diagnostics: {
      root_text_length: rootText.length,
      total_text_length: blocks.reduce((sum, block) => sum + block.text.length, 0),
      direct_text_node_count: directTextNodeCount,
      extracted_text_block_count: blocks.length,
      contains_direct_text: directTextNodeCount > 0,
    },
  };
}

function extractKeyTerms(
  $: ReturnType<typeof load>,
  rootSel: string
): RuankaoKeyTerm[] {
  const terms: RuankaoKeyTerm[] = [];
  let order = 0;

  const termDefs: Array<[string, "underline_placeholder" | "strong" | "emphasis"]> = [
    ["a.underline-placeholder", "underline_placeholder"],
    ["strong", "strong"],
    ["em", "emphasis"],
  ];

  for (const [sel, kind] of termDefs) {
    const elems = $(`${rootSel} ${sel}`);
    for (let i = 0; i < elems.length; i++) {
      const text = elems.eq(i).text().trim();
      if (text) {
        terms.push({ text, kind, order: order++, source_selector: sel });
      }
    }
  }

  return terms;
}

function extractImageRefs(
  $: CheerioApi,
  rootSel: string
): RuankaoImageRef[] {
  const refs: RuankaoImageRef[] = [];
  let order = 0;

  const imgs = $(`${rootSel} img`);
  for (let i = 0; i < imgs.length; i++) {
    const $img = imgs.eq(i);
    const src = $img.attr("src") ?? "";
    const alt = $img.attr("alt") ?? "";
    const title = $img.attr("title") ?? "";

    // Find surrounding text: text of nearest preceding <p>
    const $parent = $img.parent();
    const surroundingText =
      $parent.text().trim() ||
      $parent.prev("p").text().trim() ||
      $parent.prevAll("p").first().text().trim() ||
      $img.closest("p, li, div").text().trim() ||
      "";

    refs.push({
      src,
      alt,
      title,
      order: order++,
      surrounding_text: surroundingText,
      asset_status: "referenced_not_downloaded",
      requires_manual_review: true,
      manual_review_reason: "image may contain table or non-text instructional content",
    });
  }

  return refs;
}

function extractHtmlFragments(
  $: CheerioApi,
  rootSel: string,
  rawHtml: string,
  diagnostics: ExtractionDiagnostics
): RuankaoHtmlFragment[] {
  const rootEl = $(rootSel).first();
  return [
    {
      source_selector: rootSel,
      outer_html: rawHtml,
      text_length: rootEl.text().trim().length,
      contains_direct_text: diagnostics.contains_direct_text,
      contains_image: rootEl.find("img").length > 0,
      contains_table: rootEl.find("table").length > 0,
    },
  ];
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

function classify(
  textBlocks: RuankaoContentBlock[],
  imageRefs: RuankaoImageRef[]
): { classification: ContentSourceClassification; confidence: ParserConfidence; reasons: string[] } {
  const hasText = textBlocks.length > 0;
  const hasImages = imageRefs.length > 0;
  const reasons: string[] = [];

  let classification: ContentSourceClassification;
  let confidence: ParserConfidence;

  if (hasText && hasImages) {
    classification = "MIXED_TEXT_IMAGE";
    confidence = "medium";
    reasons.push(
      `Contains ${imageRefs.length} image(s) that may encode non-text content (e.g. tables, diagrams)`
    );
  } else if (hasText) {
    classification = "HTML_RICH_TEXT";
    confidence = "high";
  } else if (hasImages) {
    classification = "IMAGE_EMBEDDED";
    confidence = "low";
    reasons.push("No extractable text; content is image-only");
  } else {
    classification = "UNSTABLE_OR_INCOMPLETE";
    confidence = "low";
    reasons.push("No text or images found; snapshot may be incomplete or not yet rendered");
  }

  return { classification, confidence, reasons };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { timestamp, latestSuccess } = parseArgs();
// --latest-success uses the same auto-discovery as no-flag (finds latest successful metadata)
const { ts, meta, metadataPath, selectedReason } = findLatestSuccessfulMetadata(
  timestamp,
  latestSuccess ? "latest_success_auto" : "auto_success"
);
console.log(`[parser] timestamp: ${ts}`);

const outerHtmlRelPath = findOuterHtmlRelPath(meta);
const outerHtmlAbsPath = resolve(repoRoot, outerHtmlRelPath);

if (!existsSync(outerHtmlAbsPath)) {
  console.error("[parser] ERROR: outerHTML file not found:", outerHtmlAbsPath);
  console.error("[parser] Raw artifacts may be gitignored. Run the crawler first.");
  process.exit(1);
}

const rawHtml = readFileSync(outerHtmlAbsPath, "utf8");
const sourceOuterHtmlHash = createHash("sha256").update(rawHtml).digest("hex");

const $ = load(rawHtml);
const rootSel = ".knowInfo.ql-editor";
const rootEl = $(rootSel).first();

if (rootEl.length === 0) {
  console.error("[parser] ERROR: selector .knowInfo.ql-editor not found in outerHTML");
  console.error("[parser] Not falling back to body. outerHTML must contain the target selector.");
  process.exit(1);
}

console.log("[parser] .knowInfo.ql-editor found — extracting content...");

// Title: prefer knowledge_node_click_text, then first text node in DOM
const title: string | null =
  (typeof meta.knowledge_node_click_text === "string" && meta.knowledge_node_click_text) ||
  rootEl.find("strong, h1, h2, h3, h4").first().text().trim() ||
  rootEl.find("p").first().text().trim() ||
  null;

const extraction = extractTextBlocks($, rootSel);
const textBlocks = extraction.blocks;
const keyTerms = extractKeyTerms($, rootSel);
const imageRefs = extractImageRefs($, rootSel);
const htmlFragments = extractHtmlFragments($, rootSel, rawHtml, extraction.diagnostics);
const { classification, confidence, reasons } = classify(textBlocks, imageRefs);
const parserReasons = [
  ...reasons,
  extraction.diagnostics.contains_direct_text
    ? `Direct .knowInfo.ql-editor text nodes detected: ${extraction.diagnostics.direct_text_node_count}`
    : "",
].filter((reason) => reason.length > 0);

// Route extraction from final_url hash fragment
const finalUrl = meta.final_url ?? "";
const routeMatch = finalUrl.match(/#\/([^?#]+)/);
const route = routeMatch ? routeMatch[1] : "";

const doc: RuankaoIntermediateDocument = {
  schema_version: "1.0.0",
  source: {
    source_name: "ruankaodaren",
    source_url: finalUrl,
    captured_at: meta.captured_at ?? "",
    timestamp: ts,
    raw_paths: {
      metadata: `sources/ruankaodaren/raw/metadata/${ts}.json`,
      outer_html: outerHtmlRelPath,
      screenshot: meta.screenshot_path ?? `sources/ruankaodaren/raw/screenshots/${ts}.png`,
      dom_text: meta.dom_text_path ?? `sources/ruankaodaren/raw/dom-text/${ts}.txt`,
      containers: meta.container_text_path ?? `sources/ruankaodaren/raw/containers/${ts}.json`,
    },
  },
  navigation_context: {
    target_node_text: meta.knowledge_node_click_text ?? "",
    final_url: finalUrl,
    route,
    detail_entry_strategy: (meta.detail_entry_strategy ?? "unknown") as DetailEntryStrategy,
    detail_entry_route_changed: meta.detail_entry_route_changed ?? false,
  },
  content: {
    title,
    text_blocks: textBlocks,
    key_terms: keyTerms,
    image_refs: imageRefs,
    html_fragments: htmlFragments,
    source_outer_html_hash: sourceOuterHtmlHash,
  },
  classification: {
    content_source_classification: classification,
    parser_confidence: confidence,
    requires_manual_review: parserReasons.length > 0,
    manual_review_reasons: parserReasons,
  },
  constraints: {
    ocr_used: false,
    encrypted_xhr_decrypted: false,
    image_table_reconstructed: false,
    markdown_generated: false,
  },
};

const outputDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
mkdirSync(outputDir, { recursive: true });
const outputPath = resolve(outputDir, `${ts}.json`);
writeFileSync(outputPath, JSON.stringify(doc, null, 2), "utf8");

mkdirSync(generatedDir, { recursive: true });
const selectionLog = {
  generated_at: new Date().toISOString(),
  selected_metadata_timestamp: ts,
  selected_metadata_path: `sources/ruankaodaren/raw/metadata/${ts}.json`,
  selected_metadata_abs_path: metadataPath,
  selected_outer_html_path: outerHtmlRelPath,
  output_intermediate_path: `data/intermediate/ruankaodaren/samples/${ts}.json`,
  selected_reason: selectedReason,
  strict_timestamp_requested: timestamp ?? null,
  latest_success_requested: latestSuccess,
};
const selectionLogPath = resolve(generatedDir, `phase3_16_parser_selection_${ts}.json`);
writeFileSync(selectionLogPath, `${JSON.stringify(selectionLog, null, 2)}\n`, "utf8");

const parserDiagnostics = {
  generated_at: new Date().toISOString(),
  timestamp: ts,
  source_outer_html_path: outerHtmlRelPath,
  root_selector: rootSel,
  ...extraction.diagnostics,
  root_text_loss_ratio:
    extraction.diagnostics.root_text_length === 0
      ? 0
      : 1 - extraction.diagnostics.total_text_length / extraction.diagnostics.root_text_length,
  text_block_types: textBlocks.map((block) => block.type),
  constraints: {
    no_markdown_generated: true,
    no_ocr: true,
    no_encrypt1_decrypted: true,
    no_image_table_reconstructed: true,
  },
};
const parserDiagnosticsPath = resolve(generatedDir, `phase3_17_parser_diagnostics_${ts}.json`);
writeFileSync(parserDiagnosticsPath, `${JSON.stringify(parserDiagnostics, null, 2)}\n`, "utf8");

console.log(`[parser] output: ${outputPath}`);
console.log(`[parser] selected_metadata_timestamp: ${selectionLog.selected_metadata_timestamp}`);
console.log(`[parser] selected_metadata_path: ${selectionLog.selected_metadata_path}`);
console.log(`[parser] selected_outer_html_path: ${selectionLog.selected_outer_html_path}`);
console.log(`[parser] output_intermediate_path: ${selectionLog.output_intermediate_path}`);
console.log(`[parser] selected_reason: ${selectionLog.selected_reason}`);
console.log(`[parser] selection_log: ${selectionLogPath}`);
console.log(`[parser] parser_diagnostics: ${parserDiagnosticsPath}`);
console.log(`[parser] root_text_length: ${extraction.diagnostics.root_text_length}`);
console.log(`[parser] total_text_length: ${extraction.diagnostics.total_text_length}`);
console.log(`[parser] direct_text_node_count: ${extraction.diagnostics.direct_text_node_count}`);
console.log(`[parser] title: ${doc.content.title}`);
console.log(`[parser] text_blocks: ${doc.content.text_blocks.length}`);
console.log(`[parser] key_terms: ${doc.content.key_terms.length}`);
console.log(`[parser] image_refs: ${doc.content.image_refs.length}`);
console.log(`[parser] html_fragments: ${doc.content.html_fragments.length}`);
console.log(`[parser] classification: ${doc.classification.content_source_classification}`);
console.log(`[parser] parser_confidence: ${doc.classification.parser_confidence}`);
console.log(`[parser] requires_manual_review: ${doc.classification.requires_manual_review}`);
console.log(`[parser] constraints.ocr_used: ${doc.constraints.ocr_used}`);
console.log(`[parser] constraints.markdown_generated: ${doc.constraints.markdown_generated}`);
