/**
 * Phase 5.3 baseline detail-entry contract test.
 *
 * Tests one exact baseline title through leaf replay and matched-leaf detail
 * entry. It does not parse, capture assets, OCR, decrypt encrypt=1, reconstruct
 * image tables, read raw XHR directly, generate official Markdown, or generate
 * AI learning content.
 *
 * Usage:
 *   pnpm test:baseline-detail-entry -- --title "1.3 指令系统CISC和RISC"
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type BrowserContextOptions } from "playwright";
import {
  clickMatchedLeafDetailEntry,
  ensureRuankaodarenContext,
  inspectKnowInfoOuterHtml,
  openKnowledgeRoute,
  replayCatalogLeaf,
  waitForStableDetailContent,
} from "./lib/ruankaodaren-dom-explorer.js";
import {
  defaultReachableLeafCatalogPath,
  findCatalogLeaf,
  loadReachableLeafCatalog,
} from "./lib/ruankaodaren-target-resolution.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const authStatePath = resolve(repoRoot, ".auth/ruankaodaren.storageState.json");

interface DetailEntryTestReport {
  generated_at: string;
  title: string;
  auth_state_present: boolean;
  catalog_match_found: boolean;
  live_replay_success: boolean;
  leaf_match_title: string | null;
  detail_entry_attempted: boolean;
  detail_entry_success: boolean;
  detail_entry_text: string | null;
  detail_entry_click_attempts: string[];
  login_dialog_detected: boolean;
  detail_entry_route_changed: boolean;
  detail_entry_failure_reason: string | null;
  final_url: string;
  final_url_contains_konwledgeInfo: boolean;
  stabilization_status: string | null;
  knowInfo_outer_html_found: boolean;
  knowInfo_outer_html_selector: string | null;
  knowInfo_outer_html_text_length: number;
  knowInfo_outer_html_length: number;
  metadata_compatible_with_parser: boolean;
  recommended_action: "safe_for_recovery" | "provide_authenticated_storage_state" | "fix_detail_entry_selector" | "inspect_dom";
  constraints: {
    no_parse: true;
    no_asset_capture: true;
    no_ai_learning_content: true;
    no_official_markdown_generated: true;
    no_ocr: true;
    no_encrypt1_decrypted: true;
    no_image_table_reconstructed: true;
    no_raw_xhr_direct_read: true;
    phase4_6_not_entered: true;
  };
}

function parseArgs(): string {
  const args = process.argv.slice(2);
  const titleIndex = args.indexOf("--title");
  const title = titleIndex >= 0 ? args[titleIndex + 1] : null;
  if (!title) {
    console.error('[baseline-detail-entry-test] ERROR: provide --title "<exact baseline title>".');
    process.exit(1);
  }
  return title;
}

function safeTitleName(title: string): string {
  return title
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.\-\u4e00-\u9fff]+/g, "_")
    .slice(0, 80);
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function renderMarkdown(report: DetailEntryTestReport): string {
  return [
    `# Phase 5.3 Detail-entry Test: ${report.title}`,
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    `- title: ${report.title}`,
    `- auth_state_present: ${report.auth_state_present}`,
    `- live_replay_success: ${report.live_replay_success}`,
    `- leaf_match_title: ${report.leaf_match_title ?? "(none)"}`,
    `- detail_entry_attempted: ${report.detail_entry_attempted}`,
    `- detail_entry_success: ${report.detail_entry_success}`,
    `- login_dialog_detected: ${report.login_dialog_detected}`,
    `- detail_entry_route_changed: ${report.detail_entry_route_changed}`,
    `- final_url_contains_konwledgeInfo: ${report.final_url_contains_konwledgeInfo}`,
    `- knowInfo_outer_html_found: ${report.knowInfo_outer_html_found}`,
    `- knowInfo_outer_html_text_length: ${report.knowInfo_outer_html_text_length}`,
    `- metadata_compatible_with_parser: ${report.metadata_compatible_with_parser}`,
    `- recommended_action: ${report.recommended_action}`,
    `- detail_entry_failure_reason: ${report.detail_entry_failure_reason ?? "(none)"}`,
    "",
    "## Constraints",
    "",
    "- No parser was run.",
    "- No asset capture was run.",
    "- No AI learning content was generated.",
    "- No official Markdown was generated.",
    "- No OCR was used.",
    "- No encrypt=1 data was decrypted.",
    "- No image table was reconstructed.",
    "- No raw XHR was read directly.",
    "- Phase 4.6 was not entered.",
    "",
  ].join("\n");
}

async function main(): Promise<void> {
  const title = parseArgs();
  const catalogPath = defaultReachableLeafCatalogPath();
  const catalog = loadReachableLeafCatalog(catalogPath);
  const catalogMatch = findCatalogLeaf(title, catalog);

  const browser = await chromium.launch({ headless: true });
  let report: DetailEntryTestReport;
  try {
    const contextOptions: BrowserContextOptions = existsSync(authStatePath)
      ? { storageState: authStatePath, viewport: { width: 1365, height: 768 } }
      : { viewport: { width: 1365, height: 768 } };
    const context = await browser.newContext(contextOptions);
    await context.addInitScript(() => {
      Reflect.set(globalThis, "__name", (fn: unknown) => fn);
    });
    const page = await context.newPage();
    await openKnowledgeRoute(page);
    await ensureRuankaodarenContext(page);

    const replay = await replayCatalogLeaf(page, catalogMatch);
    const leafMatchTitle = replay.match.leaf?.title ?? catalogMatch.leaf_title ?? null;
    const detailEntry = replay.success && leafMatchTitle
      ? await clickMatchedLeafDetailEntry(page, leafMatchTitle)
      : null;
    const stabilization = detailEntry?.success
      ? await waitForStableDetailContent(page)
      : null;
    const knowInfo = detailEntry?.success
      ? await inspectKnowInfoOuterHtml(page)
      : {
          found: false,
          selector: null,
          text_length: 0,
          outer_html_length: 0,
          img_count: 0,
          outer_html: null,
        };
    const metadataCompatible =
      Boolean(detailEntry?.success) &&
      Boolean(detailEntry?.route_changed) &&
      Boolean(detailEntry?.final_url_contains_konwledgeInfo) &&
      knowInfo.found;
    const recommendedAction: DetailEntryTestReport["recommended_action"] = metadataCompatible
      ? "safe_for_recovery"
      : detailEntry?.login_dialog_detected
        ? "provide_authenticated_storage_state"
        : replay.success
        ? "fix_detail_entry_selector"
        : "inspect_dom";

    report = {
      generated_at: new Date().toISOString(),
      title,
      auth_state_present: existsSync(authStatePath),
      catalog_match_found: catalogMatch.found,
      live_replay_success: replay.success,
      leaf_match_title: leafMatchTitle,
      detail_entry_attempted: detailEntry?.attempted ?? false,
      detail_entry_success: detailEntry?.success ?? false,
      detail_entry_text: detailEntry?.text ?? null,
      detail_entry_click_attempts: detailEntry?.click_attempts ?? [],
      login_dialog_detected: detailEntry?.login_dialog_detected ?? false,
      detail_entry_route_changed: detailEntry?.route_changed ?? false,
      detail_entry_failure_reason: detailEntry?.failure_reason ?? (replay.success ? null : replay.failure_reason),
      final_url: detailEntry?.final_url ?? page.url(),
      final_url_contains_konwledgeInfo: detailEntry?.final_url_contains_konwledgeInfo ?? page.url().includes("konwledgeInfo"),
      stabilization_status: stabilization?.status ?? null,
      knowInfo_outer_html_found: knowInfo.found,
      knowInfo_outer_html_selector: knowInfo.selector,
      knowInfo_outer_html_text_length: knowInfo.text_length,
      knowInfo_outer_html_length: knowInfo.outer_html_length,
      metadata_compatible_with_parser: metadataCompatible,
      recommended_action: recommendedAction,
      constraints: {
        no_parse: true,
        no_asset_capture: true,
        no_ai_learning_content: true,
        no_official_markdown_generated: true,
        no_ocr: true,
        no_encrypt1_decrypted: true,
        no_image_table_reconstructed: true,
        no_raw_xhr_direct_read: true,
        phase4_6_not_entered: true,
      },
    };
    await context.close();
  } finally {
    await browser.close();
  }

  mkdirSync(generatedDir, { recursive: true });
  const safeTitle = safeTitleName(title);
  const jsonPath = resolve(generatedDir, `phase5_3_detail_entry_test_${safeTitle}.json`);
  const mdPath = resolve(generatedDir, `phase5_3_detail_entry_test_${safeTitle}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  console.log("[baseline-detail-entry-test] completed");
  console.log(`  title:                           ${report.title}`);
  console.log(`  auth_state_present:              ${report.auth_state_present}`);
  console.log(`  live_replay_success:             ${report.live_replay_success}`);
  console.log(`  detail_entry_success:            ${report.detail_entry_success}`);
  console.log(`  login_dialog_detected:           ${report.login_dialog_detected}`);
  console.log(`  final_url_contains_konwledgeInfo:${report.final_url_contains_konwledgeInfo}`);
  console.log(`  knowInfo_outer_html_found:       ${report.knowInfo_outer_html_found}`);
  console.log(`  metadata_compatible_with_parser: ${report.metadata_compatible_with_parser}`);
  console.log(`  recommended_action:              ${report.recommended_action}`);
  console.log(`  detail_entry_failure_reason:     ${report.detail_entry_failure_reason ?? "(none)"}`);
  console.log(`  JSON report:                     ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report:                 ${toRepoPath(mdPath)}`);

  if (!report.metadata_compatible_with_parser) process.exit(1);
}

main().catch((error) => {
  console.error(`[baseline-detail-entry-test] ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
