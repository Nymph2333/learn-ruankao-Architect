/**
 * Phase 3.7: semantic alignment audit and quarantine manifest.
 *
 * This script audits existing intermediate samples for target/body mismatch,
 * duplicate actual content, and low-text diagnostic samples. It does not
 * delete raw artifacts, decrypt encrypted XHR, OCR images, reconstruct image
 * tables, crawl pages, or generate Markdown knowledge documents.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const generatedDir = resolve(repoRoot, "verification/generated");
const quarantineDir = resolve(repoRoot, "data/intermediate/ruankaodaren/quarantine");
const quarantineManifestPath = resolve(quarantineDir, "quarantine-manifest.json");

type Alignment = "matched" | "likely_matched" | "mismatched" | "unknown";
type BodyAlignment = "matched" | "mismatched" | "insufficient_text" | "image_dominant_unknown" | "unknown";
type QuarantineReason =
  | "target_body_mismatch"
  | "duplicate_actual_content"
  | "duplicate_same_title"
  | "low_text"
  | "global_fallback"
  | "unknown";
type DuplicateKind = "none" | "duplicate_actual_content" | "duplicate_same_title";

interface CrawlerMetadata {
  requested_target_text?: string | null;
  target_source?: string;
  detail_entry_strategy?: string;
  detail_content_text_preview?: string;
}

interface SampleRecord {
  fileName: string;
  samplePath: string;
  timestamp: string;
  doc: RuankaoIntermediateDocument;
  metadata: CrawlerMetadata | null;
}

interface SampleAudit {
  sample_path: string;
  timestamp: string;
  title: string | null;
  target_node_text: string;
  requested_target_text: string | null;
  effective_target_text: string;
  final_url: string;
  classification: string;
  alignment: Alignment;
  body_alignment: BodyAlignment;
  expected_tokens: string[];
  matched_body_tokens: string[];
  detected_body_signals: string[];
  duplicate_group_id: string | null;
  duplicate_kind: DuplicateKind;
  duplicate_actual_content: boolean;
  duplicate_group_titles: string[];
  quarantined: boolean;
  quarantine_reason: QuarantineReason | null;
  renderer_eligible: boolean;
  requires_manual_review: boolean;
  notes: string[];
}

interface QuarantineManifest {
  source_name: "ruankaodaren";
  created_at: string;
  reason: string;
  items: Array<{
    sample_path: string;
    timestamp: string;
    title: string | null;
    target_node_text: string;
    detected_body_signals: string[];
    quarantine_reason: QuarantineReason;
    excluded_from_renderer_baseline: true;
  }>;
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, "").trim();
}

function normalizeComparable(value: string | null | undefined): string {
  return normalizeText(value).toLowerCase();
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function isChapterTitle(title: string | null | undefined): boolean {
  const normalized = normalizeText(title);
  return /^第\s*\d+\s*章/.test(normalized) || (normalized.startsWith("第") && normalized.includes("章"));
}

function isLeafTitle(title: string | null | undefined): boolean {
  const normalized = normalizeText(title);
  return /^\d+(?:\.\d+)+\s*\S+/.test(normalized) && !isChapterTitle(normalized);
}

function sectionNumber(value: string | null | undefined): string | null {
  return normalizeText(value).match(/^(\d+(?:\.\d+)+)/)?.[1] ?? null;
}

function titleWithoutNumber(value: string | null | undefined): string {
  return normalizeText(value).replace(/^\d+(?:\.\d+)+\s*/, "");
}

function tokenCandidates(value: string | null | undefined): string[] {
  const text = titleWithoutNumber(value);
  const number = sectionNumber(value);
  const withoutWeakSuffix = text.replace(/(常识|基础|知识|系统|技术|处理|设计)$/, "");
  const weakTerms = new Set(["系统", "技术", "处理", "设计", "常识", "基础", "知识", "计算机"]);
  const rawTokens = [
    number ?? "",
    text,
    withoutWeakSuffix,
    ...text.split(/[的和与及、，,：:（）()—\-]/),
    ...(text.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g) ?? []),
    ...(text.match(/\p{Script=Han}{2,}/gu) ?? []),
  ];
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const rawToken of rawTokens) {
    const token = normalizeComparable(rawToken);
    if (token.length < 2 || weakTerms.has(token) || seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }

  return tokens;
}

