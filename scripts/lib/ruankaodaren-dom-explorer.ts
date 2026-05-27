import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "playwright";
import {
  isLikelySameLeaf,
  normalizeTitle,
  parseTargetSection,
  titleTokens,
  visibleTitle,
  type CatalogLeafMatch,
  type CatalogMatchStrategy,
} from "./ruankaodaren-target-resolution.js";

export const RUANKAODAREN_SOURCE_URL = "https://ruankaodaren.com/exam/#/knowlegde";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const generatedDir = resolve(repoRoot, "verification/generated");
const debugDir = resolve(generatedDir, "phase3_14_live_replay_debug");

const NAVIGATION_TIMEOUT_MS = 30_000;
const NETWORK_IDLE_TIMEOUT_MS = 20_000;
const WAIT_AFTER_RENDER_MS = 3_000;
const WAIT_AFTER_CONTEXT_CLICK_MS = 2_500;
const WAIT_AFTER_CHAPTER_CLICK_MS = 800;
const WAIT_AFTER_SCROLL_MS = 350;
const TARGET_CONTEXT_TEXTS = ["系统架构设计师", "架构设计师", "高级"];
const CONTEXT_SELECTION_ROUTE_SIGNALS = ["switchAccounts", "switchAccount", "account", "select"];

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisibleChapter {
  text: string;
  normalized_text: string;
  chapter_number: string | null;
  visible: boolean;
  expanded: boolean | null;
  dom_order: number;
  bounding_box: BoundingBox | null;
}

export interface VisibleLeaf {
  title: string;
  normalized_title: string;
  section_number: string | null;
  chapter_number: string | null;
  visible: boolean;
  has_detail_entry_signal: boolean;
  dom_order: number;
  chapter_title: string | null;
  bounding_box: BoundingBox | null;
  raw_text_preview: string;
  confidence: "high" | "medium" | "low";
}

export interface LiveLeafMatch {
  found: boolean;
  strategy: CatalogMatchStrategy;
  leaf: VisibleLeaf | null;
  candidates: VisibleLeaf[];
  failure_reason: string | null;
}

export interface DomExplorationSnapshot {
  chapters: VisibleChapter[];
  leaves: VisibleLeaf[];
  warnings: string[];
}

export interface ReplayCatalogLeafResult {
  success: boolean;
  match: LiveLeafMatch;
  visible_chapters: VisibleChapter[];
  visible_leaves: VisibleLeaf[];
  failure_type: "catalog_target_not_found" | "catalog_live_replay_mismatch" | null;
  failure_reason: string | null;
}

export interface ReplayDebugPaths {
  screenshot: string;
  body_text: string;
  visible_chapters: string;
  visible_leaves: string;
  candidate_ranking: string;
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function safeTargetName(target: string): string {
  return target
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.\-\u4e00-\u9fff]+/g, "_")
    .slice(0, 80);
}

function hasAnySignal(value: string, signals: string[]): boolean {
  const lowerValue = value.toLowerCase();
  return signals.some((signal) => lowerValue.includes(signal.toLowerCase()));
}

function isContextSelectionRoute(url: string): boolean {
  return hasAnySignal(url, CONTEXT_SELECTION_ROUTE_SIGNALS);
}

async function ensureEvaluateHelper(page: Page): Promise<void> {
  await page.evaluate("globalThis.__name = (fn) => fn;").catch(() => undefined);
}

async function clickVisibleByText(page: Page, text: string): Promise<boolean> {
  const locators = [
    page.getByRole("button", { name: text, exact: false }),
    page.getByText(text, { exact: false }),
  ];

  for (const locator of locators) {
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < Math.min(count, 10); index += 1) {
      const candidate = locator.nth(index);
      const visible = await candidate.isVisible({ timeout: 1_000 }).catch(() => false);
      if (!visible) continue;
      try {
        await candidate.scrollIntoViewIfNeeded({ timeout: 2_000 });
        await candidate.click({ timeout: 5_000 });
        return true;
      } catch {
        // Try the next candidate.
      }
    }
  }

  return false;
}

