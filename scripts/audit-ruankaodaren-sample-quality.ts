/**
 * Phase 3.4: sample quality audit and renderer readiness gate.
 *
 * Read-only audit over intermediate JSON samples and asset manifests.
 * This script does not generate knowledge Markdown, does not OCR images,
 * does not decrypt encrypt=1 data, and does not reconstruct image tables.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";
import type { RuankaoAssetManifest } from "../packages/domain-types/ruankaodaren-asset-manifest.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const manifestsDir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");
const generatedDir = resolve(repoRoot, "verification/generated");
const quarantineManifestPath = resolve(
  repoRoot,
  "data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json"
);
const semanticAuditPath = resolve(repoRoot, "verification/generated/phase3_7_semantic_alignment_audit.json");

type ContentShape = "leaf_knowledge_point" | "chapter_overview" | "mixed" | "unknown";
type TargetAlignment = "exact" | "related" | "mismatch" | "missing";
type RendererReadiness =
  | "ready"
  | "ready_with_asset_refs"
  | "not_ready_chapter_level"
  | "not_ready_low_text"
  | "not_ready_quarantined"
  | "not_ready_target_mismatch"
  | "not_ready_unknown";

interface QuarantineItem {
  sample_path: string;
  timestamp: string;
  title: string | null;
  target_node_text: string;
  detected_body_signals: string[];
  quarantine_reason: string;
  excluded_from_renderer_baseline: true;
}

interface QuarantineManifest {
  items?: QuarantineItem[];
}

interface SemanticAuditItem {
  timestamp: string;
  renderer_eligible?: boolean;
  quarantine_reason?: string | null;
}

interface SemanticAuditReport {
  samples?: SemanticAuditItem[];
}

interface SampleAudit {
  identity: {
    timestamp: string;
    title: string | null;
    final_url: string;
    target_node_text: string;
    detail_entry_strategy: string;
    detail_entry_route_changed: boolean;
    classification: string;
    parser_confidence: string;
    requires_manual_review: boolean;
  };
  content_volume: {
    text_blocks_count: number;
    key_terms_count: number;
    image_refs_count: number;
    html_fragments_count: number;
    total_text_length: number;
    longest_text_block_length: number;
    risks: string[];
  };
  target_alignment: {
    title_vs_target: TargetAlignment;
    content_mentions_title_signal: boolean;
    final_url_contains_konwledgeInfo: boolean;
    detail_strategy_allowed: boolean;
    chapter_level_sample: boolean;
    high_risk: boolean;
    risks: string[];
  };
  content_shape: ContentShape;
  asset_integrity: {
    manifest_present: boolean;
    manifest_path: string | null;
    image_refs_count: number;
    manifest_asset_count: number | null;
    asset_count_matches_image_refs: boolean | null;
    downloaded_assets_count: number;
    downloaded_assets_exist: boolean;
    image_refs_require_manual_review: boolean;
    risks: string[];
  };
  renderer_readiness: {
    status: RendererReadiness;
    reasons: string[];
    renderer_policy: string | null;
  };
  quarantine: {
    quarantined: boolean;
    quarantine_reason: string | null;
    excluded_from_renderer_baseline: boolean;
  };
  semantic_audit: {
    available: boolean;
    renderer_eligible: boolean | null;
  };
  constraint_violations: string[];
}

interface AuditReport {
  generated_at: string;
  sample_count: number;
  samples: SampleAudit[];
  summary: {
    leaf_knowledge_point_count: number;
    chapter_overview_count: number;
    mixed_count: number;
    unknown_count: number;
    ready_count: number;
    ready_with_asset_refs_count: number;
    not_ready_count: number;
    readiness_distribution: Record<string, number>;
    constraint_violations_total: number;
    quarantined_count: number;
    renderer_eligible_leaf_count: number;
  };
  overall_gate: {
    phase4_renderer_allowed: boolean;
    reason: string;
    required_before_phase4: string[];
  };
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function loadManifest(timestamp: string): { path: string; manifest: RuankaoAssetManifest } | null {
  const absPath = resolve(manifestsDir, `${timestamp}.json`);
  if (!existsSync(absPath)) return null;
  return { path: absPath, manifest: readJson<RuankaoAssetManifest>(absPath) };
}

function loadQuarantineItems(): Map<string, QuarantineItem> {
  const itemsByTimestamp = new Map<string, QuarantineItem>();
  if (!existsSync(quarantineManifestPath)) return itemsByTimestamp;

  const manifest = readJson<QuarantineManifest>(quarantineManifestPath);
  for (const item of manifest.items ?? []) {
    itemsByTimestamp.set(item.timestamp, item);
  }

  return itemsByTimestamp;
}

function loadSemanticAuditItems(): Map<string, SemanticAuditItem> {
  const itemsByTimestamp = new Map<string, SemanticAuditItem>();
  if (!existsSync(semanticAuditPath)) return itemsByTimestamp;

  const report = readJson<SemanticAuditReport>(semanticAuditPath);
  for (const item of report.samples ?? []) {
    itemsByTimestamp.set(item.timestamp, item);
  }

  return itemsByTimestamp;
}

function normalizeText(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, "").trim();
}

function isChapterTitle(title: string | null | undefined): boolean {
  return /^第\d+章/.test(title ?? "");
}

function isLeafTitle(title: string | null | undefined): boolean {
  return /^(\d+\.)+\s*\S+/.test(title ?? "");
}

function titleAlignment(title: string | null, target: string): TargetAlignment {
  const normalizedTitle = normalizeText(title);
  const normalizedTarget = normalizeText(target);
  if (!normalizedTitle || !normalizedTarget) return "missing";
  if (normalizedTitle === normalizedTarget) return "exact";

  const titleNumber = normalizedTitle.match(/^(\d+(?:\.\d+)+)/)?.[1];
  const targetNumber = normalizedTarget.match(/^(\d+(?:\.\d+)+)/)?.[1];
  if (titleNumber && targetNumber && titleNumber === targetNumber) return "related";

  const shorter = normalizedTitle.length < normalizedTarget.length ? normalizedTitle : normalizedTarget;
  const longer = normalizedTitle.length < normalizedTarget.length ? normalizedTarget : normalizedTitle;
  if (shorter.length >= 4 && longer.includes(shorter)) return "related";
  return "mismatch";
}

function titleSignalTerms(title: string | null | undefined): string[] {
  const withoutNumber = (title ?? "").replace(/^\d+(?:\.\d+)+\s*/, "").trim();
  if (!withoutNumber) return [];
  const withoutWeakSuffix = withoutNumber.replace(/(常识|基础|知识|系统|技术|处理|设计)$/, "");

  const rawTerms = [
    withoutNumber,
    withoutWeakSuffix,
    ...withoutNumber.split(/[的和与及、，,：:（）()]/),
    ...(withoutNumber.match(/[A-Za-z0-9-]{2,}/g) ?? []),
    ...(withoutNumber.match(/\p{Script=Han}{2,}/gu) ?? []),
  ];

  const weakTerms = new Set(["系统", "技术", "处理", "设计", "常识", "基础", "知识"]);
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const rawTerm of rawTerms) {
    const term = normalizeText(rawTerm).toLowerCase();
    if (term.length < 2 || weakTerms.has(term) || seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }

  return terms;
}

