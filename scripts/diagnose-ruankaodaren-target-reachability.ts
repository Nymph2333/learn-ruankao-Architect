/**
 * Phase 3.10: target reachability diagnostics.
 *
 * Opens the authenticated knowledge route, expands only the relevant chapter,
 * and reports whether a requested leaf title is reachable in the current DOM.
 * It does not enter detail pages, parse content, save raw snapshots, OCR,
 * decrypt encrypt=1 data, reconstruct image tables, or generate Markdown.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContextOptions, type Page } from "playwright";

const SOURCE_URL = "https://ruankaodaren.com/exam/#/knowlegde";
const NAVIGATION_TIMEOUT_MS = 30_000;
const NETWORK_IDLE_TIMEOUT_MS = 20_000;
const WAIT_AFTER_RENDER_MS = 3_000;
const WAIT_AFTER_CLICK_MS = 2_000;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const authStatePath = resolve(repoRoot, ".auth/ruankaodaren.storageState.json");
const generatedDir = resolve(repoRoot, "verification/generated");

type MatchStrategy = "exact_full_title" | "number_and_keywords" | "number_only" | "same_chapter_fallback" | "failed";

interface ParsedTarget {
  target_section_number: string;
  target_chapter_number: string;
  target_leaf_number: string;
  target_title_remainder: string;
}

interface LeafMatch {
  leaf_exact_match_found: boolean;
  leaf_candidates_same_chapter: string[];
  best_match: string | null;
  best_match_strategy: MatchStrategy;
}

interface ReachabilityReport {
  generated_at: string;
  target: string;
  target_section_number: string | null;
  target_chapter_number: string | null;
  chapter_found: boolean;
  chapter_text: string | null;
  chapter_expand_success: boolean;
  leaf_exact_match_found: boolean;
  leaf_candidates_same_chapter: string[];
  best_match: string | null;
  best_match_strategy: MatchStrategy;
  recommendation: "safe_to_crawl" | "target_not_found" | "use_exact_leaf_title" | "inspect_dom";
  next_steps: string[];
  constraints: {
    no_formal_raw_snapshot: true;
    no_parse: true;
    no_markdown_generated: true;
    no_ocr: true;
    no_encrypt1_decrypted: true;
    no_image_table_reconstructed: true;
    phase4_not_entered: true;
  };
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function normalizeVisibleText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeTargetText(text: string): string {
  return normalizeVisibleText(text).replace(/\s+/g, "").toLowerCase();
}

function safeTargetName(target: string): string {
  return target
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.\-\u4e00-\u9fff]+/g, "_")
    .slice(0, 80);
}

function parseArgs(): string {
  const args = process.argv.slice(2);
  const index = args.indexOf("--target");
  const target = index >= 0 ? args[index + 1] : null;
  if (!target) {
    console.error('[target-diagnose] ERROR: provide --target "<leaf title>".');
    process.exit(1);
  }
  return target;
}

function parseTarget(target: string): ParsedTarget | null {
  const normalized = normalizeVisibleText(target);
  const match = normalized.match(/^(\d+)\.(\d+)\s+(.+)$/);
  if (!match) return null;
  return {
    target_section_number: `${match[1]}.${match[2]}`,
    target_chapter_number: match[1] ?? "",
    target_leaf_number: `${match[1]}.${match[2]}`,
    target_title_remainder: normalizeVisibleText(match[3] ?? ""),
  };
}

function keywordTokens(remainder: string): string[] {
  const weakTerms = new Set(["系统", "技术", "处理", "设计", "常识", "基础", "知识"]);
  return [
    remainder,
    ...remainder.split(/[的和与及、，,：:（）()—\-]/),
    ...(remainder.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g) ?? []),
    ...(remainder.match(/\p{Script=Han}{2,}/gu) ?? []),
  ]
    .map(normalizeTargetText)
    .filter((token, index, list) => token.length >= 2 && !weakTerms.has(token) && list.indexOf(token) === index);
}

async function waitForRender(page: Page): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS });
  } catch {
    // SPA diagnostics can continue with visible DOM if networkidle is noisy.
  }
  await page.waitForTimeout(WAIT_AFTER_RENDER_MS);
}

async function findChapter(page: Page, chapterNumber: string): Promise<{ found: boolean; text: string | null }> {
  const text = await page
    .evaluate((chapter) => {
      const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
      const selectors = [".chapterExercises-title", ".lgchapterExercises-title", ".catalogue-title", ".el-tree-node__content", "div", "span"];
      const nodes = Array.from(document.querySelectorAll(selectors.join(","))).filter((node) => {
        const value = normalize(node.textContent ?? "");
        if (!value.includes(`第${chapter}章`)) return false;
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && value.length <= 160;
      });
      const node = nodes[0] ?? null;
      if (!node) return null;
      node.setAttribute("data-pw-reachability-chapter", "1");
      return normalize(node.textContent ?? "");
    }, chapterNumber)
    .catch(() => null);

  return { found: text !== null, text };
}

async function clickMarkedChapter(page: Page): Promise<boolean> {
  const locator = page.locator("[data-pw-reachability-chapter='1']").first();
  const visible = await locator.isVisible({ timeout: 1_000 }).catch(() => false);
  if (!visible) return false;

  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 3_000 });
    await locator.click({ timeout: 5_000 });
    await page.evaluate(() => {
      document.querySelector("[data-pw-reachability-chapter='1']")?.removeAttribute("data-pw-reachability-chapter");
    }).catch(() => undefined);
    await page.waitForTimeout(WAIT_AFTER_CLICK_MS);
    return true;
  } catch {
    await page.evaluate(() => {
      document.querySelector("[data-pw-reachability-chapter='1']")?.removeAttribute("data-pw-reachability-chapter");
    }).catch(() => undefined);
    return false;
  }
}

async function findLeafMatch(page: Page, target: string, parsed: ParsedTarget): Promise<LeafMatch> {
  return page
    .evaluate(
      ({ targetText, sectionNumber, chapterNumber, remainder }) => {
        const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
        const comparable = (value: string) => normalize(value).replace(/\s+/g, "").toLowerCase();
        const weakTerms = new Set(["系统", "技术", "处理", "设计", "常识", "基础", "知识"]);
        const keywords = [
          remainder,
          ...remainder.split(/[的和与及、，,：:（）()—\-]/),
          ...(remainder.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g) ?? []),
          ...(remainder.match(/\p{Script=Han}{2,}/gu) ?? [])
        ]
          .map(comparable)
          .filter((token, index, list) => token.length >= 2 && !weakTerms.has(token) && list.indexOf(token) === index);
        const extractLeaf = (raw: string) => {
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
        const candidates: string[] = [];
        for (const node of Array.from(document.querySelectorAll(selectors.join(",")))) {
          const rect = node.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) continue;
          const hasLeafIcon = Boolean(node.querySelector(".el-icon-document"));
          const text = extractLeaf(node.textContent ?? "");
          const isLeaf = /^\d+(?:\.\d+)+\s*\S+/.test(text) && !/^第\s*\d+\s*章/.test(text);
          if (!hasLeafIcon && !isLeaf) continue;
          if (!text.startsWith(`${chapterNumber}.`)) continue;
          if (!candidates.includes(text)) candidates.push(text);
        }

        const exact = candidates.find((text) => comparable(text) === comparable(targetText));
        if (exact) {
          return {
            leaf_exact_match_found: true,
            leaf_candidates_same_chapter: candidates,
            best_match: exact,
            best_match_strategy: "exact_full_title" as const
          };
        }

        const byNumberAndKeyword = candidates.find((text) => {
          const normalized = comparable(text);
          return text.startsWith(sectionNumber) && keywords.some((token) => normalized.includes(token));
        });
        if (byNumberAndKeyword) {
          return {
            leaf_exact_match_found: false,
            leaf_candidates_same_chapter: candidates,
            best_match: byNumberAndKeyword,
            best_match_strategy: "number_and_keywords" as const
          };
        }

        const byNumber = candidates.find((text) => text.startsWith(sectionNumber));
        if (byNumber) {
          return {
            leaf_exact_match_found: false,
            leaf_candidates_same_chapter: candidates,
            best_match: byNumber,
            best_match_strategy: "number_only" as const
          };
        }

        return {
          leaf_exact_match_found: false,
          leaf_candidates_same_chapter: candidates,
          best_match: candidates[0] ?? null,
          best_match_strategy: candidates.length > 0 ? "same_chapter_fallback" as const : "failed" as const
        };
      },
      {
        targetText: target,
        sectionNumber: parsed.target_section_number,
        chapterNumber: parsed.target_chapter_number,
        remainder: parsed.target_title_remainder,
      }
    )
    .catch(() => ({
      leaf_exact_match_found: false,
      leaf_candidates_same_chapter: [],
      best_match: null,
      best_match_strategy: "failed" as const,
    }));
}

function recommendationFor(report: Omit<ReachabilityReport, "recommendation" | "next_steps" | "constraints" | "generated_at">): ReachabilityReport["recommendation"] {
  if (report.leaf_exact_match_found) return "safe_to_crawl";
  if (!report.chapter_found || report.leaf_candidates_same_chapter.length === 0) return "target_not_found";
  if (report.best_match) return "use_exact_leaf_title";
  return "inspect_dom";
}

function writeReports(report: ReachabilityReport): void {
  mkdirSync(generatedDir, { recursive: true });
  const safeName = safeTargetName(report.target);
  const jsonPath = resolve(generatedDir, `phase3_10_target_reachability_${safeName}.json`);
  const mdPath = resolve(generatedDir, `phase3_10_target_reachability_${safeName}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Phase 3.10 Target Reachability: ${report.target}`,
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Field | Value |",
    "|---|---|",
    `| target | ${report.target} |`,
    `| target_section_number | ${report.target_section_number ?? ""} |`,
    `| target_chapter_number | ${report.target_chapter_number ?? ""} |`,
    `| chapter_found | ${report.chapter_found} |`,
    `| chapter_text | ${report.chapter_text ?? ""} |`,
    `| chapter_expand_success | ${report.chapter_expand_success} |`,
    `| leaf_exact_match_found | ${report.leaf_exact_match_found} |`,
    `| best_match | ${report.best_match ?? ""} |`,
    `| best_match_strategy | ${report.best_match_strategy} |`,
    `| recommendation | ${report.recommendation} |`,
    "",
    "## Same Chapter Leaf Candidates",
    "",
    ...(report.leaf_candidates_same_chapter.length > 0
      ? report.leaf_candidates_same_chapter.map((candidate) => `- ${candidate}`)
      : ["- None found."]),
    "",
    "## Next Steps",
    "",
    ...(report.next_steps.length > 0 ? report.next_steps.map((step) => `- ${step}`) : ["- None."]),
    "",
    "## Constraints",
    "",
    "- No formal raw snapshot saved.",
    "- No parser executed.",
    "- No Markdown knowledge documents generated.",
    "- No OCR used.",
    "- No encrypt=1 data decrypted.",
    "- No image table reconstructed.",
    "- Phase 4 was not entered.",
    "",
  ];
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log(`[target-diagnose] JSON report: ${toRepoPath(jsonPath)}`);
  console.log(`[target-diagnose] Markdown report: ${toRepoPath(mdPath)}`);
}

async function main(): Promise<void> {
  const target = parseArgs();
  const parsed = parseTarget(target);
  if (!parsed) {
    console.error("[target-diagnose] ERROR: target must be a full leaf title such as \"3.6 关系数据库的规范化\".");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const contextOptions: BrowserContextOptions = {
      viewport: { width: 1365, height: 768 },
    };
    if (existsSync(authStatePath)) {
      contextOptions.storageState = authStatePath;
    }
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
    page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS);

    await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
    await waitForRender(page);

    const chapterBefore = await findChapter(page, parsed.target_chapter_number);
    let leafMatch = await findLeafMatch(page, target, parsed);
    let chapterExpandSuccess = leafMatch.leaf_candidates_same_chapter.length > 0;

    if (!leafMatch.leaf_exact_match_found) {
      chapterExpandSuccess = await clickMarkedChapter(page);
      await waitForRender(page);
      leafMatch = await findLeafMatch(page, target, parsed);
      if (!leafMatch.leaf_exact_match_found && leafMatch.leaf_candidates_same_chapter.length === 0 && chapterBefore.found) {
        await findChapter(page, parsed.target_chapter_number);
        await clickMarkedChapter(page);
        await waitForRender(page);
        leafMatch = await findLeafMatch(page, target, parsed);
        chapterExpandSuccess = leafMatch.leaf_candidates_same_chapter.length > 0;
      }
    }

    const partial = {
      target,
      target_section_number: parsed.target_section_number,
      target_chapter_number: parsed.target_chapter_number,
      chapter_found: chapterBefore.found,
      chapter_text: chapterBefore.text,
      chapter_expand_success: chapterExpandSuccess,
      ...leafMatch,
    };

    const report: ReachabilityReport = {
      generated_at: new Date().toISOString(),
      ...partial,
      recommendation: recommendationFor(partial),
      next_steps:
        recommendationFor(partial) === "target_not_found"
          ? [
              "Run `pnpm catalog:reachable-leaves` to refresh the current UI reachable leaf catalog.",
              "Choose the next target from `verification/generated/phase3_11_reachable_leaf_catalog.md`.",
            ]
          : [],
      constraints: {
        no_formal_raw_snapshot: true,
        no_parse: true,
        no_markdown_generated: true,
        no_ocr: true,
        no_encrypt1_decrypted: true,
        no_image_table_reconstructed: true,
        phase4_not_entered: true,
      },
    };

    writeReports(report);
    console.log("[target-diagnose] completed");
    console.log(`  target:                 ${report.target}`);
    console.log(`  chapter_found:          ${report.chapter_found}`);
    console.log(`  leaf_exact_match_found: ${report.leaf_exact_match_found}`);
    console.log(`  best_match:             ${report.best_match ?? "(none)"}`);
    console.log(`  recommendation:         ${report.recommendation}`);
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(`[target-diagnose][error] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
