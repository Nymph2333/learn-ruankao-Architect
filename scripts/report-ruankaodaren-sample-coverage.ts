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
const quarantineManifestPath = resolve(
  repoRoot,
  "data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json"
);
const semanticAuditPath = resolve(repoRoot, "verification/generated/phase3_7_semantic_alignment_audit.json");
const readinessAuditPath = resolve(repoRoot, "verification/generated/phase3_21_renderer_readiness_audit.json");
const baselineManifestPath = resolve(repoRoot, "verification/generated/phase3_23_renderer_baseline_manifest.json");
const generatedDir = resolve(repoRoot, "verification/generated");
const diagnosticsDir = resolve(repoRoot, "data/intermediate/ruankaodaren/diagnostics");

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
  quarantined: boolean;
  quarantine_reason: string | null;
  renderer_eligible: boolean;
  preflight_passed: boolean;
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
  quarantined_samples: number;
  renderer_eligible_samples: number;
  preflight_passed_samples: number;
  diagnostic_samples: number;
  renderer_baseline_candidates: Array<{
    file: string;
    title: string | null;
  }>;
  duplicate_actual_content_count: number;
  constraint_violations_total: number;
  phase4_candidate_status:
    | "blocked_insufficient_renderer_eligible"
    | "blocked_quarantined_baseline_candidate"
    | "blocked_constraints_violation"
    | "candidate_ready";
  renderer_eligible_titles: string[];
  missing_renderer_eligible_count: number;
  // Phase 3.21 additions
  renderer_readiness_classes_distribution: Record<string, number>;
  content_shape_distribution: Record<string, number>;
  eligible_for_phase4_baseline_count: number;
  static_low_text_verified_count: number;
  renderer_policy_summary: Array<{ title: string | null; render_as: string; allow_markdown: boolean }>;
  // Phase 3.23 additions
  renderer_baseline_manifest_exists: boolean;
  unique_renderer_baseline_count: number;
  canonical_baseline_titles: string[];
  duplicate_eligible_samples_excluded: number;
  phase4_input_contract_ready: boolean;
}

interface AssetManifestSummary {
  path: string;
  asset_count: number;
  downloaded_assets: number;
  download_failed_assets: number;
  skipped_assets: number;
  manual_review_assets: number;
}

interface QuarantineManifest {
  items?: Array<{
    timestamp: string;
    quarantine_reason?: string;
  }>;
}

interface SemanticAuditReport {
  duplicate_actual_content_count?: number;
  samples?: Array<{
    timestamp: string;
    renderer_eligible?: boolean;
  }>;
}