function contentMentionsTitleSignal(doc: RuankaoIntermediateDocument): boolean {
  const title = doc.content?.title ?? null;
  if (!isLeafTitle(title)) return true;

  const terms = titleSignalTerms(title);
  if (terms.length === 0) return true;

  const contentText = normalizeText(
    [
      ...(doc.content?.text_blocks ?? []).map((block) => block.text),
      ...(doc.content?.key_terms ?? []).map((term) => term.text),
    ].join("\n")
  ).toLowerCase();

  return terms.some((term) => contentText.includes(term));
}

function classifyShape(doc: RuankaoIntermediateDocument): ContentShape {
  const title = doc.content?.title ?? null;
  if (isChapterTitle(title)) return "chapter_overview";
  if (isLeafTitle(title)) return "leaf_knowledge_point";

  const hasImages = (doc.content?.image_refs?.length ?? 0) > 0;
  const hasText = (doc.content?.text_blocks?.length ?? 0) > 0;
  if (hasImages && hasText) return "mixed";
  return "unknown";
}

function checkConstraints(doc: RuankaoIntermediateDocument): string[] {
  const violations: string[] = [];
  if (doc.constraints?.ocr_used !== false) violations.push("ocr_used !== false");
  if (doc.constraints?.encrypted_xhr_decrypted !== false) violations.push("encrypted_xhr_decrypted !== false");
  if (doc.constraints?.image_table_reconstructed !== false) violations.push("image_table_reconstructed !== false");
  if (doc.constraints?.markdown_generated !== false) violations.push("markdown_generated !== false");
  return violations;
}

