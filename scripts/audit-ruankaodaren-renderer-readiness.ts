/**
 * Phase 3.21 – Renderer Readiness Threshold Recalibration Audit
 *
 * Reads:
 *   - data/intermediate/ruankaodaren/samples/*.json
 *   - data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json
 *   - verification/generated/phase3_20_detail_interaction_discovery_*.json
 *   - verification/generated/phase3_18_content_rich_probe.json
 *   - verification/generated/phase3_4_sample_quality_audit.json
 *   - verification/generated/phase3_7_semantic_alignment_audit.json
 *
 * Outputs:
 *   - verification/generated/phase3_21_renderer_readiness_audit.json
 *   - verification/generated/phase3_21_renderer_readiness_audit.md
 *
 * HARD CONSTRAINTS: no OCR, no Markdown generation, no decryption, no samples generated.
 *
 * Usage:
 *   pnpm audit:renderer-readiness
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
const semanticAuditPath = resolve(repoRoot, "verification/generated/phase3_7_semantic_alignment_audit.json");
const sampleQualityAuditPath = resolve(repoRoot, "verification/generated/phase3_4_sample_quality_audit.json");

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * Phase 3.21 content shape taxonomy.
 * Extends the legacy "leaf_knowledge_point" / "chapter_overview" shape with
 * more granular categories informed by discovery evidence.
 */
export type ContentShapeV2 =
  | "SHORT_TEXT_CARD"          // short leaf node — may still be valid
  | "HTML_RICH_TEXT"           // rich text with multiple text blocks
  | "MIXED_TEXT_IMAGE"         // text + image_refs
  | "IMAGE_ASSET_CARD"         // image-dominant, minimal text
  | "STATIC_LOW_TEXT_VERIFIED" // low text but discovery confirmed it is the real content
  | "UNSTABLE_OR_INCOMPLETE"   // not yet stable or incomplete
  | "TARGET_MISMATCH"          // title/target mismatch
  | "DIAGNOSTIC_ONLY";         // chapter overview or debug-only artifact

/**
 * Phase 3.21 renderer readiness classes.
 * Replaces the binary ready/not_ready gate with a graduated classification.
 */
export type ReadinessClass =
  | "renderer_ready_text"           // rich text, no special policy
  | "renderer_ready_short_card"     // verified short card, renderer knows to expect brevity
  | "renderer_ready_with_asset_refs" // text + asset refs, preserve links, no OCR
  | "renderer_ready_manual_review"  // plausible but requires human check before rendering
  | "not_ready_target_mismatch"     // title/body mismatch
  | "not_ready_unstable"            // content not yet stable
  | "not_ready_diagnostic"          // chapter or diagnostic artifact
  | "not_ready_quarantined";        // quarantined, blocked

interface RendererPolicy {
  render_as: "concept_card" | "short_card" | "asset_card" | "manual_review_card";
  preserve_asset_refs: boolean;
  allow_markdown_generation_later: boolean;
  notes: string[];
}

export interface ReadinessItem {
  title: string | null;
  timestamp: string;
  content_shape: ContentShapeV2;
  readiness_class: ReadinessClass;
  semantic_alignment: string;
  text_length: number;
  image_refs_count: number;
  content_access_pattern: string | null;
  discovery_evidence_path: string | null;
  requires_manual_review: boolean;
  renderer_policy: RendererPolicy;
  eligible_for_phase4_baseline: boolean;
  reason: string;
}

interface ReadinessAuditReport {
  generated_at: string;
  total_evaluated: number;
  items: ReadinessItem[];
  summary: {
    content_shape_distribution: Record<string, number>;
    readiness_class_distribution: Record<string, number>;
    static_low_text_verified_count: number;
    eligible_for_phase4_baseline_count: number;
    eligible_titles: string[];
    phase4_gate: {
      allowed: boolean;
      reason: string;
      required: string[];
    };
  };
}

interface QuarantineManifest {
  items?: Array<{ timestamp: string; quarantine_reason?: string; title?: string | null }>;
}

