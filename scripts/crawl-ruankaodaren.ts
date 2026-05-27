import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContextOptions, type Page, type Response } from "playwright";

const SOURCE_URL = "https://ruankaodaren.com/exam/#/knowlegde";
const SOURCE_NAME = "ruankaodaren";
const MAX_OPEN_ATTEMPTS = 3;
const NAVIGATION_TIMEOUT_MS = 30_000;
const NETWORK_IDLE_TIMEOUT_MS = 20_000;
const SPA_RENDER_WAIT_MS = 3_000;
const WAIT_AFTER_CONTEXT_NAVIGATION_MS = 3_000;
const WAIT_AFTER_CONTEXT_CLICK_MS = 2_500;
const MAX_CONTEXT_SELECTION_ATTEMPTS = 3;
const WAIT_AFTER_DIRECTORY_CLICK_MS = 2_000;
const WAIT_AFTER_KNOWLEDGE_NODE_CLICK_MS = 3_000;
const WAIT_AFTER_DETAIL_ENTRY_CLICK_MS = 5_000;
const MAX_DIRECTORY_EXPAND_ATTEMPTS = 5;
const MAX_KNOWLEDGE_NODE_CLICK_ATTEMPTS = 5;
const MAX_DETAIL_ENTRY_CLICK_ATTEMPTS = 5;
const TARGET_CONTEXT_TEXTS = ["系统架构设计师", "架构设计师", "高级"];
const DIRECTORY_TEXT_SIGNALS = ["计算机", "软件", "架构", "数据库", "网络", "系统"];
const KNOWLEDGE_NODE_TEXT_PATTERN = "text=/架构|软件|数据库|网络|系统|质量|设计/";
const DETAIL_ENTRY_TEXT_PATTERN =
  "text=/学习|去学习|进入学习|开始学习|查看|查看详情|详情|进入|开始|继续学习|掌握|已掌握|未掌握|练习|查看知识点/";
const CONTEXT_SELECTION_ROUTE_SIGNALS = ["switchAccounts", "switchAccount", "account", "select"];
const KNOWLEDGE_API_SIGNALS = ["/api/knowledge", "knowledge"];
const KNOWLEDGE_CONTENT_SIGNALS = [
  "系统架构设计师",
  "架构",
  "软件架构",
  "数据库",
  "计算机网络",
  "案例分析",
  "论文"
];
const DETAIL_CONTENT_SIGNALS = [
  "指令系统",
  "CISC",
  "RISC",
  "复杂指令集",
  "精简指令集",
  "核心概念",
  "知识点",
  "考点",
  "解析",
  "说明",
  "特点",
  "优点",
  "缺点",
  "适用",
  "系统架构",
  "软件架构",
  "数据库",
  "计算机网络"
];

// ---------------------------------------------------------------------------
// CLI args (Phase 3.2)
// ---------------------------------------------------------------------------

function parseCrawlerArgs(): {
  requestedTarget: string | null;
  targetSource: "cli" | "default";
  requireLeaf: boolean;
} {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--target");
  const requireLeaf = args.includes("--require-leaf");
  if (idx !== -1 && args[idx + 1]) {
    return { requestedTarget: args[idx + 1], targetSource: "cli", requireLeaf };
  }
  return { requestedTarget: null, targetSource: "default", requireLeaf };
}

const CRAWLER_ARGS = parseCrawlerArgs();

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const rawRoot = resolve(repoRoot, "sources", SOURCE_NAME, "raw");
const htmlDir = resolve(rawRoot, "html");
const xhrDir = resolve(rawRoot, "xhr");
const screenshotDir = resolve(rawRoot, "screenshots");
const debugScreenshotDir = resolve(screenshotDir, "debug");
const metadataDir = resolve(rawRoot, "metadata");
const domTextDir = resolve(rawRoot, "dom-text");
const containersDir = resolve(rawRoot, "containers");
const accessibilityDir = resolve(rawRoot, "accessibility");
const storageDir = resolve(rawRoot, "storage");
const outerHtmlDir = resolve(rawRoot, "outer-html");
const networkDir = resolve(rawRoot, "network");
const consoleDir = resolve(rawRoot, "console");
const authStateRelativePath = ".auth/ruankaodaren.storageState.json";
const authStatePath = resolve(repoRoot, authStateRelativePath);

const CONTAINER_SELECTORS = [
  "body",
  "main",
  "article",
  '[role="main"]',
  ".content",
  ".markdown",
  ".detail",
  ".knowledge",
  ".el-main",
  ".ant-layout-content",
  ".page-content",
  ".v-md-editor-preview",
  ".markdown-body",
  ".knowInfo",
  ".ql-editor",
  ".knowInfo.ql-editor",
  ".topicDetails",
  ".topicDetails .ql-editor",
  ".questionInfo",
  ".questionContent",
  ".rich-text",
  ".html-content"
];

const DETAIL_ENTRY_SCOPED_LABELS = [
  "去掌握",
  "学习",
  "去学习",
  "进入学习",
  "开始学习",
  "查看",
  "查看详情",
  "详情",
  "进入",
  "开始",
  "继续学习",
  "掌握",
  "未掌握",
  "练习",
  "查看知识点"
];

type XhrArtifact = {
  path: string;
  request_url: string;
  status: number;
  content_type: string;
  content_hash: string;
};

type XhrSnapshot = {
  source_url: string;
  captured_at: string;
  status: number;
  method: string;
  request_url: string;
  content_type: string;
  content_hash: string;
  body?: unknown;
  text?: string;
  body_base64?: string;
  body_encoding?: "base64";
  warning?: string;
};

type ContextSelectionResult = {
  attempted: boolean;
  success: boolean;
  text: string | null;
  postContextUrl: string;
};

type ClickTextResult = {
  success: boolean;
  text: string | null;
};

type InteractionHarvestResult = {
  attempted: boolean;
  directoryExpandAttempted: boolean;
  directoryExpandSuccess: boolean;
  directoryExpandText: string | null;
  knowledgeNodeClickAttempted: boolean;
  knowledgeNodeClickSuccess: boolean;
  knowledgeNodeClickText: string | null;
  postInteractionUrl: string;
  bodyTextLengthBefore: number;
  bodyTextLength: number;
  bodyText: string;
  detailContentSignalFromPage: boolean;
  requireLeaf: boolean;
  chapterLevelHit: boolean;
  chapterLevelText: string | null;
  leafResolutionAttempted: boolean;
  leafResolutionSuccess: boolean;
  resolvedLeafText: string | null;
  resolvedLeafStrategy: "same_chapter_related_leaf" | "same_chapter_first_leaf" | "not_required" | "failed";
  targetResolverEnabled: boolean;
  targetSectionNumber: string | null;
  targetChapterNumber: string | null;
  targetLeafNumber: string | null;
  targetTitleRemainder: string | null;
  targetChapterExpandAttempted: boolean;
  targetChapterExpandSuccess: boolean;
  targetChapterText: string | null;
  targetLeafResolutionAttempted: boolean;
  targetLeafResolutionSuccess: boolean;
  targetLeafResolutionStrategy:
    | "exact_full_title"
    | "number_and_keywords"
    | "number_only"
    | "same_chapter_fallback"
    | "failed"
    | "not_required";
  targetLeafText: string | null;
  targetLeafExactMatch: boolean;
  targetResolutionTrusted: boolean;
  resolvedTargetText: string | null;
  actualNodeMatchesRequestedTarget: boolean;
  targetResolutionFailureReason:
    | "target_not_found"
    | "chapter_not_found"
    | "global_fallback_not_allowed_for_require_leaf"
    | "leaf_mismatch"
    | null;
};

type DetailEntryScopedClickResult = {
  success: boolean;
  text: string | null;
  strategy: "target_scoped" | "nearby_sibling" | "global_fallback" | "failed";
  scopeFound: boolean;
  scopeTextLength: number;
  scopeTextPreview: string;
  clickIndex: number;
};

type DetailEntryResult = {
  attempted: boolean;
  success: boolean;
  text: string | null;
  urlBefore: string;
  urlAfter: string;
  routeChanged: boolean;
  bodyTextLengthBefore: number;
  bodyTextLengthAfter: number;
  beforeScreenshotPath: string;
  afterScreenshotPath: string;
  postDetailContentSignalFromPage: boolean;
  strategy: "target_scoped" | "nearby_sibling" | "global_fallback" | "failed";
  scopeFound: boolean;
  scopeTextLength: number;
  scopeTextPreview: string;
  clickIndex: number;
  contentTargetAlignment: "matched" | "mismatched" | "unknown";
  contentDetectedTitle: string | null;
  contentTextLength: number;
  contentTextPreview: string;
};

type NetworkTimelineEntry = {
  type: "request" | "response";
  timestamp: string;
  method: string;
  url: string;
  status: number | null;
  resource_type: string;
  content_type: string;
};

type ConsoleEntry = {
  timestamp: string;
  type: string;
  text: string;
};

function log(message: string): void {
  console.log(`[crawler] ${message}`);
}

function warn(message: string): void {
  console.warn(`[crawler][warning] ${message}`);
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function safeTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

function toRepoRelativePath(absolutePath: string): string {
  return relative(repoRoot, absolutePath).replace(/\\/g, "/");
}

async function ensureRawDirectories(): Promise<void> {
  await Promise.all([
    mkdir(htmlDir, { recursive: true }),
    mkdir(xhrDir, { recursive: true }),
    mkdir(screenshotDir, { recursive: true }),
    mkdir(debugScreenshotDir, { recursive: true }),
    mkdir(metadataDir, { recursive: true }),
    mkdir(domTextDir, { recursive: true }),
    mkdir(containersDir, { recursive: true }),
    mkdir(accessibilityDir, { recursive: true }),
    mkdir(storageDir, { recursive: true }),
    mkdir(outerHtmlDir, { recursive: true }),
    mkdir(networkDir, { recursive: true }),
    mkdir(consoleDir, { recursive: true })
  ]);
}

function isJsonContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase();
  return normalized.includes("application/json") || normalized.includes("+json");
}

function isTextContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase();
  return (
    normalized.includes("text/plain") ||
    normalized.includes("text/html") ||
    normalized.includes("application/xhtml+xml")
  );
}

function hasAnySignal(value: string, signals: string[]): boolean {
  const lowerValue = value.toLowerCase();
  return signals.some((signal) => lowerValue.includes(signal.toLowerCase()));
}

