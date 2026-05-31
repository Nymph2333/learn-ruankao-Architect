/**
 * Phase 5.1 taxonomy recheck for 13.3 软件架构风格.
 *
 * This script reads the existing reachable-leaf catalog and, when child nodes
 * are not confirmed there, performs a catalog-level live DOM recheck only. It
 * does not click "去掌握", enter detail pages, parse content, run acquisition,
 * generate official Markdown, OCR, decrypt encrypt=1 data, or read raw XHR.
 *
 * Usage:
 *   pnpm recheck:taxonomy
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContextOptions, type Page } from "playwright";
import {
  collectVisibleLeaves,
  ensureRuankaodarenContext,
  expandVisibleChapters,
  openKnowledgeRoute,
  type VisibleLeaf,
} from "./lib/ruankaodaren-dom-explorer.js";

const TARGET = "13.3 软件架构风格";
const KEYWORDS = [
  "13.3 软件架构风格",
  "13.3 软件架构",
  "软件架构风格",
  "13.3.1",
  "13.3.1 软件系统结构风格",
  "13.3.1 软件体系结构风格",
  "13.3.2",
  "13.3.2 基本架构风格",
  "13.3.3",
  "13.3.3 层次结构风格",
  "13.3.4",
  "13.3.4 面向服务的架构 SOA",
  "软件系统结构风格",
  "软件体系结构风格",
  "基本架构风格",
  "层次结构风格",
  "面向服务的架构",
  "SOA",
];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const catalogPath = resolve(generatedDir, "phase3_11_reachable_leaf_catalog.json");
const outputJsonPath = resolve(generatedDir, "phase5_1_taxonomy_recheck.json");
const outputMdPath = resolve(generatedDir, "phase5_1_taxonomy_recheck.md");
const authStatePath = resolve(repoRoot, ".auth/ruankaodaren.storageState.json");

type ChildSource = "live_dom" | "existing_catalog";

interface CatalogLeafLike {
  title?: string;
  raw_text_preview?: string;
  section_number?: string | null;
  chapter_title?: string | null;
}

interface ChildCandidate {
  title: string;
  visible: boolean;
  source: ChildSource;
}

interface TaxonomyRecheckReport {
  target: string;
  existing_catalog_path: string;
  existing_catalog_status: string;
  catalog_search_keywords: string[];
  catalog_matches: Array<{
    title: string;
    source: "existing_catalog";
    keyword_matches: string[];
    raw_text_preview: string | null;
  }>;
  live_recheck_attempted: boolean;
  live_recheck_success: boolean;
  live_recheck_failed: boolean;
  live_recheck_failure_reason: string | null;
  live_visible_leaf_count: number;
  taxonomy_result: {
    is_parent_node: boolean;
    is_leaf_node: boolean;
    is_multi_card_sequence: boolean;
    taxonomy_suspect: true;
    children_found: ChildCandidate[];
  };
  recommended_action:
    | "replace_parent_with_children"
    | "model_as_multi_card_sequence"
    | "keep_as_leaf_with_warning"
    | "manual_review_required";
  constraints: {
    no_detail_page_entered: true;
    no_parse: true;
    no_intermediate_generated: true;
    no_official_markdown_generated: true;
    no_ocr: true;
    no_encrypt1_decrypted: true;
    no_image_table_reconstructed: true;
    no_raw_xhr_read: true;
    phase4_6_not_entered: true;
  };
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function normalize(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

function visibleText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function flattenCatalogLeaves(value: unknown): CatalogLeafLike[] {
  const leaves: CatalogLeafLike[] = [];
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (!node || typeof node !== "object") return;
    const object = node as Record<string, unknown>;
    if (typeof object.title === "string") {
      leaves.push({
        title: object.title,
        raw_text_preview: typeof object.raw_text_preview === "string" ? object.raw_text_preview : undefined,
        section_number: typeof object.section_number === "string" ? object.section_number : undefined,
        chapter_title: typeof object.chapter_title === "string" ? object.chapter_title : undefined,
      });
    }
    for (const child of Object.values(object)) visit(child);
  };
  visit(value);
  return leaves;
}

function keywordMatchesFor(leaf: CatalogLeafLike): string[] {
  const haystack = normalize(`${leaf.title ?? ""} ${leaf.raw_text_preview ?? ""}`);
  return KEYWORDS.filter((keyword) => haystack.includes(normalize(keyword)));
}

function childCandidatesFromLeaves(leaves: CatalogLeafLike[], source: ChildSource): ChildCandidate[] {
  const seen = new Set<string>();
  const candidates: ChildCandidate[] = [];
  for (const leaf of leaves) {
    const title = visibleText(leaf.title);
    if (!/^13\.3\.\d+/.test(title)) continue;
    if (seen.has(title)) continue;
    seen.add(title);
    candidates.push({ title, visible: true, source });
  }
  return candidates;
}

function hasMultiCardSignal(leaves: CatalogLeafLike[]): boolean {
  return leaves.some((leaf) => {
    const title = visibleText(leaf.title);
    const preview = visibleText(leaf.raw_text_preview);
    return title === TARGET && /掌握程度\s*0\s*\/\s*(?:[2-9]|\d{2,})/.test(preview);
  });
}

function normalizeLiveFailureReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes("Executable doesn't exist") ||
    message.includes("Looks like Playwright") ||
    message.includes("playwright install") ||
    message.includes("browserType.launch")
  ) {
    return "Playwright Chromium is not installed or not executable; run pnpm exec playwright install chromium before taxonomy live recheck.";
  }
  return message;
}

async function safeExpandTargetParent(page: Page): Promise<boolean> {
  const marked = await page
    .evaluate((target) => {
      const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[aria-expanded], [role='treeitem'], .el-tree-node__content, div, span"));
      for (const node of nodes) {
        const text = normalize(node.innerText || node.textContent || "");
        if (!text.includes(target)) continue;
        if (text.includes("去掌握")) continue;
        const ariaExpanded = node.getAttribute("aria-expanded");
        const looksExpandable =
          ariaExpanded === "false" ||
          ariaExpanded === "true" ||
          node.getAttribute("role") === "treeitem" ||
          /expand|collapse|tree|node/i.test(node.className.toString());
        const rect = node.getBoundingClientRect();
        if (!looksExpandable || rect.width <= 0 || rect.height <= 0) continue;
        node.setAttribute("data-phase5-taxonomy-target", "1");
        return true;
      }
      return false;
    }, TARGET)
    .catch(() => false);

  if (!marked) return false;
  const locator = page.locator("[data-phase5-taxonomy-target='1']").first();
  const beforeUrl = page.url();
  await locator.scrollIntoViewIfNeeded({ timeout: 3_000 }).catch(() => undefined);
  await locator.click({ timeout: 5_000 }).catch(() => undefined);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    document.querySelector("[data-phase5-taxonomy-target='1']")?.removeAttribute("data-phase5-taxonomy-target");
  }).catch(() => undefined);
  return page.url() === beforeUrl && !page.url().includes("konwledgeInfo");
}

async function liveCatalogRecheck(): Promise<{
  failed: boolean;
  failureReason: string | null;
  visibleLeaves: VisibleLeaf[];
  expandedTarget: boolean;
}> {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  let context: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newContext"]>> | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const contextOptions: BrowserContextOptions = existsSync(authStatePath)
      ? { storageState: authStatePath }
      : {};
    context = await browser.newContext(contextOptions);
    await context.addInitScript(() => {
      Reflect.set(globalThis, "__name", (fn: unknown) => fn);
    });
    const page = await context.newPage();
    await openKnowledgeRoute(page);
    await ensureRuankaodarenContext(page);
    const exploration = await expandVisibleChapters(page);
    let visibleLeaves = exploration.leaves;
    let expandedTarget = false;
    if (!childCandidatesFromLeaves(visibleLeaves, "live_dom").length) {
      expandedTarget = await safeExpandTargetParent(page);
      if (page.url().includes("konwledgeInfo")) {
        return {
          failed: true,
          failureReason: "safe parent expansion unexpectedly entered detail route; taxonomy remains suspect",
          visibleLeaves,
          expandedTarget,
        };
      }
      visibleLeaves = await collectVisibleLeaves(page);
    }
    return {
      failed: false,
      failureReason: expandedTarget ? null : "no safe expandable 13.3 catalog control found",
      visibleLeaves,
      expandedTarget,
    };
  } catch (error) {
    return {
      failed: true,
      failureReason: normalizeLiveFailureReason(error),
      visibleLeaves: [],
      expandedTarget: false,
    };
  } finally {
    await context?.close().catch(() => undefined);
    await browser?.close().catch(() => undefined);
  }
}

function recommendedAction(args: {
  childrenFound: ChildCandidate[];
  multiCard: boolean;
  liveFailed: boolean;
}): TaxonomyRecheckReport["recommended_action"] {
  if (args.childrenFound.length > 0) return "replace_parent_with_children";
  if (args.liveFailed) return "manual_review_required";
  if (args.multiCard) return "model_as_multi_card_sequence";
  return "keep_as_leaf_with_warning";
}

function renderMarkdown(report: TaxonomyRecheckReport): string {
  return [
    "# Phase 5.1 Taxonomy Recheck",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- target: ${report.target}`,
    `- existing_catalog_status: ${report.existing_catalog_status}`,
    `- live_recheck_attempted: ${report.live_recheck_attempted}`,
    `- live_recheck_success: ${report.live_recheck_success}`,
    `- live_recheck_failed: ${report.live_recheck_failed}`,
    `- live_recheck_failure_reason: ${report.live_recheck_failure_reason ?? "(none)"}`,
    `- is_parent_node: ${report.taxonomy_result.is_parent_node}`,
    `- is_leaf_node: ${report.taxonomy_result.is_leaf_node}`,
    `- is_multi_card_sequence: ${report.taxonomy_result.is_multi_card_sequence}`,
    `- taxonomy_suspect: ${report.taxonomy_result.taxonomy_suspect}`,
    `- recommended_action: ${report.recommended_action}`,
    "",
    "## Children Found",
    "",
    ...(report.taxonomy_result.children_found.length > 0
      ? report.taxonomy_result.children_found.map((child) => `- ${child.title} (${child.source}, visible=${child.visible})`)
      : ["- (none)"]),
    "",
    "## Catalog Matches",
    "",
    ...(report.catalog_matches.length > 0
      ? report.catalog_matches.map((match) => `- ${match.title}: ${match.keyword_matches.join(", ")}`)
      : ["- (none)"]),
    "",
    "## Constraints",
    "",
    "- No detail page was intentionally entered.",
    "- No parser or acquisition was run.",
    "- No intermediate JSON was generated.",
    "- No official Markdown was generated.",
    "- No OCR was used.",
    "- No encrypt=1 data was decrypted.",
    "- No image table was reconstructed.",
    "- No raw XHR was read.",
    "- Phase 4.6 was not entered.",
    "",
  ].join("\n");
}

async function main(): Promise<void> {
  if (!existsSync(catalogPath)) {
    console.error(`[recheck:taxonomy] ERROR: missing catalog: ${toRepoPath(catalogPath)}`);
    process.exit(1);
  }

  const catalog = readJson<unknown>(catalogPath);
  const catalogLeaves = flattenCatalogLeaves(catalog);
  const exact13 = catalogLeaves.filter((leaf) => visibleText(leaf.title) === TARGET);
  const catalogMatches = catalogLeaves
    .map((leaf) => ({
      leaf,
      keywordMatches: keywordMatchesFor(leaf),
    }))
    .filter((entry) => entry.keywordMatches.length > 0)
    .map((entry) => ({
      title: visibleText(entry.leaf.title),
      source: "existing_catalog" as const,
      keyword_matches: entry.keywordMatches,
      raw_text_preview: entry.leaf.raw_text_preview ?? null,
    }));
  const existingChildren = childCandidatesFromLeaves(catalogLeaves, "existing_catalog");
  const existingMultiCard = hasMultiCardSignal(catalogLeaves);

  let liveRecheckAttempted = false;
  let liveRecheckFailed = false;
  let liveRecheckFailureReason: string | null = null;
  let liveVisibleLeafCount = 0;
  let liveChildren: ChildCandidate[] = [];

  if (existingChildren.length === 0) {
    liveRecheckAttempted = true;
    const live = await liveCatalogRecheck();
    liveRecheckFailed = live.failed;
    liveRecheckFailureReason = live.failureReason;
    liveVisibleLeafCount = live.visibleLeaves.length;
    liveChildren = childCandidatesFromLeaves(live.visibleLeaves, "live_dom");
  }

  const childrenFound = [...existingChildren, ...liveChildren];
  const isParentNode = childrenFound.length > 0;
  const isLeafNode = exact13.length > 0 && childrenFound.length === 0;
  const isMultiCardSequence = existingMultiCard && childrenFound.length === 0;
  const existingCatalogStatus = [
    exact13.length > 0 ? "target_present_as_catalog_leaf" : "target_not_found",
    existingChildren.length > 0 ? "children_present" : "children_not_confirmed",
    existingMultiCard ? "multi_card_signal_present" : "multi_card_signal_absent",
  ].join(";");

  const report: TaxonomyRecheckReport = {
    target: TARGET,
    existing_catalog_path: toRepoPath(catalogPath),
    existing_catalog_status: existingCatalogStatus,
    catalog_search_keywords: KEYWORDS,
    catalog_matches: catalogMatches,
    live_recheck_attempted: liveRecheckAttempted,
    live_recheck_success: liveRecheckAttempted && !liveRecheckFailed,
    live_recheck_failed: liveRecheckFailed,
    live_recheck_failure_reason: liveRecheckFailureReason,
    live_visible_leaf_count: liveVisibleLeafCount,
    taxonomy_result: {
      is_parent_node: isParentNode,
      is_leaf_node: isLeafNode,
      is_multi_card_sequence: isMultiCardSequence,
      taxonomy_suspect: true,
      children_found: childrenFound,
    },
    recommended_action: recommendedAction({
      childrenFound,
      multiCard: isMultiCardSequence,
      liveFailed: liveRecheckFailed,
    }),
    constraints: {
      no_detail_page_entered: true,
      no_parse: true,
      no_intermediate_generated: true,
      no_official_markdown_generated: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_raw_xhr_read: true,
      phase4_6_not_entered: true,
    },
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(outputJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(outputMdPath, renderMarkdown(report), "utf8");

  console.log("[recheck:taxonomy] Taxonomy recheck complete");
  console.log(`  live_recheck_attempted: ${report.live_recheck_attempted}`);
  console.log(`  live_recheck_success:   ${report.live_recheck_success}`);
  console.log(`  is_parent_node:         ${report.taxonomy_result.is_parent_node}`);
  console.log(`  is_leaf_node:           ${report.taxonomy_result.is_leaf_node}`);
  console.log(`  is_multi_card_sequence: ${report.taxonomy_result.is_multi_card_sequence}`);
  console.log(`  taxonomy_suspect:       ${report.taxonomy_result.taxonomy_suspect}`);
  console.log(`  children_found:         ${report.taxonomy_result.children_found.map((child) => child.title).join(", ") || "(none)"}`);
  console.log(`  recommended_action:     ${report.recommended_action}`);
  console.log(`  JSON report:            ${toRepoPath(outputJsonPath)}`);
  console.log(`  Markdown report:        ${toRepoPath(outputMdPath)}`);
}

main().catch((error) => {
  console.error(`[recheck:taxonomy] ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
