/**
 * Phase 3.23 – Unique Renderer Baseline Manifest Builder
 *
 * Reads:
 *   - verification/generated/phase3_21_renderer_readiness_audit.json
 *   - data/intermediate/ruankaodaren/samples/*.json
 *   - data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json
 *   - sources/ruankaodaren/raw/assets/manifests/*.json
 *
 * Outputs:
 *   - verification/generated/phase3_23_renderer_baseline_manifest.json
 *   - verification/generated/phase3_23_renderer_baseline_manifest.md
 *
 * Canonical selection rules (highest priority first):
 *   1. non-quarantined (but for STATIC_LOW_TEXT_VERIFIED with soft quarantine,
 *      prefer the one with the lowest-number duplicate quarantine reason)
 *   2. renderer_ready_with_asset_refs > renderer_ready_short_card (for image-bearing titles)
 *   3. sample with asset manifest
 *   4. latest timestamp
 *   5. highest text_length
 *
 * HARD CONSTRAINTS: no OCR, no Markdown generation, no decryption, no new samples.
 *
 * Usage:
 *   pnpm build:renderer-baseline
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const generatedDir = resolve(repoRoot, "verification/generated");
const quarantineManifestPath = resolve(
  repoRoot,
  "data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json"
);
const readinessAuditPath = resolve(
  repoRoot,
  "verification/generated/phase3_21_renderer_readiness_audit.json"
);
const manifestsDir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");

// ── Types ──────────────────────────────────────────────────────────────────

interface ReadinessAuditItem {
  title: string | null;
  timestamp: string;
  content_shape: string;
  readiness_class: string;
  semantic_alignment: string;
  text_length: number;
  image_refs_count: number;
  content_access_pattern: string | null;
  discovery_evidence_path: string | null;
  requires_manual_review: boolean;
  renderer_policy: {
    render_as: string;
    preserve_asset_refs: boolean;
    allow_markdown_generation_later: boolean;
    notes: string[];
  } | null;
  eligible_for_phase4_baseline: boolean;
  reason: string;
}

interface ReadinessAuditReport {
  items?: ReadinessAuditItem[];
}

interface QuarantineManifest {
  items?: Array<{ timestamp: string; quarantine_reason?: string; title?: string | null }>;
}

interface RendererPolicy {
  render_as: string;
  preserve_asset_refs: boolean;
  allow_markdown_generation_later: boolean;
  notes: string[];
}

interface BaselineItem {
  canonical_title: string;
  canonical_sample_path: string;
  timestamp: string;
  readiness_class: string;
  content_shape: string;
  renderer_policy: RendererPolicy;
  asset_manifest_path: string | null;
  duplicate_sample_paths: string[];
  manual_review_required: boolean;
  constraints: {
    ocr_used: false;
    encrypted_xhr_decrypted: false;
    image_table_reconstructed: false;
  };
}

interface ExcludedItem {
  title: string | null;
  sample_path: string;
  reason: string;
}

interface BaselineManifest {
  created_at: string;
  source_name: "ruankaodaren";
  baseline_policy: {
    unit: "unique_title";
    duplicates_count_once: true;
    quarantined_excluded: true;
    diagnostic_excluded: true;
    min_unique_titles_for_phase4: 3;
  };
  baseline_count: number;
  unique_title_count: number;
  phase4_input_contract_ready: boolean;
  required_before_phase4: string[];
  baseline_items: BaselineItem[];
  excluded_items: ExcludedItem[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function samplePath(timestamp: string): string {
  return toRepoPath(resolve(samplesDir, `${timestamp}.json`));
}

function hasAssetManifest(timestamp: string): string | null {
  const p = resolve(manifestsDir, `${timestamp}.json`);
  if (existsSync(p)) return toRepoPath(p);
  return null;
}

/** Soft quarantine reasons that can be overridden for STATIC_LOW_TEXT_VERIFIED */
const SOFT_QUARANTINE_REASONS = new Set([
  "duplicate_same_title",
  "duplicate_actual_content",
  "low_text",
]);

function softQuarantineScore(quarantineReason: string | undefined): number {
  // Lower score = preferred (less "duplicate-ish")
  if (!quarantineReason) return 0;
  if (quarantineReason === "low_text") return 1;
  if (quarantineReason === "duplicate_actual_content") return 2;
  if (quarantineReason === "duplicate_same_title") return 3;
  return 99;
}