function isContextSelectionRoute(url: string): boolean {
  return hasAnySignal(url, CONTEXT_SELECTION_ROUTE_SIGNALS);
}

function hasKnowledgeContentSignal(text: string): boolean {
  return hasAnySignal(text, KNOWLEDGE_CONTENT_SIGNALS);
}

function hasDetailContentSignal(text: string): boolean {
  return hasAnySignal(text, DETAIL_CONTENT_SIGNALS);
}

function normalizeVisibleText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeTargetText(text: string | null | undefined): string {
  return normalizeVisibleText(text ?? "").replace(/\s+/g, "").toLowerCase();
}

function parseTargetSection(target: string | null | undefined): {
  targetSectionNumber: string;
  targetChapterNumber: string;
  targetLeafNumber: string;
  targetTitleRemainder: string;
} | null {
  const normalized = normalizeVisibleText(target ?? "");
  const match = normalized.match(/^(\d+)\.(\d+)\s+(.+)$/);
  if (!match) return null;

  return {
    targetSectionNumber: `${match[1]}.${match[2]}`,
    targetChapterNumber: match[1] ?? "",
    targetLeafNumber: `${match[1]}.${match[2]}`,
    targetTitleRemainder: normalizeVisibleText(match[3] ?? "")
  };
}

function targetTextsAlign(left: string | null | undefined, right: string | null | undefined): boolean {
  const a = normalizeTargetText(left);
  const b = normalizeTargetText(right);
  if (!a || !b) return false;
  if (a === b) return true;
  return (a.length >= 4 && b.includes(a)) || (b.length >= 4 && a.includes(b));
}

function targetKeywordTokens(remainder: string): string[] {
  const weakTerms = new Set(["系统", "技术", "处理", "设计", "常识", "基础", "知识"]);
  const tokens = [
    remainder,
    ...remainder.split(/[的和与及、，,：:（）()—\-]/),
    ...(remainder.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g) ?? []),
    ...(remainder.match(/\p{Script=Han}{2,}/gu) ?? [])
  ]
    .map(normalizeTargetText)
    .filter((token) => token.length >= 2 && !weakTerms.has(token));

  return [...new Set(tokens)];
}

function isChapterLevelText(text: string | null | undefined): boolean {
  const normalized = normalizeVisibleText(text ?? "");
  if (!normalized) return false;
  return /^第\s*\d+\s*章/.test(normalized) || (normalized.startsWith("第") && normalized.includes("章"));
}

function isLeafLevelText(text: string | null | undefined): boolean {
  const normalized = normalizeVisibleText(text ?? "");
  if (!normalized || isChapterLevelText(normalized)) return false;
  if (normalized.includes("掌握程度") || /^\d+\s*\/\s*\d+$/.test(normalized)) return false;
  return /^\d+(?:\.\d+)+\s*\S+/.test(normalized);
}

function getChapterNumber(text: string | null | undefined): string | null {
  const match = normalizeVisibleText(text ?? "").match(/^第\s*(\d+)\s*章/);
  return match?.[1] ?? null;
}

function isCommonNavigationText(text: string): boolean {
  const blockedTexts = [
    "首页",
    "软考题库",
    "机考",
    "知识库",
    "APP",
    "登录",
    "立即登录",
    "未登录",
    "请先登录",
    "切换账号",
    "返回",
    "搜索",
    "软考达人",
    "系统架构设计师"
  ];

  return blockedTexts.some((blockedText) => text.includes(blockedText));
}

function isBlockedDetailEntryText(text: string): boolean {
  const blockedTexts = [
    "登录",
    "切换账号",
    "首页",
    "返回",
    "退出",
    "搜索",
    "删除",
    "重置",
    "软考题库",
    "机考",
    "知识库",
    "APP",
    "软考达人",
    "掌握程度"
  ];

  return blockedTexts.some((blockedText) => text.includes(blockedText));
}

function isDirectoryCandidateText(text: string): boolean {
  return text.length <= 200 && isChapterLevelText(text) && hasAnySignal(text, DIRECTORY_TEXT_SIGNALS);
}

function isKnowledgeNodeCandidateText(text: string): boolean {
  if (text.length < 2 || text.length > 100) {
    return false;
  }

  if (isCommonNavigationText(text)) {
    return false;
  }

  if (isChapterLevelText(text) || text.includes("掌握程度") || /^\d+\s*\/\s*\d+$/.test(text)) {
    return false;
  }

  return isLeafLevelText(text) || hasAnySignal(text, ["架构", "软件", "数据库", "网络", "系统", "质量", "设计"]);
}

function isDetailEntryCandidateText(text: string): boolean {
  if (text.length < 1 || text.length > 40) {
    return false;
  }

  if (isBlockedDetailEntryText(text)) {
    return false;
  }

  return hasAnySignal(text, [
    "学习",
    "去学习",
    "进入学习",
    "开始学习",
    "查看",
    "查看详情",
    "详情",
    "进入",
    "开始",
    "继续学习",
    "掌握",
    "已掌握",
    "未掌握",
    "练习",
    "查看知识点"
  ]);
}

async function openPageWithRetry(pageGoto: () => Promise<unknown>): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_OPEN_ATTEMPTS; attempt += 1) {
    try {
      log(`opening page (attempt ${attempt}/${MAX_OPEN_ATTEMPTS})`);
      await pageGoto();
      return;
    } catch (error) {
      lastError = error;
      warn(`page open attempt ${attempt} failed: ${formatError(error)}`);

      if (attempt < MAX_OPEN_ATTEMPTS) {
        await new Promise((resolveAttemptDelay) => {
          setTimeout(resolveAttemptDelay, 1_000 * attempt);
        });
      }
    }
  }

  throw new Error(`failed to open page after ${MAX_OPEN_ATTEMPTS} attempts: ${formatError(lastError)}`);
}

async function waitForRender(page: Page, extraWaitMs: number): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS });
  } catch (error) {
    warn(`networkidle wait timed out; continuing with visible SPA snapshot: ${formatError(error)}`);
  }

  await page.waitForTimeout(extraWaitMs);
}

async function readBodyText(page: Page): Promise<string> {
  return page
    .locator("body")
    .innerText({ timeout: 5_000 })
    .catch(() => "");
}

async function clickVisibleByText(page: Page, text: string): Promise<boolean> {
  const locators = [
    page.getByRole("button", { name: text, exact: false }),
    page.getByText(text, { exact: false })
  ];

  for (const locator of locators) {
    const count = await locator.count().catch(() => 0);

    for (let index = 0; index < Math.min(count, 10); index += 1) {
      const candidate = locator.nth(index);
      const isVisible = await candidate.isVisible({ timeout: 1_000 }).catch(() => false);

      if (!isVisible) {
        continue;
      }

      try {
        await candidate.scrollIntoViewIfNeeded({ timeout: 2_000 });
        await candidate.click({ timeout: 5_000 });
        return true;
      } catch (error) {
        warn(`visible candidate for "${text}" could not be clicked: ${formatError(error)}`);
      }
    }
  }

  return false;
}

async function clickVisibleTextCandidate(
  page: Page,
  selector: string,
  maxAttempts: number,
  isAllowedText: (text: string) => boolean,
  logPrefix: string,
  waitAfterClickMs: number
): Promise<ClickTextResult> {
  const locator = page.locator(selector);
  const count = await locator.count().catch(() => 0);
  let attempts = 0;

  for (let index = 0; index < count && attempts < maxAttempts; index += 1) {
    const candidate = locator.nth(index);
    const isVisible = await candidate.isVisible({ timeout: 1_000 }).catch(() => false);

    if (!isVisible) {
      continue;
    }

    const text = normalizeVisibleText(await candidate.innerText({ timeout: 1_000 }).catch(() => ""));

    if (!text || !isAllowedText(text)) {
      continue;
    }

    attempts += 1;
    log(`${logPrefix}: ${text}`);

    try {
      await candidate.scrollIntoViewIfNeeded({ timeout: 2_000 });
      await candidate.click({ timeout: 5_000 });
      await waitForRender(page, waitAfterClickMs);

      return {
        success: true,
        text
      };
    } catch (error) {
      warn(`click failed for "${text}": ${formatError(error)}`);
    }
  }

  return {
    success: false,
    text: null
  };
}