function bodyText(doc: RuankaoIntermediateDocument, metadata: CrawlerMetadata | null): string {
  const parts = [
    ...(doc.content?.text_blocks ?? []).map((block) => block.text),
    ...(doc.content?.key_terms ?? []).map((term) => term.text),
    ...(doc.content?.image_refs ?? []).map((ref) => ref.surrounding_text ?? ""),
    ...(doc.content?.html_fragments ?? []).map((fragment) => stripHtml(fragment.outer_html ?? "")),
    metadata?.detail_content_text_preview ?? "",
  ];

  return normalizeText(parts.join("\n"));
}

function detectedSignals(text: string): string[] {
  const signals = [
    "CISC",
    "RISC",
    "数据库",
    "规范化",
    "存储",
    "流水",
    "码距",
    "校验码",
    "纠错",
    "检错",
    "SQL",
    "NoSQL",
    "数据仓库",
    "数据挖掘",
    "网络",
    "架构",
  ];
  const lowerText = text.toLowerCase();
  return signals.filter((signal) => lowerText.includes(signal.toLowerCase()));
}

function contentFingerprint(doc: RuankaoIntermediateDocument): string {
  const payload = {
    text: (doc.content?.text_blocks ?? []).map((block) => normalizeComparable(block.text)),
    key_terms: (doc.content?.key_terms ?? []).map((term) => normalizeComparable(term.text)),
    image_refs: (doc.content?.image_refs ?? []).map((ref) => ref.src ?? ""),
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

function duplicateKindFor(record: SampleRecord, duplicateGroup: SampleRecord[]): DuplicateKind {
  if (duplicateGroup.length <= 1) return "none";

  const title = record.doc.content?.title ?? null;
  const target = record.doc.navigation_context?.target_node_text ?? "";
  const differentTitleOrTarget = duplicateGroup.some((other) => {
    if (other.timestamp === record.timestamp) return false;
    return (
      normalizeComparable(other.doc.content?.title ?? null) !== normalizeComparable(title) ||
      normalizeComparable(other.doc.navigation_context?.target_node_text ?? "") !== normalizeComparable(target)
    );
  });

  if (differentTitleOrTarget) return "duplicate_actual_content";

  const earliest = [...duplicateGroup].sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0];
  return earliest?.timestamp === record.timestamp ? "none" : "duplicate_same_title";
}

function titleTargetAlignment(title: string | null, target: string, requested: string | null): Alignment {
  const normalizedTitle = normalizeComparable(title);
  const normalizedTarget = normalizeComparable(target);
  const normalizedRequested = normalizeComparable(requested);
  const effectiveTarget = normalizedRequested || normalizedTarget;

  if (!normalizedTitle || !effectiveTarget) return "unknown";
  if (normalizedTitle === effectiveTarget) return "matched";

  const titleNum = sectionNumber(title);
  const targetNum = sectionNumber(requested ?? target);
  if (titleNum && targetNum && titleNum === targetNum) return "likely_matched";
  if (titleNum && targetNum && titleNum !== targetNum) return "mismatched";

  if (normalizedTitle.includes(effectiveTarget) || effectiveTarget.includes(normalizedTitle)) {
    return "likely_matched";
  }

  if (isChapterTitle(title) || isChapterTitle(requested ?? target)) return "mismatched";
  return "mismatched";
}

function judgeBodyAlignment(
  record: SampleRecord,
  allRecords: SampleRecord[]
): {
  bodyAlignment: BodyAlignment;
  expectedTokens: string[];
  matchedTokens: string[];
} {
  const doc = record.doc;
  const title = doc.content?.title ?? null;
  const target = doc.navigation_context?.target_node_text ?? "";
  const requested = record.metadata?.requested_target_text ?? null;
  const expectedTokens = [...new Set([
    ...tokenCandidates(title),
    ...tokenCandidates(target),
    ...tokenCandidates(requested),
  ])];
  const body = normalizeComparable(bodyText(doc, record.metadata));
  const textLength = (doc.content?.text_blocks ?? []).reduce((sum, block) => sum + block.text.length, 0);
  const imageRefs = doc.content?.image_refs?.length ?? 0;
  const matchedTokens = expectedTokens.filter((token) => body.includes(token));

  if (matchedTokens.length > 0) {
    return { bodyAlignment: "matched", expectedTokens, matchedTokens };
  }

  if (textLength < 80 && imageRefs === 0) {
    return { bodyAlignment: "insufficient_text", expectedTokens, matchedTokens };
  }

  if (imageRefs > 0 && textLength < 80) {
    return { bodyAlignment: "image_dominant_unknown", expectedTokens, matchedTokens };
  }

  const otherDistinctiveTokens = allRecords
    .filter((other) => other.timestamp !== record.timestamp)
    .flatMap((other) => [
      ...tokenCandidates(other.doc.content?.title ?? null),
      ...tokenCandidates(other.doc.navigation_context?.target_node_text ?? ""),
      ...tokenCandidates(other.metadata?.requested_target_text ?? null),
    ])
    .filter((token) => !expectedTokens.includes(token));

  if (otherDistinctiveTokens.some((token) => body.includes(token))) {
    return { bodyAlignment: "mismatched", expectedTokens, matchedTokens };
  }

  if (isLeafTitle(title)) {
    return { bodyAlignment: "mismatched", expectedTokens, matchedTokens };
  }

  return { bodyAlignment: "unknown", expectedTokens, matchedTokens };
}

function loadMetadata(timestamp: string): CrawlerMetadata | null {
  const absPath = resolve(metadataDir, `${timestamp}.json`);
  if (!existsSync(absPath)) return null;
  return readJson<CrawlerMetadata>(absPath);
}

function loadSamples(): SampleRecord[] {
  if (!existsSync(samplesDir)) {
    console.error("[semantic-audit] ERROR: samples directory missing:", samplesDir);
    process.exit(1);
  }

  const files = readdirSync(samplesDir)
    .filter((file) => file.endsWith(".json") && file !== ".gitkeep")
    .sort();

  return files.map((fileName) => {
    const absPath = resolve(samplesDir, fileName);
    const doc = readJson<RuankaoIntermediateDocument>(absPath);
    const timestamp = doc.source?.timestamp ?? basename(fileName, ".json");

    return {
      fileName,
      samplePath: absPath,
      timestamp,
      doc,
      metadata: loadMetadata(timestamp),
    };
  });
}

function buildDuplicateGroups(records: SampleRecord[]): Map<string, SampleRecord[]> {
  const groups = new Map<string, SampleRecord[]>();

  for (const record of records) {
    const fingerprint = contentFingerprint(record.doc);
    const group = groups.get(fingerprint) ?? [];
    group.push(record);
    groups.set(fingerprint, group);
  }

  return groups;
}

function quarantineReasonFor(
  record: SampleRecord,
  alignment: Alignment,
  bodyAlignment: BodyAlignment,
  duplicateKind: DuplicateKind
): QuarantineReason | null {
  const doc = record.doc;
  const textLength = (doc.content?.text_blocks ?? []).reduce((sum, block) => sum + block.text.length, 0);
  const imageRefs = doc.content?.image_refs?.length ?? 0;
  const strategy = String(doc.navigation_context?.detail_entry_strategy ?? record.metadata?.detail_entry_strategy ?? "");

  if (strategy === "global_fallback") return "global_fallback";
  if (alignment === "mismatched" || bodyAlignment === "mismatched") return "target_body_mismatch";
  if (duplicateKind === "duplicate_actual_content") return "duplicate_actual_content";
  if (duplicateKind === "duplicate_same_title") return "duplicate_same_title";
  if (textLength < 80 && imageRefs === 0) return "low_text";
  return null;
}

function buildAudits(records: SampleRecord[]): SampleAudit[] {
  const duplicateGroups = buildDuplicateGroups(records);
  const duplicateGroupIds = new Map<string, string>();
  let duplicateGroupCounter = 1;
  for (const [fingerprint, group] of duplicateGroups) {
    if (group.length <= 1) continue;
    duplicateGroupIds.set(fingerprint, `dup-${duplicateGroupCounter}`);
    duplicateGroupCounter += 1;
  }

  return records.map((record) => {
    const doc = record.doc;
    const title = doc.content?.title ?? null;
    const target = doc.navigation_context?.target_node_text ?? "";
    const requested = record.metadata?.requested_target_text ?? null;
    const effectiveTarget = requested || target;
    const alignment = titleTargetAlignment(title, target, requested);
    const body = bodyText(doc, record.metadata);
    const bodyResult = judgeBodyAlignment(record, records);
    const fingerprint = contentFingerprint(doc);
    const duplicateGroup = duplicateGroups.get(fingerprint) ?? [];
    const duplicateGroupId = duplicateGroupIds.get(fingerprint) ?? null;
    const duplicateActualContent = duplicateGroup.length > 1;
    const duplicateKind = duplicateKindFor(record, duplicateGroup);
    const reason = quarantineReasonFor(record, alignment, bodyResult.bodyAlignment, duplicateKind);
    const quarantined = reason !== null;
    const notes: string[] = [];

    if (!record.metadata) notes.push("raw metadata missing");
    if (requested && normalizeComparable(requested) !== normalizeComparable(target)) {
      notes.push(`requested target differs from crawler target: ${requested}`);
    }
    if (duplicateActualContent) notes.push(`duplicate actual content group: ${duplicateGroupId}`);

    const rendererEligible =
      !quarantined &&
      isLeafTitle(title) &&
      (alignment === "matched" || alignment === "likely_matched") &&
      (bodyResult.bodyAlignment === "matched" || bodyResult.bodyAlignment === "image_dominant_unknown");

    return {
      sample_path: toRepoPath(record.samplePath),
      timestamp: record.timestamp,
      title,
      target_node_text: target,
      requested_target_text: requested,
      effective_target_text: effectiveTarget,
      final_url: doc.navigation_context?.final_url ?? "",
      classification: doc.classification?.content_source_classification ?? "UNKNOWN",
      alignment,
      body_alignment: bodyResult.bodyAlignment,
      expected_tokens: bodyResult.expectedTokens,
      matched_body_tokens: bodyResult.matchedTokens,
      detected_body_signals: detectedSignals(body),
      duplicate_group_id: duplicateGroupId,
      duplicate_kind: duplicateKind,
      duplicate_actual_content: duplicateActualContent,
      duplicate_group_titles: duplicateGroup.map((item) => item.doc.content?.title ?? "(untitled)"),
      quarantined,
      quarantine_reason: reason,
      renderer_eligible: rendererEligible,
      requires_manual_review:
        doc.classification?.requires_manual_review === true ||
        bodyResult.bodyAlignment === "unknown" ||
        bodyResult.bodyAlignment === "image_dominant_unknown",
      notes,
    };
  });
}

function writeQuarantineManifest(audits: SampleAudit[], createdAt: string): QuarantineManifest {
  mkdirSync(quarantineDir, { recursive: true });

  const manifest: QuarantineManifest = {
    source_name: "ruankaodaren",
    created_at: createdAt,
    reason: "semantic target/body mismatch detected during Phase 3.6",
    items: audits
      .filter((audit) => audit.quarantined)
      .map((audit) => ({
        sample_path: audit.sample_path,
        timestamp: audit.timestamp,
        title: audit.title,
        target_node_text: audit.target_node_text,
        detected_body_signals: audit.detected_body_signals,
        quarantine_reason: audit.quarantine_reason ?? "unknown",
        excluded_from_renderer_baseline: true,
      })),
  };

  writeFileSync(quarantineManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

function writeAuditReports(audits: SampleAudit[], manifest: QuarantineManifest, generatedAt: string): void {
  mkdirSync(generatedDir, { recursive: true });
  const duplicateActualContentCount = audits.filter((audit) => audit.duplicate_actual_content).length;
  const duplicateSameTitleCount = audits.filter((audit) => audit.duplicate_kind === "duplicate_same_title").length;
  const report = {
    generated_at: generatedAt,
    total_samples: audits.length,
    matched_count: audits.filter((audit) => audit.alignment === "matched").length,
    likely_matched_count: audits.filter((audit) => audit.alignment === "likely_matched").length,
    mismatched_count: audits.filter(
      (audit) => audit.alignment === "mismatched" || audit.body_alignment === "mismatched"
    ).length,
    quarantined_count: manifest.items.length,
    duplicate_actual_content_count: duplicateActualContentCount,
    duplicate_same_title_count: duplicateSameTitleCount,
    renderer_eligible_count: audits.filter((audit) => audit.renderer_eligible).length,
    quarantine_manifest_path: toRepoPath(quarantineManifestPath),
    samples: audits,
  };

  const jsonPath = resolve(generatedDir, "phase3_7_semantic_alignment_audit.json");
  const mdPath = resolve(generatedDir, "phase3_7_semantic_alignment_audit.md");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    "# Phase 3.7 Semantic Alignment Audit",
    "",
    `Generated at: ${generatedAt}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| Total samples | ${report.total_samples} |`,
    `| matched | ${report.matched_count} |`,
    `| likely_matched | ${report.likely_matched_count} |`,
    `| mismatched | ${report.mismatched_count} |`,
    `| quarantined | ${report.quarantined_count} |`,
    `| duplicate_actual_content | ${report.duplicate_actual_content_count} |`,
    `| duplicate_same_title | ${report.duplicate_same_title_count} |`,
    `| renderer_eligible | ${report.renderer_eligible_count} |`,
    "",
    "## Samples",
    "",
    "| Timestamp | Title | Requested target | Target node | Alignment | Body alignment | Duplicate | Quarantined | Reason | Renderer eligible |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...audits.map(
      (audit) =>
        `| ${audit.timestamp} | ${audit.title ?? ""} | ${audit.requested_target_text ?? ""} | ${audit.target_node_text} | ${audit.alignment} | ${audit.body_alignment} | ${audit.duplicate_group_id ?? ""} | ${audit.quarantined ? "yes" : "no"} | ${audit.quarantine_reason ?? ""} | ${audit.renderer_eligible ? "yes" : "no"} |`
    ),
    "",
    "## Quarantine Manifest",
    "",
    `Path: \`${toRepoPath(quarantineManifestPath)}\``,
    "",
  ];

  if (manifest.items.length === 0) {
    mdLines.push("- No quarantined samples.");
  } else {
    for (const item of manifest.items) {
      mdLines.push(`- ${item.timestamp} / ${item.title ?? ""}: ${item.quarantine_reason}`);
    }
  }

  mdLines.push("");
  mdLines.push("## Constraints");
  mdLines.push("");
  mdLines.push("- No raw artifacts deleted.");
  mdLines.push("- No Markdown knowledge documents generated.");
  mdLines.push("- No OCR used.");
  mdLines.push("- No encrypt=1 data decrypted.");
  mdLines.push("- No image table reconstructed.");
  mdLines.push("- No full-site batch crawl performed.");
  mdLines.push("- Phase 4 was not entered.");
  mdLines.push("");

  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log("[semantic-audit] Semantic alignment audit complete");
  console.log(`  total samples:             ${report.total_samples}`);
  console.log(`  matched:                   ${report.matched_count}`);
  console.log(`  likely matched:            ${report.likely_matched_count}`);
  console.log(`  mismatched:                ${report.mismatched_count}`);
  console.log(`  quarantined:               ${report.quarantined_count}`);
  console.log(`  duplicate actual content:  ${report.duplicate_actual_content_count}`);
  console.log(`  renderer eligible:         ${report.renderer_eligible_count}`);
  console.log(`  quarantine manifest:       ${toRepoPath(quarantineManifestPath)}`);
  console.log(`  JSON report:               ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report:           ${toRepoPath(mdPath)}`);
}

function main(): void {
  const generatedAt = new Date().toISOString();
  const records = loadSamples();
  const audits = buildAudits(records);
  const manifest = writeQuarantineManifest(audits, generatedAt);
  writeAuditReports(audits, manifest, generatedAt);
}

main();
