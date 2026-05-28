/**
 * Phase 3.20 – Detail Interaction Surface Discovery
 *
 * Spawns the full crawler for a target to obtain the konwledgeInfo final_url,
 * then opens that URL directly in a new browser session to:
 * 1. Scan interaction candidates (buttons, links, tabs, collapse)
 * 2. Safely click up to 3 candidates to check for hidden content
 * 3. Scan alternate containers for text/images
 * 4. Output a discovery report without generating samples or Markdown
 *
 * Usage:
 *   pnpm discover:detail-interactions -- --target "13.3 软件架构风格"
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContextOptions, type Page } from "playwright";
import {
  waitForStableDetailContent,
  type StabilizationResult,
} from "./lib/ruankaodaren-dom-explorer.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(__dirname, "..");
const authStatePath = resolve(repoRoot, ".auth/ruankaodaren.storageState.json");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const generatedDir = resolve(repoRoot, "verification/generated");
const screenshotDir = resolve(repoRoot, "sources/ruankaodaren/raw/screenshots/debug");

const NETWORK_IDLE_TIMEOUT_MS = 20_000;

// ── Safe / unsafe click text lists ─────────────────────────────────────────

const SAFE_CLICK_TEXTS = [
  "查看", "查看详情", "详情", "展开", "展开全部", "更多",
  "解析", "查看解析", "答案", "查看答案", "知识点",
  "下一题", "下一个", "继续", "学习", "内容", "全部",
];

const UNSAFE_CLICK_TEXTS = [
  "删除", "重置", "退出", "登录", "切换账号", "提交",
  "保存", "收藏", "掌握", "未掌握", "已掌握", "返回", "首页",
];

// ── Alternate container selectors ──────────────────────────────────────────

const ALTERNATE_CONTAINERS = [
  "body", "main", "article", "[role=\"main\"]",
  ".knowInfo", ".ql-editor", ".knowInfo.ql-editor",
  ".topicDetails", ".questionInfo", ".questionContent",
  ".analysis", ".answer", ".explanation", ".solution",
  ".content", ".detail", ".markdown", ".rich-text", ".html-content",
  ".el-main", ".ant-layout-content", ".page-content",
  ".card", ".panel", ".collapse", ".tab-pane",
];

// ── Types ──────────────────────────────────────────────────────────────────

interface ParsedArgs {
  target: string;
}

interface InteractionCandidate {
  text: string;
  tag: string;
  role: string;
  class_name: string;
  visible: boolean;
  bounding_box: { x: number; y: number; width: number; height: number } | null;
  candidate_type: "button" | "link" | "tab" | "collapse" | "pagination" | "form" | "unknown";
  risk: "safe" | "medium" | "unsafe";
  reason: string;
  selector_index: number;
}

interface ContainerScan {
  selector: string;
  exists: boolean;
  count: number;
  text_length: number;
  img_count: number;
  visible: boolean;
  text_preview: string;
}

interface ContentSnapshot {
  body_text_length: number;
  ql_editor_text_length: number;
  img_count: number;
  url: string;
  screenshot_path: string | null;
}

interface ClickResult {
  candidate_text: string;
  candidate_type: string;
  before: ContentSnapshot;
  after: ContentSnapshot;
  text_length_delta: number;
  img_count_delta: number;
  url_changed: boolean;
  stabilization_status: string | null;
  stabilization_text_length: number;
  error: string | null;
}

interface IframeShadowSignals {
  iframe_count: number;
  shadow_root_count: number;
}

type ContentAccessPattern =
  | "static_low_text"
  | "secondary_interaction_required"
  | "alternate_container_found"
  | "image_or_asset_dominant"
  | "unknown";

type RecommendedNextAction =
  | "adjust_renderer_baseline_threshold"
  | "probe_secondary_interactions"
  | "update_container_selectors"
  | "asset_policy_required"
  | "manual_review_required";

interface DiscoveryReport {
  target: string;
  generated_at: string;
  final_url: string;
  stabilization: StabilizationResult | null;
  baseline: ContentSnapshot;
  interaction_candidate_count: number;
  safe_candidate_count: number;
  unsafe_candidate_count: number;
  clicked_candidate_count: number;
  max_text_length_after_clicks: number;
  candidates: InteractionCandidate[];
  click_results: ClickResult[];
  alternate_containers: ContainerScan[];
  alternate_container_max_text_length: number;
  iframe_shadow_signals: IframeShadowSignals;
  conclusion: {
    content_access_pattern: ContentAccessPattern;
    recommended_next_action: RecommendedNextAction;
    notes: string;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let target = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target" && i + 1 < args.length) {
      target = args[i + 1] ?? "";
      i++;
    }
  }
  if (!target) {
    console.error("[discover] ERROR: --target is required");
    process.exit(1);
  }
  return { target };
}

function safeFilename(title: string): string {
  return title.replace(/[^A-Za-z0-9\u4e00-\u9fff]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
}

function classifyRisk(text: string): { risk: "safe" | "medium" | "unsafe"; reason: string } {
  const normalized = text.replace(/\s+/g, "").trim();
  if (UNSAFE_CLICK_TEXTS.some((t) => normalized.includes(t))) {
    return { risk: "unsafe", reason: "matches unsafe text list" };
  }
  if (SAFE_CLICK_TEXTS.some((t) => normalized.includes(t))) {
    return { risk: "safe", reason: "matches safe text list" };
  }
  return { risk: "medium", reason: "no explicit classification" };
}

function classifyCandidateType(
  tag: string,
  role: string,
  className: string
): InteractionCandidate["candidate_type"] {
  const cls = className.toLowerCase();
  if (cls.includes("tab")) return "tab";
  if (cls.includes("collapse")) return "collapse";
  if (cls.includes("pagination") || cls.includes("page") || cls.includes("next") || cls.includes("prev"))
    return "pagination";
  if (tag === "input" || tag === "label" || cls.includes("radio") || cls.includes("checkbox"))
    return "form";
  if (tag === "a") return "link";
  if (
    tag === "button" ||
    role === "button" ||
    cls.includes("btn") ||
    cls.includes("button")
  )
    return "button";
  return "unknown";
}

async function captureSnapshot(page: Page, screenshotName: string | null): Promise<ContentSnapshot> {
  const bodyText = await page.locator("body").innerText({ timeout: 5_000 }).catch(() => "");
  const qlText = await page
    .evaluate(() => {
      const el = document.querySelector(".knowInfo.ql-editor, .knowInfo, .ql-editor") as HTMLElement | null;
      return el ? (el.innerText ?? el.textContent ?? "") : "";
    })
    .catch(() => "");
  const imgCount = await page.evaluate(() => document.querySelectorAll("img").length).catch(() => 0);
  const url = page.url();

  let screenshotPath: string | null = null;
  if (screenshotName) {
    mkdirSync(screenshotDir, { recursive: true });
    const p = resolve(screenshotDir, `${screenshotName}.png`);
    await page.screenshot({ path: p, fullPage: false }).catch(() => undefined);
    screenshotPath = `sources/ruankaodaren/raw/screenshots/debug/${screenshotName}.png`;
  }

  return {
    body_text_length: bodyText.length,
    ql_editor_text_length: qlText.replace(/\s+/g, " ").trim().length,
    img_count: imgCount,
    url,
    screenshot_path: screenshotPath,
  };
}

async function scanInteractionCandidates(page: Page): Promise<InteractionCandidate[]> {
  const raw = await page
    .evaluate(() => {
      const results: Array<{
        text: string;
        tag: string;
        role: string;
        class_name: string;
        visible: boolean;
        bounding_box: { x: number; y: number; width: number; height: number } | null;
        selector_index: number;
      }> = [];

      const selectors = [
        "button", "a", "[role='button']",
        ".el-button", ".ant-btn", ".van-button",
        ".el-tabs .el-tabs__item", ".el-collapse-item__header",
        ".ant-tabs-tab", ".ant-collapse-header",
        ".pagination", ".next", ".prev",
      ];

      let idx = 0;
      const seen = new Set<Element>();
      for (const sel of selectors) {
        for (const el of Array.from(document.querySelectorAll(sel))) {
          if (seen.has(el)) continue;
          seen.add(el);
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && (el as HTMLElement).offsetParent !== null;
          const text = ((el as HTMLElement).innerText ?? el.textContent ?? "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 100);
          results.push({
            text,
            tag: el.tagName.toLowerCase(),
            role: el.getAttribute("role") ?? "",
            class_name: el.className ?? "",
            visible: isVisible,
            bounding_box: isVisible
              ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }
              : null,
            selector_index: idx++,
          });
        }
      }

      // Also catch clickable divs/spans
      for (const el of Array.from(document.querySelectorAll("div, span"))) {
        if (seen.has(el)) continue;
        const style = window.getComputedStyle(el);
        if (style.cursor !== "pointer") continue;
        seen.add(el);
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const text = ((el as HTMLElement).innerText ?? el.textContent ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 100);
        if (!text) continue;
        results.push({
          text,
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role") ?? "",
          class_name: el.className ?? "",
          visible: isVisible,
          bounding_box: isVisible
            ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }
            : null,
          selector_index: idx++,
        });
      }

      return results;
    })
    .catch(() => [] as Array<{
      text: string; tag: string; role: string; class_name: string;
      visible: boolean; bounding_box: { x: number; y: number; width: number; height: number } | null;
      selector_index: number;
    }>);

  return raw.map((item) => {
    const { risk, reason } = classifyRisk(item.text);
    const candidateType = classifyCandidateType(item.tag, item.role, item.class_name);
    return { ...item, candidate_type: candidateType, risk, reason };
  });
}

async function scanAlternateContainers(page: Page): Promise<ContainerScan[]> {
  const results: ContainerScan[] = [];
  for (const selector of ALTERNATE_CONTAINERS) {
    const data = await page
      .evaluate((sel: string) => {
        const els = Array.from(document.querySelectorAll(sel));
        if (els.length === 0) return null;
        const el = els[0] as HTMLElement;
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const text = (el.innerText ?? el.textContent ?? "").replace(/\s+/g, " ").trim();
        const imgs = el.querySelectorAll("img").length;
        return {
          count: els.length,
          text_length: text.length,
          img_count: imgs,
          visible: isVisible,
          text_preview: text.slice(0, 120),
        };
      }, selector)
      .catch(() => null);

    results.push({
      selector,
      exists: data !== null,
      count: data?.count ?? 0,
      text_length: data?.text_length ?? 0,
      img_count: data?.img_count ?? 0,
      visible: data?.visible ?? false,
      text_preview: data?.text_preview ?? "",
    });
  }
  return results;
}

async function scanIframeShadowSignals(page: Page): Promise<IframeShadowSignals> {
  return page
    .evaluate(() => ({
      iframe_count: document.querySelectorAll("iframe").length,
      shadow_root_count: Array.from(document.querySelectorAll("*")).filter(
        (el) => (el as Element & { shadowRoot?: ShadowRoot }).shadowRoot
      ).length,
    }))
    .catch(() => ({ iframe_count: 0, shadow_root_count: 0 }));
}

function deriveConclusion(
  stabilization: StabilizationResult | null,
  clickResults: ClickResult[],
  containers: ContainerScan[]
): { content_access_pattern: ContentAccessPattern; recommended_next_action: RecommendedNextAction; notes: string } {
  const maxClickDelta = Math.max(0, ...clickResults.map((r) => r.text_length_delta));
  const maxContainerText = Math.max(0, ...containers.map((c) => c.text_length));
  const hasAlternateContainer = containers.some((c) => c.text_length > 200 && c.selector !== "body");
  const hasImgDominant = containers.some((c) => c.img_count >= 3 && c.text_length < 50);
  const secondaryInteractionFound = clickResults.some((r) => r.text_length_delta > 100);

  if (secondaryInteractionFound) {
    return {
      content_access_pattern: "secondary_interaction_required",
      recommended_next_action: "probe_secondary_interactions",
      notes: `Safe click increased text by up to ${maxClickDelta} chars.`,
    };
  }
  if (hasAlternateContainer) {
    return {
      content_access_pattern: "alternate_container_found",
      recommended_next_action: "update_container_selectors",
      notes: `Alternate container has ${maxContainerText} chars.`,
    };
  }
  if (hasImgDominant) {
    return {
      content_access_pattern: "image_or_asset_dominant",
      recommended_next_action: "asset_policy_required",
      notes: "Content appears to be image-dominant.",
    };
  }
  if ((stabilization?.text_length ?? 0) > 0 && (stabilization?.text_length ?? 0) < 120) {
    return {
      content_access_pattern: "static_low_text",
      recommended_next_action: "manual_review_required",
      notes: `Content stabilized at only ${stabilization?.text_length ?? 0} chars. May require manual inspection or different knowledge category.`,
    };
  }
  return {
    content_access_pattern: "unknown",
    recommended_next_action: "manual_review_required",
    notes: "No stable rich content found; no secondary interaction found.",
  };
}

// ── Crawler spawn helpers ──────────────────────────────────────────────────

interface CrawlMetadata {
  final_url?: string;
  detail_entry_route_changed?: boolean;
  detail_content_stabilization_status?: string;
  detail_content_stabilization_text_length?: number;
  [key: string]: unknown;
}

function listMetadataFiles(): string[] {
  if (!existsSync(metadataDir)) return [];
  return readdirSync(metadataDir)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

function findNewestMetadataAfter(afterMtime: number): string | null {
  const files = listMetadataFiles();
  let newest: string | null = null;
  let newestMtime = afterMtime;
  for (const file of files) {
    const absPath = resolve(metadataDir, file);
    const mtime = statSync(absPath).mtimeMs;
    if (mtime > newestMtime) {
      newestMtime = mtime;
      newest = absPath;
    }
  }
  return newest;
}

function readJson<T>(absPath: string): T | null {
  if (!existsSync(absPath)) return null;
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch {
    return null;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { target } = parseArgs();
  console.log(`[discover] target: ${target}`);

  mkdirSync(generatedDir, { recursive: true });
  mkdirSync(screenshotDir, { recursive: true });

  // Step 1: spawn crawler to navigate to target detail page and obtain final_url
  const beforeMtime = Date.now();
  console.log(`[discover] spawning crawler for: ${target}`);
  const crawlResult = spawnSync(
    `pnpm crawl:ruankaodaren -- --target "${target}" --require-leaf`,
    { cwd: repoRoot, shell: true, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
  );

  if (crawlResult.error) {
    console.error(`[discover] spawn error: ${crawlResult.error.message}`);
    process.exit(1);
  }

  const exitCode = typeof crawlResult.status === "number" ? crawlResult.status : 1;
  if (exitCode !== 0) {
    const stderr = crawlResult.stderr ?? "";
    const stdout = crawlResult.stdout ?? "";
    console.error(`[discover] crawler exited with code ${exitCode}`);
    console.error(stderr.slice(-2000) || stdout.slice(-2000));
    process.exit(1);
  }

  const metadataPath = findNewestMetadataAfter(beforeMtime);
  if (!metadataPath) {
    console.error("[discover] ERROR: no new metadata file found after crawl");
    process.exit(1);
  }

  console.log(`[discover] reading metadata: ${basename(metadataPath)}`);
  const metadata = readJson<CrawlMetadata>(metadataPath);
  if (!metadata) {
    console.error("[discover] ERROR: failed to parse metadata");
    process.exit(1);
  }

  const finalUrl = metadata.final_url;
  if (!finalUrl || !finalUrl.includes("konwledgeInfo")) {
    console.error(`[discover] ERROR: no konwledgeInfo URL in metadata. final_url=${finalUrl ?? "null"}`);
    process.exit(1);
  }

  console.log(`[discover] final_url: ${finalUrl}`);

  // Step 2: open the detail URL directly in a new browser session
  const browser = await chromium.launch({ headless: true });
  try {
    const contextOptions: BrowserContextOptions = existsSync(authStatePath)
      ? { storageState: authStatePath }
      : {};
    const context = await browser.newContext(contextOptions);
    await context.addInitScript(() => {
      Reflect.set(globalThis, "__name", (fn: unknown) => fn);
    });
    const page = await context.newPage();

    try {
      console.log(`[discover] navigating directly to: ${finalUrl}`);
      await page.goto(finalUrl, { timeout: 30_000, waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3_000);

      // Wait for content to stabilize
      console.log("[discover] waiting for content stabilization");
      const stabilization = await waitForStableDetailContent(page);
      console.log(`[discover] stabilization: ${stabilization.status} text=${stabilization.text_length}`);

      // Capture baseline
      const safeTarget = safeFilename(target);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const baseline = await captureSnapshot(page, `phase3_20_baseline_${safeTarget}_${timestamp}`);
      console.log(`[discover] baseline: body=${baseline.body_text_length} ql=${baseline.ql_editor_text_length} imgs=${baseline.img_count}`);

      // Scan interaction candidates
      console.log("[discover] scanning interaction candidates");
      const candidates = await scanInteractionCandidates(page);
      const safeCandidates = candidates.filter((c) => c.risk === "safe" && c.visible && c.text.length > 0);
      const unsafeCandidates = candidates.filter((c) => c.risk === "unsafe");
      console.log(`[discover] total candidates: ${candidates.length}, safe: ${safeCandidates.length}, unsafe: ${unsafeCandidates.length}`);

      // Scan alternate containers
      console.log("[discover] scanning alternate containers");
      const containers = await scanAlternateContainers(page);
      const altMaxText = Math.max(0, ...containers.filter((c) => c.selector !== "body").map((c) => c.text_length));
      console.log(`[discover] alternate container max text: ${altMaxText}`);

      // Iframe / shadow DOM signals
      const iframeShadow = await scanIframeShadowSignals(page);
      console.log(`[discover] iframes: ${iframeShadow.iframe_count}, shadowRoots: ${iframeShadow.shadow_root_count}`);

      // Safe click tests (max 3)
      const clickResults: ClickResult[] = [];
      const maxClicks = 3;
      for (const candidate of safeCandidates.slice(0, maxClicks)) {
        if (clickResults.length >= maxClicks) break;

        console.log(`[discover] testing safe click: "${candidate.text}" (${candidate.candidate_type})`);
        const beforeSnap = await captureSnapshot(page, null);
        const clickTs = new Date().toISOString().replace(/[:.]/g, "-");

        let clickError: string | null = null;
        try {
          const locator = page.getByText(candidate.text, { exact: true }).first();
          const count = await locator.count().catch(() => 0);
          if (count === 0) {
            clickError = "locator not found";
          } else {
            await locator.click({ timeout: 5_000 });
            await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => undefined);
          }
        } catch (err) {
          clickError = String(err).slice(0, 200);
        }

        const afterStab = clickError ? null : await waitForStableDetailContent(page);
        const afterSnap = await captureSnapshot(page, `phase3_20_click${clickResults.length}_${safeTarget}_${clickTs}`);

        const textDelta = afterSnap.body_text_length - beforeSnap.body_text_length;
        const imgDelta = afterSnap.img_count - beforeSnap.img_count;
        const urlChanged = afterSnap.url !== beforeSnap.url;

        clickResults.push({
          candidate_text: candidate.text,
          candidate_type: candidate.candidate_type,
          before: beforeSnap,
          after: afterSnap,
          text_length_delta: textDelta,
          img_count_delta: imgDelta,
          url_changed: urlChanged,
          stabilization_status: afterStab?.status ?? null,
          stabilization_text_length: afterStab?.text_length ?? 0,
          error: clickError,
        });

        console.log(`[discover] click result: delta=${textDelta} url_changed=${urlChanged} stab=${afterStab?.status ?? "n/a"}`);

        // Try to restore if URL changed
        if (urlChanged) {
          await page.goBack({ timeout: 10_000 }).catch(() => undefined);
          await page.waitForTimeout(2_000);
        }
      }

      const maxTextAfterClicks = Math.max(0, ...clickResults.map((r) => r.after.body_text_length));
      const conclusion = deriveConclusion(stabilization, clickResults, containers);
      console.log(`[discover] conclusion: ${conclusion.content_access_pattern} -> ${conclusion.recommended_next_action}`);

      const report: DiscoveryReport = {
        target,
        generated_at: new Date().toISOString(),
        final_url: finalUrl,
        stabilization,
        baseline,
        interaction_candidate_count: candidates.length,
        safe_candidate_count: safeCandidates.length,
        unsafe_candidate_count: unsafeCandidates.length,
        clicked_candidate_count: clickResults.length,
        max_text_length_after_clicks: maxTextAfterClicks,
        candidates,
        click_results: clickResults,
        alternate_containers: containers,
        alternate_container_max_text_length: altMaxText,
        iframe_shadow_signals: iframeShadow,
        conclusion,
      };

      // Write JSON report
      const jsonPath = resolve(generatedDir, `phase3_20_detail_interaction_discovery_${safeTarget}.json`);
      writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

      // Write Markdown report
      const mdPath = resolve(generatedDir, `phase3_20_detail_interaction_discovery_${safeTarget}.md`);
      const mdLines = [
        `# Phase 3.20 Detail Interaction Discovery: ${target}`,
        "",
        `Generated at: ${report.generated_at}`,
        "",
        "## Summary",
        "",
        `| Field | Value |`,
        `|---|---|`,
        `| target | ${target} |`,
        `| final_url | ${finalUrl} |`,
        `| stabilization_status | ${stabilization.status} |`,
        `| stabilization_text_length | ${stabilization.text_length} |`,
        `| baseline_body_text | ${baseline.body_text_length} |`,
        `| baseline_ql_editor_text | ${baseline.ql_editor_text_length} |`,
        `| baseline_img_count | ${baseline.img_count} |`,
        `| interaction_candidate_count | ${candidates.length} |`,
        `| safe_candidate_count | ${safeCandidates.length} |`,
        `| unsafe_candidate_count | ${unsafeCandidates.length} |`,
        `| clicked_candidate_count | ${clickResults.length} |`,
        `| max_text_after_clicks | ${maxTextAfterClicks} |`,
        `| alternate_container_max_text | ${altMaxText} |`,
        `| iframe_count | ${iframeShadow.iframe_count} |`,
        `| shadow_root_count | ${iframeShadow.shadow_root_count} |`,
        `| content_access_pattern | ${conclusion.content_access_pattern} |`,
        `| recommended_next_action | ${conclusion.recommended_next_action} |`,
        "",
        "## Conclusion",
        "",
        conclusion.notes,
        "",
        "## Interaction Candidates (safe only)",
        "",
        ...(safeCandidates.length === 0
          ? ["No safe candidates found."]
          : safeCandidates.slice(0, 20).map((c) => `- \`${c.text}\` (${c.candidate_type}, ${c.tag})`)),
        "",
        "## Click Results",
        "",
        ...(clickResults.length === 0
          ? ["No clicks performed."]
          : clickResults.map((r) =>
              `- **${r.candidate_text}**: delta=${r.text_length_delta} img_delta=${r.img_count_delta} url_changed=${r.url_changed} stab=${r.stabilization_status ?? "n/a"} err=${r.error ?? "none"}`
            )),
        "",
        "## Alternate Container Scan",
        "",
        "| Selector | Exists | Text Length | Img Count | Visible | Preview |",
        "|---|---|---|---|---|---|",
        ...containers.map(
          (c) =>
            `| \`${c.selector}\` | ${c.exists} | ${c.text_length} | ${c.img_count} | ${c.visible} | ${c.text_preview.slice(0, 40).replace(/\|/g, "/")} |`
        ),
        "",
        "## Constraints",
        "",
        "- No formal samples generated.",
        "- No intermediate JSON written.",
        "- No Markdown docs generated.",
        "- No OCR used.",
        "- No encrypt=1 decrypted.",
        "- No image tables reconstructed.",
        "- No Phase 4 entry.",
        "",
      ];
      writeFileSync(mdPath, mdLines.join("\n"), "utf8");

      console.log(`[discover] JSON: verification/generated/${basename(jsonPath)}`);
      console.log(`[discover] MD:   verification/generated/${basename(mdPath)}`);
      console.log(`[discover] content_access_pattern: ${conclusion.content_access_pattern}`);
      console.log(`[discover] recommended_next_action: ${conclusion.recommended_next_action}`);

      await context.close();
    } catch (err) {
      await context.close().catch(() => undefined);
      throw err;
    }
  } finally {
    await browser.close();
  }
}

main().catch((err: unknown) => {
  console.error(`[discover] ERROR: ${String(err)}`);
  process.exit(1);
});