function selectorToFilename(selector: string): string {
  return selector
    .replace(/[^a-zA-Z0-9-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function detectContentAlignment(
  contentText: string,
  knowledgeNodeClickText: string | null
): {
  alignment: "matched" | "mismatched" | "unknown";
  detectedTitle: string | null;
  textLength: number;
  textPreview: string;
} {
  const textLength = contentText.length;
  const textPreview = contentText.slice(0, 200);

  if (!knowledgeNodeClickText || textLength === 0) {
    return { alignment: "unknown", detectedTitle: null, textLength, textPreview };
  }

  // Extract target node number prefix e.g. "1.3"
  const targetNumMatch = knowledgeNodeClickText.match(/^(\d+\.\d+)/);
  const targetNum = targetNumMatch ? targetNumMatch[1] : null;

  // Full text match
  if (contentText.includes(knowledgeNodeClickText)) {
    return { alignment: "matched", detectedTitle: knowledgeNodeClickText, textLength, textPreview };
  }

  // Number prefix match
  if (targetNum && contentText.includes(targetNum)) {
    return { alignment: "matched", detectedTitle: targetNum, textLength, textPreview };
  }

  // Check for other node numbers indicating wrong content
  const otherNumMatch = contentText.match(/\b(\d+\.\d+)\b/);
  if (otherNumMatch) {
    const found = otherNumMatch[1];
    if (!targetNum || found !== targetNum) {
      return { alignment: "mismatched", detectedTitle: found, textLength, textPreview };
    }
  }

  return { alignment: "unknown", detectedTitle: null, textLength, textPreview };
}

async function clickDetailEntryGlobalFallback(page: Page): Promise<ClickTextResult> {
  const locators = [
    page.getByRole("button", { name: /学习|查看|详情|进入|开始|掌握|练习|查看知识点/ }),
    page.getByRole("link", { name: /学习|查看|详情|进入|开始|掌握|练习|查看知识点/ }),
    page.locator(DETAIL_ENTRY_TEXT_PATTERN)
  ];
  let attempts = 0;

  for (const locator of locators) {
    const count = await locator.count().catch(() => 0);

    for (let index = 0; index < count && attempts < MAX_DETAIL_ENTRY_CLICK_ATTEMPTS; index += 1) {
      const candidate = locator.nth(index);
      const isVisible = await candidate.isVisible({ timeout: 1_000 }).catch(() => false);

      if (!isVisible) {
        continue;
      }

      const text = normalizeVisibleText(await candidate.innerText({ timeout: 1_000 }).catch(() => ""));

      if (!text || !isDetailEntryCandidateText(text)) {
        continue;
      }

      attempts += 1;
      log(`trying detail entry (global fallback): ${text}`);

      try {
        await candidate.scrollIntoViewIfNeeded({ timeout: 2_000 });
        await candidate.click({ timeout: 5_000 });
        await waitForRender(page, WAIT_AFTER_DETAIL_ENTRY_CLICK_MS);

        return {
          success: true,
          text
        };
      } catch (error) {
        warn(`detail entry click failed for "${text}": ${formatError(error)}`);
      }
    }
  }

  return {
    success: false,
    text: null
  };
}

async function clickDetailEntryScopedOrFallback(
  page: Page,
  knowledgeNodeClickText: string | null,
  allowGlobalFallback = true
): Promise<DetailEntryScopedClickResult> {
  // Pre-step: decoy-select — clicking "去掌握" only navigates when a DIFFERENT row
  // is already in the selected state. If nothing is selected, the click merely selects
  // that row. We find a non-target item's text via evaluate, then Playwright-click it
  // (native evaluate.click() doesn't reliably trigger Vue event handlers).
  if (knowledgeNodeClickText) {
    const decoyText = await page
      .evaluate(({ targetText }) => {
        // Find a leaf item title (inside .chapterExercises) that does NOT contain the target.
        // Distinguish leaf knowledge items from chapter headers by the presence of
        // el-icon-document (leaf) vs el-icon-caret-top (chapter header).
        const candidates = Array.from(
          document.querySelectorAll(".chapterExercises .chapterExercises-title")
        ).filter((el) => {
          if (!el.querySelector(".el-icon-document")) return false;
          const t = (el.textContent || "").replace(/\s+/g, " ").trim();
          return t.length > 0 && !t.includes(targetText.substring(0, 6));
        });
        if (candidates.length === 0) return null;
        // Return the leaf text node inside the title (skip the icon element)
        const inner = Array.from(candidates[0].querySelectorAll("div, span")).find(
          (d) => d.children.length === 0 && (d.textContent || "").trim().length > 0
        );
        return inner?.textContent?.trim() ?? (candidates[0].textContent || "").replace(/\s+/g, " ").trim();
      }, { targetText: knowledgeNodeClickText })
      .catch(() => null);

    if (decoyText) {
      // Use Playwright API click (not native evaluate click) so Vue handlers fire correctly.
      await page.getByText(decoyText, { exact: false }).first().click();
      log(`detail entry decoy pre-select: clicked "${decoyText}" to activate selected state`);
      await page.waitForTimeout(1_500);
    } else {
      warn(`detail entry decoy pre-select: no candidate found — proceeding without pre-select`);
    }
  }

  // Strategy 1: target_scoped — start from the TARGET TEXT element, walk UP
  // looking for an action button sibling. This stays within the item boundary
  // and avoids false-positives caused by large ancestor containers that span
  // the entire chapter list.
  if (knowledgeNodeClickText) {
    const scopeResult = await page
      .evaluate(
        ({ targetText, exactLabels }) => {
          // Find the leaf element(s) whose text exactly matches the target knowledge node.
          const allLeaves = Array.from(document.querySelectorAll("*")).filter((el) => {
            if (el.children.length !== 0) return false;
            return (el.textContent || "").replace(/\s+/g, " ").trim() === targetText;
          });
          if (allLeaves.length === 0) return null;

          const textEl = allLeaves[0];
          // Walk UP from the target text element; at each level look for a sibling
          // action button that is NOT an ancestor of the text element itself.
          let container = textEl.parentElement;
          for (let depth = 0; depth < 8 && container; depth++) {
            const descendants = Array.from(container.querySelectorAll("a, button, span, div, li"));
            for (const actionEl of descendants) {
              // Skip if actionEl is the text element or an ancestor of it
              if (actionEl === textEl || actionEl.contains(textEl)) continue;
              const t = (actionEl.textContent || "").replace(/\s+/g, " ").trim();
              if (!exactLabels.some((label) => t === label)) continue;
              // Only accept leaf elements (no children) to avoid clicking the
              // .chapterExercises-title3 container (children.length=2) which only
              // selects the row. The inner <span class="noVipState"> has 0 children
              // and is the actual navigation trigger.
              if (actionEl.children.length !== 0) continue;
              const rect = actionEl.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                // Mark the action element itself (the "去掌握" span/button) rather than
                // walking up to .chapterExercises-title3. Clicking the container only
                // selects the row; clicking the inner span triggers navigation when
                // another row is already in selected state (decoy pre-select).
                actionEl.setAttribute("data-pw-scoped-target", "1");
                const clickTargetText = (actionEl.textContent || "").replace(/\s+/g, " ").trim();
                const scopeText = (container.textContent || "").replace(/\s+/g, " ").trim();
                return {
                  elText: t,
                  clickTargetText: clickTargetText.slice(0, 100),
                  scopeText: scopeText.slice(0, 200),
                  found: true
                };
              }
            }
            container = container.parentElement;
          }
          return null;
        },
        {
          targetText: knowledgeNodeClickText,
          exactLabels: ["去掌握", "学习", "去学习", "进入学习", "开始学习", "查看详情", "查看知识点"]
        }
      )
      .catch((err) => {
        warn(`target_scoped evaluate error: ${String(err)}`);
        return null;
      });

    if (scopeResult?.found) {
      const urlBefore = page.url();
      try {
        const target = page.locator("[data-pw-scoped-target='1']").first();
        await target.scrollIntoViewIfNeeded({ timeout: 3_000 });
        await target.click({ timeout: 5_000 });
        await page.evaluate(() => {
          document.querySelector("[data-pw-scoped-target='1']")?.removeAttribute("data-pw-scoped-target");
        }).catch(() => undefined);
        await waitForRender(page, WAIT_AFTER_DETAIL_ENTRY_CLICK_MS);
        log(`detail entry target_scoped click: "${scopeResult.elText}"`);
        return {
          success: true,
          text: scopeResult.elText,
          strategy: "target_scoped",
          scopeFound: true,
          scopeTextLength: scopeResult.scopeText.length,
          scopeTextPreview: scopeResult.scopeText,
          clickIndex: 0
        };
      } catch (error) {
        warn(`target_scoped locator click failed: ${formatError(error)}`);
        await page.evaluate(() => {
          document.querySelector("[data-pw-scoped-target='1']")?.removeAttribute("data-pw-scoped-target");
        }).catch(() => undefined);
      }
    }

    // Strategy 2: nearby_sibling — use CSS selected-state class.
    // Currently no CSS selection class exists on this site, so this branch
    // always returns null. It is kept for forward-compatibility.
    // All logic is inlined (no named inner functions) to avoid esbuild __name injection.
    const siblingHit = await page
      .evaluate(
        ({ entryLabels }) => {
          const selected = document.querySelector(
            ".item-choose-active, .is-selected, .selected-item"
          );
          if (!selected) return null;

          let ancestor = selected.parentElement;
          for (let depth = 0; depth < 15 && ancestor; depth++) {
            const ancestorText = (ancestor.textContent || "").replace(/\s+/g, " ").trim();
            if (entryLabels.some((label) => ancestorText.includes(label))) {
              const actionEls = Array.from(
                ancestor.querySelectorAll("a, button, span, div")
              );
              for (const actionEl of actionEls) {
                if (actionEl === selected || actionEl.contains(selected)) continue;
                const t = (actionEl.textContent || "").replace(/\s+/g, " ").trim();
                if (!entryLabels.some((label) => t.includes(label))) continue;
                if (t.length === 0 || t.length > 20) continue;
                const rect = actionEl.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  return {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    text: t,
                    scopeText: ancestorText.slice(0, 200),
                    found: true
                  };
                }
              }
            }
            ancestor = ancestor.parentElement;
          }
          return null;
        },
        { entryLabels: DETAIL_ENTRY_SCOPED_LABELS }
      )
      .catch((err) => {
        warn(`nearby_sibling evaluate error: ${String(err)}`);
        return null;
      });

    if (siblingHit?.found) {
      try {
        await page.mouse.click(siblingHit.x, siblingHit.y);
        await waitForRender(page, WAIT_AFTER_DETAIL_ENTRY_CLICK_MS);
        log(`detail entry nearby_sibling click: "${siblingHit.text}"`);
        return {
          success: true,
          text: siblingHit.text,
          strategy: "nearby_sibling",
          scopeFound: true,
          scopeTextLength: siblingHit.scopeText.length,
          scopeTextPreview: siblingHit.scopeText,
          clickIndex: 0
        };
      } catch (error) {
        warn(`nearby_sibling mouse click failed: ${formatError(error)}`);
      }
    }
  }

  if (!allowGlobalFallback) {
    warn("detail entry global fallback disabled for require-leaf exact target");
    return {
      success: false,
      text: null,
      strategy: "failed",
      scopeFound: false,
      scopeTextLength: 0,
      scopeTextPreview: "",
      clickIndex: -1
    };
  }

  // Strategy 3: global_fallback
  warn("WARNING: detail entry used global fallback and may click wrong item.");
  const fallbackResult = await clickDetailEntryGlobalFallback(page);
  return {
    success: fallbackResult.success,
    text: fallbackResult.text,
    strategy: fallbackResult.success ? "global_fallback" : "failed",
    scopeFound: false,
    scopeTextLength: 0,
    scopeTextPreview: "",
    clickIndex: 0
  };
}

async function scrollPageAndContentContainers(page: Page): Promise<void> {
  await page.waitForTimeout(10_000);
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(2_000);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1_000);

  const scrollSelectors = [
    ".knowInfo",
    ".ql-editor",
    ".knowInfo.ql-editor",
    ".topicDetails",
    ".el-main",
    ".ant-layout-content",
    "main",
    "article",
    ...CONTAINER_SELECTORS.filter(
      (s) => !["body", ".knowInfo", ".ql-editor", ".knowInfo.ql-editor", ".topicDetails", ".el-main", ".ant-layout-content", "main", "article"].includes(s)
    )
  ];

  for (const selector of scrollSelectors) {
    const locator = page.locator(selector);
    const count = await locator.count().catch(() => 0);

    if (count === 0) {
      continue;
    }

    const first = locator.first();
    const isVisible = await first.isVisible({ timeout: 1_000 }).catch(() => false);

    if (!isVisible) {
      continue;
    }

    await first
      .evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      })
      .catch(() => undefined);
    await page.waitForTimeout(300);
  }

  await page.waitForTimeout(2_000);
}