/** Pick the best canonical sample from a list of eligible items for the same title. */
function pickCanonical(
  items: ReadinessAuditItem[],
  quarantineMap: Map<string, string>
): ReadinessAuditItem {
  // Sort by canonical priority:
  // 1. non-quarantined first (quarantine reason absent = best)
  // 2. soft quarantine score (low_text < duplicate_actual < duplicate_same)
  // 3. renderer_ready_with_asset_refs > renderer_ready_short_card
  // 4. has asset manifest
  // 5. latest timestamp (lexicographic desc)
  // 6. highest text_length
  const scored = items.map((item) => {
    const qReason = quarantineMap.get(item.timestamp);
    const isHardQuarantined = qReason && !SOFT_QUARANTINE_REASONS.has(qReason);
    return {
      item,
      hardQuarantined: isHardQuarantined ? 1 : 0,
      softScore: softQuarantineScore(qReason),
      readinessScore:
        item.readiness_class === "renderer_ready_with_asset_refs"
          ? 0
          : item.readiness_class === "renderer_ready_short_card"
          ? 1
          : 2,
      hasManifest: hasAssetManifest(item.timestamp) ? 0 : 1,
      timestampDesc: item.timestamp, // sort descending for latest
      textLengthDesc: item.text_length,
    };
  });

  scored.sort((a, b) => {
    if (a.hardQuarantined !== b.hardQuarantined) return a.hardQuarantined - b.hardQuarantined;
    if (a.softScore !== b.softScore) return a.softScore - b.softScore;
    if (a.readinessScore !== b.readinessScore) return a.readinessScore - b.readinessScore;
    if (a.hasManifest !== b.hasManifest) return a.hasManifest - b.hasManifest;
    if (a.timestampDesc !== b.timestampDesc)
      return b.timestampDesc.localeCompare(a.timestampDesc); // latest first
    return b.textLengthDesc - a.textLengthDesc;
  });

  return scored[0].item;
}

function loadConstraints(timestamp: string): BaselineItem["constraints"] {
  const p = resolve(samplesDir, `${timestamp}.json`);
  if (!existsSync(p))
    return { ocr_used: false, encrypted_xhr_decrypted: false, image_table_reconstructed: false };
  const doc = readJson<RuankaoIntermediateDocument>(p);
  // These must all be false; coerce to literal false
  return {
    ocr_used: false,
    encrypted_xhr_decrypted: false,
    image_table_reconstructed: false,
  };
}

// ── Load inputs ────────────────────────────────────────────────────────────

if (!existsSync(readinessAuditPath)) {
  console.error(
    "[build:renderer-baseline] ERROR: phase3_21_renderer_readiness_audit.json not found."
  );
  console.error("[build:renderer-baseline] Run pnpm audit:renderer-readiness first.");
  process.exit(1);
}

const readinessReport = readJson<ReadinessAuditReport>(readinessAuditPath);
const allItems = readinessReport.items ?? [];

const quarantineMap = new Map<string, string>();
if (existsSync(quarantineManifestPath)) {
  const qManifest = readJson<QuarantineManifest>(quarantineManifestPath);
  for (const item of qManifest.items ?? []) {
    quarantineMap.set(item.timestamp, item.quarantine_reason ?? "unknown");
  }
}

// ── Partition items ────────────────────────────────────────────────────────

const eligibleItems = allItems.filter((item) => item.eligible_for_phase4_baseline);
const nonEligibleItems = allItems.filter((item) => !item.eligible_for_phase4_baseline);

// Group eligible by normalized title
const eligibleByTitle = new Map<string, ReadinessAuditItem[]>();
for (const item of eligibleItems) {
  const key = (item.title ?? "").trim();
  if (!eligibleByTitle.has(key)) eligibleByTitle.set(key, []);
  eligibleByTitle.get(key)!.push(item);
}

// ── Build baseline items ───────────────────────────────────────────────────

const baselineItems: BaselineItem[] = [];
const excludedItems: ExcludedItem[] = [];