function hasObviousTermStructure(doc: RuankaoIntermediateDocument): boolean {
  const combinedText = (doc.content?.text_blocks ?? []).map((block) => block.text).join("\n");
  const combinedHtml = (doc.content?.html_fragments ?? []).map((fragment) => fragment.outer_html).join("\n");
  return /[:：]/.test(combinedText) || /<(strong|em)\b/i.test(combinedHtml);
}

function auditContentVolume(doc: RuankaoIntermediateDocument): SampleAudit["content_volume"] {
  const textBlocks = doc.content?.text_blocks ?? [];
  const textLengths = textBlocks.map((block) => block.text.length);
  const totalTextLength = textLengths.reduce((sum, length) => sum + length, 0);
  const longestTextBlockLength = textLengths.length > 0 ? Math.max(...textLengths) : 0;
  const risks: string[] = [];

  if (textBlocks.length === 0) risks.push("text_blocks = 0");
  if (totalTextLength < 80 && (doc.content?.image_refs?.length ?? 0) === 0) {
    risks.push("total text length < 80 and image_refs = 0");
  }
  if (!doc.content?.title) risks.push("title missing");
  if ((doc.content?.key_terms?.length ?? 0) === 0 && hasObviousTermStructure(doc)) {
    risks.push("key_terms = 0 despite obvious term structure");
  }

  return {
    text_blocks_count: textBlocks.length,
    key_terms_count: doc.content?.key_terms?.length ?? 0,
    image_refs_count: doc.content?.image_refs?.length ?? 0,
    html_fragments_count: doc.content?.html_fragments?.length ?? 0,
    total_text_length: totalTextLength,
    longest_text_block_length: longestTextBlockLength,
    risks,
  };
}

function auditTargetAlignment(doc: RuankaoIntermediateDocument): SampleAudit["target_alignment"] {
  const title = doc.content?.title ?? null;
  const target = doc.navigation_context?.target_node_text ?? "";
  const strategy = String(doc.navigation_context?.detail_entry_strategy ?? "unknown");
  const titleVsTarget = titleAlignment(title, target);
  const contentMentionsTitle = contentMentionsTitleSignal(doc);
  const finalUrlContains = (doc.navigation_context?.final_url ?? "").includes("konwledgeInfo");
  const detailStrategyAllowed = strategy === "target_scoped" || strategy === "nearby_sibling";
  const chapterLevelSample = isChapterTitle(title);
  const risks: string[] = [];

  if (!finalUrlContains) risks.push("final_url does not contain konwledgeInfo");
  if (!detailStrategyAllowed) risks.push(`detail_entry_strategy is ${strategy}`);
  if (strategy === "global_fallback") risks.push("global_fallback detail entry is high risk");
  if (titleVsTarget === "mismatch" || titleVsTarget === "missing") risks.push(`title_vs_target = ${titleVsTarget}`);
  if (isLeafTitle(title) && !contentMentionsTitle) {
    risks.push("content body does not contain a meaningful title signal");
  }
  if (chapterLevelSample) risks.push("chapter-level title should not be treated as a leaf knowledge point");

  return {
    title_vs_target: titleVsTarget,
    content_mentions_title_signal: contentMentionsTitle,
    final_url_contains_konwledgeInfo: finalUrlContains,
    detail_strategy_allowed: detailStrategyAllowed,
    chapter_level_sample: chapterLevelSample,
    high_risk:
      strategy === "global_fallback" ||
      titleVsTarget === "mismatch" ||
      chapterLevelSample ||
      (isLeafTitle(title) && !contentMentionsTitle),
    risks,
  };
}

