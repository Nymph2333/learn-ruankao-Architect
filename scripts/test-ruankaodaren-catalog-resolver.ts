/**
 * Phase 3.13: catalog-backed target resolver smoke test.
 *
 * This script does not open a browser. It only checks whether a requested leaf
 * title can be resolved from the Phase 3.11 reachable leaf catalog.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultReachableLeafCatalogPath,
  findCatalogLeaf,
  loadReachableLeafCatalog,
} from "./lib/ruankaodaren-target-resolution.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const catalogPath = defaultReachableLeafCatalogPath();

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
    console.error('[catalog-resolver-test] ERROR: provide --target "<leaf title>".');
    process.exit(1);
  }
  return target;
}

function main(): void {
  const target = parseArgs();
  const catalog = loadReachableLeafCatalog(catalogPath);
  const match = findCatalogLeaf(target, catalog);
  const report = {
    generated_at: new Date().toISOString(),
    target,
    catalog_path: toRepoPath(catalogPath),
    catalog_loaded: catalog !== null,
    catalog_leaf_count: catalog?.leaf_count ?? 0,
    match_found: match.found,
    match_strategy: match.match_strategy,
    chapter_title: match.chapter_title,
    leaf_title: match.leaf_title,
    section_number: match.section_number,
    chapter_number: match.chapter_number,
    confidence: match.confidence,
    constraints: {
      no_browser_opened: true,
      no_parse: true,
      no_markdown_generated: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_full_site_crawl: true,
      phase4_not_entered: true,
    },
  };

  mkdirSync(generatedDir, { recursive: true });
  const safeName = safeTargetName(target);
  const jsonPath = resolve(generatedDir, `phase3_13_catalog_resolver_test_${safeName}.json`);
  const mdPath = resolve(generatedDir, `phase3_13_catalog_resolver_test_${safeName}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Phase 3.13 Catalog Resolver Test: ${target}`,
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
    `| match_found | ${report.match_found} |`,
    `| match_strategy | ${report.match_strategy} |`,
    `| chapter_title | ${report.chapter_title ?? ""} |`,
    `| leaf_title | ${report.leaf_title ?? ""} |`,
    `| section_number | ${report.section_number ?? ""} |`,
    `| confidence | ${report.confidence ?? ""} |`,
    "",
    "## Constraints",
    "",
    "- No browser opened.",
    "- No parser executed.",
    "- No Markdown knowledge documents generated.",
    "- No OCR used.",
    "- No encrypt=1 data decrypted.",
    "- No image table reconstructed.",
    "- No full-site batch crawl performed.",
    "- Phase 4 was not entered.",
    "",
  ];
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log("[catalog-resolver-test] completed");
  console.log(`  match_found:    ${report.match_found}`);
  console.log(`  match_strategy: ${report.match_strategy}`);
  console.log(`  chapter_title:  ${report.chapter_title ?? "(none)"}`);
  console.log(`  leaf_title:     ${report.leaf_title ?? "(none)"}`);
  console.log(`  JSON report:    ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report:${toRepoPath(mdPath)}`);

  if (!report.match_found) process.exit(1);
}

main();
