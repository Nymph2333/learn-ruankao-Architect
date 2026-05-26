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
  return text.length <= 200 && text.includes("第") && text.includes("章") && hasAnySignal(text, DIRECTORY_TEXT_SIGNALS);
}

function isKnowledgeNodeCandidateText(text: string): boolean {
  if (text.length < 2 || text.length > 100) {
    return false;
  }

  if (isCommonNavigationText(text)) {
    return false;
  }

  if (/第\s*\d+\s*章/.test(text) || text.includes("掌握程度") || /^\d+\s*\/\s*\d+$/.test(text)) {
    return false;
  }

  return hasAnySignal(text, ["架构", "软件", "数据库", "网络", "系统", "质量", "设计"]);
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
  knowledgeNodeClickText: string | null
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
  knowledgeNodeClickText: string | null
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

  const clickResult = await clickDetailEntryScopedOrFallback(page, knowledgeNodeClickText);

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

async function findKnowledgeNodeCandidateText(page: Page): Promise<string | null> {
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

async function harvestInteractiveContent(page: Page): Promise<InteractionHarvestResult> {
  log("interaction harvesting started");

  const beforeUrl = page.url();
  const beforeTitle = await page.title().catch(() => "");
  const beforeBodyText = await readBodyText(page);
  const beforeBodyTextLength = beforeBodyText.length;

  log(`interaction start url: ${beforeUrl}`);
  log(`interaction start title: ${beforeTitle}`);
  log(`body text length before interaction: ${beforeBodyTextLength}`);

  const directoryExpandResult = await clickVisibleTextCandidate(
    page,
    "text=/计算机|软件|架构|数据库|网络|系统/",
    MAX_DIRECTORY_EXPAND_ATTEMPTS,
    isDirectoryCandidateText,
    "trying to expand directory",
    WAIT_AFTER_DIRECTORY_CLICK_MS
  );

  if (directoryExpandResult.success) {
    log("directory expand success");
  } else {
    warn("directory expand failed");
  }

  // Phase 2.13: Do NOT click the knowledge node row here.
  // Clicking the row hides its own "去掌握" button via v-if, preventing scoped detail entry.
  // Instead, find the target node text without clicking so harvestDetailEntry can click
  // "去掌握" directly (while the button is still visible).
  const knowledgeNodeText = await findKnowledgeNodeCandidateText(page);

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
    detailContentSignalFromPage: pageDetailContentSignal
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
    const interactionHarvest = await harvestInteractiveContent(page);
    const detailEntry = await harvestDetailEntry(
      page,
      timestamp,
      interactionHarvest.knowledgeNodeClickText
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
    log("crawler completed");
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(`[crawler][error] ${formatError(error)}`);
  process.exit(1);
});