function auditAssetIntegrity(
  doc: RuankaoIntermediateDocument,
  timestamp: string
): SampleAudit["asset_integrity"] {
  const imageRefs = doc.content?.image_refs ?? [];
  const manifestResult = loadManifest(timestamp);
  const manifest = manifestResult?.manifest ?? null;
  const assets = manifest?.assets ?? [];
  const risks: string[] = [];
  const imageRefsRequireManualReview = imageRefs.every((ref) => ref.requires_manual_review === true);

  if (imageRefs.length > 0 && !manifest) risks.push("image_refs exist but asset manifest is missing");
  if (manifest && manifest.asset_count !== imageRefs.length) {
    risks.push(`manifest asset_count ${manifest.asset_count} does not match image_refs ${imageRefs.length}`);
  }
  if (imageRefs.length > 0 && !imageRefsRequireManualReview) {
    risks.push("one or more image_refs are missing requires_manual_review=true");
  }

  const downloadedAssets = assets.filter((asset) => asset.asset_status === "downloaded");
  const downloadedAssetsExist = downloadedAssets.every((asset) => {
    if (!asset.saved_path) return false;
    return existsSync(resolve(repoRoot, asset.saved_path));
  });
  if (downloadedAssets.length > 0 && !downloadedAssetsExist) {
    risks.push("one or more downloaded assets are missing on disk");
  }

  return {
    manifest_present: manifest !== null,
    manifest_path: toRepoPath(manifestResult?.path ?? null),
    image_refs_count: imageRefs.length,
    manifest_asset_count: manifest?.asset_count ?? null,
    asset_count_matches_image_refs: manifest ? manifest.asset_count === imageRefs.length : null,
    downloaded_assets_count: downloadedAssets.length,
    downloaded_assets_exist: downloadedAssets.length === 0 ? true : downloadedAssetsExist,
    image_refs_require_manual_review: imageRefsRequireManualReview,
    risks,
  };
}