interface PreflightReport {
  timestamp: string;
  overall?: "pass" | "fail";
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

function buildQuarantineMap(): Map<string, string> {
  const quarantined = new Map<string, string>();
  if (!existsSync(quarantineManifestPath)) return quarantined;
  const manifest = JSON.parse(readFileSync(quarantineManifestPath, "utf8")) as QuarantineManifest;
  for (const item of manifest.items ?? []) {
    quarantined.set(item.timestamp, item.quarantine_reason ?? "unknown");
  }
  return quarantined;
}

function readSemanticAudit(): SemanticAuditReport | null {
  if (!existsSync(semanticAuditPath)) return null;
  return JSON.parse(readFileSync(semanticAuditPath, "utf8")) as SemanticAuditReport;
}

function buildPreflightPassSet(): Set<string> {
  const passed = new Set<string>();
  if (!existsSync(generatedDir)) return passed;

  const files = readdirSync(generatedDir).filter(
    (file) => file.startsWith("phase3_8_preflight_") && file.endsWith(".json")
  );

  for (const file of files) {
    const report = JSON.parse(readFileSync(resolve(generatedDir, file), "utf8")) as PreflightReport;
    if (report.overall === "pass") {
      passed.add(report.timestamp);
    }
  }

  return passed;
}

function diagnosticSampleCount(): number {
  if (!existsSync(diagnosticsDir)) return 0;
  return readdirSync(diagnosticsDir).filter((file) => file.endsWith(".json") && file !== ".gitkeep").length;
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
const quarantineMap = buildQuarantineMap();
const semanticAudit = readSemanticAudit();
const semanticRendererEligible = new Set(
  (semanticAudit?.samples ?? [])
    .filter((sample) => sample.renderer_eligible === true)
    .map((sample) => sample.timestamp)
);
const preflightPassed = buildPreflightPassSet();

const samples: SampleSummary[] = [];

for (const fname of sampleFiles) {
  const absPath = resolve(samplesDir, fname);
  const doc = JSON.parse(readFileSync(absPath, "utf8")) as RuankaoIntermediateDocument;
  const ts = fname.replace(".json", "");
  const violations = checkConstraints(doc);
  const manifest = manifestMap.get(ts);
  const quarantineReason = quarantineMap.get(ts) ?? null;
  const rendererEligible = semanticAudit
    ? semanticRendererEligible.has(ts)
    : quarantineReason === null;

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
    quarantined: quarantineReason !== null,
    quarantine_reason: quarantineReason,
    renderer_eligible: rendererEligible,
    preflight_passed: preflightPassed.has(ts),
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
let quarantinedSamples = 0;
let rendererEligibleSamples = 0;
let preflightPassedSamples = 0;

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
  if (s.quarantined) quarantinedSamples++;
  if (s.renderer_eligible) rendererEligibleSamples++;
  if (s.preflight_passed) preflightPassedSamples++;
  constraintViolationsTotal += s.constraint_violations.length;
}

const rendererBaselineCandidates = samples
  .filter((sample) => sample.renderer_eligible)
  .map((sample) => ({
    file: sample.file,
    title: sample.title,
  }));

const rendererEligibleTitles = samples
  .filter((s) => s.renderer_eligible)
  .map((s) => s.title)
  .filter((t): t is string => t !== null);

const missingRendererEligibleCount = Math.max(0, 3 - rendererEligibleSamples);

let phase4CandidateStatus: CoverageReport["phase4_candidate_status"];
if (rendererEligibleSamples >= 3 && constraintViolationsTotal === 0) {
  phase4CandidateStatus = "candidate_ready";
} else if (constraintViolationsTotal > 0) {
  phase4CandidateStatus = "blocked_constraints_violation";
} else {
  phase4CandidateStatus = "blocked_insufficient_renderer_eligible";
}

// Phase 3.21: load readiness audit if present
interface ReadinessAuditItemCoverage {
  timestamp: string;
  title?: string | null;
  content_shape: string;
  readiness_class: string;
  eligible_for_phase4_baseline: boolean;
  renderer_policy?: {
    render_as: string;
    allow_markdown_generation_later: boolean;
  } | null;
}
interface ReadinessAuditReportCoverage {
  items?: ReadinessAuditItemCoverage[];
}

const readinessClassesDist: Record<string, number> = {};
const contentShapeDist: Record<string, number> = {};
let eligibleForPhase4Count = 0;
let staticLowTextVerifiedCount = 0;
const rendererPolicySummary: Array<{ title: string | null; render_as: string; allow_markdown: boolean }> = [];

if (existsSync(readinessAuditPath)) {
  try {
    const raw = readFileSync(readinessAuditPath, "utf8");
    const readinessReport = JSON.parse(raw) as ReadinessAuditReportCoverage;
    for (const item of readinessReport.items ?? []) {
      readinessClassesDist[item.readiness_class] = (readinessClassesDist[item.readiness_class] ?? 0) + 1;
      contentShapeDist[item.content_shape] = (contentShapeDist[item.content_shape] ?? 0) + 1;
      if (item.eligible_for_phase4_baseline) eligibleForPhase4Count++;
      if (item.content_shape === "STATIC_LOW_TEXT_VERIFIED") staticLowTextVerifiedCount++;
      if (item.renderer_policy) {
        rendererPolicySummary.push({
          title: item.title ?? null,
          render_as: item.renderer_policy.render_as,
          allow_markdown: item.renderer_policy.allow_markdown_generation_later,
        });
      }
    }
  } catch {
    // readiness audit unreadable — leave distributions empty
  }
}

// Phase 3.23: load unique renderer baseline manifest if present
interface BaselineManifestForCoverage {
  unique_title_count?: number;
  phase4_input_contract_ready?: boolean;
  baseline_items?: Array<{ canonical_title?: string }>;
  excluded_items?: Array<{ reason?: string }>;
}

let baselineManifestExists = false;
let uniqueRendererBaselineCount = 0;
let canonicalBaselineTitles: string[] = [];
let duplicateEligibleSamplesExcluded = 0;
let phase4InputContractReady = false;

if (existsSync(baselineManifestPath)) {
  try {
    const bm = JSON.parse(readFileSync(baselineManifestPath, "utf8")) as BaselineManifestForCoverage;
    baselineManifestExists = true;
    uniqueRendererBaselineCount = bm.unique_title_count ?? 0;
    canonicalBaselineTitles = (bm.baseline_items ?? [])
      .map((i) => i.canonical_title ?? "")
      .filter(Boolean);
    duplicateEligibleSamplesExcluded = (bm.excluded_items ?? []).filter(
      (i) => i.reason === "duplicate_same_title" || i.reason === "duplicate_actual_content" || i.reason === "duplicate_of_canonical"
    ).length;
    phase4InputContractReady = bm.phase4_input_contract_ready ?? false;
    // Override phase4 status based on unique baseline manifest
    if (phase4InputContractReady && uniqueRendererBaselineCount >= 3) {
      phase4CandidateStatus = "candidate_ready";
    } else if (constraintViolationsTotal > 0) {
      phase4CandidateStatus = "blocked_constraints_violation";
    } else {
      phase4CandidateStatus = "blocked_insufficient_renderer_eligible";
    }
  } catch {
    // unreadable manifest — ignore
  }
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
  quarantined_samples: quarantinedSamples,
  renderer_eligible_samples: rendererEligibleSamples,
  preflight_passed_samples: preflightPassedSamples,
  diagnostic_samples: diagnosticSampleCount(),
  renderer_baseline_candidates: rendererBaselineCandidates,
  duplicate_actual_content_count: semanticAudit?.duplicate_actual_content_count ?? 0,
  constraint_violations_total: constraintViolationsTotal,
  phase4_candidate_status: phase4CandidateStatus,
  renderer_eligible_titles: rendererEligibleTitles,
  missing_renderer_eligible_count: missingRendererEligibleCount,
  renderer_readiness_classes_distribution: readinessClassesDist,
  content_shape_distribution: contentShapeDist,
  eligible_for_phase4_baseline_count: eligibleForPhase4Count,
  static_low_text_verified_count: staticLowTextVerifiedCount,
  renderer_policy_summary: rendererPolicySummary,
  renderer_baseline_manifest_exists: baselineManifestExists,
  unique_renderer_baseline_count: uniqueRendererBaselineCount,
  canonical_baseline_titles: canonicalBaselineTitles,
  duplicate_eligible_samples_excluded: duplicateEligibleSamplesExcluded,
  phase4_input_contract_ready: phase4InputContractReady,
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
console.log(`  quarantined samples:          ${report.quarantined_samples}`);
console.log(`  renderer eligible samples:    ${report.renderer_eligible_samples}`);
console.log(`  preflight passed samples:     ${report.preflight_passed_samples}`);
console.log(`  diagnostic samples:           ${report.diagnostic_samples}`);
console.log(`  duplicate actual content:     ${report.duplicate_actual_content_count}`);
console.log(`  constraint_violations_total:  ${report.constraint_violations_total}`);
console.log(`  phase4_candidate_status:      ${report.phase4_candidate_status}`);
console.log(`  missing_renderer_eligible:    ${report.missing_renderer_eligible_count}`);
console.log(`  renderer_eligible_titles:     ${report.renderer_eligible_titles.join(", ") || "(none)"}`);
console.log(`  total text_blocks:            ${report.total_text_blocks}`);
console.log(`  total key_terms:              ${report.total_key_terms}`);
console.log(`  total image_refs:             ${report.total_image_refs}`);
console.log("\n  Phase 3.21 readiness distributions:");
if (Object.keys(report.renderer_readiness_classes_distribution).length > 0) {
  for (const [k, v] of Object.entries(report.renderer_readiness_classes_distribution)) {
    console.log(`    readiness_class ${k}: ${v}`);
  }
  for (const [k, v] of Object.entries(report.content_shape_distribution)) {
    console.log(`    content_shape ${k}: ${v}`);
  }
  console.log(`  eligible_for_phase4_baseline: ${report.eligible_for_phase4_baseline_count}`);
  console.log(`  static_low_text_verified:     ${report.static_low_text_verified_count}`);
} else {
  console.log("    (no readiness audit — run pnpm audit:renderer-readiness)");
}
console.log("\n  Phase 3.23 unique baseline manifest:");
if (report.renderer_baseline_manifest_exists) {
  console.log(`  renderer_baseline_manifest_exists: true`);
  console.log(`  unique_renderer_baseline_count:    ${report.unique_renderer_baseline_count}`);
  console.log(`  canonical_baseline_titles:         ${report.canonical_baseline_titles.join(", ") || "(none)"}`);
  console.log(`  duplicate_eligible_excluded:       ${report.duplicate_eligible_samples_excluded}`);
  console.log(`  phase4_input_contract_ready:       ${report.phase4_input_contract_ready}`);
} else {
  console.log("    (no baseline manifest — run pnpm build:renderer-baseline)");
}
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
  console.log(`      semantic: quarantined=${s.quarantined} renderer_eligible=${s.renderer_eligible}${s.quarantine_reason ? ` reason=${s.quarantine_reason}` : ""}`);
  console.log(`      assets: manifest_count=${s.asset_count} downloaded=${s.downloaded_assets} failed=${s.download_failed_assets} skipped=${s.skipped_assets} manual_review=${s.manual_review_assets}`);
}

// ---------------------------------------------------------------------------
// Write JSON report
// ---------------------------------------------------------------------------

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
  `| Quarantined samples | ${report.quarantined_samples} |`,
  `| Renderer eligible samples | ${report.renderer_eligible_samples} |`,
  `| Preflight passed samples | ${report.preflight_passed_samples} |`,
  `| Diagnostic samples | ${report.diagnostic_samples} |`,
  `| Duplicate actual content | ${report.duplicate_actual_content_count} |`,
  `| Constraint violations | ${report.constraint_violations_total} |`,
  `| Phase 4 candidate status | ${report.phase4_candidate_status} |`,
  `| Missing renderer eligible | ${report.missing_renderer_eligible_count} |`,
  `| Total text_blocks | ${report.total_text_blocks} |`,
  `| Total key_terms | ${report.total_key_terms} |`,
  `| Total image_refs | ${report.total_image_refs} |`,
  `| eligible_for_phase4_baseline | ${report.eligible_for_phase4_baseline_count} |`,
  `| static_low_text_verified | ${report.static_low_text_verified_count} |`,
  `| renderer_baseline_manifest_exists | ${report.renderer_baseline_manifest_exists} |`,
  `| unique_renderer_baseline_count | ${report.unique_renderer_baseline_count} |`,
  `| duplicate_eligible_samples_excluded | ${report.duplicate_eligible_samples_excluded} |`,
  `| phase4_input_contract_ready | ${report.phase4_input_contract_ready} |`,
  "",
  "## Renderer Readiness Classes (Phase 3.21)",
  "",
  Object.keys(report.renderer_readiness_classes_distribution).length > 0
    ? ["| Readiness Class | Count |", "|---|---:|",
        ...Object.entries(report.renderer_readiness_classes_distribution).map(([k, v]) => `| ${k} | ${v} |`)]
        .join("\n")
    : "- (no readiness audit — run `pnpm audit:renderer-readiness`)",
  "",
  "## Content Shape Distribution (Phase 3.21)",
  "",
  Object.keys(report.content_shape_distribution).length > 0
    ? ["| Content Shape | Count |", "|---|---:|",
        ...Object.entries(report.content_shape_distribution).map(([k, v]) => `| ${k} | ${v} |`)]
        .join("\n")
    : "- (no readiness audit)",
  "",
  "## Renderer Eligible Titles",
  "",
  ...(report.renderer_eligible_titles.length === 0
    ? ["- None."]
    : report.renderer_eligible_titles.map((t) => `- ${t}`)),
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
  mdLines.push(`- **Quarantined**: ${s.quarantined}${s.quarantine_reason ? ` (${s.quarantine_reason})` : ""}`);
  mdLines.push(`- **Renderer eligible**: ${s.renderer_eligible}`);
  mdLines.push(`- **Preflight passed**: ${s.preflight_passed}`);
  mdLines.push(`- **Asset manifest**: ${s.has_asset_manifest ? `present (${s.asset_manifest_path})` : "missing"}`);
  mdLines.push(`- **Assets**: manifest_count=${s.asset_count}, downloaded=${s.downloaded_assets}, failed=${s.download_failed_assets}, skipped=${s.skipped_assets}, manual_review=${s.manual_review_assets}`);
  if (s.constraint_violations.length > 0) {
    mdLines.push(`- **CONSTRAINT VIOLATIONS**: ${s.constraint_violations.join(", ")}`);
  }
  mdLines.push("");
}

mdLines.push("## Renderer Baseline Candidates");
mdLines.push("");
if (report.renderer_baseline_candidates.length === 0) {
  mdLines.push("- None.");
} else {
  for (const sample of report.renderer_baseline_candidates) {
    mdLines.push(`- ${sample.file}: ${sample.title ?? "(null)"}`);
  }
}
mdLines.push("");

mdLines.push("## Quarantined Samples");
mdLines.push("");
const quarantinedList = samples.filter((sample) => sample.quarantined);
if (quarantinedList.length === 0) {
  mdLines.push("- None.");
} else {
  for (const sample of quarantinedList) {
    mdLines.push(`- ${sample.file}: ${sample.title ?? "(null)"} — ${sample.quarantine_reason ?? "unknown"}`);
  }
}
mdLines.push("");

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
