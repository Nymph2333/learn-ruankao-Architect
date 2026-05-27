/**
 * Phase 3.2: Sample coverage reporter for ruankaodaren intermediate JSONs.
 *
 * Scans data/intermediate/ruankaodaren/samples/*.json and produces:
 *   - console summary
 *   - verification/generated/phase3_2_sample_coverage.json
 *   - verification/generated/phase3_2_sample_coverage.md
 *
 * HARD CONSTRAINTS: no OCR, no Markdown generation, no decryption.
 * This script only reads and aggregates; it never modifies source data.
 *
 * Usage:
 *   pnpm report:sample-coverage
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SampleSummary {
  file: string;
  title: string | null;
  classification: string;
  parser_confidence: string;
  requires_manual_review: boolean;
  text_blocks: number;
  key_terms: number;
  image_refs: number;
  html_fragments: number;
  has_asset_manifest: boolean;
  asset_manifest_path: string | null;
  asset_count: number;
  downloaded_assets: number;
  download_failed_assets: number;
  skipped_assets: number;
  manual_review_assets: number;
  constraint_violations: string[];
}

interface CoverageReport {
  generated_at: string;
  total_samples: number;
  samples: SampleSummary[];
  classification_distribution: Record<string, number>;
  parser_confidence_distribution: Record<string, number>;
  total_image_refs: number;
  total_key_terms: number;
  total_text_blocks: number;
  samples_requiring_manual_review: number;
  samples_with_asset_manifests: number;
  samples_without_asset_manifests: number;
  total_asset_manifest_assets: number;
  total_downloaded_assets: number;
  total_download_failed_assets: number;
  total_skipped_assets: number;
  total_manual_review_assets: number;
  constraint_violations_total: number;
}

interface AssetManifestSummary {
  path: string;
  asset_count: number;
  downloaded_assets: number;
  download_failed_assets: number;
  skipped_assets: number;
  manual_review_assets: number;
}

// ---------------------------------------------------------------------------
// Asset manifest lookup
// ---------------------------------------------------------------------------

function buildManifestMap(): Map<string, AssetManifestSummary> {
  const manifestDir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");
  const manifests = new Map<string, AssetManifestSummary>();
  if (!existsSync(manifestDir)) return manifests;
  const files = readdirSync(manifestDir).filter((f) => f.endsWith(".json") && f !== ".gitkeep");

  for (const file of files) {
    const absPath = resolve(manifestDir, file);
    const raw = JSON.parse(readFileSync(absPath, "utf8")) as {
      source_timestamp?: string;
      asset_count?: number;
      assets?: Array<{ asset_status?: string; requires_manual_review?: boolean }>;
    };
    const timestamp = raw.source_timestamp ?? file.replace(".json", "");
    const assets = raw.assets ?? [];
    manifests.set(timestamp, {
      path: relative(repoRoot, absPath).replace(/\\/g, "/"),
      asset_count: raw.asset_count ?? assets.length,
      downloaded_assets: assets.filter((asset) => asset.asset_status === "downloaded").length,
      download_failed_assets: assets.filter((asset) => asset.asset_status === "download_failed").length,
      skipped_assets: assets.filter((asset) => asset.asset_status === "skipped").length,
      manual_review_assets: assets.filter((asset) => asset.requires_manual_review === true).length,
    });
  }

  return manifests;
}

// ---------------------------------------------------------------------------
// Constraint checks (mirrors validate-ruankaodaren-intermediate.ts)
// ---------------------------------------------------------------------------

function checkConstraints(doc: RuankaoIntermediateDocument): string[] {
  const violations: string[] = [];
  if (doc.constraints?.ocr_used !== false) violations.push("ocr_used !== false");
  if (doc.constraints?.encrypted_xhr_decrypted !== false) violations.push("encrypted_xhr_decrypted !== false");
  if (doc.constraints?.image_table_reconstructed !== false) violations.push("image_table_reconstructed !== false");
  if (doc.constraints?.markdown_generated !== false) violations.push("markdown_generated !== false");
  return violations;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");

if (!existsSync(samplesDir)) {
  console.error("[report] ERROR: samples directory not found:", samplesDir);
  console.error("[report] Run pnpm parse:ruankaodaren first.");
  process.exit(1);
}

const sampleFiles = readdirSync(samplesDir)
  .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
  .sort();

if (sampleFiles.length === 0) {
  console.error("[report] ERROR: no sample JSON files found.");
  console.error("[report] Run pnpm parse:ruankaodaren first.");
  process.exit(1);
}

const manifestMap = buildManifestMap();

const samples: SampleSummary[] = [];

for (const fname of sampleFiles) {
  const absPath = resolve(samplesDir, fname);
  const doc = JSON.parse(readFileSync(absPath, "utf8")) as RuankaoIntermediateDocument;
  const ts = fname.replace(".json", "");
  const violations = checkConstraints(doc);
  const manifest = manifestMap.get(ts);

  samples.push({
    file: fname,
    title: doc.content?.title ?? null,
    classification: doc.classification?.content_source_classification ?? "UNKNOWN",
    parser_confidence: doc.classification?.parser_confidence ?? "UNKNOWN",
    requires_manual_review: doc.classification?.requires_manual_review ?? false,
    text_blocks: doc.content?.text_blocks?.length ?? 0,
    key_terms: doc.content?.key_terms?.length ?? 0,
    image_refs: doc.content?.image_refs?.length ?? 0,
    html_fragments: doc.content?.html_fragments?.length ?? 0,
    has_asset_manifest: manifest !== undefined,
    asset_manifest_path: manifest?.path ?? null,
    asset_count: manifest?.asset_count ?? 0,
    downloaded_assets: manifest?.downloaded_assets ?? 0,
    download_failed_assets: manifest?.download_failed_assets ?? 0,
    skipped_assets: manifest?.skipped_assets ?? 0,
    manual_review_assets: manifest?.manual_review_assets ?? 0,
    constraint_violations: violations,
  });
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

const classificationDist: Record<string, number> = {};
const confidenceDist: Record<string, number> = {};
let totalImageRefs = 0;
let totalKeyTerms = 0;
let totalTextBlocks = 0;
let samplesRequiringReview = 0;
let samplesWithManifests = 0;
let constraintViolationsTotal = 0;
let totalAssetManifestAssets = 0;
let totalDownloadedAssets = 0;
let totalDownloadFailedAssets = 0;
let totalSkippedAssets = 0;
let totalManualReviewAssets = 0;

for (const s of samples) {
  classificationDist[s.classification] = (classificationDist[s.classification] ?? 0) + 1;
  confidenceDist[s.parser_confidence] = (confidenceDist[s.parser_confidence] ?? 0) + 1;
  totalImageRefs += s.image_refs;
  totalKeyTerms += s.key_terms;
  totalTextBlocks += s.text_blocks;
  if (s.requires_manual_review) samplesRequiringReview++;
  if (s.has_asset_manifest) samplesWithManifests++;
  totalAssetManifestAssets += s.asset_count;
  totalDownloadedAssets += s.downloaded_assets;
  totalDownloadFailedAssets += s.download_failed_assets;
  totalSkippedAssets += s.skipped_assets;
  totalManualReviewAssets += s.manual_review_assets;
  constraintViolationsTotal += s.constraint_violations.length;
}

const report: CoverageReport = {
  generated_at: new Date().toISOString(),
  total_samples: samples.length,
  samples,
  classification_distribution: classificationDist,
  parser_confidence_distribution: confidenceDist,
  total_image_refs: totalImageRefs,
  total_key_terms: totalKeyTerms,
  total_text_blocks: totalTextBlocks,
  samples_requiring_manual_review: samplesRequiringReview,
  samples_with_asset_manifests: samplesWithManifests,
  samples_without_asset_manifests: samples.length - samplesWithManifests,
  total_asset_manifest_assets: totalAssetManifestAssets,
  total_downloaded_assets: totalDownloadedAssets,
  total_download_failed_assets: totalDownloadFailedAssets,
  total_skipped_assets: totalSkippedAssets,
  total_manual_review_assets: totalManualReviewAssets,
  constraint_violations_total: constraintViolationsTotal,
};

// ---------------------------------------------------------------------------
// Console output
// ---------------------------------------------------------------------------

console.log("\n[report] Sample Coverage Summary");
console.log(`  total samples:                ${report.total_samples}`);
console.log(`  requires_manual_review:       ${report.samples_requiring_manual_review}`);
console.log(`  with asset manifests:         ${report.samples_with_asset_manifests}`);
console.log(`  without asset manifests:      ${report.samples_without_asset_manifests}`);
console.log(`  asset manifest assets:        ${report.total_asset_manifest_assets}`);
console.log(`  downloaded assets:            ${report.total_downloaded_assets}`);
console.log(`  download_failed assets:       ${report.total_download_failed_assets}`);
console.log(`  skipped assets:               ${report.total_skipped_assets}`);
console.log(`  manual review assets:         ${report.total_manual_review_assets}`);
console.log(`  constraint_violations_total:  ${report.constraint_violations_total}`);
console.log(`  total text_blocks:            ${report.total_text_blocks}`);
console.log(`  total key_terms:              ${report.total_key_terms}`);
console.log(`  total image_refs:             ${report.total_image_refs}`);
console.log("\n  classification distribution:");
for (const [cls, count] of Object.entries(classificationDist)) {
  console.log(`    ${cls}: ${count}`);
}
console.log("\n  parser_confidence distribution:");
for (const [conf, count] of Object.entries(confidenceDist)) {
  console.log(`    ${conf}: ${count}`);
}
console.log("\n  samples:");
for (const s of samples) {
  const violations = s.constraint_violations.length > 0 ? ` [VIOLATIONS: ${s.constraint_violations.join(", ")}]` : "";
  const manifest = s.has_asset_manifest ? " [manifest ✓]" : " [no manifest]";
  console.log(`    ${s.file}`);
  console.log(`      title:          ${s.title ?? "(null)"}`);
  console.log(`      classification: ${s.classification}  confidence: ${s.parser_confidence}`);
  console.log(`      text_blocks: ${s.text_blocks}  key_terms: ${s.key_terms}  image_refs: ${s.image_refs}${manifest}${violations}`);
  console.log(`      assets: manifest_count=${s.asset_count} downloaded=${s.downloaded_assets} failed=${s.download_failed_assets} skipped=${s.skipped_assets} manual_review=${s.manual_review_assets}`);
}

// ---------------------------------------------------------------------------
// Write JSON report
// ---------------------------------------------------------------------------

const generatedDir = resolve(repoRoot, "verification/generated");
mkdirSync(generatedDir, { recursive: true });

const jsonPath = resolve(generatedDir, "phase3_2_sample_coverage.json");
writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
console.log(`\n[report] JSON written: ${relative(repoRoot, jsonPath).replace(/\\/g, "/")}`);

// ---------------------------------------------------------------------------
// Write Markdown report
// ---------------------------------------------------------------------------

const mdLines: string[] = [
  "# Phase 3.2 Sample Coverage Report",
  "",
  `Generated at: ${report.generated_at}`,
  "",
  "## Summary",
  "",
  `| Metric | Value |`,
  `|--------|-------|`,
  `| Total samples | ${report.total_samples} |`,
  `| Requires manual review | ${report.samples_requiring_manual_review} |`,
  `| With asset manifests | ${report.samples_with_asset_manifests} |`,
  `| Without asset manifests | ${report.samples_without_asset_manifests} |`,
  `| Asset manifest assets | ${report.total_asset_manifest_assets} |`,
  `| Downloaded assets | ${report.total_downloaded_assets} |`,
  `| Download failed assets | ${report.total_download_failed_assets} |`,
  `| Skipped assets | ${report.total_skipped_assets} |`,
  `| Manual review assets | ${report.total_manual_review_assets} |`,
  `| Constraint violations | ${report.constraint_violations_total} |`,
  `| Total text_blocks | ${report.total_text_blocks} |`,
  `| Total key_terms | ${report.total_key_terms} |`,
  `| Total image_refs | ${report.total_image_refs} |`,
  "",
  "## Classification Distribution",
  "",
  "| Classification | Count |",
  "|----------------|-------|",
  ...Object.entries(classificationDist).map(([cls, count]) => `| ${cls} | ${count} |`),
  "",
  "## Parser Confidence Distribution",
  "",
  "| Confidence | Count |",
  "|------------|-------|",
  ...Object.entries(confidenceDist).map(([conf, count]) => `| ${conf} | ${count} |`),
  "",
  "## Sample Details",
  "",
];

for (const s of samples) {
  mdLines.push(`### ${s.file}`);
  mdLines.push("");
  mdLines.push(`- **Title**: ${s.title ?? "(null)"}`);
  mdLines.push(`- **Classification**: ${s.classification}`);
  mdLines.push(`- **Parser confidence**: ${s.parser_confidence}`);
  mdLines.push(`- **Requires manual review**: ${s.requires_manual_review}`);
  mdLines.push(`- **text_blocks**: ${s.text_blocks}`);
  mdLines.push(`- **key_terms**: ${s.key_terms}`);
  mdLines.push(`- **image_refs**: ${s.image_refs}`);
  mdLines.push(`- **Asset manifest**: ${s.has_asset_manifest ? `present (${s.asset_manifest_path})` : "missing"}`);
  mdLines.push(`- **Assets**: manifest_count=${s.asset_count}, downloaded=${s.downloaded_assets}, failed=${s.download_failed_assets}, skipped=${s.skipped_assets}, manual_review=${s.manual_review_assets}`);
  if (s.constraint_violations.length > 0) {
    mdLines.push(`- **CONSTRAINT VIOLATIONS**: ${s.constraint_violations.join(", ")}`);
  }
  mdLines.push("");
}

mdLines.push("## Constraints");
mdLines.push("");
mdLines.push("- No OCR was used");
mdLines.push("- No encrypt=1 decrypted");
mdLines.push("- No Markdown generated");
mdLines.push("- No image table reconstructed");
mdLines.push("");

const mdPath = resolve(generatedDir, "phase3_2_sample_coverage.md");
writeFileSync(mdPath, mdLines.join("\n"), "utf8");
console.log(`[report] Markdown written: ${relative(repoRoot, mdPath).replace(/\\/g, "/")}`);

if (report.constraint_violations_total > 0) {
  console.error(`\n[report] WARNING: ${report.constraint_violations_total} constraint violation(s) found!`);
  process.exit(1);
}

console.log("\n[report] Done.");