function decideReadiness(
  doc: RuankaoIntermediateDocument,
  shape: ContentShape,
  volume: SampleAudit["content_volume"],
  alignment: SampleAudit["target_alignment"],
  constraintViolations: string[],
  quarantineItem: QuarantineItem | null
): SampleAudit["renderer_readiness"] {
  const reasons: string[] = [];
  const imageRefsCount = doc.content?.image_refs?.length ?? 0;

  if (quarantineItem) {
    return {
      status: "not_ready_quarantined",
      reasons: [`quarantined: ${quarantineItem.quarantine_reason}`],
      renderer_policy: null,
    };
  }

  if (constraintViolations.length > 0) {
    return {
      status: "not_ready_unknown",
      reasons: [`constraint violations: ${constraintViolations.join(", ")}`],
      renderer_policy: null,
    };
  }

  if (String(doc.navigation_context?.detail_entry_strategy ?? "unknown") === "global_fallback") {
    return {
      status: "not_ready_target_mismatch",
      reasons: ["detail_entry_strategy = global_fallback"],
      renderer_policy: null,
    };
  }

  if (alignment.title_vs_target === "mismatch" || alignment.title_vs_target === "missing") {
    return {
      status: "not_ready_target_mismatch",
      reasons: [`title_vs_target = ${alignment.title_vs_target}`],
      renderer_policy: null,
    };
  }

  if (shape === "leaf_knowledge_point" && !alignment.content_mentions_title_signal) {
    return {
      status: "not_ready_target_mismatch",
      reasons: ["content body does not contain a meaningful title signal"],
      renderer_policy: null,
    };
  }

  if (shape === "chapter_overview") {
    return {
      status: "not_ready_chapter_level",
      reasons: ["chapter-level sample is not a leaf knowledge-point renderer baseline"],
      renderer_policy: null,
    };
  }

  if (shape === "leaf_knowledge_point" && volume.total_text_length < 80 && imageRefsCount === 0) {
    return {
      status: "not_ready_low_text",
      reasons: ["total text length < 80 and image_refs = 0"],
      renderer_policy: null,
    };
  }

  if (shape !== "leaf_knowledge_point" || volume.text_blocks_count === 0) {
    reasons.push(`content_shape = ${shape}`);
    if (volume.text_blocks_count === 0) reasons.push("text_blocks = 0");
    return {
      status: "not_ready_unknown",
      reasons,
      renderer_policy: null,
    };
  }

  if (doc.classification?.content_source_classification === "MIXED_TEXT_IMAGE" && imageRefsCount > 0) {
    return {
      status: "ready_with_asset_refs",
      reasons: ["leaf knowledge point with text and image_refs"],
      renderer_policy: "Renderer may preserve asset_ref links only; no OCR and no image-table reconstruction.",
    };
  }

  if (imageRefsCount > 0 && volume.text_blocks_count >= 1) {
    return {
      status: "ready_with_asset_refs",
      reasons: ["leaf knowledge point with text_blocks and image_refs"],
      renderer_policy: "Renderer may preserve asset_ref links only; no OCR and no image-table reconstruction.",
    };
  }

  if (volume.text_blocks_count >= 2 && volume.total_text_length >= 120) {
    return {
      status: "ready",
      reasons: ["leaf knowledge point with at least 2 text blocks and total text length >= 120"],
      renderer_policy: "Renderer may render text_blocks and key_terms without rewriting exam content.",
    };
  }

  if (
    doc.classification?.content_source_classification === "HTML_RICH_TEXT" &&
    volume.total_text_length >= 100
  ) {
    return {
      status: "ready",
      reasons: ["HTML_RICH_TEXT leaf knowledge point with total text length >= 100"],
      renderer_policy: "Renderer may render validated HTML-derived text blocks without rewriting exam content.",
    };
  }

  return {
    status: "not_ready_low_text",
    reasons: ["leaf sample does not meet content-ready text or asset thresholds"],
    renderer_policy: null,
  };
}

function isSemanticEligible(sample: SampleAudit): boolean {
  return !sample.semantic_audit.available || sample.semantic_audit.renderer_eligible === true;
}