async function harvestDetailEntry(
  page: Page,
  timestamp: string,
  knowledgeNodeClickText: string | null,
  allowGlobalFallback = true
): Promise<DetailEntryResult> {
  const urlBefore = page.url();
  const bodyTextBefore = await readBodyText(page);
  const bodyTextLengthBefore = bodyTextBefore.length;
  const beforeScreenshotPath = resolve(debugScreenshotDir, `${timestamp}-before-detail-entry.png`);
  const afterScreenshotPath = resolve(debugScreenshotDir, `${timestamp}-after-detail-entry.png`);

  await page.screenshot({
    path: beforeScreenshotPath,
    fullPage: true
  });

  log(`body text length before detail entry: ${bodyTextLengthBefore}`);

  const clickResult = await clickDetailEntryScopedOrFallback(page, knowledgeNodeClickText, allowGlobalFallback);

  if (clickResult.success) {
    log(`detail entry click success (strategy: ${clickResult.strategy})`);
  } else {
    warn("detail entry click failed");
  }

  await scrollPageAndContentContainers(page);

  await page.screenshot({
    path: afterScreenshotPath,
    fullPage: true
  });

  const bodyTextAfter = await readBodyText(page);
  const bodyTextLengthAfter = bodyTextAfter.length;
  const urlAfter = page.url();
  const routeChanged = urlAfter !== urlBefore;
  const postDetailContentSignalFromPage = hasDetailContentSignal(bodyTextAfter);

  // Alignment detection: use .knowInfo.ql-editor if available, else body text
  let alignmentText = bodyTextAfter;
  const qlLocator = page.locator(".knowInfo.ql-editor").first();
  const qlExists = await qlLocator.count().then((c) => c > 0).catch(() => false);
  if (qlExists) {
    alignmentText = await qlLocator.innerText({ timeout: 3_000 }).catch(() => bodyTextAfter);
  }

  const alignmentResult = detectContentAlignment(alignmentText, knowledgeNodeClickText);

  log(`body text length after detail entry: ${bodyTextLengthAfter}`);
  log(`post-detail content signal: ${postDetailContentSignalFromPage ? "yes" : "no"}`);
  log(`content alignment: ${alignmentResult.alignment} (title: ${alignmentResult.detectedTitle ?? "null"})`);

  return {
    attempted: true,
    success: clickResult.success && (routeChanged || bodyTextLengthAfter > bodyTextLengthBefore),
    text: clickResult.text,
    urlBefore,
    urlAfter,
    routeChanged,
    bodyTextLengthBefore,
    bodyTextLengthAfter,
    beforeScreenshotPath,
    afterScreenshotPath,
    postDetailContentSignalFromPage,
    strategy: clickResult.strategy,
    scopeFound: clickResult.scopeFound,
    scopeTextLength: clickResult.scopeTextLength,
    scopeTextPreview: clickResult.scopeTextPreview,
    clickIndex: clickResult.clickIndex,
    contentTargetAlignment: alignmentResult.alignment,
    contentDetectedTitle: alignmentResult.detectedTitle,
    contentTextLength: alignmentResult.textLength,
    contentTextPreview: alignmentResult.textPreview
  };
}

async function buildSkippedDetailEntry(page: Page, timestamp: string): Promise<DetailEntryResult> {
  const url = page.url();
  const bodyText = await readBodyText(page);
  const beforeScreenshotPath = resolve(debugScreenshotDir, `${timestamp}-before-detail-entry.png`);
  const afterScreenshotPath = resolve(debugScreenshotDir, `${timestamp}-after-detail-entry.png`);

  await page.screenshot({ path: beforeScreenshotPath, fullPage: true });
  await page.screenshot({ path: afterScreenshotPath, fullPage: true });

  return {
    attempted: false,
    success: false,
    text: null,
    urlBefore: url,
    urlAfter: url,
    routeChanged: false,
    bodyTextLengthBefore: bodyText.length,
    bodyTextLengthAfter: bodyText.length,
    beforeScreenshotPath,
    afterScreenshotPath,
    postDetailContentSignalFromPage: hasDetailContentSignal(bodyText),
    strategy: "failed",
    scopeFound: false,
    scopeTextLength: 0,
    scopeTextPreview: "",
    clickIndex: -1,
    contentTargetAlignment: "unknown",
    contentDetectedTitle: null,
    contentTextLength: bodyText.length,
    contentTextPreview: bodyText.slice(0, 200)
  };
}

async function collectContainerText(
  page: Page,
  timestamp: string
): Promise<
  Array<{
    selector: string;
    exists: boolean;
    count: number;
    text_length: number;
    text: string;
    outer_html_length: number;
    outer_html_path: string | null;
  }>
> {
  const containers = [];

  for (const selector of CONTAINER_SELECTORS) {
    const locator = page.locator(selector);
    const count = await locator.count().catch(() => 0);

    if (count === 0) {
      containers.push({
        selector,
        exists: false,
        count: 0,
        text_length: 0,
        text: "",
        outer_html_length: 0,
        outer_html_path: null
      });
      continue;
    }

    const text = await locator.first().innerText({ timeout: 3_000 }).catch(() => "");
    let outerHtmlPath: string | null = null;
    let outerHtmlLength = 0;

    if (text.length > 0) {
      const outerHtml = await locator.first().evaluate((el) => el.outerHTML).catch(() => "");
      outerHtmlLength = outerHtml.length;
      if (outerHtml.length > 0) {
        const safeSelector = selectorToFilename(selector);
        outerHtmlPath = resolve(outerHtmlDir, `${timestamp}-${safeSelector}.html`);
        await writeFile(outerHtmlPath, outerHtml, "utf8").catch(() => {
          outerHtmlPath = null;
        });
      }
    }

    containers.push({
      selector,
      exists: true,
      count,
      text_length: text.length,
      text,
      outer_html_length: outerHtmlLength,
      outer_html_path: outerHtmlPath
    });
  }

  return containers;
}

