/**
 * Phase 3.14: live DOM replay smoke test.
 *
 * This script checks whether a catalog-backed leaf target can be replayed in
 * the current authenticated knowledge-route DOM. It does not click detail
 * entries, parse content, generate intermediate JSON, OCR images, decrypt
 * encrypt=1 data, reconstruct image tables, or generate Markdown documents.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContextOptions } from "playwright";
import {
  captureReplayDebugSnapshot,
  ensureRuankaodarenContext,
  openKnowledgeRoute,
  replayCatalogLeaf,
  type ReplayDebugPaths,
} from "./lib/ruankaodaren-dom-explorer.js";
import {
  defaultReachableLeafCatalogPath,
  findCatalogLeaf,
  loadReachableLeafCatalog,
} from "./lib/ruankaodaren-target-resolution.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const authStatePath = resolve(repoRoot, ".auth/ruankaodaren.storageState.json");
const generatedDir = resolve(repoRoot, "verification/generated");
const catalogPath = defaultReachableLeafCatalogPath();

interface LiveReplayTestReport {
  generated_at: string;
  target: string;
  catalog_path: string;
  catalog_loaded: boolean;
  catalog_leaf_count: number;
  catalog_match_found: boolean;
  catalog_match_strategy: string;
  catalog_leaf_title: string | null;
  catalog_chapter_title: string | null;
  live_replay_success: boolean;
  matched_leaf_title: string | null;
  matched_strategy: string | null;
  visible_chapter_count: number;
  visible_leaf_count: number;
  failure_type: "catalog_target_not_found" | "catalog_live_replay_mismatch" | null;
  failure_reason: string | null;
  debug_paths: ReplayDebugPaths | null;
  constraints: {
    no_detail_page_entered: true;
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

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function safeTargetName(target: string): string {
  return target
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.\-\u4e00-\u9fff]+/g, "_")
    .slice(0, 80);
}

function parseArgs(): string {
  const args = process.argv.slice(2);
  const targetIndex = args.indexOf("--target");
  const target = targetIndex >= 0 ? args[targetIndex + 1] : null;
  if (!target) {
    console.error('[live-replay-test] ERROR: provide --target "<leaf title>".');
    process.exit(1);
  }
  return target;
}

function writeReports(target: string, report: LiveReplayTestReport): void {
  mkdirSync(generatedDir, { recursive: true });
  const safeName = safeTargetName(target);
  const jsonPath = resolve(generatedDir, `phase3_14_live_replay_test_${safeName}.json`);
  const mdPath = resolve(generatedDir, `phase3_14_live_replay_test_${safeName}.md`);

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Phase 3.14 Live Replay Test: ${target}`,
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Field | Value |",
    "|---|---|",
    `| target | ${report.target} |`,
    `| catalog_path | ${report.catalog_path} |`,
    `| catalog_loaded | ${report.catalog_loaded} |`,
    `| catalog_leaf_count | ${report.catalog_leaf_count} |`,
    `| catalog_match_found | ${report.catalog_match_found} |`,
    `| catalog_match_strategy | ${report.catalog_match_strategy} |`,
    `| catalog_chapter_title | ${report.catalog_chapter_title ?? ""} |`,
    `| catalog_leaf_title | ${report.catalog_leaf_title ?? ""} |`,
    `| live_replay_success | ${report.live_replay_success} |`,
    `| matched_leaf_title | ${report.matched_leaf_title ?? ""} |`,
    `| matched_strategy | ${report.matched_strategy ?? ""} |`,
    `| visible_chapter_count | ${report.visible_chapter_count} |`,
    `| visible_leaf_count | ${report.visible_leaf_count} |`,
    `| failure_type | ${report.failure_type ?? ""} |`,
    `| failure_reason | ${report.failure_reason ?? ""} |`,
    "",
    "## Debug Paths",
    "",
    report.debug_paths
      ? [
          `- screenshot: ${report.debug_paths.screenshot}`,
          `- body_text: ${report.debug_paths.body_text}`,
          `- visible_chapters: ${report.debug_paths.visible_chapters}`,
          `- visible_leaves: ${report.debug_paths.visible_leaves}`,
          `- candidate_ranking: ${report.debug_paths.candidate_ranking}`,
        ].join("\n")
      : "- None.",
    "",
    "## Constraints",
    "",
    "- No detail page entered.",
    "- No parser executed.",
    "- No intermediate JSON generated.",
    "- No Markdown knowledge documents generated.",
    "- No OCR used.",
    "- No encrypt=1 data decrypted.",
    "- No image table reconstructed.",
    "- No full-site batch crawl performed.",
    "- Phase 4 was not entered.",
    "",
  ];
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log("[live-replay-test] completed");
  console.log(`  catalog_match_found: ${report.catalog_match_found}`);
  console.log(`  live_replay_success: ${report.live_replay_success}`);
  console.log(`  matched_leaf_title:  ${report.matched_leaf_title ?? "(none)"}`);
  console.log(`  failure_type:        ${report.failure_type ?? "(none)"}`);
  console.log(`  visible_chapters:    ${report.visible_chapter_count}`);
  console.log(`  visible_leaves:      ${report.visible_leaf_count}`);
  console.log(`  JSON report:         ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report:     ${toRepoPath(mdPath)}`);
}

async function main(): Promise<void> {
  const target = parseArgs();
  const catalog = loadReachableLeafCatalog(catalogPath);
  const match = findCatalogLeaf(target, catalog);

  let report: LiveReplayTestReport = {
    generated_at: new Date().toISOString(),
    target,
    catalog_path: toRepoPath(catalogPath),
    catalog_loaded: catalog !== null,
    catalog_leaf_count: catalog?.leaf_count ?? 0,
    catalog_match_found: match.found,
    catalog_match_strategy: match.match_strategy,
    catalog_leaf_title: match.leaf_title,
    catalog_chapter_title: match.chapter_title,
    live_replay_success: false,
    matched_leaf_title: null,
    matched_strategy: null,
    visible_chapter_count: 0,
    visible_leaf_count: 0,
    failure_type: match.found ? "catalog_live_replay_mismatch" : "catalog_target_not_found",
    failure_reason: match.found ? null : "catalog_target_not_found",
    debug_paths: null,
    constraints: {
      no_detail_page_entered: true,
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

  if (!match.found) {
    writeReports(target, report);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const contextOptions: BrowserContextOptions = existsSync(authStatePath)
    ? { storageState: authStatePath }
    : {};
  const context = await browser.newContext(contextOptions);
  await context.addInitScript(() => {
    Reflect.set(globalThis, "__name", (fn: unknown) => fn);
  });
  const page = await context.newPage();

  try {
    await openKnowledgeRoute(page);
    await ensureRuankaodarenContext(page);
    const replay = await replayCatalogLeaf(page, match);
    const debugPaths = replay.success
      ? null
      : await captureReplayDebugSnapshot(page, {
          target,
          visibleChapters: replay.visible_chapters,
          visibleLeaves: replay.visible_leaves,
          candidates: replay.match.candidates,
        });

    report = {
      ...report,
      live_replay_success: replay.success,
      matched_leaf_title: replay.match.leaf?.title ?? null,
      matched_strategy: replay.match.found ? replay.match.strategy : null,
      visible_chapter_count: replay.visible_chapters.length,
      visible_leaf_count: replay.visible_leaves.length,
      failure_type: replay.failure_type,
      failure_reason: replay.failure_reason,
      debug_paths: debugPaths,
    };
  } finally {
    await context.close();
    await browser.close();
  }

  writeReports(target, report);
  if (!report.live_replay_success) process.exit(1);
}

main().catch((error) => {
  console.error(`[live-replay-test] ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
