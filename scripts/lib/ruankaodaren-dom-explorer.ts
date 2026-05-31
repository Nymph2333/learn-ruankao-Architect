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

export interface MatchedLeafDetailEntryResult {
  attempted: true;
  success: boolean;
  text: string | null;
  strategy:
    | "matched_leaf_action"
    | "matched_leaf_action_retry"
    | "matched_leaf_direct"
    | "matched_leaf_after_select_action"
    | "failed";
  url_before: string;
  final_url: string;
  route_changed: boolean;
  final_url_contains_konwledgeInfo: boolean;
  leaf_match_title: string | null;
  scope_found: boolean;
  scope_text_length: number;
  scope_text_preview: string;
  click_attempts: string[];
  login_dialog_detected: boolean;
  failure_reason: string | null;
}

export interface KnowInfoOuterHtmlSnapshot {
  found: boolean;
  selector: string | null;
  text_length: number;
  outer_html_length: number;
  img_count: number;
  outer_html: string | null;
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

async function waitForKonwledgeInfoRoute(page: Page, timeoutMs = 6_000): Promise<boolean> {
  if (page.url().includes("konwledgeInfo")) return true;
  await page
    .waitForFunction(() => window.location.href.includes("konwledgeInfo"), null, { timeout: timeoutMs })
    .catch(() => undefined);
  return page.url().includes("konwledgeInfo");
}

async function markMatchedLeafDetailTarget(page: Page, leafTitle: string): Promise<{
  found: boolean;
  leafText: string | null;
  actionText: string | null;
  scopeText: string;
  scopeTextLength: number;
}> {
  await ensureEvaluateHelper(page);
  return page
    .evaluate((targetTitle) => {
      const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
      const actionLabels = ["去掌握", "学习", "去学习", "进入学习", "开始学习", "查看详情", "查看知识点"];
      const clearMarks = () => {
        document
          .querySelectorAll("[data-pw-baseline-detail-leaf='1'], [data-pw-baseline-detail-action='1'], [data-pw-baseline-detail-scope='1']")
          .forEach((node) => {
            node.removeAttribute("data-pw-baseline-detail-leaf");
            node.removeAttribute("data-pw-baseline-detail-action");
            node.removeAttribute("data-pw-baseline-detail-scope");
          });
      };
      const visible = (el: Element) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      clearMarks();

      const leafNodes = Array.from(document.querySelectorAll<HTMLElement>("*")).filter(
        (el) => el.children.length === 0 && visible(el) && normalize(el.textContent || "") === targetTitle
      );
      let fallbackLeaf: HTMLElement | null = null;
      let fallbackScopeText = "";
      let fallbackScopeTextLength = 0;

      for (const leafNode of leafNodes) {
        fallbackLeaf = fallbackLeaf ?? leafNode;
        let container: HTMLElement | null = leafNode.parentElement;
        for (let depth = 0; depth < 12 && container; depth += 1) {
          const scopeText = normalize(container.innerText || container.textContent || "");
          if (!scopeText.includes(targetTitle)) {
            container = container.parentElement;
            continue;
          }
          if (!fallbackScopeText) {
            fallbackScopeText = scopeText.slice(0, 300);
            fallbackScopeTextLength = scopeText.length;
          }
          if (scopeText.length > 1800 && depth > 1) {
            container = container.parentElement;
            continue;
          }

          const actionNode =
            Array.from(container.querySelectorAll<HTMLElement>("a, button, span, div, [role='button']")).find((candidate) => {
              if (candidate === leafNode || candidate.contains(leafNode)) return false;
              if (!visible(candidate)) return false;
              const text = normalize(candidate.innerText || candidate.textContent || "");
              if (!actionLabels.includes(text)) return false;
              return candidate.children.length === 0 || candidate.getAttribute("role") === "button";
            }) ?? null;

          if (!actionNode) {
            container = container.parentElement;
            continue;
          }

          leafNode.setAttribute("data-pw-baseline-detail-leaf", "1");
          container.setAttribute("data-pw-baseline-detail-scope", "1");
          actionNode.setAttribute("data-pw-baseline-detail-action", "1");
          return {
            found: true,
            leafText: normalize(leafNode.textContent || ""),
            actionText: normalize(actionNode.innerText || actionNode.textContent || ""),
            scopeText: scopeText.slice(0, 300),
            scopeTextLength: scopeText.length,
          };
        }
      }

      if (fallbackLeaf) {
        fallbackLeaf.setAttribute("data-pw-baseline-detail-leaf", "1");
        return {
          found: true,
          leafText: normalize(fallbackLeaf.textContent || ""),
          actionText: null,
          scopeText: fallbackScopeText,
          scopeTextLength: fallbackScopeTextLength,
        };
      }

      return {
        found: false,
        leafText: null,
        actionText: null,
        scopeText: "",
        scopeTextLength: 0,
      };
    }, leafTitle)
    .catch(() => ({
      found: false,
      leafText: null,
      actionText: null,
      scopeText: "",
      scopeTextLength: 0,
    }));
}

async function clickMarkedLocator(page: Page, selector: string): Promise<boolean> {
  const locator = page.locator(selector).first();
  const visible = await locator.isVisible({ timeout: 1_000 }).catch(() => false);
  if (!visible) return false;
  await locator.scrollIntoViewIfNeeded({ timeout: 3_000 }).catch(() => undefined);
  try {
    await locator.click({ timeout: 5_000 });
    await page.waitForTimeout(1_000);
    return true;
  } catch {
    return false;
  }
}

async function detectVisibleLoginDialog(page: Page): Promise<boolean> {
  return page
    .evaluate(() => {
      const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
      const loginSignals = ["微信扫码安全登录", "手机号登录", "获取小程序", "老用户手机号登录"];
      return Array.from(document.querySelectorAll<HTMLElement>(".el-dialog__wrapper, [role='dialog']")).some((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const text = normalize(el.innerText || el.textContent || "");
        return loginSignals.some((signal) => text.includes(signal));
      });
    })
    .catch(() => false);
}

export async function inspectKnowInfoOuterHtml(page: Page): Promise<KnowInfoOuterHtmlSnapshot> {
  await ensureEvaluateHelper(page);
  return page
    .evaluate(() => {
      const selectors = [".knowInfo.ql-editor", ".knowInfo", ".ql-editor"];
      for (const selector of selectors) {
        const el = document.querySelector<HTMLElement>(selector);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 && rect.height <= 0) continue;
        const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
        const outerHtml = el.outerHTML;
        return {
          found: true,
          selector,
          text_length: text.length,
          outer_html_length: outerHtml.length,
          img_count: el.querySelectorAll("img").length,
          outer_html: outerHtml,
        };
      }
      return {
        found: false,
        selector: null,
        text_length: 0,
        outer_html_length: 0,
        img_count: 0,
        outer_html: null,
      };
    })
    .catch(() => ({
      found: false,
      selector: null,
      text_length: 0,
      outer_html_length: 0,
      img_count: 0,
      outer_html: null,
    }));
}