async function saveContainerSnapshot(
  page: Page,
  timestamp: string,
  capturedAt: string
): Promise<{
  path: string;
  text: string;
  outerHtmlPaths: string[];
}> {
  const containerTextPath = resolve(containersDir, `${timestamp}.json`);
  const containers = await collectContainerText(page, timestamp);

  await writeFile(
    containerTextPath,
    `${JSON.stringify(
      {
        source_url: SOURCE_URL,
        captured_at: capturedAt,
        containers
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const outerHtmlPaths = containers
    .filter((c) => c.outer_html_path !== null)
    .map((c) => c.outer_html_path as string);

  return {
    path: containerTextPath,
    text: containers.map((container) => container.text).join("\n"),
    outerHtmlPaths
  };
}

async function saveNetworkTimeline(
  timeline: NetworkTimelineEntry[],
  timestamp: string
): Promise<string> {
  const timelinePath = resolve(networkDir, `${timestamp}-timeline.json`);
  await writeFile(timelinePath, `${JSON.stringify(timeline, null, 2)}\n`, "utf8");
  return timelinePath;
}

async function saveConsoleLogs(
  logs: ConsoleEntry[],
  timestamp: string
): Promise<string> {
  const logsPath = resolve(consoleDir, `${timestamp}.json`);
  await writeFile(logsPath, `${JSON.stringify(logs, null, 2)}\n`, "utf8");
  return logsPath;
}

async function collectAccessibilityFallback(page: Page): Promise<{
  source: string;
  summary: Array<{
    tag: string;
    role: string | null;
    aria_label: string | null;
    text: string;
  }>;
  body_text: string;
}> {
  const bodyText = await readBodyText(page);
  const summary = await page
    .locator("body")
    .evaluate(() => {
      const nodes = Array.from(document.querySelectorAll("button, a, [role], input, textarea, select, h1, h2, h3"));

      return nodes.slice(0, 200).map((node) => ({
        tag: node.tagName.toLowerCase(),
        role: node.getAttribute("role"),
        aria_label: node.getAttribute("aria-label"),
        text: (node.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 200)
      }));
    })
    .catch(() => []);

  return {
    source: "fallback-dom-role-text-summary",
    summary,
    body_text: bodyText
  };
}

async function saveAccessibilitySnapshot(page: Page, timestamp: string, capturedAt: string): Promise<{
  path: string;
  available: boolean;
  text: string;
}> {
  const accessibilityPath = resolve(accessibilityDir, `${timestamp}.json`);
  const fallback = await collectAccessibilityFallback(page);

  await writeFile(
    accessibilityPath,
    `${JSON.stringify(
      {
        source_url: SOURCE_URL,
        captured_at: capturedAt,
        accessibility_snapshot_available: false,
        reason: "Playwright Page accessibility API is not used by this TypeScript crawler; saved DOM role/text fallback instead.",
        fallback
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return {
    path: accessibilityPath,
    available: false,
    text: fallback.body_text
  };
}

async function saveStorageKeySnapshot(page: Page, timestamp: string, capturedAt: string): Promise<string> {
  const storageKeysPath = resolve(storageDir, `${timestamp}.json`);
  const storageKeys = await page
    .evaluate(() => ({
      localStorageKeys: Object.keys(window.localStorage),
      sessionStorageKeys: Object.keys(window.sessionStorage)
    }))
    .catch(() => ({
      localStorageKeys: [] as string[],
      sessionStorageKeys: [] as string[]
    }));

  await writeFile(
    storageKeysPath,
    `${JSON.stringify(
      {
        source_url: SOURCE_URL,
        captured_at: capturedAt,
        ...storageKeys
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return storageKeysPath;
}

async function findKnowledgeNodeCandidateText(page: Page, requestedTarget?: string): Promise<string | null> {
  // Phase 3.2: prefer exact match when requestedTarget is provided
  if (requestedTarget) {
    const pfx = requestedTarget.substring(0, Math.min(requestedTarget.length, 4));
    const broad = page.locator('text=/' + pfx + '/');
    const bc = await broad.count().catch(() => 0);
    for (let i = 0; i < bc && i < 20; i++) {
      const el = broad.nth(i);
      const vis = await el.isVisible({ timeout: 1_000 }).catch(() => false);
      if (!vis) continue;
      const t = normalizeVisibleText(await el.innerText({ timeout: 1_000 }).catch(() => ''));
      const ml = Math.min(requestedTarget.length, 10);
      if (t && t.includes(requestedTarget.substring(0, ml))) {
        log('[Phase 3.2] matched: "' + t + '"');
        return t;
      }
    }
    warn('[Phase 3.2] target not found; using auto-discovery');
  }
    const locator = page.locator(KNOWLEDGE_NODE_TEXT_PATTERN);
  const count = await locator.count().catch(() => 0);

  for (let index = 0; index < count && index < MAX_KNOWLEDGE_NODE_CLICK_ATTEMPTS; index += 1) {
    const candidate = locator.nth(index);
    const isVisible = await candidate.isVisible({ timeout: 1_000 }).catch(() => false);

    if (!isVisible) {
      continue;
    }

    const text = normalizeVisibleText(await candidate.innerText({ timeout: 1_000 }).catch(() => ""));

    if (text && isKnowledgeNodeCandidateText(text)) {
      return text;
    }
  }

  return null;
}

async function resolveLeafFromChapter(
  page: Page,
  chapterText: string,
  requestedTarget?: string
): Promise<{
  success: boolean;
  text: string | null;
  strategy: "same_chapter_related_leaf" | "same_chapter_first_leaf" | "failed";
}> {
  log(`leaf resolution attempted for chapter: ${chapterText}`);

  const chapterClicked = await clickVisibleByText(page, chapterText);
  if (chapterClicked) {
    log(`chapter expanded for leaf resolution: ${chapterText}`);
    await waitForRender(page, WAIT_AFTER_DIRECTORY_CLICK_MS);
  } else {
    warn(`chapter expansion click failed for leaf resolution: ${chapterText}`);
  }

  const result = await page
    .evaluate(
      ({ chapterTextArg, requestedTargetArg }) => {
        const normalizedChapter = chapterTextArg.replace(/\s+/g, " ").trim();
        const chapterNumber = normalizedChapter.match(/^第\s*(\d+)\s*章/)?.[1] ?? null;
        const target = (requestedTargetArg ?? "").replace(/\s+/g, " ").trim();
        const titleSelectors = [
          ".chapterExercises .chapterExercises-title",
          ".chapterExercises-title",
          ".lgchapterExercises .lgchapterExercises-title",
          ".lgchapterExercises-title"
        ];
        const rawCandidates = Array.from(document.querySelectorAll(titleSelectors.join(",")));
        const leafTexts: string[] = [];

        for (const el of rawCandidates) {
          const hasLeafIcon = Boolean(el.querySelector(".el-icon-document"));
          const rawText = (el.textContent ?? "").replace(/\s+/g, " ").trim();
          const textMatch = rawText.match(/\d+(?:\.\d+)+\s*[^掌握去]+/);
          const text = (textMatch?.[0] ?? rawText).replace(/\s+/g, " ").trim();
          const textIsChapter = /^第\s*\d+\s*章/.test(text);
          const textIsLeaf = /^\d+(?:\.\d+)+\s*\S+/.test(text) && !textIsChapter && !text.includes("掌握程度");
          if (!hasLeafIcon && !textIsLeaf) continue;
          if (!textIsLeaf) continue;
          if (chapterNumber && !text.startsWith(`${chapterNumber}.`)) continue;
          if (!leafTexts.includes(text)) leafTexts.push(text);
        }

        if (leafTexts.length === 0) return null;

        const related = target.length > 0
          ? leafTexts.find((text) => text.includes(target) || target.includes(text))
          : null;

        if (related) {
          return { text: related, strategy: "same_chapter_related_leaf" as const, leafTexts };
        }

        return { text: leafTexts[0], strategy: "same_chapter_first_leaf" as const, leafTexts };
      },
      { chapterTextArg: chapterText, requestedTargetArg: requestedTarget ?? "" }
    )
    .catch((error) => {
      warn(`leaf resolution evaluate failed: ${formatError(error)}`);
      return null;
    });

  if (!result?.text) {
    return { success: false, text: null, strategy: "failed" };
  }

  log(`leaf resolution success: ${result.text} (${result.strategy})`);
  return {
    success: true,
    text: result.text,
    strategy: result.strategy
  };
}

async function findVisibleTargetLeaf(
  page: Page,
  parsedTarget: NonNullable<ReturnType<typeof parseTargetSection>>,
  allowSameChapterFallback: boolean
): Promise<{
  success: boolean;
  text: string | null;
  strategy: InteractionHarvestResult["targetLeafResolutionStrategy"];
  exactMatch: boolean;
  candidates: string[];
}> {
  const result = await page
    .evaluate(
      ({ target, sectionNumber, chapterNumber, remainder, allowFallback }) => {
        const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
        const comparable = (value: string) => normalize(value).replace(/\s+/g, "").toLowerCase();
        const weakTerms = new Set(["系统", "技术", "处理", "设计", "常识", "基础", "知识"]);
        const keywordTokens = [
          remainder,
          ...remainder.split(/[的和与及、，,：:（）()—\-]/),
          ...(remainder.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g) ?? []),
          ...(remainder.match(/\p{Script=Han}{2,}/gu) ?? [])
        ]
          .map(comparable)
          .filter((token, index, list) => token.length >= 2 && !weakTerms.has(token) && list.indexOf(token) === index);

        const extractLeafText = (raw: string): string => {
          const text = normalize(raw);
          const match = text.match(/\d+(?:\.\d+)+\s*.*?(?=掌握程度|去掌握|学习|查看|详情|进入|开始|练习|$)/);
          return normalize(match?.[0] ?? text);
        };

        const selectors = [
          ".chapterExercises .chapterExercises-title",
          ".chapterExercises-title",
          ".lgchapterExercises .lgchapterExercises-title",
          ".lgchapterExercises-title",
          ".chapterExercises-title3"
        ];
        const nodes = Array.from(document.querySelectorAll(selectors.join(",")));
        const candidates: string[] = [];

        for (const node of nodes) {
          const rect = node.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) continue;
          const hasLeafIcon = Boolean(node.querySelector(".el-icon-document"));
          const rawText = normalize(node.textContent ?? "");
          const text = extractLeafText(rawText);
          const isChapter = /^第\s*\d+\s*章/.test(text);
          const isLeaf = /^\d+(?:\.\d+)+\s*\S+/.test(text) && !isChapter && !text.includes("掌握程度");
          if (!hasLeafIcon && !isLeaf) continue;
          if (!isLeaf) continue;
          if (!text.startsWith(`${chapterNumber}.`)) continue;
          if (!candidates.includes(text)) candidates.push(text);
        }

        const exact = candidates.find((text) => comparable(text) === comparable(target));
        if (exact) {
          return {
            success: true,
            text: exact,
            strategy: "exact_full_title" as const,
            exactMatch: true,
            candidates
          };
        }

        const numberAndKeywords = candidates.find((text) => {
          const normalized = comparable(text);
          return text.startsWith(sectionNumber) && keywordTokens.some((token) => normalized.includes(token));
        });
        if (numberAndKeywords) {
          return {
            success: true,
            text: numberAndKeywords,
            strategy: "number_and_keywords" as const,
            exactMatch: false,
            candidates
          };
        }

        const numberOnly = candidates.find((text) => text.startsWith(sectionNumber));
        if (numberOnly) {
          return {
            success: true,
            text: numberOnly,
            strategy: "number_only" as const,
            exactMatch: false,
            candidates
          };
        }

        if (allowFallback) {
          const sameChapter = candidates.find((text) => text.startsWith(`${chapterNumber}.`));
          if (sameChapter) {
            return {
              success: true,
              text: sameChapter,
              strategy: "same_chapter_fallback" as const,
              exactMatch: false,
              candidates
            };
          }
        }

        return {
          success: false,
          text: null,
          strategy: "failed" as const,
          exactMatch: false,
          candidates
        };
      },
      {
        target: `${parsedTarget.targetLeafNumber} ${parsedTarget.targetTitleRemainder}`,
        sectionNumber: parsedTarget.targetSectionNumber,
        chapterNumber: parsedTarget.targetChapterNumber,
        remainder: parsedTarget.targetTitleRemainder,
        allowFallback: allowSameChapterFallback
      }
    )
    .catch((error) => {
      warn(`target leaf evaluate failed: ${formatError(error)}`);
      return {
        success: false,
        text: null,
        strategy: "failed" as const,
        exactMatch: false,
        candidates: [] as string[]
      };
    });

  return result;
}

async function findAndMaybeExpandTargetChapter(
  page: Page,
  parsedTarget: NonNullable<ReturnType<typeof parseTargetSection>>
): Promise<{
  attempted: boolean;
  success: boolean;
  text: string | null;
}> {
  const beforeLeaf = await findVisibleTargetLeaf(page, parsedTarget, false);
  if (beforeLeaf.success) {
    const chapterText = await page
      .evaluate((chapterNumber) => {
        const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
        const candidates = Array.from(document.querySelectorAll("*")).filter((node) => {
          const text = normalize(node.textContent ?? "");
          if (!text.includes(`第${chapterNumber}章`)) return false;
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && text.length <= 80;
        });
        return normalize(candidates[0]?.textContent ?? `第${chapterNumber}章`);
      }, parsedTarget.targetChapterNumber)
      .catch(() => `第${parsedTarget.targetChapterNumber}章`);

    return { attempted: true, success: true, text: chapterText };
  }

  const chapterResult = await page
    .evaluate((chapterNumber) => {
      const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
      const selectors = [
        ".chapterExercises-title",
        ".lgchapterExercises-title",
        ".catalogue-title",
        ".el-tree-node__content",
        "div",
        "span"
      ];
      const candidates = Array.from(document.querySelectorAll(selectors.join(","))).filter((node) => {
        const text = normalize(node.textContent ?? "");
        if (!text.includes(`第${chapterNumber}章`)) return false;
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && text.length <= 160;
      });
      const node = candidates[0] ?? null;
      if (!node) return null;
      node.setAttribute("data-pw-target-chapter", "1");
      return normalize(node.textContent ?? "");
    }, parsedTarget.targetChapterNumber)
    .catch((error) => {
      warn(`target chapter evaluate failed: ${formatError(error)}`);
      return null;
    });

  if (!chapterResult) {
    return { attempted: true, success: false, text: null };
  }

  try {
    const locator = page.locator("[data-pw-target-chapter='1']").first();
    await locator.scrollIntoViewIfNeeded({ timeout: 3_000 });
    await locator.click({ timeout: 5_000 });
    await page.evaluate(() => {
      document.querySelector("[data-pw-target-chapter='1']")?.removeAttribute("data-pw-target-chapter");
    }).catch(() => undefined);
    await waitForRender(page, WAIT_AFTER_DIRECTORY_CLICK_MS);
  } catch (error) {
    warn(`target chapter click failed: ${formatError(error)}`);
    await page.evaluate(() => {
      document.querySelector("[data-pw-target-chapter='1']")?.removeAttribute("data-pw-target-chapter");
    }).catch(() => undefined);
  }

  const afterLeaf = await findVisibleTargetLeaf(page, parsedTarget, false);
  if (afterLeaf.success || afterLeaf.candidates.some((candidate) => candidate.startsWith(`${parsedTarget.targetChapterNumber}.`))) {
    return { attempted: true, success: true, text: chapterResult };
  }

  try {
    const locator = page.getByText(`第${parsedTarget.targetChapterNumber}章`, { exact: false }).first();
    await locator.scrollIntoViewIfNeeded({ timeout: 3_000 });
    await locator.click({ timeout: 5_000 });
    await waitForRender(page, WAIT_AFTER_DIRECTORY_CLICK_MS);
  } catch (error) {
    warn(`target chapter recovery click failed: ${formatError(error)}`);
  }

  const recoveredLeaf = await findVisibleTargetLeaf(page, parsedTarget, false);
  return {
    attempted: true,
    success: recoveredLeaf.success || recoveredLeaf.candidates.some((candidate) => candidate.startsWith(`${parsedTarget.targetChapterNumber}.`)),
    text: chapterResult
  };
}

async function resolveRequestedTargetDeterministically(
  page: Page,
  requestedTarget: string | undefined,
  requireLeaf: boolean
): Promise<{
  enabled: boolean;
  targetSectionNumber: string | null;
  targetChapterNumber: string | null;
  targetLeafNumber: string | null;
  targetTitleRemainder: string | null;
  chapterExpandAttempted: boolean;
  chapterExpandSuccess: boolean;
  chapterText: string | null;
  leafResolutionAttempted: boolean;
  leafResolutionSuccess: boolean;
  leafResolutionStrategy: InteractionHarvestResult["targetLeafResolutionStrategy"];
  leafText: string | null;
  leafExactMatch: boolean;
  trusted: boolean;
  resolvedTargetText: string | null;
  actualNodeMatchesRequestedTarget: boolean;
  failureReason: InteractionHarvestResult["targetResolutionFailureReason"];
}> {
  const parsed = parseTargetSection(requestedTarget);
  if (!parsed) {
    return {
      enabled: false,
      targetSectionNumber: null,
      targetChapterNumber: null,
      targetLeafNumber: null,
      targetTitleRemainder: null,
      chapterExpandAttempted: false,
      chapterExpandSuccess: false,
      chapterText: null,
      leafResolutionAttempted: false,
      leafResolutionSuccess: false,
      leafResolutionStrategy: "not_required",
      leafText: null,
      leafExactMatch: false,
      trusted: false,
      resolvedTargetText: null,
      actualNodeMatchesRequestedTarget: false,
      failureReason: null
    };
  }

  log(`target resolver enabled: ${requestedTarget}`);
  const chapter = await findAndMaybeExpandTargetChapter(page, parsed);
  if (!chapter.success) {
    return {
      enabled: true,
      targetSectionNumber: parsed.targetSectionNumber,
      targetChapterNumber: parsed.targetChapterNumber,
      targetLeafNumber: parsed.targetLeafNumber,
      targetTitleRemainder: parsed.targetTitleRemainder,
      chapterExpandAttempted: chapter.attempted,
      chapterExpandSuccess: false,
      chapterText: chapter.text,
      leafResolutionAttempted: false,
      leafResolutionSuccess: false,
      leafResolutionStrategy: "failed",
      leafText: null,
      leafExactMatch: false,
      trusted: false,
      resolvedTargetText: null,
      actualNodeMatchesRequestedTarget: false,
      failureReason: "chapter_not_found"
    };
  }

  const leaf = await findVisibleTargetLeaf(page, parsed, requireLeaf);
  const requestedFullTitle = `${parsed.targetLeafNumber} ${parsed.targetTitleRemainder}`;
  const exactOrTrusted =
    leaf.success &&
    leaf.text !== null &&
    leaf.exactMatch &&
    targetTextsAlign(leaf.text, requestedFullTitle);
  const trusted = exactOrTrusted;
  const failureReason: InteractionHarvestResult["targetResolutionFailureReason"] = !leaf.success
    ? "target_not_found"
    : trusted
      ? null
      : "leaf_mismatch";

  log(
    `target leaf resolution: ${leaf.success ? leaf.text : "failed"} (${leaf.strategy}, exact=${leaf.exactMatch ? "yes" : "no"})`
  );

  return {
    enabled: true,
    targetSectionNumber: parsed.targetSectionNumber,
    targetChapterNumber: parsed.targetChapterNumber,
    targetLeafNumber: parsed.targetLeafNumber,
    targetTitleRemainder: parsed.targetTitleRemainder,
    chapterExpandAttempted: chapter.attempted,
    chapterExpandSuccess: chapter.success,
    chapterText: chapter.text,
    leafResolutionAttempted: true,
    leafResolutionSuccess: leaf.success,
    leafResolutionStrategy: leaf.strategy,
    leafText: leaf.text,
    leafExactMatch: leaf.exactMatch,
    trusted,
    resolvedTargetText: leaf.text,
    actualNodeMatchesRequestedTarget: targetTextsAlign(leaf.text, requestedFullTitle),
    failureReason
  };
}

async function harvestInteractiveContent(
  page: Page,
  requestedTarget?: string,
  requireLeaf = false
): Promise<InteractionHarvestResult> {
  log("interaction harvesting started");

  const beforeUrl = page.url();
  const beforeTitle = await page.title().catch(() => "");
  const beforeBodyText = await readBodyText(page);
  const beforeBodyTextLength = beforeBodyText.length;

  log(`interaction start url: ${beforeUrl}`);
  log(`interaction start title: ${beforeTitle}`);
  log(`body text length before interaction: ${beforeBodyTextLength}`);

  const targetResolver = await resolveRequestedTargetDeterministically(page, requestedTarget, requireLeaf);
  const shouldUseGenericDiscovery = !targetResolver.enabled;

  const directoryExpandResult = shouldUseGenericDiscovery
    ? await clickVisibleTextCandidate(
      page,
      "text=/计算机|软件|架构|数据库|网络|系统/",
      MAX_DIRECTORY_EXPAND_ATTEMPTS,
      isDirectoryCandidateText,
      "trying to expand directory",
      WAIT_AFTER_DIRECTORY_CLICK_MS
    )
    : {
      success: targetResolver.chapterExpandSuccess,
      text: targetResolver.chapterText
    };

  if (directoryExpandResult.success) {
    log("directory expand success");
  } else {
    warn("directory expand failed");
  }

  // Phase 2.13: Do NOT click the knowledge node row here.
  // Clicking the row hides its own "去掌握" button via v-if, preventing scoped detail entry.
  // Instead, find the target node text without clicking so harvestDetailEntry can click
  // "去掌握" directly (while the button is still visible).
  let knowledgeNodeText = targetResolver.enabled
    ? targetResolver.leafText
    : await findKnowledgeNodeCandidateText(page, requestedTarget);
  let chapterLevelHit = false;
  let chapterLevelText: string | null = null;
  let leafResolutionAttempted = false;
  let leafResolutionSuccess = false;
  let resolvedLeafText: string | null = null;
  let resolvedLeafStrategy: InteractionHarvestResult["resolvedLeafStrategy"] = requireLeaf ? "failed" : "not_required";

  if (targetResolver.enabled) {
    chapterLevelHit = false;
    chapterLevelText = null;
    leafResolutionAttempted = targetResolver.leafResolutionAttempted;
    leafResolutionSuccess = targetResolver.leafResolutionSuccess;
    resolvedLeafText = targetResolver.resolvedTargetText;
    resolvedLeafStrategy = targetResolver.trusted ? "not_required" : "failed";
  } else if (requireLeaf && knowledgeNodeText && isChapterLevelText(knowledgeNodeText)) {
    chapterLevelHit = true;
    chapterLevelText = knowledgeNodeText;
    leafResolutionAttempted = true;
    log(`require-leaf detected chapter-level hit: ${knowledgeNodeText}`);

    const leafResolution = await resolveLeafFromChapter(page, knowledgeNodeText, requestedTarget);
    leafResolutionSuccess = leafResolution.success;
    resolvedLeafText = leafResolution.text;
    resolvedLeafStrategy = leafResolution.strategy;

    if (leafResolution.success && leafResolution.text) {
      knowledgeNodeText = leafResolution.text;
    } else {
      warn("require-leaf leaf resolution failed");
    }
  } else if (requireLeaf && knowledgeNodeText && isLeafLevelText(knowledgeNodeText)) {
    leafResolutionSuccess = true;
    resolvedLeafText = knowledgeNodeText;
    resolvedLeafStrategy = "not_required";
  }

  if (knowledgeNodeText) {
    log(`knowledge node identified (not clicked): ${knowledgeNodeText}`);
  } else {
    warn("knowledge node candidate text not found");
  }

  const afterBodyText = await readBodyText(page);
  const afterBodyTextLength = afterBodyText.length;
  const pageDetailContentSignal = hasDetailContentSignal(afterBodyText);

  log(`body text length after interaction: ${afterBodyTextLength}`);
  log(`detail content signal: ${pageDetailContentSignal ? "yes" : "no"}`);

  return {
    attempted: true,
    directoryExpandAttempted: true,
    directoryExpandSuccess: directoryExpandResult.success && afterBodyTextLength > beforeBodyTextLength,
    directoryExpandText: directoryExpandResult.text,
    // Row click is intentionally skipped — detail entry handles node selection via scoped click
    knowledgeNodeClickAttempted: false,
    knowledgeNodeClickSuccess: false,
    knowledgeNodeClickText: knowledgeNodeText,
    postInteractionUrl: page.url(),
    bodyTextLengthBefore: beforeBodyTextLength,
    bodyTextLength: afterBodyTextLength,
    bodyText: afterBodyText,
    detailContentSignalFromPage: pageDetailContentSignal,
    requireLeaf,
    chapterLevelHit,
    chapterLevelText,
    leafResolutionAttempted,
    leafResolutionSuccess,
    resolvedLeafText,
    resolvedLeafStrategy,
    targetResolverEnabled: targetResolver.enabled,
    targetSectionNumber: targetResolver.targetSectionNumber,
    targetChapterNumber: targetResolver.targetChapterNumber,
    targetLeafNumber: targetResolver.targetLeafNumber,
    targetTitleRemainder: targetResolver.targetTitleRemainder,
    targetChapterExpandAttempted: targetResolver.chapterExpandAttempted,
    targetChapterExpandSuccess: targetResolver.chapterExpandSuccess,
    targetChapterText: targetResolver.chapterText,
    targetLeafResolutionAttempted: targetResolver.leafResolutionAttempted,
    targetLeafResolutionSuccess: targetResolver.leafResolutionSuccess,
    targetLeafResolutionStrategy: targetResolver.leafResolutionStrategy,
    targetLeafText: targetResolver.leafText,
    targetLeafExactMatch: targetResolver.leafExactMatch,
    targetResolutionTrusted: targetResolver.trusted,
    resolvedTargetText: targetResolver.resolvedTargetText,
    actualNodeMatchesRequestedTarget: targetResolver.actualNodeMatchesRequestedTarget,
    targetResolutionFailureReason: targetResolver.failureReason
  };
}

async function selectContextIfNeeded(page: Page): Promise<ContextSelectionResult> {
  const currentUrl = page.url();
  log(`current route after auth: ${currentUrl}`);

  if (!isContextSelectionRoute(currentUrl)) {
    log("context selection required: no");
    return {
      attempted: false,
      success: false,
      text: null,
      postContextUrl: currentUrl
    };
  }

  log("context selection required: yes");

  for (let attempt = 1; attempt <= MAX_CONTEXT_SELECTION_ATTEMPTS; attempt += 1) {
    for (const text of TARGET_CONTEXT_TEXTS) {
      log(`trying context text: ${text} (attempt ${attempt}/${MAX_CONTEXT_SELECTION_ATTEMPTS})`);

      const clicked = await clickVisibleByText(page, text);

      if (!clicked) {
        warn(`context text not clickable: ${text}`);
        continue;
      }

      await waitForRender(page, WAIT_AFTER_CONTEXT_CLICK_MS);

      log("revisiting knowledge route");
      await page.goto(SOURCE_URL, {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT_MS
      });
      await waitForRender(page, WAIT_AFTER_CONTEXT_NAVIGATION_MS);

      const postContextUrl = page.url();
      const bodyText = await readBodyText(page);

      if (!isContextSelectionRoute(postContextUrl) || hasKnowledgeContentSignal(bodyText)) {
        log(`context selected: ${text}`);
        return {
          attempted: true,
          success: true,
          text,
          postContextUrl
        };
      }

      warn(`context click "${text}" did not leave context selection route: ${postContextUrl}`);
    }
  }

  log("context selection failed");

  return {
    attempted: true,
    success: false,
    text: null,
    postContextUrl: page.url()
  };
}

function detectLoginSignals(text: string): { loginRequired: boolean; matchedTerms: string[] } {
  const terms = ["登录", "立即登录", "未登录", "请先登录", "login", "sign in"];
  const lowerText = text.toLowerCase();
  const matchedTerms = terms.filter((term) => lowerText.includes(term.toLowerCase()));

  return {
    loginRequired: matchedTerms.length > 0,
    matchedTerms
  };
}

async function main(): Promise<void> {
  log("starting crawler");

  const capturedAt = new Date().toISOString();
  const timestamp = safeTimestamp(new Date(capturedAt));
  const xhrArtifacts: XhrArtifact[] = [];
  const xhrTasks: Promise<void>[] = [];
  let xhrIndex = 0;
  let knowledgeApiSeen = false;
  let xhrKnowledgeContentSignal = false;
  let xhrDetailContentSignal = false;
  const networkTimeline: NetworkTimelineEntry[] = [];
  const consoleLogs: ConsoleEntry[] = [];

  await ensureRawDirectories();

  const browser = await chromium.launch({ headless: true });

  try {
    const authStateUsed = existsSync(authStatePath);
    log(
      authStateUsed
        ? `using auth state: ${authStateRelativePath}`
        : "auth state not found; using anonymous context"
    );

    const contextOptions: BrowserContextOptions = {
      viewport: { width: 1365, height: 768 }
    };

    if (authStateUsed) {
      contextOptions.storageState = authStatePath;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
    page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS);

    // Network timeline listener
    page.on("request", (request) => {
      networkTimeline.push({
        type: "request",
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        status: null,
        resource_type: request.resourceType(),
        content_type: request.headers()["content-type"] ?? ""
      });
    });

    page.on("response", (response: Response) => {
      const request = response.request();
      const resourceType = request.resourceType();

      if (resourceType !== "xhr" && resourceType !== "fetch") {
        return;
      }

      const currentIndex = xhrIndex;
      xhrIndex += 1;

      const task = (async () => {
        const responseCapturedAt = new Date().toISOString();
        const requestUrl = response.url();
        const contentType = response.headers()["content-type"] ?? "";
        const method = request.method();
        const status = response.status();
        const xhrPath = resolve(xhrDir, `${timestamp}-${String(currentIndex).padStart(3, "0")}.json`);

        if (hasAnySignal(requestUrl, KNOWLEDGE_API_SIGNALS)) {
          knowledgeApiSeen = true;
        }

        let bodyBuffer: Buffer;
        let warning: string | undefined;

        try {
          bodyBuffer = await response.body();
        } catch (error) {
          warning = `failed to read response body: ${formatError(error)}`;
          warn(`${requestUrl} - ${warning}`);
          bodyBuffer = Buffer.from("");
        }

        const contentHash = sha256(bodyBuffer);
        const bodyTextForSignal = bodyBuffer.toString("utf8");
        if (hasKnowledgeContentSignal(bodyTextForSignal)) {
          xhrKnowledgeContentSignal = true;
        }
        if (hasDetailContentSignal(bodyTextForSignal)) {
          xhrDetailContentSignal = true;
        }

        const snapshot: XhrSnapshot = {
          source_url: SOURCE_URL,
          captured_at: responseCapturedAt,
          status,
          method,
          request_url: requestUrl,
          content_type: contentType,
          content_hash: contentHash
        };

        if (warning) {
          snapshot.warning = warning;
        }

        if (isJsonContentType(contentType)) {
          try {
            snapshot.body = bodyTextForSignal.length > 0 ? JSON.parse(bodyTextForSignal) : null;
          } catch (error) {
            snapshot.text = bodyTextForSignal;
            snapshot.warning = `JSON parse failed; saved as text: ${formatError(error)}`;
          }
        } else if (isTextContentType(contentType)) {
          snapshot.text = bodyTextForSignal;
        } else if (bodyBuffer.length === 0) {
          snapshot.text = "";
        } else {
          snapshot.body_base64 = bodyBuffer.toString("base64");
          snapshot.body_encoding = "base64";
        }

        try {
          await writeFile(xhrPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
          xhrArtifacts.push({
            path: toRepoRelativePath(xhrPath),
            request_url: requestUrl,
            status,
            content_type: contentType,
            content_hash: contentHash
          });
        } catch (error) {
          warn(`failed to save XHR snapshot for ${requestUrl}: ${formatError(error)}`);
        }
      })();

      xhrTasks.push(task);

      // Record response in network timeline
      networkTimeline.push({
        type: "response",
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: response.url(),
        status: response.status(),
        resource_type: resourceType,
        content_type: response.headers()["content-type"] ?? ""
      });
    });

    // Console log listener
    page.on("console", (msg) => {
      consoleLogs.push({
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: msg.text()
      });
    });

    await openPageWithRetry(async () => {
      await page.goto(SOURCE_URL, {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT_MS
      });
    });

    log("waiting for render");
    await waitForRender(page, SPA_RENDER_WAIT_MS);

    const contextSelection = await selectContextIfNeeded(page);
    const interactionHarvest = await harvestInteractiveContent(
      page,
      CRAWLER_ARGS.requestedTarget ?? undefined,
      CRAWLER_ARGS.requireLeaf
    );
    const requestedTargetIsFullLeaf = parseTargetSection(CRAWLER_ARGS.requestedTarget) !== null;
    const leafRequirementFailed =
      CRAWLER_ARGS.requireLeaf &&
      (
        !interactionHarvest.knowledgeNodeClickText ||
        !isLeafLevelText(interactionHarvest.knowledgeNodeClickText) ||
        (interactionHarvest.chapterLevelHit && !interactionHarvest.leafResolutionSuccess) ||
        (requestedTargetIsFullLeaf && !interactionHarvest.targetResolutionTrusted)
      );

    if (leafRequirementFailed) {
      warn("require-leaf failed; preserving raw snapshot without detail-entry click");
    }

    const allowGlobalFallback = !(CRAWLER_ARGS.requireLeaf && requestedTargetIsFullLeaf);
    const detailEntry = leafRequirementFailed
      ? await buildSkippedDetailEntry(page, timestamp)
      : await harvestDetailEntry(
        page,
        timestamp,
        interactionHarvest.knowledgeNodeClickText,
        allowGlobalFallback
      );

    log("saving html");
    const html = await page.content();
    const htmlPath = resolve(htmlDir, `${timestamp}.html`);
    const htmlContentHash = sha256(html);
    await writeFile(htmlPath, html, "utf8");

    log("saving screenshot");
    const screenshotPath = resolve(screenshotDir, `${timestamp}.png`);
    let screenshotBuffer: Buffer;
    try {
      screenshotBuffer = await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
    } catch (error) {
      throw new Error(`screenshot failed: ${formatError(error)}`);
    }
    const screenshotContentHash = sha256(screenshotBuffer);

    log("saving dom text snapshot");
    const domTextPath = resolve(domTextDir, `${timestamp}.txt`);
    const bodyText = await readBodyText(page);
    const domTextContentHash = sha256(bodyText);
    await writeFile(domTextPath, bodyText, "utf8");

    log("saving container text snapshot");
    const containerSnapshot = await saveContainerSnapshot(page, timestamp, capturedAt);

    log("saving accessibility snapshot");
    const accessibilitySnapshot = await saveAccessibilitySnapshot(page, timestamp, capturedAt);

    log("saving storage key snapshot");
    const storageKeysPath = await saveStorageKeySnapshot(page, timestamp, capturedAt);

    log("saving xhr responses");
    const settledXhrTasks = await Promise.allSettled(xhrTasks);
    const failedXhrTasks = settledXhrTasks.filter((result) => result.status === "rejected");
    if (failedXhrTasks.length > 0) {
      warn(`${failedXhrTasks.length} XHR response(s) failed to save`);
    }

    log("saving network timeline");
    const networkTimelinePath = await saveNetworkTimeline(networkTimeline, timestamp);

    log("saving console logs");
    const consoleLogPath = await saveConsoleLogs(consoleLogs, timestamp);
    const consoleErrorCount = consoleLogs.filter((e) => e.type === "error").length;
    const consoleWarningCount = consoleLogs.filter((e) => e.type === "warning").length;

    const pageTitle = await page.title();
    const loginSignals = detectLoginSignals(bodyText);
    const knowledgeContentSignal = hasKnowledgeContentSignal(bodyText) || xhrKnowledgeContentSignal;
    const detailContentSignal = hasDetailContentSignal(bodyText) || xhrDetailContentSignal;
    const postDetailContentSignal =
      hasDetailContentSignal(bodyText) ||
      hasDetailContentSignal(containerSnapshot.text) ||
      hasDetailContentSignal(accessibilitySnapshot.text) ||
      xhrDetailContentSignal;

    log(`knowledge api seen: ${knowledgeApiSeen ? "yes" : "no"}`);
    log(`knowledge content signal: ${knowledgeContentSignal ? "yes" : "no"}`);
    log(`detail content signal: ${detailContentSignal ? "yes" : "no"}`);
    log(`post-detail content signal: ${postDetailContentSignal ? "yes" : "no"}`);

    log("writing metadata");
    const metadataPath = resolve(metadataDir, `${timestamp}.json`);
    const metadata = {
      source_url: SOURCE_URL,
      captured_at: capturedAt,
      html_path: toRepoRelativePath(htmlPath),
      screenshot_path: toRepoRelativePath(screenshotPath),
      xhr_count: xhrArtifacts.length,
      xhr_paths: xhrArtifacts.map((artifact) => artifact.path),
      page_title: pageTitle,
      final_url: page.url(),
      login_required_signal: loginSignals.loginRequired,
      login_required_terms_detected: loginSignals.matchedTerms,
      auth_state_used: authStateUsed,
      auth_state_path: authStateUsed ? authStateRelativePath : null,
      context_selection_attempted: contextSelection.attempted,
      context_selection_success: contextSelection.success,
      context_selection_text: contextSelection.text,
      post_context_url: contextSelection.postContextUrl,
      knowledge_api_seen: knowledgeApiSeen,
      knowledge_content_signal: knowledgeContentSignal,
      interaction_harvesting_attempted: interactionHarvest.attempted,
      directory_expand_attempted: interactionHarvest.directoryExpandAttempted,
      directory_expand_success: interactionHarvest.directoryExpandSuccess,
      directory_expand_text: interactionHarvest.directoryExpandText,
      knowledge_node_click_attempted: interactionHarvest.knowledgeNodeClickAttempted,
      knowledge_node_click_success: interactionHarvest.knowledgeNodeClickSuccess,
      knowledge_node_click_text: interactionHarvest.knowledgeNodeClickText,
      post_interaction_url: interactionHarvest.postInteractionUrl,
      body_text_length_before_interaction: interactionHarvest.bodyTextLengthBefore,
      body_text_length: bodyText.length,
      dom_text_path: toRepoRelativePath(domTextPath),
      detail_content_signal: detailContentSignal,
      detail_entry_attempted: detailEntry.attempted,
      detail_entry_success: detailEntry.success,
      detail_entry_text: detailEntry.text,
      detail_entry_url_before: detailEntry.urlBefore,
      detail_entry_url_after: detailEntry.urlAfter,
      detail_entry_route_changed: detailEntry.routeChanged,
      body_text_length_before_detail_entry: detailEntry.bodyTextLengthBefore,
      body_text_length_after_detail_entry: detailEntry.bodyTextLengthAfter,
      container_text_path: toRepoRelativePath(containerSnapshot.path),
      accessibility_snapshot_path: toRepoRelativePath(accessibilitySnapshot.path),
      accessibility_snapshot_available: accessibilitySnapshot.available,
      storage_keys_path: toRepoRelativePath(storageKeysPath),
      before_detail_screenshot_path: toRepoRelativePath(detailEntry.beforeScreenshotPath),
      after_detail_screenshot_path: toRepoRelativePath(detailEntry.afterScreenshotPath),
      post_detail_content_signal: postDetailContentSignal,
      requested_target_text: CRAWLER_ARGS.requestedTarget,
      target_source: CRAWLER_ARGS.targetSource,
      require_leaf: CRAWLER_ARGS.requireLeaf,
      target_resolver_enabled: interactionHarvest.targetResolverEnabled,
      target_section_number: interactionHarvest.targetSectionNumber,
      target_chapter_number: interactionHarvest.targetChapterNumber,
      target_leaf_number: interactionHarvest.targetLeafNumber,
      target_title_remainder: interactionHarvest.targetTitleRemainder,
      target_chapter_expand_attempted: interactionHarvest.targetChapterExpandAttempted,
      target_chapter_expand_success: interactionHarvest.targetChapterExpandSuccess,
      target_chapter_text: interactionHarvest.targetChapterText,
      target_leaf_resolution_attempted: interactionHarvest.targetLeafResolutionAttempted,
      target_leaf_resolution_success: interactionHarvest.targetLeafResolutionSuccess,
      target_leaf_resolution_strategy: interactionHarvest.targetLeafResolutionStrategy,
      target_leaf_text: interactionHarvest.targetLeafText,
      target_leaf_exact_match: interactionHarvest.targetLeafExactMatch,
      target_resolution_trusted: interactionHarvest.targetResolutionTrusted,
      resolved_target_text: interactionHarvest.resolvedTargetText,
      actual_node_matches_requested_target: interactionHarvest.actualNodeMatchesRequestedTarget,
      target_resolution_failure_reason:
        !allowGlobalFallback && detailEntry.strategy === "global_fallback"
          ? "global_fallback_not_allowed_for_require_leaf"
          : interactionHarvest.targetResolutionFailureReason,
      chapter_level_hit: interactionHarvest.chapterLevelHit,
      chapter_level_text: interactionHarvest.chapterLevelText,
      leaf_resolution_attempted: interactionHarvest.leafResolutionAttempted,
      leaf_resolution_success: interactionHarvest.leafResolutionSuccess,
      resolved_leaf_text: interactionHarvest.resolvedLeafText,
      resolved_leaf_strategy: interactionHarvest.resolvedLeafStrategy,
      leaf_requirement_failed: leafRequirementFailed,
      phase2_13_target_scoped_detail_entry_enabled: true,
      detail_entry_strategy: detailEntry.strategy,
      detail_entry_target_text: interactionHarvest.knowledgeNodeClickText,
      detail_entry_scope_found: detailEntry.scopeFound,
      detail_entry_scope_text_length: detailEntry.scopeTextLength,
      detail_entry_scope_text_preview: detailEntry.scopeTextPreview,
      detail_entry_click_index: detailEntry.clickIndex,
      detail_content_target_alignment: detailEntry.contentTargetAlignment,
      detail_content_detected_title: detailEntry.contentDetectedTitle,
      detail_content_text_length: detailEntry.contentTextLength,
      detail_content_text_preview: detailEntry.contentTextPreview,
      outer_html_paths: containerSnapshot.outerHtmlPaths.map(toRepoRelativePath),
      network_timeline_path: toRepoRelativePath(networkTimelinePath),
      network_event_count: networkTimeline.length,
      console_log_path: toRepoRelativePath(consoleLogPath),
      console_error_count: consoleErrorCount,
      console_warning_count: consoleWarningCount,
      content_hash: htmlContentHash,
      artifacts: {
        html: {
          path: toRepoRelativePath(htmlPath),
          content_hash: htmlContentHash,
          source_url: SOURCE_URL,
          captured_at: capturedAt
        },
        screenshot: {
          path: toRepoRelativePath(screenshotPath),
          content_hash: screenshotContentHash,
          source_url: SOURCE_URL,
          captured_at: capturedAt
        },
        dom_text: {
          path: toRepoRelativePath(domTextPath),
          content_hash: domTextContentHash,
          source_url: SOURCE_URL,
          captured_at: capturedAt
        },
        containers: {
          path: toRepoRelativePath(containerSnapshot.path),
          content_hash: sha256(containerSnapshot.text),
          source_url: SOURCE_URL,
          captured_at: capturedAt
        },
        accessibility: {
          path: toRepoRelativePath(accessibilitySnapshot.path),
          available: accessibilitySnapshot.available,
          source_url: SOURCE_URL,
          captured_at: capturedAt
        },
        storage_keys: {
          path: toRepoRelativePath(storageKeysPath),
          source_url: SOURCE_URL,
          captured_at: capturedAt
        },
        debug_screenshots: {
          before_detail_entry: toRepoRelativePath(detailEntry.beforeScreenshotPath),
          after_detail_entry: toRepoRelativePath(detailEntry.afterScreenshotPath)
        },
        xhr: xhrArtifacts
      }
    };

    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

    await context.close();

    if (leafRequirementFailed) {
      throw new Error("require-leaf failed: chapter-level target was not resolved to a leaf knowledge point");
    }

    log("crawler completed");
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(`[crawler][error] ${formatError(error)}`);
  process.exit(1);
});