function auditSample(
  fileName: string,
  quarantineItems: Map<string, QuarantineItem>,
  semanticAuditItems: Map<string, SemanticAuditItem>
): SampleAudit {
  const absPath = resolve(samplesDir, fileName);
  const doc = readJson<RuankaoIntermediateDocument>(absPath);
  const timestamp = doc.source?.timestamp ?? fileName.replace(".json", "");
  const quarantineItem = quarantineItems.get(timestamp) ?? null;
  const semanticAuditItem = semanticAuditItems.get(timestamp) ?? null;
  const volume = auditContentVolume(doc);
  const alignment = auditTargetAlignment(doc);
  const shape = classifyShape(doc);
  const assetIntegrity = auditAssetIntegrity(doc, timestamp);
  const constraintViolations = checkConstraints(doc);
  let rendererReadiness = decideReadiness(doc, shape, volume, alignment, constraintViolations, quarantineItem);

  if (
    semanticAuditItems.size > 0 &&
    semanticAuditItem?.renderer_eligible !== true &&
    (rendererReadiness.status === "ready" || rendererReadiness.status === "ready_with_asset_refs")
  ) {
    rendererReadiness = {
      status: quarantineItem ? "not_ready_quarantined" : "not_ready_target_mismatch",
      reasons: [
        quarantineItem
          ? `quarantined: ${quarantineItem.quarantine_reason}`
          : "semantic audit renderer_eligible is not true",
      ],
      renderer_policy: null,
    };
  }

  return {
    identity: {
      timestamp,
      title: doc.content?.title ?? null,
      final_url: doc.navigation_context?.final_url ?? "",
      target_node_text: doc.navigation_context?.target_node_text ?? "",
      detail_entry_strategy: doc.navigation_context?.detail_entry_strategy ?? "unknown",
      detail_entry_route_changed: doc.navigation_context?.detail_entry_route_changed ?? false,
      classification: doc.classification?.content_source_classification ?? "UNKNOWN",
      parser_confidence: doc.classification?.parser_confidence ?? "UNKNOWN",
      requires_manual_review: doc.classification?.requires_manual_review ?? false,
    },
    content_volume: volume,
    target_alignment: alignment,
    content_shape: shape,
    asset_integrity: assetIntegrity,
    renderer_readiness: rendererReadiness,
    quarantine: {
      quarantined: quarantineItem !== null,
      quarantine_reason: quarantineItem?.quarantine_reason ?? null,
      excluded_from_renderer_baseline: quarantineItem?.excluded_from_renderer_baseline === true,
    },
    semantic_audit: {
      available: semanticAuditItems.size > 0,
      renderer_eligible: semanticAuditItem?.renderer_eligible ?? null,
    },
    constraint_violations: constraintViolations,
  };
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  const result = {} as Record<T, number>;
  for (const value of values) {
    result[value] = (result[value] ?? 0) + 1;
  }
  return result;
}

function buildGate(samples: SampleAudit[]): AuditReport["overall_gate"] {
  const readySamples = samples.filter(
    (sample) =>
      sample.content_shape === "leaf_knowledge_point" &&
      (sample.renderer_readiness.status === "ready" ||
        sample.renderer_readiness.status === "ready_with_asset_refs")
  );
  const rendererEligibleLeafSamples = readySamples.filter(
    (sample) => !sample.quarantine.quarantined && isSemanticEligible(sample)
  );
  const uniqueReadyLeafTitleCount = new Set(
    rendererEligibleLeafSamples.map((sample) => sample.identity.title).filter((title): title is string => Boolean(title))
  ).size;
  const leafSampleCount = samples.filter((sample) => sample.content_shape === "leaf_knowledge_point").length;
  const constraintViolationsTotal = samples.reduce(
    (sum, sample) => sum + sample.constraint_violations.length,
    0
  );
  const targetMismatchCount = samples.filter(
    (sample) => sample.renderer_readiness.status === "not_ready_target_mismatch"
  ).length;
  const quarantinedCount = samples.filter((sample) => sample.quarantine.quarantined).length;
  const allReadySamplesHavePolicy = readySamples.every(
    (sample) => sample.renderer_readiness.renderer_policy !== null
  );

  const required: string[] = [];
  if (rendererEligibleLeafSamples.length < 3) {
    const needed = 3 - rendererEligibleLeafSamples.length;
    required.push(
      `acquire ${needed} more renderer-eligible non-quarantined leaf-level sample(s) (have ${rendererEligibleLeafSamples.length}/3)`
    );
  }
  if (uniqueReadyLeafTitleCount < 3) {
    required.push("validate at least 3 unique renderer-ready leaf titles");
  }
  if (constraintViolationsTotal > 0) required.push("fix constraint violations before renderer design");
  if (!allReadySamplesHavePolicy) required.push("define renderer policy for every ready sample");
  const chapterOverviewPresent = samples.some((sample) => sample.content_shape === "chapter_overview");

  const allowed =
    rendererEligibleLeafSamples.length >= 3 &&
    uniqueReadyLeafTitleCount >= 3 &&
    constraintViolationsTotal === 0 &&
    allReadySamplesHavePolicy;

  if (!allowed && chapterOverviewPresent) {
    required.push("improve target selection for chapter-level hints");
    required.push("avoid using chapter overview as renderer baseline");
  }

  return {
    phase4_renderer_allowed: allowed,
    reason: allowed
      ? "Renderer design gate passed for controlled leaf-level samples."
      : "Renderer design gate blocked because controlled samples do not yet provide enough leaf-level renderer baselines.",
    required_before_phase4: [...new Set(required)],
  };
}