export async function clickMatchedLeafDetailEntry(
  page: Page,
  leafTitle: string
): Promise<MatchedLeafDetailEntryResult> {
  const urlBefore = page.url();
  const clickAttempts: string[] = [];
  let leafMatchTitle: string | null = null;
  let scopeText = "";
  let scopeTextLength = 0;
  let actionText: string | null = null;
  let failureReason: string | null = null;
  let loginDialogDetected = false;

  const attemptAction = async (
    label: MatchedLeafDetailEntryResult["strategy"]
  ): Promise<MatchedLeafDetailEntryResult | null> => {
    const mark = await markMatchedLeafDetailTarget(page, leafTitle);
    if (!mark.found) {
      failureReason = "matched leaf was not found in visible DOM";
      return null;
    }
    leafMatchTitle = mark.leafText;
    scopeText = mark.scopeText;
    scopeTextLength = mark.scopeTextLength;
    actionText = mark.actionText;
    if (!mark.actionText) {
      failureReason = "matched leaf scope did not contain a visible detail-entry action";
      return null;
    }
    const clicked = await clickMarkedLocator(page, "[data-pw-baseline-detail-action='1']");
    clickAttempts.push(`${label}:${clicked ? "clicked" : "not_visible"}`);
    const routeOk = await waitForKonwledgeInfoRoute(page);
    if (!routeOk) {
      loginDialogDetected = await detectVisibleLoginDialog(page);
      if (loginDialogDetected) {
        failureReason = "detail entry opened login dialog; authenticated storage state is missing or expired";
      }
    }
    if (!routeOk) return null;
    const finalUrl = page.url();
    return {
      attempted: true,
      success: true,
      text: mark.actionText,
      strategy: label,
      url_before: urlBefore,
      final_url: finalUrl,
      route_changed: finalUrl !== urlBefore,
      final_url_contains_konwledgeInfo: finalUrl.includes("konwledgeInfo"),
      leaf_match_title: mark.leafText,
      scope_found: true,
      scope_text_length: mark.scopeTextLength,
      scope_text_preview: mark.scopeText,
      click_attempts: clickAttempts,
      login_dialog_detected: false,
      failure_reason: null,
    };
  };

  const firstAction = await attemptAction("matched_leaf_action");
  if (firstAction) return firstAction;

  const secondAction = await attemptAction("matched_leaf_action_retry");
  if (secondAction) return secondAction;

  const markForLeaf = await markMatchedLeafDetailTarget(page, leafTitle);
  if (markForLeaf.found) {
    leafMatchTitle = markForLeaf.leafText;
    scopeText = markForLeaf.scopeText;
    scopeTextLength = markForLeaf.scopeTextLength;
    actionText = markForLeaf.actionText ?? actionText;
    const clickedLeaf = await clickMarkedLocator(page, "[data-pw-baseline-detail-leaf='1']");
    clickAttempts.push(`matched_leaf_direct:${clickedLeaf ? "clicked" : "not_visible"}`);
    const leafRouteOk = await waitForKonwledgeInfoRoute(page);
    if (!leafRouteOk) {
      loginDialogDetected = await detectVisibleLoginDialog(page);
      if (loginDialogDetected) {
        failureReason = "detail entry opened login dialog; authenticated storage state is missing or expired";
      }
    }
    if (leafRouteOk) {
      const finalUrl = page.url();
      return {
        attempted: true,
        success: true,
        text: markForLeaf.leafText,
        strategy: "matched_leaf_direct",
        url_before: urlBefore,
        final_url: finalUrl,
        route_changed: finalUrl !== urlBefore,
        final_url_contains_konwledgeInfo: finalUrl.includes("konwledgeInfo"),
        leaf_match_title: markForLeaf.leafText,
        scope_found: true,
        scope_text_length: markForLeaf.scopeTextLength,
        scope_text_preview: markForLeaf.scopeText,
        click_attempts: clickAttempts,
        login_dialog_detected: false,
        failure_reason: null,
      };
    }
  }

  const afterSelectAction = await attemptAction("matched_leaf_after_select_action");
  if (afterSelectAction) return afterSelectAction;

  const finalUrl = page.url();
  loginDialogDetected = loginDialogDetected || await detectVisibleLoginDialog(page);
  return {
    attempted: true,
    success: false,
    text: actionText,
    strategy: "failed",
    url_before: urlBefore,
    final_url: finalUrl,
    route_changed: finalUrl !== urlBefore,
    final_url_contains_konwledgeInfo: finalUrl.includes("konwledgeInfo"),
    leaf_match_title: leafMatchTitle,
    scope_found: leafMatchTitle !== null,
    scope_text_length: scopeTextLength,
    scope_text_preview: scopeText,
    click_attempts: clickAttempts,
    login_dialog_detected: loginDialogDetected,
    failure_reason: failureReason ?? "matched leaf detail-entry actions did not enter konwledgeInfo route",
  };
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

// Phase 3.19: Detail Content Stabilization

export interface StabilizationRound {
  round: number;
  selector: string;
  exists: boolean;
  text_length: number;
  normalized_text_hash: string;
  outer_html_length: number;
  img_count: number;
  paragraph_count: number;
  current_url: string;
  timestamp: string;
}

export interface StabilizationResult {
  status:
    | "stable_rich"
    | "stable_with_assets"
    | "stable_but_low_text"
    | "timeout_no_container"
    | "timeout_unstable";
  selected_selector: string | null;
  text_length: number;
  outer_html_length: number;
  img_count: number;
  paragraph_count: number;
  rounds: StabilizationRound[];
  waited_ms: number;
}

export interface StabilizationOptions {
  minTextLength?: number;
  stableRounds?: number;
  pollIntervalMs?: number;
  timeoutMs?: number;
  selectors?: string[];
}

function simpleTextHash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(31, h) + text.charCodeAt(i);
    h |= 0;
  }
  return (h >>> 0).toString(16);
}