export async function waitForKnowledgePageReady(page: Page, extraWaitMs = WAIT_AFTER_RENDER_MS): Promise<void> {
  await ensureEvaluateHelper(page);
  try {
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS });
  } catch {
    // The SPA sometimes keeps network activity open; visible DOM is still useful.
  }
  await page.waitForTimeout(extraWaitMs);
  await ensureEvaluateHelper(page);
}

export async function openKnowledgeRoute(page: Page): Promise<void> {
  await ensureEvaluateHelper(page);
  await page.goto(RUANKAODAREN_SOURCE_URL, {
    waitUntil: "domcontentloaded",
    timeout: NAVIGATION_TIMEOUT_MS,
  });
  await waitForKnowledgePageReady(page);
}

export async function ensureRuankaodarenContext(page: Page): Promise<{
  attempted: boolean;
  success: boolean;
  text: string | null;
  warnings: string[];
}> {
  const warnings: string[] = [];
  if (!isContextSelectionRoute(page.url())) {
    return { attempted: false, success: false, text: null, warnings };
  }

  for (const text of TARGET_CONTEXT_TEXTS) {
    const clicked = await clickVisibleByText(page, text);
    if (!clicked) {
      warnings.push(`context text not clickable: ${text}`);
      continue;
    }

    await waitForKnowledgePageReady(page, WAIT_AFTER_CONTEXT_CLICK_MS);
    await openKnowledgeRoute(page);
    if (!isContextSelectionRoute(page.url())) {
      return { attempted: true, success: true, text, warnings };
    }
  }

  warnings.push("context selection route remained after normal context selection attempts");
  return { attempted: true, success: false, text: null, warnings };
}

export async function collectVisibleChapters(page: Page): Promise<VisibleChapter[]> {
  await ensureEvaluateHelper(page);
  return page.evaluate(() => {
    const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
    const chapterPattern = /^第\s*(\d+)\s*章\s*\S*/;
    const selectors = [
      ".chapterExercises-title",
      ".lgchapterExercises-title",
      ".catalogue-title",
      ".el-tree-node__content",
      "div",
      "span",
    ].join(",");
    const seen = new Set<string>();
    const chapters: VisibleChapter[] = [];

    function boxFor(node: Element): BoundingBox | null {
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }

    for (const node of Array.from(document.querySelectorAll(selectors))) {
      const text = normalize((node as HTMLElement).innerText || node.textContent || "");
      if (!text || text.length > 180) continue;
      const match = text.match(chapterPattern);
      if (!match) continue;
      const box = boxFor(node);
      if (!box) continue;
      const chapterText = normalize(match[0] ?? text);
      if (seen.has(chapterText)) continue;
      seen.add(chapterText);
      chapters.push({
        text: chapterText,
        normalized_text: chapterText.replace(/\s+/g, "").toLowerCase(),
        chapter_number: match[1] ?? null,
        visible: true,
        expanded: null,
        dom_order: chapters.length,
        bounding_box: box,
      });
    }

    return chapters;
  });
}