function buildReport(samples: SampleAudit[]): AuditReport {
  const readinessDistribution = countBy(samples.map((sample) => sample.renderer_readiness.status));
  const rendererEligibleLeafCount = samples.filter(
    (sample) =>
      sample.content_shape === "leaf_knowledge_point" &&
      !sample.quarantine.quarantined &&
      isSemanticEligible(sample) &&
      (sample.renderer_readiness.status === "ready" ||
        sample.renderer_readiness.status === "ready_with_asset_refs")
  ).length;
  const summary = {
    leaf_knowledge_point_count: samples.filter((sample) => sample.content_shape === "leaf_knowledge_point").length,
    chapter_overview_count: samples.filter((sample) => sample.content_shape === "chapter_overview").length,
    mixed_count: samples.filter((sample) => sample.content_shape === "mixed").length,
    unknown_count: samples.filter((sample) => sample.content_shape === "unknown").length,
    ready_count: samples.filter((sample) => sample.renderer_readiness.status === "ready").length,
    ready_with_asset_refs_count: samples.filter(
      (sample) => sample.renderer_readiness.status === "ready_with_asset_refs"
    ).length,
    not_ready_count: samples.filter((sample) => sample.renderer_readiness.status.startsWith("not_ready")).length,
    readiness_distribution: readinessDistribution,
    constraint_violations_total: samples.reduce(
      (sum, sample) => sum + sample.constraint_violations.length,
      0
    ),
    quarantined_count: samples.filter((sample) => sample.quarantine.quarantined).length,
    renderer_eligible_leaf_count: rendererEligibleLeafCount,
  };

  return {
    generated_at: new Date().toISOString(),
    sample_count: samples.length,
    samples,
    summary,
    overall_gate: buildGate(samples),
  };
}