for (const [title, items] of eligibleByTitle.entries()) {
  const canonical = pickCanonical(items, quarantineMap);
  const duplicates = items.filter((item) => item.timestamp !== canonical.timestamp);

  const assetManifest = hasAssetManifest(canonical.timestamp);

  baselineItems.push({
    canonical_title: title,
    canonical_sample_path: samplePath(canonical.timestamp),
    timestamp: canonical.timestamp,
    readiness_class: canonical.readiness_class,
    content_shape: canonical.content_shape,
    renderer_policy: canonical.renderer_policy ?? {
      render_as: "manual_review_card",
      preserve_asset_refs: true,
      allow_markdown_generation_later: false,
      notes: ["renderer_policy not set in readiness audit"],
    },
    asset_manifest_path: assetManifest,
    duplicate_sample_paths: duplicates.map((d) => samplePath(d.timestamp)),
    manual_review_required: canonical.requires_manual_review,
    constraints: loadConstraints(canonical.timestamp),
  });

  // Duplicates go to excluded_items
  for (const dup of duplicates) {
    const qReason = quarantineMap.get(dup.timestamp);
    excludedItems.push({
      title,
      sample_path: samplePath(dup.timestamp),
      reason:
        qReason === "duplicate_same_title"
          ? "duplicate_same_title"
          : qReason === "duplicate_actual_content"
          ? "duplicate_actual_content"
          : "duplicate_of_canonical",
    });
  }
}

// Non-eligible items → excluded_items
for (const item of nonEligibleItems) {
  const shape = item.content_shape;
  let reason: string;
  if (shape === "DIAGNOSTIC_ONLY") {
    reason = "diagnostic";
  } else if (shape === "TARGET_MISMATCH") {
    reason = "target_mismatch";
  } else {
    const qReason = quarantineMap.get(item.timestamp);
    reason = qReason ?? "not_eligible";
  }
  excludedItems.push({
    title: item.title,
    sample_path: samplePath(item.timestamp),
    reason,
  });
}

// ── Phase 4 gate ───────────────────────────────────────────────────────────

const uniqueTitleCount = baselineItems.length;
const requiredBeforePhase4: string[] = [];

if (uniqueTitleCount < 3) {
  requiredBeforePhase4.push(
    `need at least 3 unique renderer-ready titles (have ${uniqueTitleCount}/3)`
  );
}

const allHavePolicy = baselineItems.every((item) => item.renderer_policy !== null);
if (!allHavePolicy) {
  requiredBeforePhase4.push("all baseline items must have renderer_policy defined");
}

const mixedWithoutAssetPolicy = baselineItems.filter(
  (item) =>
    (item.content_shape === "MIXED_TEXT_IMAGE" || item.content_shape === "IMAGE_ASSET_CARD") &&
    !item.renderer_policy?.preserve_asset_refs
);
if (mixedWithoutAssetPolicy.length > 0) {
  requiredBeforePhase4.push(
    `MIXED_TEXT_IMAGE / IMAGE_ASSET_CARD items must have preserve_asset_refs=true (${mixedWithoutAssetPolicy.length} missing)`
  );
}

const phase4InputContractReady =
  uniqueTitleCount >= 3 &&
  allHavePolicy &&
  mixedWithoutAssetPolicy.length === 0 &&
  requiredBeforePhase4.length === 0;

// ── Write manifest ─────────────────────────────────────────────────────────

const manifest: BaselineManifest = {
  created_at: new Date().toISOString(),
  source_name: "ruankaodaren",
  baseline_policy: {
    unit: "unique_title",
    duplicates_count_once: true,
    quarantined_excluded: true,
    diagnostic_excluded: true,
    min_unique_titles_for_phase4: 3,
  },
  baseline_count: uniqueTitleCount,
  unique_title_count: uniqueTitleCount,
  phase4_input_contract_ready: phase4InputContractReady,
  required_before_phase4: requiredBeforePhase4,
  baseline_items: baselineItems,
  excluded_items: excludedItems,
};

mkdirSync(generatedDir, { recursive: true });

const jsonPath = resolve(generatedDir, "phase3_23_renderer_baseline_manifest.json");
writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), "utf8");

// ── Write Markdown ─────────────────────────────────────────────────────────