export async function waitForStableDetailContent(
  page: Page,
  options: StabilizationOptions = {}
): Promise<StabilizationResult> {
  const {
    minTextLength = 120,
    stableRounds = 3,
    pollIntervalMs = 1000,
    timeoutMs = 15000,
    selectors = [
      ".knowInfo.ql-editor",
      ".knowInfo",
      ".ql-editor",
      ".topicDetails",
      ".topicDetails .ql-editor",
      ".questionInfo",
      ".questionContent",
    ],
  } = options;

  const startMs = Date.now();
  const allRounds: StabilizationRound[] = [];
  let roundNumber = 0;

  // Per-selector: track consecutive stable readings
  const selectorStableCount = new Map<string, number>();
  const selectorLastSnap = new Map<
    string,
    { text_length: number; img_count: number; outer_html_length: number }
  >();

  while (Date.now() - startMs < timeoutMs) {
    roundNumber++;

    for (const selector of selectors) {
      const data = await page
        .evaluate((sel: string) => {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 && rect.height <= 0) return null;
          const text = (el.innerText ?? el.textContent ?? "")
            .replace(/\s+/g, " ")
            .trim();
          const outerHtml = el.outerHTML;
          const imgs = el.querySelectorAll("img").length;
          const paragraphs = el.querySelectorAll("p, li").length;
          return {
            text,
            outer_html_length: outerHtml.length,
            img_count: imgs,
            paragraph_count: paragraphs,
          };
        }, selector)
        .catch(() => null);

      const textHash = data ? simpleTextHash(data.text) : "";
      const round: StabilizationRound = {
        round: roundNumber,
        selector,
        exists: data !== null,
        text_length: data ? data.text.length : 0,
        normalized_text_hash: textHash,
        outer_html_length: data ? data.outer_html_length : 0,
        img_count: data ? data.img_count : 0,
        paragraph_count: data ? data.paragraph_count : 0,
        current_url: page.url(),
        timestamp: new Date().toISOString(),
      };
      allRounds.push(round);

      if (!data || data.text.length === 0) {
        selectorStableCount.set(selector, 0);
        selectorLastSnap.delete(selector);
        continue;
      }

      const last = selectorLastSnap.get(selector);
      const stableThisRound =
        last !== undefined &&
        Math.abs(data.text.length - last.text_length) <= 5 &&
        data.img_count === last.img_count &&
        Math.abs(data.outer_html_length - last.outer_html_length) <= 50;

      selectorLastSnap.set(selector, {
        text_length: data.text.length,
        img_count: data.img_count,
        outer_html_length: data.outer_html_length,
      });

      if (stableThisRound) {
        selectorStableCount.set(selector, (selectorStableCount.get(selector) ?? 0) + 1);
      } else {
        selectorStableCount.set(selector, 0);
      }

      const stableCount = selectorStableCount.get(selector) ?? 0;
      if (stableCount >= stableRounds - 1) {
        const waited_ms = Date.now() - startMs;
        if (data.text.length >= minTextLength) {
          return {
            status: "stable_rich",
            selected_selector: selector,
            text_length: data.text.length,
            outer_html_length: data.outer_html_length,
            img_count: data.img_count,
            paragraph_count: data.paragraph_count,
            rounds: allRounds,
            waited_ms,
          };
        }
        if (data.img_count >= 1 && data.text.length >= 40) {
          return {
            status: "stable_with_assets",
            selected_selector: selector,
            text_length: data.text.length,
            outer_html_length: data.outer_html_length,
            img_count: data.img_count,
            paragraph_count: data.paragraph_count,
            rounds: allRounds,
            waited_ms,
          };
        }
        if (data.text.length > 0) {
          return {
            status: "stable_but_low_text",
            selected_selector: selector,
            text_length: data.text.length,
            outer_html_length: data.outer_html_length,
            img_count: data.img_count,
            paragraph_count: data.paragraph_count,
            rounds: allRounds,
            waited_ms,
          };
        }
      }
    }

    await page.waitForTimeout(pollIntervalMs);
  }

  const waited_ms = Date.now() - startMs;
  const anyContainer = allRounds.some((r) => r.exists && r.text_length > 0);
  if (!anyContainer) {
    return {
      status: "timeout_no_container",
      selected_selector: null,
      text_length: 0,
      outer_html_length: 0,
      img_count: 0,
      paragraph_count: 0,
      rounds: allRounds,
      waited_ms,
    };
  }

  const best = allRounds
    .filter((r) => r.exists && r.text_length > 0)
    .sort((a, b) => b.text_length - a.text_length)[0];

  return {
    status: "timeout_unstable",
    selected_selector: best?.selector ?? null,
    text_length: best?.text_length ?? 0,
    outer_html_length: best?.outer_html_length ?? 0,
    img_count: best?.img_count ?? 0,
    paragraph_count: best?.paragraph_count ?? 0,
    rounds: allRounds,
    waited_ms,
  };
}