function writeMarkdown(report: AuditReport, mdPath: string): void {
  const mdLines: string[] = [
    "# Phase 3.4 Sample Quality Audit",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| Sample count | ${report.sample_count} |`,
    `| leaf_knowledge_point | ${report.summary.leaf_knowledge_point_count} |`,
    `| chapter_overview | ${report.summary.chapter_overview_count} |`,
    `| mixed | ${report.summary.mixed_count} |`,
    `| unknown | ${report.summary.unknown_count} |`,
    `| ready | ${report.summary.ready_count} |`,
    `| ready_with_asset_refs | ${report.summary.ready_with_asset_refs_count} |`,
    `| not_ready | ${report.summary.not_ready_count} |`,
    `| quarantined | ${report.summary.quarantined_count} |`,
    `| renderer eligible leaf | ${report.summary.renderer_eligible_leaf_count} |`,
    `| constraint violations | ${report.summary.constraint_violations_total} |`,
    "",
    "## Overall Gate",
    "",
    `- **phase4_renderer_allowed**: ${report.overall_gate.phase4_renderer_allowed}`,
    `- **reason**: ${report.overall_gate.reason}`,
    "- **required_before_phase4**:",
    ...report.overall_gate.required_before_phase4.map((item) => `  - ${item}`),
    "",
    "## Sample Audits",
    "",
    "| Timestamp | Title | Shape | Readiness | Quarantined | Strategy | Text length | image_refs | Asset manifest | Risks |",
    "|---|---|---|---|---|---|---:|---:|---|---|",
  ];

  for (const sample of report.samples) {
    const risks = [
      ...sample.content_volume.risks,
      ...sample.target_alignment.risks,
      ...sample.asset_integrity.risks,
      ...sample.renderer_readiness.reasons.filter((reason) => reason.startsWith("constraint")),
      ...(sample.quarantine.quarantined ? [`quarantine_reason = ${sample.quarantine.quarantine_reason}`] : []),
    ];
    mdLines.push(
      `| ${sample.identity.timestamp} | ${sample.identity.title ?? ""} | ${sample.content_shape} | ${sample.renderer_readiness.status} | ${sample.quarantine.quarantined ? "yes" : "no"} | ${sample.identity.detail_entry_strategy} | ${sample.content_volume.total_text_length} | ${sample.content_volume.image_refs_count} | ${sample.asset_integrity.manifest_present ? "present" : "missing"} | ${risks.join("; ")} |`
    );
  }

  mdLines.push("");
  mdLines.push("## Renderer Policies");
  mdLines.push("");

  for (const sample of report.samples) {
    if (!sample.renderer_readiness.renderer_policy) continue;
    mdLines.push(`- ${sample.identity.timestamp}: ${sample.renderer_readiness.renderer_policy}`);
  }

  mdLines.push("");
  mdLines.push("## Constraints");
  mdLines.push("");
  mdLines.push("- No Markdown knowledge documents generated.");
  mdLines.push("- No OCR used.");
  mdLines.push("- No encrypt=1 data decrypted.");
  mdLines.push("- No image table reconstructed.");
  mdLines.push("- No full-site batch crawl performed.");
  mdLines.push("- Phase 4 implementation was not entered.");
  mdLines.push("");

  writeFileSync(mdPath, mdLines.join("\n"), "utf8");
}

function main(): void {
  if (!existsSync(samplesDir)) {
    console.error("[audit] ERROR: samples directory not found:", samplesDir);
    process.exit(1);
  }

  const sampleFiles = readdirSync(samplesDir)
    .filter((file) => file.endsWith(".json") && file !== ".gitkeep")
    .sort();

  if (sampleFiles.length === 0) {
    console.error("[audit] ERROR: no intermediate sample JSON files found.");
    process.exit(1);
  }

  const quarantineItems = loadQuarantineItems();
  const semanticAuditItems = loadSemanticAuditItems();
  const samples = sampleFiles.map((fileName) => auditSample(fileName, quarantineItems, semanticAuditItems));
  const report = buildReport(samples);
  mkdirSync(generatedDir, { recursive: true });

  const jsonPath = resolve(generatedDir, "phase3_4_sample_quality_audit.json");
  const mdPath = resolve(generatedDir, "phase3_4_sample_quality_audit.md");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  writeMarkdown(report, mdPath);

  console.log("[audit] Sample quality audit complete");
  console.log(`  sample count:              ${report.sample_count}`);
  console.log(`  leaf_knowledge_point:      ${report.summary.leaf_knowledge_point_count}`);
  console.log(`  chapter_overview:          ${report.summary.chapter_overview_count}`);
  console.log(`  ready:                     ${report.summary.ready_count}`);
  console.log(`  ready_with_asset_refs:     ${report.summary.ready_with_asset_refs_count}`);
  console.log(`  not_ready:                 ${report.summary.not_ready_count}`);
  console.log(`  quarantined:               ${report.summary.quarantined_count}`);
  console.log(`  renderer_eligible_leaf:    ${report.summary.renderer_eligible_leaf_count}`);
  console.log(`  phase4_renderer_allowed:   ${report.overall_gate.phase4_renderer_allowed}`);
  console.log(`  required_before_phase4:    ${report.overall_gate.required_before_phase4.join("; ") || "(none)"}`);
  console.log(`  JSON report:               ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report:           ${toRepoPath(mdPath)}`);
}

main();