export async function collectVisibleLeaves(page: Page): Promise<VisibleLeaf[]> {
  await ensureEvaluateHelper(page);
  return page.evaluate(() => {
    const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
    const blockedSignals = ["首页", "搜索", "去掌握", "掌握程度", "系统架构设计师", "账号", "登录", "切换"];
    const chapterPattern = /^第\s*(\d+)\s*章\s*\S*/;
    const leafPattern = /^(\d+(?:\.\d+)+)\s+(.+)$/;
    const detailSignalPattern = /去掌握|学习|掌握|查看|详情|进入|开始|练习/;
    const selectors = [
      ".chapterExercises-title",
      ".chapterExercises-title3",
      ".lgchapterExercises-title",
      ".el-tree-node__content",
      ".catalogue-title",
      "li",
      "div",
      "span",
    ].join(",");
    const chapterTitles = new Map<string, string>();
    const leaves: VisibleLeaf[] = [];
    const seen = new Set<string>();

    function boxFor(node: Element): BoundingBox | null {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      if (rect.width <= 0 || rect.height <= 0 || style.display === "none" || style.visibility === "hidden") {
        return null;
      }
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }

    function cleanLeafTitle(rawValue: string): string | null {
      const raw = normalize(rawValue);
      if (!raw || raw.length > 240) return null;
      if (blockedSignals.some((signal) => raw.includes(signal) && !/^\d+(?:\.\d+)+/.test(raw))) {
        return null;
      }
      const directLineMatch = raw.match(/^(\d+(?:\.\d+)+)\s+(.+)$/);
      if (directLineMatch && !/[0-9]\s*\/\s*[0-9]/.test(raw)) {
        const section = directLineMatch[1] ?? "";
        const titlePart = normalize((directLineMatch[2] ?? "").replace(/掌握程度.*$/, ""));
        if (section && titlePart && !blockedSignals.some((signal) => titlePart === signal)) {
          return `${section} ${titlePart}`;
        }
      }
      const lineMatch = raw.match(/^(\d+(?:\.\d+)+)\s+(.+?)(?=\s*(掌握程度|去掌握|学习|查看|详情|进入|开始|练习|$))/);
      if (!lineMatch) return null;
      const section = lineMatch[1] ?? "";
      const titlePart = normalize(lineMatch[2] ?? "");
      if (!section || !titlePart || /^第\s*\d+\s*章/.test(titlePart)) return null;
      if (blockedSignals.some((signal) => titlePart === signal)) return null;
      return `${section} ${titlePart}`;
    }

    const nodes = Array.from(document.querySelectorAll(selectors));
    for (const node of nodes) {
      const box = boxFor(node);
      if (!box) continue;
      const raw = normalize((node as HTMLElement).innerText || node.textContent || "");
      const chapterMatch = raw.match(chapterPattern);
      if (chapterMatch && raw.length <= 180) {
        chapterTitles.set(chapterMatch[1] ?? "", normalize(chapterMatch[0] ?? raw));
      }
    }

    const bodyLines = (document.body.innerText || "").split(/\r?\n/).map(normalize).filter(Boolean);
    for (const line of bodyLines) {
      const chapterMatch = line.match(chapterPattern);
      if (chapterMatch && line.length <= 180) {
        chapterTitles.set(chapterMatch[1] ?? "", normalize(chapterMatch[0] ?? line));
      }
    }

    function pushLeaf(title: string, raw: string, box: BoundingBox | null, confidence: "high" | "medium" | "low"): void {
      if (seen.has(title)) return;
      const leafMatch = title.match(leafPattern);
      const section = leafMatch?.[1] ?? null;
      const chapterNumber = section?.split(".")[0] ?? null;
      seen.add(title);
      leaves.push({
        title,
        normalized_title: title.replace(/\s+/g, "").toLowerCase(),
        section_number: section,
        chapter_number: chapterNumber,
        visible: box !== null,
        has_detail_entry_signal: detailSignalPattern.test(raw),
        dom_order: leaves.length,
        chapter_title: chapterNumber ? chapterTitles.get(chapterNumber) ?? null : null,
        bounding_box: box,
        raw_text_preview: raw.slice(0, 240),
        confidence,
      });
    }

    for (const node of nodes) {
      const box = boxFor(node);
      if (!box) continue;
      const raw = normalize((node as HTMLElement).innerText || node.textContent || "");
      const leafTitle = cleanLeafTitle(raw);
      if (leafTitle) {
        pushLeaf(leafTitle, raw, box, node.className.toString().includes("title") ? "high" : "medium");
      }
    }

    for (const line of bodyLines) {
      const leafTitle = cleanLeafTitle(line);
      if (leafTitle) pushLeaf(leafTitle, line, null, "medium");
    }

    return leaves;
  });
}

function mergeByTitle<T extends { title?: string; text?: string; dom_order: number }>(items: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const item of items) {
    const key = "title" in item && item.title ? item.title : "text" in item && item.text ? item.text : "";
    if (!key) continue;
    const current = byKey.get(key);
    if (!current || item.dom_order < current.dom_order) byKey.set(key, item);
  }
  return [...byKey.values()].sort((a, b) => a.dom_order - b.dom_order);
}

