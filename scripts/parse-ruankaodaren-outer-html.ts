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

function findLatestSuccessfulMetadata(timestamp?: string): { ts: string; meta: CrawlerMetadata } {
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
    return { ts: timestamp, meta };
  }

  // Auto-discover latest successful metadata
  for (const fname of files) {
    const meta = loadMetadata(metaDir, fname);
    if (isSuccessfulMetadata(meta)) {
      const ts = fname.replace(".json", "");
      console.log(`[parser] auto-selected timestamp: ${ts}`);
      return { ts, meta };
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

function extractTextBlocks(
  $: ReturnType<typeof load>,
  rootSel: string
): RuankaoContentBlock[] {
  const blocks: RuankaoContentBlock[] = [];
  const seenTexts = new Set<string>();
  let order = 0;

  // Block-level elements: p and li (direct DOM traversal respects order)
  const blockDefs: Array<[string, "paragraph" | "list_item"]> = [
    ["p", "paragraph"],
    ["li", "list_item"],
  ];

  for (const [sel, type] of blockDefs) {
    const elems = $(`${rootSel} ${sel}`);
    for (let i = 0; i < elems.length; i++) {
      const $el = elems.eq(i);
      const text = $el.text().trim();
      if (!text || seenTexts.has(text)) continue;
      seenTexts.add(text);
      blocks.push({
        type,
        text,
        order: order++,
        source_selector: sel,
        html: $.html($el) ?? "",
      });
    }
  }

  // Inline elements: strong, em — only if not already subsumed by a block
  const inlineDefs: Array<[string, "inline"]> = [
    ["strong", "inline"],
    ["em", "inline"],
  ];

  for (const [sel, type] of inlineDefs) {
    const elems = $(`${rootSel} ${sel}`);
    for (let i = 0; i < elems.length; i++) {
      const $el = elems.eq(i);
      const text = $el.text().trim();
      if (!text) continue;
      if (seenTexts.has(text)) continue;
      // Skip if the text is fully contained within any already-seen block text
      const alreadyCovered = [...seenTexts].some((seen) => seen.includes(text));
      if (alreadyCovered) continue;
      seenTexts.add(text);
      blocks.push({
        type,
        text,
        order: order++,
        source_selector: sel,
        html: $.html($el) ?? "",
      });
    }
  }

  // Sort by DOM order (p elements come first, then inline)
  blocks.sort((a, b) => a.order - b.order);
  return blocks;
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
  $: ReturnType<typeof load>,
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
      $parent.prev("p").text().trim() ||
      $parent.prevAll("p").first().text().trim() ||
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
  $: ReturnType<typeof load>,
  rootSel: string,
  rawHtml: string
): RuankaoHtmlFragment[] {
  const rootEl = $(rootSel).first();
  return [
    {
      source_selector: rootSel,
      outer_html: rawHtml,
      text_length: rootEl.text().trim().length,
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
const { ts, meta } = findLatestSuccessfulMetadata(latestSuccess ? undefined : timestamp);
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

const textBlocks = extractTextBlocks($, rootSel);
const keyTerms = extractKeyTerms($, rootSel);
const imageRefs = extractImageRefs($, rootSel);
const htmlFragments = extractHtmlFragments($, rootSel, rawHtml);
const { classification, confidence, reasons } = classify(textBlocks, imageRefs);

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
    requires_manual_review: reasons.length > 0,
    manual_review_reasons: reasons,
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

console.log(`[parser] output: ${outputPath}`);
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
