/**
 * Phase 3.11: reachable leaf catalog refresh.
 *
 * This script opens the authenticated knowledge route, performs directory-only
 * interactions, and catalogs currently reachable leaf-level titles. It does not
 * enter detail pages, parse content, generate intermediate JSON, OCR images,
 * decrypt encrypt=1 data, reconstruct image tables, or generate Markdown
 * knowledge documents.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContextOptions, type Page } from "playwright";

const SOURCE_URL = "https://ruankaodaren.com/exam/#/knowlegde";
const NAVIGATION_TIMEOUT_MS = 30_000;
const NETWORK_IDLE_TIMEOUT_MS = 20_000;
const WAIT_AFTER_RENDER_MS = 3_000;
const WAIT_AFTER_CHAPTER_CLICK_MS = 800;
const WAIT_AFTER_SCROLL_MS = 350;
const TARGET_CONTEXT_TEXTS = ["系统架构设计师", "架构设计师", "高级"];
const CONTEXT_SELECTION_ROUTE_SIGNALS = ["switchAccounts", "switchAccount", "account", "select"];
const TECH_TOPIC_TERMS = [
  "数据库",
  "索引",
  "事务",
  "网络",
  "TCP",
  "IP",
  "软件测试",
  "架构",
  "设计模式",
  "可靠性",
  "安全",
];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const authStatePath = resolve(repoRoot, ".auth/ruankaodaren.storageState.json");
const generatedDir = resolve(repoRoot, "verification/generated");
const quarantineManifestPath = resolve(
  repoRoot,
  "data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json"
);
const semanticAuditPath = resolve(repoRoot, "verification/generated/phase3_7_semantic_alignment_audit.json");
const qualityAuditPath = resolve(repoRoot, "verification/generated/phase3_4_sample_quality_audit.json");

type Confidence = "high" | "medium" | "low";

interface LeafEntry {
  title: string;
  section_number: string;
  chapter_number: string;
  confidence: Confidence;
  visible: boolean;
  has_detail_entry_signal: boolean;
  raw_text_preview: string;
}

interface ChapterEntry {
  chapter_title: string;
  expanded: boolean;
  leaf_count: number;
  leaves: LeafEntry[];
}

interface RecommendedTarget {
  title: string;
  reason: string;
  suggested_command: string;
}

interface RejectedTarget {
  title: string;
  reason: string;
}

interface CatalogReport {
  captured_at: string;
  source_url: string;
  final_url: string;
  screenshot_path: string | null;
  chapter_count: number;
  leaf_count: number;
  chapters: ChapterEntry[];
  recommended_targets: RecommendedTarget[];
  not_recommended_targets: RejectedTarget[];
  warnings: string[];
  constraints: {
    no_detail_page_entered_intentionally: true;
    no_parse: true;
    no_intermediate_generated: true;
    no_markdown_generated: true;
    no_ocr: true;
    no_encrypt1_decrypted: true;
    no_image_table_reconstructed: true;
    no_full_site_crawl: true;
    phase4_not_entered: true;
  };
}

interface DirectorySnapshot {
  chapters: Array<{
    title: string;
    chapter_number: string;
    raw_text_preview: string;
  }>;
  leaves: LeafEntry[];
}

interface QuarantineManifest {
  items?: Array<{
    title?: string | null;
    quarantine_reason?: string;
  }>;
}

interface SemanticAuditReport {
  samples?: Array<{
    title?: string | null;
    renderer_eligible?: boolean;
  }>;
}

interface QualityAuditReport {
  samples?: Array<{
    identity?: {
      title?: string | null;
    };
    renderer_readiness?: {
      status?: string;
    };
  }>;
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function readJson<T>(absPath: string): T | null {
  if (!existsSync(absPath)) return null;
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function normalizeVisibleText(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function normalizeComparable(text: string | null | undefined): string {
  return normalizeVisibleText(text).replace(/\s+/g, "").toLowerCase();
}

function hasAnySignal(value: string, signals: string[]): boolean {
  const lowerValue = value.toLowerCase();
  return signals.some((signal) => lowerValue.includes(signal.toLowerCase()));
}

function isContextSelectionRoute(url: string): boolean {
  return hasAnySignal(url, CONTEXT_SELECTION_ROUTE_SIGNALS);
}

function commandForTarget(title: string): string {
  return `pnpm crawl:ruankaodaren -- --target "${title.replace(/"/g, '\\"')}" --require-leaf`;
}

function log(message: string): void {
  console.log(`[catalog] ${message}`);
}

function warn(warnings: string[], message: string): void {
  warnings.push(message);
  console.warn(`[catalog][warning] ${message}`);
}

async function waitForRender(page: Page, extraWaitMs = WAIT_AFTER_RENDER_MS): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS });
  } catch {
    // SPA cataloging can continue with the visible DOM if networkidle is noisy.
  }
  await page.waitForTimeout(extraWaitMs);
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
        // Try the next visible candidate.
      }
    }
  }

  return false;
}

async function selectContextIfNeeded(page: Page, warnings: string[]): Promise<void> {
  if (!isContextSelectionRoute(page.url())) return;

  log("context selection route detected; trying normal exam context selection");
  for (const text of TARGET_CONTEXT_TEXTS) {
    const clicked = await clickVisibleByText(page, text);
    if (!clicked) {
      warn(warnings, `context text not clickable: ${text}`);
      continue;
    }

    await waitForRender(page, 2_500);
    await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
    await waitForRender(page);

    if (!isContextSelectionRoute(page.url())) {
      log(`context selected: ${text}`);
      return;
    }
  }

  warn(warnings, "context selection route remained after conservative context selection attempts");
}

function mergeSnapshots(snapshots: DirectorySnapshot[]): DirectorySnapshot {
  const chaptersByTitle = new Map<string, DirectorySnapshot["chapters"][number]>();
  const leavesByTitle = new Map<string, LeafEntry>();

  for (const snapshot of snapshots) {
    for (const chapter of snapshot.chapters) {
      if (!chaptersByTitle.has(chapter.title)) {
        chaptersByTitle.set(chapter.title, chapter);
      }
    }

    for (const leaf of snapshot.leaves) {
      const current = leavesByTitle.get(leaf.title);
      if (!current) {
        leavesByTitle.set(leaf.title, leaf);
        continue;
      }

      leavesByTitle.set(leaf.title, {
        ...current,
        confidence: current.confidence === "high" || leaf.confidence === "high" ? "high" : current.confidence,
        has_detail_entry_signal: current.has_detail_entry_signal || leaf.has_detail_entry_signal,
        raw_text_preview:
          current.raw_text_preview.length >= leaf.raw_text_preview.length
            ? current.raw_text_preview
            : leaf.raw_text_preview,
      });
    }
  }

  return {
    chapters: [...chaptersByTitle.values()].sort((a, b) => Number(a.chapter_number) - Number(b.chapter_number)),
    leaves: [...leavesByTitle.values()].sort((a, b) =>
      a.section_number.localeCompare(b.section_number, "zh-CN", { numeric: true })
    ),
  };
}

async function collectDirectorySnapshot(page: Page): Promise<DirectorySnapshot> {
  return page.evaluate(() => {
    const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
    const blockedSignals = [
      "首页",
      "搜索",
      "去掌握",
      "掌握程度",
      "系统架构设计师",
      "账号",
      "登录",
      "切换",
    ];
    const chapterPattern = /^第\s*(\d+)\s*章\s*\S+/;
    const leafPattern = /^(\d+(?:\.\d+)+)\s+(.+)$/;
    const detailSignalPattern = /去掌握|学习|掌握|查看|详情|进入|开始|练习/;

    function isVisible(node: Element): boolean {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none"
      );
    }

    function cleanLeafTitle(rawValue: string): string | null {
      const raw = normalize(rawValue);
      if (!raw || raw.length > 220) return null;
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

    const selector = [
      ".chapterExercises-title",
      ".chapterExercises-title3",
      ".lgchapterExercises-title",
      ".el-tree-node__content",
      ".catalogue-title",
      "li",
      "div",
      "span",
    ].join(",");

    const chapters: DirectorySnapshot["chapters"] = [];
    const leaves: LeafEntry[] = [];
    const seenChapters = new Set<string>();
    const seenLeaves = new Set<string>();

    for (const node of Array.from(document.querySelectorAll(selector))) {
      if (!isVisible(node)) continue;
      const raw = normalize((node as HTMLElement).innerText || node.textContent || "");
      if (!raw) continue;

      const chapterMatch = raw.match(chapterPattern);
      if (chapterMatch && raw.length <= 160) {
        const title = normalize(chapterMatch[0] ?? raw);
        if (!seenChapters.has(title)) {
          seenChapters.add(title);
          chapters.push({
            title,
            chapter_number: chapterMatch[1] ?? "",
            raw_text_preview: raw.slice(0, 180),
          });
        }
      }

      const leafTitle = cleanLeafTitle(raw);
      if (leafTitle && !seenLeaves.has(leafTitle)) {
        const leafMatch = leafTitle.match(leafPattern);
        const section = leafMatch?.[1] ?? "";
        const chapterNumber = section.split(".")[0] ?? "";
        seenLeaves.add(leafTitle);
        leaves.push({
          title: leafTitle,
          section_number: section,
          chapter_number: chapterNumber,
          confidence: node.className.toString().includes("title") ? "high" : "medium",
          visible: true,
          has_detail_entry_signal: detailSignalPattern.test(raw),
          raw_text_preview: raw.slice(0, 220),
        });
      }
    }

    const bodyLines = (document.body.innerText || "")
      .split(/\r?\n/)
      .map(normalize)
      .filter(Boolean);
    for (const line of bodyLines) {
      const chapterMatch = line.match(chapterPattern);
      if (chapterMatch && line.length <= 160) {
        const title = normalize(chapterMatch[0] ?? line);
        if (!seenChapters.has(title)) {
          seenChapters.add(title);
          chapters.push({
            title,
            chapter_number: chapterMatch[1] ?? "",
            raw_text_preview: line.slice(0, 180),
          });
        }
      }

      const leafTitle = cleanLeafTitle(line);
      if (leafTitle && !seenLeaves.has(leafTitle)) {
        const leafMatch = leafTitle.match(leafPattern);
        const section = leafMatch?.[1] ?? "";
        const chapterNumber = section.split(".")[0] ?? "";
        seenLeaves.add(leafTitle);
        leaves.push({
          title: leafTitle,
          section_number: section,
          chapter_number: chapterNumber,
          confidence: "medium",
          visible: true,
          has_detail_entry_signal: detailSignalPattern.test(line),
          raw_text_preview: line.slice(0, 220),
        });
      }
    }

    return { chapters, leaves };
  });
}

async function markChapter(page: Page, chapterTitle: string): Promise<boolean> {
  return page
    .evaluate((title) => {
      const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
      const selectors = [
        ".chapterExercises-title",
        ".lgchapterExercises-title",
        ".catalogue-title",
        ".el-tree-node__content",
        "div",
        "span",
      ].join(",");

      for (const node of Array.from(document.querySelectorAll(selectors))) {
        const text = normalize((node as HTMLElement).innerText || node.textContent || "");
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (text.length > 180) continue;
        if (text.includes(title) || title.includes(text)) {
          node.setAttribute("data-pw-reachable-catalog-chapter", "1");
          return true;
        }
      }

      return false;
    }, chapterTitle)
    .catch(() => false);
}

async function clickMarkedChapter(page: Page): Promise<boolean> {
  const locator = page.locator("[data-pw-reachable-catalog-chapter='1']").first();
  const visible = await locator.isVisible({ timeout: 1_000 }).catch(() => false);
  if (!visible) return false;

  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 2_000 });
    await locator.click({ timeout: 5_000 });
    await page.evaluate(() => {
      document
        .querySelector("[data-pw-reachable-catalog-chapter='1']")
        ?.removeAttribute("data-pw-reachable-catalog-chapter");
    });
    await page.waitForTimeout(WAIT_AFTER_CHAPTER_CLICK_MS);
    return true;
  } catch {
    await page
      .evaluate(() => {
        document
          .querySelector("[data-pw-reachable-catalog-chapter='1']")
          ?.removeAttribute("data-pw-reachable-catalog-chapter");
      })
      .catch(() => undefined);
    return false;
  }
}

function leafCountForChapter(snapshot: DirectorySnapshot, chapterNumber: string): number {
  return snapshot.leaves.filter((leaf) => leaf.chapter_number === chapterNumber).length;
}

async function expandVisibleChapters(
  page: Page,
  initialSnapshot: DirectorySnapshot,
  warnings: string[]
): Promise<DirectorySnapshot[]> {
  const snapshots: DirectorySnapshot[] = [initialSnapshot];
  const chapterTitleCount = await page.locator(".chapterExercises-title").count().catch(() => 0);

  if (chapterTitleCount > 0) {
    for (const chapter of initialSnapshot.chapters) {
      const titleLocator = page.locator(".chapterExercises-title").filter({ hasText: chapter.title }).first();
      const visible = await titleLocator.isVisible({ timeout: 1_000 }).catch(() => false);
      if (!visible) continue;

      const title = chapter.title;
      const chapterNumber = chapter.chapter_number;
      if (!chapterNumber) continue;

      const before = await collectDirectorySnapshot(page);
      const beforeCount = leafCountForChapter(before, chapterNumber);
      try {
        await titleLocator.scrollIntoViewIfNeeded({ timeout: 2_000 });
        await titleLocator.click({ timeout: 5_000 });
        await page.waitForTimeout(WAIT_AFTER_CHAPTER_CLICK_MS);
      } catch {
        warn(warnings, `chapter row click failed: ${title}`);
        continue;
      }

      if (page.url().includes("konwledgeInfo")) {
        warn(warnings, `chapter row click changed to detail route; returning to catalog route: ${title}`);
        await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
        await waitForRender(page);
        continue;
      }

      const after = await collectDirectorySnapshot(page);
      const afterCount = leafCountForChapter(after, chapterNumber);
      snapshots.push(after);

      if (beforeCount > 0 && afterCount < beforeCount) {
        try {
          await titleLocator.click({ timeout: 5_000 });
          await page.waitForTimeout(WAIT_AFTER_CHAPTER_CLICK_MS);
          snapshots.push(await collectDirectorySnapshot(page));
        } catch {
          warn(warnings, `chapter row may have been collapsed and could not be restored: ${title}`);
        }
      }
    }

    return snapshots;
  }

  for (const chapter of initialSnapshot.chapters) {
    const before = await collectDirectorySnapshot(page);
    const beforeCount = leafCountForChapter(before, chapter.chapter_number);
    const marked = await markChapter(page, chapter.title);
    if (!marked) {
      warn(warnings, `chapter could not be marked for expansion: ${chapter.title}`);
      continue;
    }

    const clicked = await clickMarkedChapter(page);
    if (!clicked) {
      warn(warnings, `chapter click failed: ${chapter.title}`);
      continue;
    }

    if (page.url().includes("konwledgeInfo")) {
      warn(warnings, `chapter click changed to detail route; returning to catalog route: ${chapter.title}`);
      await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
      await waitForRender(page);
      continue;
    }

    const after = await collectDirectorySnapshot(page);
    const afterCount = leafCountForChapter(after, chapter.chapter_number);
    snapshots.push(after);

    if (beforeCount > 0 && afterCount < beforeCount) {
      const reMarked = await markChapter(page, chapter.title);
      if (reMarked && (await clickMarkedChapter(page))) {
        const restored = await collectDirectorySnapshot(page);
        snapshots.push(restored);
      } else {
        warn(warnings, `chapter may have been collapsed and could not be restored: ${chapter.title}`);
      }
    }
  }

  return snapshots;
}

async function collectDuringDirectoryScroll(page: Page, warnings: string[]): Promise<DirectorySnapshot[]> {
  const snapshots: DirectorySnapshot[] = [];
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

    const steps = Math.min(5, Math.ceil(stats.scrollHeight / Math.max(stats.clientHeight, 400)));
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
      snapshots.push(await collectDirectorySnapshot(page));
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

  if (snapshots.length === 0) {
    warn(warnings, "no scrollable directory container found; catalog is limited to initially reachable DOM");
  }

  return snapshots;
}

function loadExclusionSets(): {
  quarantinedTitles: Set<string>;
  rendererEligibleTitles: Set<string>;
  lowTextTitles: Set<string>;
} {
  const quarantine = readJson<QuarantineManifest>(quarantineManifestPath);
  const semanticAudit = readJson<SemanticAuditReport>(semanticAuditPath);
  const qualityAudit = readJson<QualityAuditReport>(qualityAuditPath);

  const quarantinedTitles = new Set<string>();
  const lowTextTitles = new Set<string>();
  for (const item of quarantine?.items ?? []) {
    const normalizedTitle = normalizeComparable(item.title);
    if (!normalizedTitle) continue;
    quarantinedTitles.add(normalizedTitle);
    if (item.quarantine_reason === "low_text") {
      lowTextTitles.add(normalizedTitle);
    }
  }

  for (const sample of qualityAudit?.samples ?? []) {
    const normalizedTitle = normalizeComparable(sample.identity?.title);
    if (normalizedTitle && sample.renderer_readiness?.status === "not_ready_low_text") {
      lowTextTitles.add(normalizedTitle);
    }
  }

  const rendererEligibleTitles = new Set(
    (semanticAudit?.samples ?? [])
      .filter((sample) => sample.renderer_eligible === true)
      .map((sample) => normalizeComparable(sample.title))
      .filter(Boolean)
  );

  return { quarantinedTitles, rendererEligibleTitles, lowTextTitles };
}

function recommendationScore(leaf: LeafEntry): number {
  let score = 0;
  if (leaf.title.length >= 8 && leaf.title.length <= 40) score += 2;
  if (leaf.has_detail_entry_signal) score += 1;
  if (TECH_TOPIC_TERMS.some((term) => leaf.title.toLowerCase().includes(term.toLowerCase()))) score += 5;
  if (leaf.confidence === "high") score += 1;
  return score;
}

function selectRecommendedTargets(leaves: LeafEntry[]): {
  recommendedTargets: RecommendedTarget[];
  notRecommendedTargets: RejectedTarget[];
} {
  const { quarantinedTitles, rendererEligibleTitles, lowTextTitles } = loadExclusionSets();
  const notRecommendedTargets: RejectedTarget[] = [];
  const candidates: LeafEntry[] = [];

  for (const leaf of leaves) {
    const normalizedTitle = normalizeComparable(leaf.title);
    if (quarantinedTitles.has(normalizedTitle)) {
      notRecommendedTargets.push({ title: leaf.title, reason: "quarantined sample title" });
      continue;
    }
    if (rendererEligibleTitles.has(normalizedTitle)) {
      notRecommendedTargets.push({ title: leaf.title, reason: "already renderer-eligible" });
      continue;
    }
    if (lowTextTitles.has(normalizedTitle)) {
      notRecommendedTargets.push({ title: leaf.title, reason: "known low-text diagnostic sample" });
      continue;
    }
    if (leaf.title.length < 6) {
      notRecommendedTargets.push({ title: leaf.title, reason: "title too short for renderer baseline probing" });
      continue;
    }
    candidates.push(leaf);
  }

  const selected: LeafEntry[] = [];
  const usedChapters = new Set<string>();
  const sorted = [...candidates].sort((a, b) => recommendationScore(b) - recommendationScore(a));

  for (const leaf of sorted) {
    if (selected.length >= 5) break;
    if (usedChapters.has(leaf.chapter_number) && selected.length < 3) continue;
    selected.push(leaf);
    usedChapters.add(leaf.chapter_number);
  }

  for (const leaf of sorted) {
    if (selected.length >= 5) break;
    if (selected.some((item) => item.title === leaf.title)) continue;
    selected.push(leaf);
  }

  const recommendedTargets = selected.map((leaf) => {
    const matchedTerms = TECH_TOPIC_TERMS.filter((term) =>
      leaf.title.toLowerCase().includes(term.toLowerCase())
    );
    const reasonParts = [
      "reachable leaf from current UI catalog",
      matchedTerms.length > 0 ? `contains topic term(s): ${matchedTerms.join(", ")}` : "moderate-length leaf title",
      `chapter ${leaf.chapter_number}`,
    ];
    return {
      title: leaf.title,
      reason: reasonParts.join("; "),
      suggested_command: commandForTarget(leaf.title),
    };
  });

  const recommendedSet = new Set(recommendedTargets.map((target) => target.title));
  for (const leaf of candidates) {
    if (!recommendedSet.has(leaf.title)) {
      notRecommendedTargets.push({
        title: leaf.title,
        reason: "lower recommendation score or same chapter already represented",
      });
    }
  }

  return { recommendedTargets, notRecommendedTargets };
}

function buildChapters(snapshot: DirectorySnapshot): ChapterEntry[] {
  const chaptersByNumber = new Map<string, DirectorySnapshot["chapters"][number]>();
  for (const chapter of snapshot.chapters) {
    chaptersByNumber.set(chapter.chapter_number, chapter);
  }

  for (const leaf of snapshot.leaves) {
    if (!chaptersByNumber.has(leaf.chapter_number)) {
      chaptersByNumber.set(leaf.chapter_number, {
        title: `第${leaf.chapter_number}章`,
        chapter_number: leaf.chapter_number,
        raw_text_preview: "",
      });
    }
  }

  return [...chaptersByNumber.values()]
    .sort((a, b) => Number(a.chapter_number) - Number(b.chapter_number))
    .map((chapter) => {
      const leaves = snapshot.leaves.filter((leaf) => leaf.chapter_number === chapter.chapter_number);
      return {
        chapter_title: chapter.title,
        expanded: leaves.length > 0,
        leaf_count: leaves.length,
        leaves,
      };
    });
}

function writeReports(report: CatalogReport): void {
  mkdirSync(generatedDir, { recursive: true });
  const jsonPath = resolve(generatedDir, "phase3_11_reachable_leaf_catalog.json");
  const mdPath = resolve(generatedDir, "phase3_11_reachable_leaf_catalog.md");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines: string[] = [
    "# Phase 3.11 Reachable Leaf Catalog",
    "",
    `Captured at: ${report.captured_at}`,
    `Source URL: ${report.source_url}`,
    `Final URL: ${report.final_url}`,
    `Screenshot: ${report.screenshot_path ?? "(not saved)"}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| chapter_count | ${report.chapter_count} |`,
    `| leaf_count | ${report.leaf_count} |`,
    `| recommended target count | ${report.recommended_targets.length} |`,
    "",
    "## Recommended Renderer Baseline Candidates",
    "",
    ...(report.recommended_targets.length === 0
      ? ["- None. Do not start acquisition from this catalog."]
      : report.recommended_targets.map(
          (target) => `- ${target.title}: ${target.reason}\n  - Command: \`${target.suggested_command}\``
        )),
    "",
    "## Reachable Leaves by Chapter",
    "",
  ];

  for (const chapter of report.chapters) {
    mdLines.push(`### ${chapter.chapter_title}`);
    mdLines.push("");
    mdLines.push(`- expanded: ${chapter.expanded}`);
    mdLines.push(`- leaf_count: ${chapter.leaf_count}`);
    mdLines.push("");
    if (chapter.leaves.length === 0) {
      mdLines.push("- No reachable leaves collected.");
    } else {
      for (const leaf of chapter.leaves) {
        mdLines.push(
          `- ${leaf.title} (confidence=${leaf.confidence}, detail_entry_signal=${leaf.has_detail_entry_signal})`
        );
      }
    }
    mdLines.push("");
  }

  mdLines.push("## Not Recommended Candidates");
  mdLines.push("");
  if (report.not_recommended_targets.length === 0) {
    mdLines.push("- None.");
  } else {
    for (const item of report.not_recommended_targets) {
      mdLines.push(`- ${item.title}: ${item.reason}`);
    }
  }

  mdLines.push("");
  mdLines.push("## Warnings");
  mdLines.push("");
  if (report.warnings.length === 0) {
    mdLines.push("- None.");
  } else {
    for (const item of report.warnings) {
      mdLines.push(`- ${item}`);
    }
  }

  mdLines.push("");
  mdLines.push("## Constraints");
  mdLines.push("");
  mdLines.push("- Did not intentionally enter detail pages.");
  mdLines.push("- No parser executed.");
  mdLines.push("- No intermediate JSON generated.");
  mdLines.push("- No Markdown knowledge documents generated.");
  mdLines.push("- No OCR used.");
  mdLines.push("- No encrypt=1 data decrypted.");
  mdLines.push("- No image table reconstructed.");
  mdLines.push("- No full-site batch crawl performed.");
  mdLines.push("- Phase 4 was not entered.");
  mdLines.push("");

  writeFileSync(mdPath, mdLines.join("\n"), "utf8");
  console.log(`[catalog] JSON report: ${toRepoPath(jsonPath)}`);
  console.log(`[catalog] Markdown report: ${toRepoPath(mdPath)}`);
}

async function main(): Promise<void> {
  const warnings: string[] = [];
  const capturedAt = new Date().toISOString();

  const browser = await chromium.launch({ headless: true });
  try {
    const contextOptions: BrowserContextOptions = {
      viewport: { width: 1365, height: 768 },
    };

    if (existsSync(authStatePath)) {
      contextOptions.storageState = authStatePath;
    } else {
      warn(warnings, "auth state missing; reachable catalog may show anonymous or login-gated UI only");
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    await page.addInitScript("globalThis.__name = (fn) => fn;");
    await page.evaluate("globalThis.__name = (fn) => fn;").catch(() => undefined);
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
    page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS);

    log("opening knowledge route");
    await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
    await waitForRender(page);
    await selectContextIfNeeded(page, warnings);

    log("collecting initial directory snapshot");
    const initialSnapshot = await collectDirectorySnapshot(page);

    log(`expanding visible chapters: ${initialSnapshot.chapters.length}`);
    const expansionSnapshots = await expandVisibleChapters(page, initialSnapshot, warnings);

    log("scrolling reachable directory containers");
    const scrollSnapshots = await collectDuringDirectoryScroll(page, warnings);
    const mergedSnapshot = mergeSnapshots([...expansionSnapshots, ...scrollSnapshots, await collectDirectorySnapshot(page)]);

    const chapters = buildChapters(mergedSnapshot);
    const { recommendedTargets, notRecommendedTargets } = selectRecommendedTargets(mergedSnapshot.leaves);

    const screenshotPath = resolve(generatedDir, "phase3_11_reachable_leaf_catalog.png");
    mkdirSync(generatedDir, { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {
      warn(warnings, "directory state screenshot failed");
    });

    const report: CatalogReport = {
      captured_at: capturedAt,
      source_url: SOURCE_URL,
      final_url: page.url(),
      screenshot_path: existsSync(screenshotPath) ? toRepoPath(screenshotPath) : null,
      chapter_count: chapters.length,
      leaf_count: mergedSnapshot.leaves.length,
      chapters,
      recommended_targets: recommendedTargets,
      not_recommended_targets: notRecommendedTargets,
      warnings,
      constraints: {
        no_detail_page_entered_intentionally: true,
        no_parse: true,
        no_intermediate_generated: true,
        no_markdown_generated: true,
        no_ocr: true,
        no_encrypt1_decrypted: true,
        no_image_table_reconstructed: true,
        no_full_site_crawl: true,
        phase4_not_entered: true,
      },
    };

    writeReports(report);
    console.log("[catalog] completed");
    console.log(`  chapter_count:            ${report.chapter_count}`);
    console.log(`  leaf_count:               ${report.leaf_count}`);
    console.log(`  recommended target count: ${report.recommended_targets.length}`);
    console.log(
      `  recommended targets:      ${report.recommended_targets.map((target) => target.title).join(", ") || "(none)"}`
    );

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(`[catalog][error] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