async function clickChapter(page: Page, chapter: VisibleChapter): Promise<boolean> {
  await ensureEvaluateHelper(page);
  const directLocator = page.locator(".chapterExercises-title").filter({ hasText: chapter.text }).first();
  const directVisible = await directLocator.isVisible({ timeout: 800 }).catch(() => false);
  if (directVisible) {
    try {
      await directLocator.scrollIntoViewIfNeeded({ timeout: 3_000 });
      await directLocator.click({ timeout: 5_000 });
      await page.waitForTimeout(WAIT_AFTER_CHAPTER_CLICK_MS);
      if (page.url().includes("konwledgeInfo")) {
        await openKnowledgeRoute(page);
        return false;
      }
      return true;
    } catch {
      // Fall back to DOM marking below.
    }
  }

  const marked = await page
    .evaluate((chapterText) => {
      const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
      const selectors = [
        ".chapterExercises-title",
        ".lgchapterExercises-title",
        ".catalogue-title",
        ".el-tree-node__content",
        "div",
        "span",
      ].join(",");
      const nodes = Array.from(document.querySelectorAll(selectors));
      for (const node of nodes) {
        const text = normalize((node as HTMLElement).innerText || node.textContent || "");
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0 || text.length > 180) continue;
        if (text === chapterText || text.includes(chapterText) || chapterText.includes(text)) {
          node.setAttribute("data-pw-dom-explorer-chapter", "1");
          return true;
        }
      }
      return false;
    }, chapter.text)
    .catch(() => false);

  if (!marked) return false;
  try {
    const locator = page.locator("[data-pw-dom-explorer-chapter='1']").first();
    await locator.scrollIntoViewIfNeeded({ timeout: 3_000 });
    await locator.click({ timeout: 5_000 });
    await page.evaluate(() => {
      document.querySelector("[data-pw-dom-explorer-chapter='1']")?.removeAttribute("data-pw-dom-explorer-chapter");
    }).catch(() => undefined);
    await page.waitForTimeout(WAIT_AFTER_CHAPTER_CLICK_MS);
    if (page.url().includes("konwledgeInfo")) {
      await openKnowledgeRoute(page);
      return false;
    }
    return true;
  } catch {
    await page.evaluate(() => {
      document.querySelector("[data-pw-dom-explorer-chapter='1']")?.removeAttribute("data-pw-dom-explorer-chapter");
    }).catch(() => undefined);
    return false;
  }
}