interface SemanticAuditSample {
  timestamp: string;
  renderer_eligible?: boolean;
  quarantine_reason?: string | null;
  alignment?: string;
  title?: string | null;
}

interface SemanticAuditReport {
  samples?: SemanticAuditSample[];
}

interface SampleQualityAuditSample {
  identity?: {
    timestamp: string;
    title?: string | null;
  };
  renderer_readiness?: {
    status: string;
  };
  content_volume?: {
    total_text_length: number;
    image_refs_count: number;
    text_blocks_count: number;
  };
}

interface SampleQualityAuditReport {
  samples?: SampleQualityAuditSample[];
}

interface DiscoveryConclusion {
  content_access_pattern: string;
  recommended_next_action: string;
  notes: string;
}

interface DiscoveryReport {
  target: string;
  final_url?: string;
  alternate_container_max_text_length?: number;
  max_text_length_after_clicks?: number;
  conclusion: DiscoveryConclusion;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function readJson<T>(absPath: string): T | null {
  if (!existsSync(absPath)) return null;
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch {
    return null;
  }
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function normalizeTitle(t: string | null | undefined): string {
  return (t ?? "").replace(/\s+/g, "").toLowerCase();
}

function isLeafTitle(t: string | null | undefined): boolean {
  return /^(\d+\.)+\s*\S+/.test(t ?? "");
}

function isChapterTitle(t: string | null | undefined): boolean {
  return /^第\d+章/.test(t ?? "");
}

// ── Load discovery reports keyed by normalized title ───────────────────────

function loadDiscoveryReports(): Map<string, DiscoveryReport & { path: string }> {
  const map = new Map<string, DiscoveryReport & { path: string }>();
  if (!existsSync(generatedDir)) return map;

  const files = readdirSync(generatedDir).filter(
    (f) => f.startsWith("phase3_20_detail_interaction_discovery_") && f.endsWith(".json")
  );

  for (const file of files) {
    const absPath = resolve(generatedDir, file);
    const report = readJson<DiscoveryReport>(absPath);
    if (!report) continue;
    const key = normalizeTitle(report.target);
    map.set(key, { ...report, path: toRepoPath(absPath) });
  }
  return map;
}

// ── Load quarantine map ────────────────────────────────────────────────────

function loadQuarantineMap(): Map<string, string> {
  const map = new Map<string, string>();
  const manifest = readJson<QuarantineManifest>(quarantineManifestPath);
  for (const item of manifest?.items ?? []) {
    map.set(item.timestamp, item.quarantine_reason ?? "unknown");
  }
  return map;
}

// ── Load semantic audit map ────────────────────────────────────────────────

function loadSemanticMap(): Map<string, SemanticAuditSample> {
  const map = new Map<string, SemanticAuditSample>();
  const report = readJson<SemanticAuditReport>(semanticAuditPath);
  for (const item of report?.samples ?? []) {
    map.set(item.timestamp, item);
  }
  return map;
}

// ── Decide content shape ───────────────────────────────────────────────────

function decideContentShape(
  doc: RuankaoIntermediateDocument,
  quarantined: boolean,
  discoveryReport: DiscoveryReport | null,
  semanticItem: SemanticAuditSample | null
): ContentShapeV2 {
  const title = doc.content?.title ?? null;
  const textLength = (doc.content?.text_blocks ?? []).map((b) => b.text.length).reduce((s, l) => s + l, 0);
  const imageRefs = doc.content?.image_refs?.length ?? 0;
  const textBlocks = doc.content?.text_blocks?.length ?? 0;

  if (isChapterTitle(title)) return "DIAGNOSTIC_ONLY";
  if (!isLeafTitle(title) && !title) return "DIAGNOSTIC_ONLY";

  if (
    semanticItem?.renderer_eligible === false &&
    (semanticItem.quarantine_reason === "target_body_mismatch" ||
      semanticItem.quarantine_reason === "title_mismatch")
  ) {
    return "TARGET_MISMATCH";
  }

  if (quarantined) {
    // Could still be classified by content
  }

  if (
    discoveryReport?.conclusion.content_access_pattern === "static_low_text" &&
    textLength < 120 &&
    imageRefs === 0
  ) {
    return "STATIC_LOW_TEXT_VERIFIED";
  }

  if (imageRefs > 0 && textBlocks > 0) return "MIXED_TEXT_IMAGE";
  if (imageRefs > 0 && textBlocks === 0) return "IMAGE_ASSET_CARD";
  if (textLength >= 120 && textBlocks >= 2) return "HTML_RICH_TEXT";
  if (textLength > 0 && textLength < 120) return "SHORT_TEXT_CARD";
  if (textLength === 0) return "UNSTABLE_OR_INCOMPLETE";

  return "HTML_RICH_TEXT";
}

// ── Decide readiness class ─────────────────────────────────────────────────

function decideReadiness(
  shape: ContentShapeV2,
  doc: RuankaoIntermediateDocument,
  quarantined: boolean,
  semanticItem: SemanticAuditSample | null,
  discoveryReport: DiscoveryReport | null,
  quarantineReason?: string | null
): { readiness_class: ReadinessClass; reason: string; eligible: boolean } {
  const title = doc.content?.title ?? null;
  const textLength = (doc.content?.text_blocks ?? []).map((b) => b.text.length).reduce((s, l) => s + l, 0);
  const imageRefs = doc.content?.image_refs?.length ?? 0;
  const constraintViolations: string[] = [];
  if (doc.constraints?.ocr_used !== false) constraintViolations.push("ocr_used");
  if (doc.constraints?.encrypted_xhr_decrypted !== false) constraintViolations.push("encrypted_xhr_decrypted");
  if (doc.constraints?.image_table_reconstructed !== false) constraintViolations.push("image_table_reconstructed");
  if (doc.constraints?.markdown_generated !== false) constraintViolations.push("markdown_generated");

  // Rule A: quarantine always wins — except for STATIC_LOW_TEXT_VERIFIED with soft quarantine reasons
  if (quarantined) {
    const isSoftQuarantine =
      quarantineReason === "duplicate_same_title" ||
      quarantineReason === "duplicate_actual_content" ||
      quarantineReason === "low_text";
    // Phase 3.22: allow discovery-verified static low-text through soft quarantine
    const isStaticLowTextException =
      isSoftQuarantine &&
      shape === "STATIC_LOW_TEXT_VERIFIED";
    if (!isStaticLowTextException) {
      return {
        readiness_class: "not_ready_quarantined",
        reason: "quarantined by quarantine-manifest",
        eligible: false,
      };
    }
    // STATIC_LOW_TEXT_VERIFIED with soft quarantine: continue to shape-based decision
  }

  if (constraintViolations.length > 0) {
    return {
      readiness_class: "not_ready_quarantined",
      reason: `constraint violations: ${constraintViolations.join(", ")}`,
      eligible: false,
    };
  }

  // Rule B: diagnostic/chapter
  if (shape === "DIAGNOSTIC_ONLY") {
    return {
      readiness_class: "not_ready_diagnostic",
      reason: "chapter overview or diagnostic artifact, not a leaf knowledge point",
      eligible: false,
    };
  }

  // Rule C: target mismatch
  if (shape === "TARGET_MISMATCH") {
    return {
      readiness_class: "not_ready_target_mismatch",
      reason: "semantic alignment mismatch",
      eligible: false,
    };
  }

  // Check semantic alignment
  const semanticAligned =
    !semanticItem || semanticItem.renderer_eligible === true || semanticItem.renderer_eligible === null;

  if (semanticItem && semanticItem.renderer_eligible === false) {
    // If semantic audit says not eligible, check if it's because of mismatch
    const reason = semanticItem.quarantine_reason ?? "semantic_not_eligible";
    if (reason === "target_body_mismatch" || reason === "title_mismatch") {
      return {
        readiness_class: "not_ready_target_mismatch",
        reason: `semantic audit: ${reason}`,
        eligible: false,
      };
    }
    // Phase 3.21/3.22: low_text or duplicate_same_title is no longer automatically not_ready
    // if discovery confirms static_low_text
    if (
      reason === "low_text" ||
      reason === "duplicate_same_title" ||
      reason === "duplicate_actual_content"
    ) {
      if (
        shape === "STATIC_LOW_TEXT_VERIFIED" &&
        discoveryReport?.conclusion.content_access_pattern === "static_low_text" &&
        isLeafTitle(title)
      ) {
        // Allow it through as short card — needs manual review
        return {
          readiness_class: "renderer_ready_short_card",
          reason:
            "Phase 3.21/3.22: static_low_text confirmed by discovery; semantic soft-quarantine override lifted for verified short cards",
          eligible: true,
        };
      }
    }
    // Other semantic non-eligible
    return {
      readiness_class: "not_ready_unstable",
      reason: `semantic audit not eligible: ${reason}`,
      eligible: false,
    };
  }

  // Rule D: unstable/incomplete
  if (shape === "UNSTABLE_OR_INCOMPLETE") {
    return {
      readiness_class: "not_ready_unstable",
      reason: "text_length = 0, content appears incomplete",
      eligible: false,
    };
  }

  // Rule E: MIXED_TEXT_IMAGE — preserve asset refs, no OCR
  if (shape === "MIXED_TEXT_IMAGE") {
    if (semanticAligned) {
      return {
        readiness_class: "renderer_ready_with_asset_refs",
        reason: "leaf knowledge point with text blocks and image_refs; asset refs must be preserved, no OCR",
        eligible: true,
      };
    }
    return {
      readiness_class: "renderer_ready_manual_review",
      reason: "MIXED_TEXT_IMAGE but semantic alignment uncertain; manual review required",
      eligible: false,
    };
  }

  // Rule F: IMAGE_ASSET_CARD — needs asset policy
  if (shape === "IMAGE_ASSET_CARD") {
    return {
      readiness_class: "renderer_ready_manual_review",
      reason: "image-dominant content; asset policy required, no OCR",
      eligible: false,
    };
  }

  // Rule G: STATIC_LOW_TEXT_VERIFIED with discovery evidence
  if (shape === "STATIC_LOW_TEXT_VERIFIED") {
    if (
      discoveryReport !== null &&
      discoveryReport.conclusion.content_access_pattern === "static_low_text" &&
      semanticAligned &&
      isLeafTitle(title)
    ) {
      return {
        readiness_class: "renderer_ready_short_card",
        reason:
          `Phase 3.21: discovery confirms static_low_text (no secondary interaction, ` +
          `alt container max=${discoveryReport.alternate_container_max_text_length ?? 0}); ` +
          `short card is valid renderer baseline`,
        eligible: true,
      };
    }
    // No discovery evidence
    return {
      readiness_class: "not_ready_unstable",
      reason:
        "low text without Phase 3.20 discovery evidence; cannot confirm content_access_pattern",
      eligible: false,
    };
  }

  // Rule H: SHORT_TEXT_CARD without discovery
  if (shape === "SHORT_TEXT_CARD") {
    if (
      discoveryReport !== null &&
      discoveryReport.conclusion.content_access_pattern === "static_low_text"
    ) {
      return {
        readiness_class: "renderer_ready_short_card",
        reason:
          "discovery confirms content is genuinely short; eligible as short card with manual review",
        eligible: semanticAligned,
      };
    }
    return {
      readiness_class: "not_ready_unstable",
      reason: "short text without discovery confirmation; may be incomplete",
      eligible: false,
    };
  }

  // Rule I: rich text
  if (shape === "HTML_RICH_TEXT") {
    if (textLength >= 120 && semanticAligned) {
      return {
        readiness_class: "renderer_ready_text",
        reason: `HTML_RICH_TEXT with text_length=${textLength} and semantic alignment`,
        eligible: true,
      };
    }
    if (textLength >= 80 && imageRefs === 0) {
      return {
        readiness_class: "renderer_ready_manual_review",
        reason: `HTML_RICH_TEXT with text_length=${textLength} but below 120 threshold; manual review`,
        eligible: false,
      };
    }
    return {
      readiness_class: "not_ready_unstable",
      reason: `HTML_RICH_TEXT but text_length=${textLength} is insufficient`,
      eligible: false,
    };
  }

  return {
    readiness_class: "not_ready_unstable",
    reason: `unclassified shape=${shape}`,
    eligible: false,
  };
}

function buildRendererPolicy(
  shape: ContentShapeV2,
  readiness: ReadinessClass,
  imageRefsCount: number
): RendererPolicy {
  const noRender: RendererPolicy = {
    render_as: "manual_review_card",
    preserve_asset_refs: true,
    allow_markdown_generation_later: false,
    notes: ["blocked from rendering until readiness class is elevated"],
  };

  if (readiness === "not_ready_quarantined" || readiness === "not_ready_target_mismatch" ||
    readiness === "not_ready_diagnostic" || readiness === "not_ready_unstable") {
    return noRender;
  }

  if (readiness === "renderer_ready_with_asset_refs") {
    return {
      render_as: "asset_card",
      preserve_asset_refs: true,
      allow_markdown_generation_later: true,
      notes: [
        "asset refs must be preserved as links",
        "no OCR on image content",
        "no image table reconstruction",
      ],
    };
  }

  if (readiness === "renderer_ready_short_card") {
    return {
      render_as: "short_card",
      preserve_asset_refs: imageRefsCount > 0,
      allow_markdown_generation_later: true,
      notes: [
        "content is genuinely short — do not inflate or pad",
        "Phase 3.20 discovery confirmed static_low_text pattern",
        "manual human review recommended before publishing",
      ],
    };
  }

  if (readiness === "renderer_ready_manual_review") {
    return {
      render_as: "manual_review_card",
      preserve_asset_refs: imageRefsCount > 0,
      allow_markdown_generation_later: false,
      notes: ["requires human review before renderer baseline confirmation"],
    };
  }

  // renderer_ready_text
  return {
    render_as: "concept_card",
    preserve_asset_refs: imageRefsCount > 0,
    allow_markdown_generation_later: true,
    notes: ["standard concept card rendering", "do not rewrite exam content"],
  };
}

// ── Main audit logic ───────────────────────────────────────────────────────

function evaluateSample(
  fileName: string,
  quarantineMap: Map<string, string>,
  semanticMap: Map<string, SemanticAuditSample>,
  discoveryByTitle: Map<string, DiscoveryReport & { path: string }>
): ReadinessItem {
  const absPath = resolve(samplesDir, fileName);
  const doc = readJson<RuankaoIntermediateDocument>(absPath);
  if (!doc) {
    const ts = fileName.replace(".json", "");
    return {
      title: null,
      timestamp: ts,
      content_shape: "UNSTABLE_OR_INCOMPLETE",
      readiness_class: "not_ready_unstable",
      semantic_alignment: "unknown",
      text_length: 0,
      image_refs_count: 0,
      content_access_pattern: null,
      discovery_evidence_path: null,
      requires_manual_review: true,
      renderer_policy: {
        render_as: "manual_review_card",
        preserve_asset_refs: false,
        allow_markdown_generation_later: false,
        notes: ["failed to parse sample JSON"],
      },
      eligible_for_phase4_baseline: false,
      reason: "failed to parse sample JSON",
    };
  }

  const ts = doc.source?.timestamp ?? fileName.replace(".json", "");
  const title = doc.content?.title ?? null;
  const quarantined = quarantineMap.has(ts);
  const semanticItem = semanticMap.get(ts) ?? null;
  const textLength = (doc.content?.text_blocks ?? []).map((b) => b.text.length).reduce((s, l) => s + l, 0);
  const imageRefsCount = doc.content?.image_refs?.length ?? 0;

  // Find discovery report by title
  const titleKey = normalizeTitle(title);
  const discoveryReport = discoveryByTitle.get(titleKey) ?? null;

  // Semantic alignment label
  let semanticAlignment = "unknown";
  if (semanticItem) {
    if (semanticItem.renderer_eligible === true) semanticAlignment = "matched";
    else if (semanticItem.quarantine_reason === "low_text") semanticAlignment = "likely_matched_low_text";
    else if (semanticItem.quarantine_reason === "target_body_mismatch") semanticAlignment = "mismatch";
    else semanticAlignment = `not_eligible:${semanticItem.quarantine_reason ?? "unknown"}`;
  }

  const shape = decideContentShape(doc, quarantined, discoveryReport, semanticItem);
  const { readiness_class, reason, eligible } = decideReadiness(
    shape, doc, quarantined, semanticItem, discoveryReport, quarantineMap.get(ts) ?? null
  );
  const rendererPolicy = buildRendererPolicy(shape, readiness_class, imageRefsCount);

  return {
    title,
    timestamp: ts,
    content_shape: shape,
    readiness_class,
    semantic_alignment: semanticAlignment,
    text_length: textLength,
    image_refs_count: imageRefsCount,
    content_access_pattern: discoveryReport?.conclusion.content_access_pattern ?? null,
    discovery_evidence_path: discoveryReport?.path ?? null,
    requires_manual_review:
      readiness_class === "renderer_ready_manual_review" ||
      readiness_class === "renderer_ready_short_card" ||
      doc.classification?.requires_manual_review === true,
    renderer_policy: rendererPolicy,
    eligible_for_phase4_baseline: eligible,
    reason,
  };
}

function buildGate(items: ReadinessItem[]): ReadinessAuditReport["summary"]["phase4_gate"] {
  const eligible = items.filter((i) => i.eligible_for_phase4_baseline);
  const uniqueTitles = new Set(eligible.map((i) => i.title).filter((t): t is string => t !== null));
  const constraintViolated = items.some((i) => i.readiness_class === "not_ready_quarantined" && i.reason.includes("constraint"));
  const allEligibleHavePolicy = eligible.every((i) => i.renderer_policy !== null);

  const required: string[] = [];
  if (eligible.length < 3) required.push(`need at least 3 phase4-eligible samples (have ${eligible.length}/3)`);
  if (uniqueTitles.size < 3) required.push(`need at least 3 unique eligible titles (have ${uniqueTitles.size}/3)`);
  if (constraintViolated) required.push("fix constraint violations");
  if (!allEligibleHavePolicy) required.push("define renderer_policy for every eligible sample");

  const mixedWithoutAssetPolicy = eligible.filter(
    (i) => i.content_shape === "MIXED_TEXT_IMAGE" && !i.renderer_policy.preserve_asset_refs
  );
  if (mixedWithoutAssetPolicy.length > 0) {
    required.push("MIXED_TEXT_IMAGE samples must have preserve_asset_refs = true");
  }

  const allowed =
    required.length === 0 &&
    eligible.length >= 3 &&
    uniqueTitles.size >= 3 &&
    !constraintViolated &&
    allEligibleHavePolicy;

  return {
    allowed,
    reason: allowed
      ? "Phase 4 renderer design gate passed: sufficient eligible samples with renderer policies."
      : "Phase 4 renderer design gate blocked.",
    required,
  };
}

function main(): void {
  if (!existsSync(samplesDir)) {
    console.error("[audit:renderer-readiness] ERROR: samples directory not found:", samplesDir);
    process.exit(1);
  }

  const sampleFiles = readdirSync(samplesDir)
    .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
    .sort();

  if (sampleFiles.length === 0) {
    console.error("[audit:renderer-readiness] ERROR: no sample JSON files found.");
    process.exit(1);
  }

  const quarantineMap = loadQuarantineMap();
  const semanticMap = loadSemanticMap();
  const discoveryByTitle = loadDiscoveryReports();

  console.log(`[audit:renderer-readiness] Loaded ${discoveryByTitle.size} discovery report(s)`);

  const items = sampleFiles.map((f) => evaluateSample(f, quarantineMap, semanticMap, discoveryByTitle));

  // Build distributions
  const shapeDist: Record<string, number> = {};
  const readinessDist: Record<string, number> = {};
  for (const item of items) {
    shapeDist[item.content_shape] = (shapeDist[item.content_shape] ?? 0) + 1;
    readinessDist[item.readiness_class] = (readinessDist[item.readiness_class] ?? 0) + 1;
  }

  const staticLowTextVerifiedCount = items.filter((i) => i.content_shape === "STATIC_LOW_TEXT_VERIFIED").length;
  const eligible = items.filter((i) => i.eligible_for_phase4_baseline);
  const eligibleTitles = eligible.map((i) => i.title).filter((t): t is string => t !== null);

  const gate = buildGate(items);

  const report: ReadinessAuditReport = {
    generated_at: new Date().toISOString(),
    total_evaluated: items.length,
    items,
    summary: {
      content_shape_distribution: shapeDist,
      readiness_class_distribution: readinessDist,
      static_low_text_verified_count: staticLowTextVerifiedCount,
      eligible_for_phase4_baseline_count: eligible.length,
      eligible_titles: eligibleTitles,
      phase4_gate: gate,
    },
  };

  mkdirSync(generatedDir, { recursive: true });

  const jsonPath = resolve(generatedDir, "phase3_21_renderer_readiness_audit.json");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  // Write Markdown
  const mdPath = resolve(generatedDir, "phase3_21_renderer_readiness_audit.md");
  const mdLines: string[] = [
    "# Phase 3.21 Renderer Readiness Audit",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| total_evaluated | ${report.total_evaluated} |`,
    `| static_low_text_verified | ${report.summary.static_low_text_verified_count} |`,
    `| eligible_for_phase4_baseline | ${report.summary.eligible_for_phase4_baseline_count} |`,
    `| phase4_gate_allowed | ${report.summary.phase4_gate.allowed} |`,
    "",
    "## Content Shape Distribution",
    "",
    "| Shape | Count |",
    "|---|---:|",
    ...Object.entries(shapeDist).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Readiness Class Distribution",
    "",
    "| Readiness Class | Count |",
    "|---|---:|",
    ...Object.entries(readinessDist).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Phase 4 Gate",
    "",
    `- **allowed**: ${gate.allowed}`,
    `- **reason**: ${gate.reason}`,
    "- **required**:",
    ...(gate.required.length === 0 ? ["  - (none)"] : gate.required.map((r) => `  - ${r}`)),
    "",
    "## Eligible Titles",
    "",
    ...(eligibleTitles.length === 0 ? ["- None."] : eligibleTitles.map((t) => `- ${t}`)),
    "",
    "## Item Details",
    "",
    "| Title | Shape | Readiness | Text | imgs | Discovery | Eligible |",
    "|---|---|---|---:|---:|---|---|",
    ...items.map(
      (i) =>
        `| ${i.title ?? "(null)"} | ${i.content_shape} | ${i.readiness_class} | ${i.text_length} | ${i.image_refs_count} | ${i.content_access_pattern ?? "-"} | ${i.eligible_for_phase4_baseline} |`
    ),
    "",
    "## Constraints",
    "",
    "- No OCR used.",
    "- No encrypt=1 decrypted.",
    "- No Markdown knowledge docs generated.",
    "- No image tables reconstructed.",
    "- No samples generated.",
    "- No Phase 4 implementation entered.",
    "",
  ];
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  // Console output
  console.log("[audit:renderer-readiness] Renderer readiness audit complete");
  console.log(`  total_evaluated:               ${report.total_evaluated}`);
  console.log(`  static_low_text_verified:      ${report.summary.static_low_text_verified_count}`);
  console.log(`  eligible_for_phase4_baseline:  ${report.summary.eligible_for_phase4_baseline_count}`);
  console.log(`  eligible_titles:               ${eligibleTitles.join(", ") || "(none)"}`);
  console.log(`  phase4_gate_allowed:           ${gate.allowed}`);
  if (gate.required.length > 0) {
    console.log(`  required_before_phase4:        ${gate.required.join("; ")}`);
  }
  console.log("  content_shape_distribution:");
  for (const [k, v] of Object.entries(shapeDist)) console.log(`    ${k}: ${v}`);
  console.log("  readiness_class_distribution:");
  for (const [k, v] of Object.entries(readinessDist)) console.log(`    ${k}: ${v}`);
  console.log(`  JSON: ${toRepoPath(jsonPath)}`);
  console.log(`  MD:   ${toRepoPath(mdPath)}`);
}

main();