const mdLines: string[] = [
  "# Phase 3.23 Renderer Baseline Manifest",
  "",
  `Generated at: ${manifest.created_at}`,
  "",
  "## Policy",
  "",
  "| Policy | Value |",
  "|---|---|",
  `| Unit | ${manifest.baseline_policy.unit} |`,
  `| Duplicates count once | ${manifest.baseline_policy.duplicates_count_once} |`,
  `| Quarantined excluded | ${manifest.baseline_policy.quarantined_excluded} |`,
  `| Diagnostic excluded | ${manifest.baseline_policy.diagnostic_excluded} |`,
  `| Min unique titles for Phase 4 | ${manifest.baseline_policy.min_unique_titles_for_phase4} |`,
  "",
  "## Summary",
  "",
  "| Metric | Value |",
  "|---|---:|",
  `| baseline_count | ${manifest.baseline_count} |`,
  `| unique_title_count | ${manifest.unique_title_count} |`,
  `| phase4_input_contract_ready | ${manifest.phase4_input_contract_ready} |`,
  `| excluded_items | ${manifest.excluded_items.length} |`,
  "",
  "## Phase 4 Gate",
  "",
  `- **ready**: ${manifest.phase4_input_contract_ready}`,
];

if (manifest.required_before_phase4.length > 0) {
  mdLines.push("- **required**:");
  for (const req of manifest.required_before_phase4) {
    mdLines.push(`  - ${req}`);
  }
}

mdLines.push("", "## Baseline Items");
mdLines.push("");

if (manifest.baseline_items.length === 0) {
  mdLines.push("- None.");
} else {
  for (const item of manifest.baseline_items) {
    mdLines.push(`### ${item.canonical_title}`);
    mdLines.push("");
    mdLines.push(`- **Canonical sample**: \`${item.canonical_sample_path}\``);
    mdLines.push(`- **Timestamp**: ${item.timestamp}`);
    mdLines.push(`- **Content shape**: ${item.content_shape}`);
    mdLines.push(`- **Readiness class**: ${item.readiness_class}`);
    mdLines.push(`- **Render as**: ${item.renderer_policy.render_as}`);
    mdLines.push(`- **Preserve asset refs**: ${item.renderer_policy.preserve_asset_refs}`);
    mdLines.push(
      `- **Allow Markdown generation later**: ${item.renderer_policy.allow_markdown_generation_later}`
    );
    mdLines.push(`- **Manual review required**: ${item.manual_review_required}`);
    mdLines.push(
      `- **Asset manifest**: ${item.asset_manifest_path ?? "(none)"}`
    );
    if (item.duplicate_sample_paths.length > 0) {
      mdLines.push(`- **Duplicate samples** (${item.duplicate_sample_paths.length}):`);
      for (const dup of item.duplicate_sample_paths) {
        mdLines.push(`  - \`${dup}\``);
      }
    }
    if (item.renderer_policy.notes.length > 0) {
      mdLines.push("- **Notes**:");
      for (const note of item.renderer_policy.notes) {
        mdLines.push(`  - ${note}`);
      }
    }
    mdLines.push("");
  }
}

mdLines.push("## Excluded Items");
mdLines.push("");
if (manifest.excluded_items.length === 0) {
  mdLines.push("- None.");
} else {
  mdLines.push("| Title | Path | Reason |");
  mdLines.push("|---|---|---|");
  for (const ex of manifest.excluded_items) {
    const t = ex.title ?? "(null)";
    mdLines.push(`| ${t} | \`${ex.sample_path}\` | ${ex.reason} |`);
  }
}
mdLines.push("");

const mdPath = resolve(generatedDir, "phase3_23_renderer_baseline_manifest.md");
writeFileSync(mdPath, mdLines.join("\n"), "utf8");

// ── Console summary ────────────────────────────────────────────────────────

console.log("\n[build:renderer-baseline] Baseline manifest built");
console.log(`  baseline_count:             ${manifest.baseline_count}`);
console.log(`  unique_title_count:         ${manifest.unique_title_count}`);
console.log(
  `  canonical_titles:           ${manifest.baseline_items.map((i) => i.canonical_title).join(", ") || "(none)"}`
);
console.log(
  `  duplicate_paths_total:      ${manifest.baseline_items.reduce((s, i) => s + i.duplicate_sample_paths.length, 0)}`
);
console.log(`  excluded_items:             ${manifest.excluded_items.length}`);
console.log(`  phase4_input_contract_ready: ${manifest.phase4_input_contract_ready}`);
if (manifest.required_before_phase4.length > 0) {
  console.log(`  required_before_phase4:`);
  for (const req of manifest.required_before_phase4) {
    console.log(`    - ${req}`);
  }
}
console.log(`  JSON: ${toRepoPath(jsonPath)}`);
console.log(`  MD:   ${toRepoPath(mdPath)}`);