export async function expandVisibleChapters(page: Page): Promise<DomExplorationSnapshot> {
  const warnings: string[] = [];
  const chapterSnapshots: VisibleChapter[][] = [await collectVisibleChapters(page)];
  const leafSnapshots: VisibleLeaf[][] = [await collectVisibleLeaves(page)];
  const initialChapters = chapterSnapshots[0] ?? [];

  for (const chapter of initialChapters) {
    const beforeLeaves = await collectVisibleLeaves(page);
    const beforeCount = beforeLeaves.filter((leaf) => leaf.chapter_number === chapter.chapter_number).length;
    const clicked = await clickChapter(page, chapter);
    if (!clicked) {
      warnings.push(`chapter click failed: ${chapter.text}`);
      continue;
    }
    const afterLeaves = await collectVisibleLeaves(page);
    const afterCount = afterLeaves.filter((leaf) => leaf.chapter_number === chapter.chapter_number).length;
    chapterSnapshots.push(await collectVisibleChapters(page));
    leafSnapshots.push(afterLeaves);
    if (beforeCount > 0 && afterCount < beforeCount) {
      const restored = await clickChapter(page, chapter);
      if (!restored) warnings.push(`chapter may have collapsed and could not be restored: ${chapter.text}`);
      chapterSnapshots.push(await collectVisibleChapters(page));
      leafSnapshots.push(await collectVisibleLeaves(page));
    }
  }

  const scrollSelectors = [
    "body",
    ".el-scrollbar__wrap",
    ".el-main",
    ".ant-layout-content",
    ".knowledge",
    ".content",
    ".chapterExercises",
    ".lgchapterExercises",
    ".catalogue",
    ".tree",
  ];
  for (const selector of scrollSelectors) {
    const stats = await page
      .evaluate((targetSelector) => {
        const node =
          targetSelector === "body"
            ? document.scrollingElement
            : document.querySelector<HTMLElement>(targetSelector);
        if (!node) return null;
        return {
          selector: targetSelector,
          scrollHeight: node.scrollHeight,
          clientHeight: node.clientHeight,
          originalTop: node.scrollTop,
        };
      }, selector)
      .catch(() => null);
    if (!stats || stats.scrollHeight <= stats.clientHeight + 20) continue;
    const steps = Math.min(6, Math.ceil(stats.scrollHeight / Math.max(stats.clientHeight, 400)));
    for (let step = 0; step <= steps; step += 1) {
      const top = Math.round((stats.scrollHeight - stats.clientHeight) * (step / Math.max(steps, 1)));
      await page
        .evaluate(
          ({ targetSelector, nextTop }) => {
            const node =
              targetSelector === "body"
                ? document.scrollingElement
                : document.querySelector<HTMLElement>(targetSelector);
            if (node) node.scrollTop = nextTop;
          },
          { targetSelector: selector, nextTop: top }
        )
        .catch(() => undefined);
      await page.waitForTimeout(WAIT_AFTER_SCROLL_MS);
      chapterSnapshots.push(await collectVisibleChapters(page));
      leafSnapshots.push(await collectVisibleLeaves(page));
    }
    await page
      .evaluate(
        ({ targetSelector, originalTop }) => {
          const node =
            targetSelector === "body"
              ? document.scrollingElement
              : document.querySelector<HTMLElement>(targetSelector);
          if (node) node.scrollTop = originalTop;
        },
        { targetSelector: selector, originalTop: stats.originalTop }
      )
      .catch(() => undefined);
  }

  const chapters = mergeByTitle(chapterSnapshots.flat()).map((chapter, index) => ({
    ...chapter,
    dom_order: index,
  }));
  const chapterTitleByNumber = new Map(chapters.map((chapter) => [chapter.chapter_number, chapter.text]));
  const leaves = mergeByTitle(leafSnapshots.flat()).map((leaf, index) => ({
    ...leaf,
    dom_order: index,
    chapter_title: leaf.chapter_title ?? chapterTitleByNumber.get(leaf.chapter_number) ?? null,
  }));
  return { chapters, leaves, warnings };
}

function rankCandidates(target: string, leaves: VisibleLeaf[]): VisibleLeaf[] {
  const parsed = parseTargetSection(target);
  const targetTokens = titleTokens(target);
  return [...leaves]
    .map((leaf) => {
      let score = 0;
      if (leaf.title === visibleTitle(target)) score += 100;
      if (leaf.normalized_title === normalizeTitle(target)) score += 80;
      if (parsed?.target_section_number && leaf.section_number === parsed.target_section_number) score += 60;
      const leafTokens = titleTokens(leaf.title);
      score += leafTokens.filter((token) => targetTokens.includes(token)).length * 10;
      if (parsed?.target_chapter_number && leaf.chapter_number === parsed.target_chapter_number) score += 5;
      return { leaf, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.leaf.dom_order - b.leaf.dom_order)
    .map((item) => item.leaf)
    .slice(0, 20);
}

export async function findLiveLeaf(
  page: Page,
  target: string,
  catalogMatch?: CatalogLeafMatch
): Promise<LiveLeafMatch> {
  const leaves = await collectVisibleLeaves(page);
  const lookupTarget = catalogMatch?.leaf_title ?? target;
  const normalizedTarget = normalizeTitle(lookupTarget);
  const parsed = parseTargetSection(lookupTarget);
  const candidates = rankCandidates(lookupTarget, leaves);

  const exact = leaves.find((leaf) => leaf.title === visibleTitle(lookupTarget));
  if (exact) return { found: true, strategy: "exact_full_title", leaf: exact, candidates, failure_reason: null };

  const normalizedExact = leaves.find((leaf) => leaf.normalized_title === normalizedTarget);
  if (normalizedExact) return { found: true, strategy: "normalized_exact", leaf: normalizedExact, candidates, failure_reason: null };

  if (parsed) {
    const bySection = leaves.find((leaf) => leaf.section_number === parsed.target_section_number);
    if (bySection && isLikelySameLeaf(bySection.title, lookupTarget)) {
      return { found: true, strategy: "section_number", leaf: bySection, candidates, failure_reason: null };
    }
  }

  const tokenCandidate = candidates.find((leaf) => titleTokens(leaf.title).some((token) => titleTokens(lookupTarget).includes(token)));
  if (tokenCandidate) {
    return { found: true, strategy: "token_overlap", leaf: tokenCandidate, candidates, failure_reason: null };
  }

  return {
    found: false,
    strategy: "not_found",
    leaf: null,
    candidates,
    failure_reason: leaves.length === 0 ? "no_visible_leaves" : "target_not_in_visible_leaves",
  };
}

export async function replayCatalogLeaf(
  page: Page,
  catalogMatch: CatalogLeafMatch
): Promise<ReplayCatalogLeafResult> {
  if (!catalogMatch.found || !catalogMatch.leaf_title) {
    const chapters = await collectVisibleChapters(page);
    const leaves = await collectVisibleLeaves(page);
    return {
      success: false,
      match: { found: false, strategy: "not_found", leaf: null, candidates: [], failure_reason: "catalog_target_not_found" },
      visible_chapters: chapters,
      visible_leaves: leaves,
      failure_type: "catalog_target_not_found",
      failure_reason: "catalog_target_not_found",
    };
  }

  const exploration = await expandVisibleChapters(page);
  const match = await findLiveLeaf(page, catalogMatch.leaf_title, catalogMatch);
  const success =
    match.found &&
    match.leaf !== null &&
    (match.strategy === "exact_full_title" ||
      match.strategy === "normalized_exact" ||
      match.strategy === "section_number") &&
    isLikelySameLeaf(match.leaf.title, catalogMatch.leaf_title);

  return {
    success,
    match,
    visible_chapters: exploration.chapters,
    visible_leaves: exploration.leaves,
    failure_type: success ? null : "catalog_live_replay_mismatch",
    failure_reason: success ? null : match.failure_reason ?? "catalog_live_replay_mismatch",
  };
}

export async function captureReplayDebugSnapshot(
  page: Page,
  options: {
    target: string;
    visibleChapters?: VisibleChapter[];
    visibleLeaves?: VisibleLeaf[];
    candidates?: VisibleLeaf[];
  }
): Promise<ReplayDebugPaths> {
  await mkdir(debugDir, { recursive: true });
  const safeName = safeTargetName(options.target);
  const screenshotPath = resolve(debugDir, `${safeName}-screenshot.png`);
  const bodyTextPath = resolve(debugDir, `${safeName}-body-text.txt`);
  const chaptersPath = resolve(debugDir, `${safeName}-visible-chapters.json`);
  const leavesPath = resolve(debugDir, `${safeName}-visible-leaves.json`);
  const candidatePath = resolve(debugDir, `${safeName}-candidate-ranking.json`);

  const visibleChapters = options.visibleChapters ?? await collectVisibleChapters(page);
  const visibleLeaves = options.visibleLeaves ?? await collectVisibleLeaves(page);
  const candidates = options.candidates ?? rankCandidates(options.target, visibleLeaves);
  const bodyText = await page.locator("body").innerText({ timeout: 5_000 }).catch(() => "");

  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
  await writeFile(bodyTextPath, bodyText, "utf8");
  await writeFile(chaptersPath, `${JSON.stringify(visibleChapters, null, 2)}\n`, "utf8");
  await writeFile(leavesPath, `${JSON.stringify(visibleLeaves, null, 2)}\n`, "utf8");
  await writeFile(candidatePath, `${JSON.stringify(candidates, null, 2)}\n`, "utf8");

  return {
    screenshot: toRepoPath(screenshotPath),
    body_text: toRepoPath(bodyTextPath),
    visible_chapters: toRepoPath(chaptersPath),
    visible_leaves: toRepoPath(leavesPath),
    candidate_ranking: toRepoPath(candidatePath),
  };
}
