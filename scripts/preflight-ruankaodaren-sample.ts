/**
 * Phase 3.8: aligned leaf sample preflight.
 *
 * This script checks crawl metadata, parsed intermediate content, and duplicate
 * fingerprints before a sample is allowed into the renderer baseline. It does
 * not crawl, decrypt encrypt=1 data, OCR images, reconstruct image tables, or
 * generate Markdown knowledge documents.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const generatedDir = resolve(repoRoot, "verification/generated");
const quarantineManifestPath = resolve(
  repoRoot,
  "data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json"
);
const semanticAuditPath = resolve(repoRoot, "verification/generated/phase3_7_semantic_alignment_audit.json");
const historicalKnownGoodTimestamp = "2026-05-26T09-40-21-903Z";

type Gate = "pass" | "fail";
type ContentGate = "pass" | "fail" | "not_available";
type DuplicateGate = "pass" | "fail" | "unknown";
type RecommendedAction = "parse" | "quarantine" | "diagnostic_only" | "retry_target";

interface MetadataShape {
  final_url?: string;
  detail_entry_route_changed?: boolean;
  detail_entry_strategy?: string;
  knowledge_node_click_text?: string | null;
  detail_entry_target_text?: string | null;
  requested_target_text?: string | null;
  require_leaf?: boolean;
  target_resolution_trusted?: boolean;
  target_leaf_exact_match?: boolean;
  actual_node_matches_requested_target?: boolean;
  target_resolution_failure_reason?: string | null;
  catalog_resolver_used?: boolean;
  catalog_match_found?: boolean;
  catalog_match_strategy?: string | null;
  catalog_chapter_title?: string | null;
  catalog_leaf_title?: string | null;
  catalog_live_replay_success?: boolean | null;
  live_replay_visible_chapter_count?: number | null;
  live_replay_visible_leaf_count?: number | null;
  live_replay_top_candidates?: string[];
  live_replay_debug_paths?: Record<string, string> | null;
  leaf_resolution_success?: boolean;
  resolved_leaf_text?: string | null;
  post_detail_content_signal?: boolean;
  outer_html_paths?: string[];
  detail_content_stabilization_attempted?: boolean;
  detail_content_stabilization_status?: string;
  detail_content_stabilization_text_length?: number;
  detail_content_stabilization_img_count?: number;
}

interface SemanticAuditReport {
  samples?: Array<{
    sample_path: string;
    timestamp: string;
    title: string | null;
    renderer_eligible?: boolean;
  }>;
}

interface QuarantineManifest {
  items?: Array<{
    timestamp: string;
    quarantine_reason?: string;
  }>;
}

interface FingerprintRecord {
  timestamp: string;
  title: string | null;
  fingerprint: string;
}

interface PreflightReport {
  generated_at: string;
  timestamp: string;
  metadata_path: string | null;
  intermediate_path: string | null;
  outer_html_path: string | null;
  quarantine_manifest_path: string | null;
  semantic_audit_path: string | null;
  metadata_gate: Gate;
  content_gate: ContentGate;
  duplicate_gate: DuplicateGate;
  overall: Gate;
  failure_reasons: string[];
  recommended_action: RecommendedAction;
  details: {
    final_url: string | null;
    detail_entry_route_changed: boolean | null;
    detail_entry_strategy: string | null;
    knowledge_node_click_text: string | null;
    requested_target_text: string | null;
    require_leaf: boolean | null;
    resolved_leaf_text: string | null;
    target_resolution_trusted: boolean | null;
    target_leaf_exact_match: boolean | null;
    actual_node_matches_requested_target: boolean | null;
    target_resolution_failure_reason: string | null;
    catalog_resolver_used: boolean | null;
    catalog_match_found: boolean | null;
    catalog_match_strategy: string | null;
    catalog_chapter_title: string | null;
    catalog_leaf_title: string | null;
    catalog_live_replay_success: boolean | null;
    live_replay_visible_chapter_count: number | null;
    live_replay_visible_leaf_count: number | null;
    live_replay_top_candidates: string[];
    live_replay_debug_paths: Record<string, string> | null;
    post_detail_content_signal: boolean | null;
    title: string | null;
    total_text_length: number | null;
    image_refs_count: number | null;
    expected_tokens: string[];
    matched_tokens: string[];
    quarantined: boolean;
    duplicate_match: {
      timestamp: string;
      title: string | null;
      kind: "different_title" | "same_title";
    } | null;
    detail_content_stabilization_status: string | null;
    detail_content_stabilization_text_length: number | null;
    detail_content_stabilization_img_count: number | null;
  };
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function resolveRepoPath(repoPath: string): string {
  return resolve(repoRoot, repoPath.replace(/\//g, "\\"));
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function parseArgs(): { timestamp: string | null; latest: boolean } {
  const args = process.argv.slice(2);
  let timestamp: string | null = null;
  let latest = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--latest") {
      latest = true;
      continue;
    }
    if (arg === "--timestamp") {
      timestamp = args[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (arg?.startsWith("--timestamp=")) {
      timestamp = arg.slice("--timestamp=".length);
    }
  }

  return { timestamp, latest };
}

function latestMetadataTimestamp(): string | null {
  if (!existsSync(metadataDir)) return null;
  const files = readdirSync(metadataDir)
    .filter((file) => file.endsWith(".json") && file !== ".gitkeep")
    .sort();
  const latest = files.at(-1);
  return latest ? basename(latest, ".json") : null;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, "").trim();
}

function normalizeComparable(value: string | null | undefined): string {
  return normalizeText(value).toLowerCase();
}

function sectionNumber(value: string | null | undefined): string | null {
  return normalizeText(value).match(/^(\d+(?:\.\d+)+)/)?.[1] ?? null;
}

function isLeafText(value: string | null | undefined): boolean {
  const normalized = normalizeText(value);
  return /^\d+(?:\.\d+)+\s*\S+/.test(normalized);
}

function titleAligns(left: string | null | undefined, right: string | null | undefined): boolean {
  const a = normalizeComparable(left);
  const b = normalizeComparable(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const aNumber = sectionNumber(left);
  const bNumber = sectionNumber(right);
  if (aNumber && bNumber) return aNumber === bNumber;
  return a.length >= 4 && b.includes(a) || b.length >= 4 && a.includes(b);
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

function tokenCandidates(value: string | null | undefined): string[] {
  const text = normalizeText(value).replace(/^\d+(?:\.\d+)+\s*/, "");
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

function bodyText(doc: RuankaoIntermediateDocument): string {
  return normalizeComparable(
    [
      ...(doc.content?.text_blocks ?? []).map((block) => block.text),
      ...(doc.content?.key_terms ?? []).map((term) => term.text),
      ...(doc.content?.image_refs ?? []).map((ref) => ref.surrounding_text ?? ""),
      ...(doc.content?.html_fragments ?? []).map((fragment) => stripHtml(fragment.outer_html ?? "")),
    ].join("\n")
  );
}

function totalTextLength(doc: RuankaoIntermediateDocument): number {
  return (doc.content?.text_blocks ?? []).reduce((sum, block) => sum + block.text.length, 0);
}

function contentFingerprint(doc: RuankaoIntermediateDocument): string {
  const payload = {
    text: (doc.content?.text_blocks ?? []).map((block) => normalizeComparable(block.text)),
    key_terms: (doc.content?.key_terms ?? []).map((term) => normalizeComparable(term.text)),
    image_refs: (doc.content?.image_refs ?? []).map((ref) => ref.src ?? ""),
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

function findOuterHtmlPath(metadata: MetadataShape | null, doc: RuankaoIntermediateDocument | null): string | null {
  const metadataPath = (metadata?.outer_html_paths ?? []).find((rawPath) => rawPath.includes("knowInfo_ql-editor"));
  if (metadataPath && existsSync(resolveRepoPath(metadataPath))) return resolveRepoPath(metadataPath);

  const docPath = doc?.source?.raw_paths?.outer_html ?? null;
  if (docPath && docPath.includes("knowInfo_ql-editor") && existsSync(resolveRepoPath(docPath))) {
    return resolveRepoPath(docPath);
  }

  return null;
}

function loadRendererEligibleFingerprints(currentTimestamp: string): FingerprintRecord[] {
  if (!existsSync(semanticAuditPath)) return [];
  const audit = readJson<SemanticAuditReport>(semanticAuditPath);
  return (audit.samples ?? [])
    .filter((sample) => sample.renderer_eligible === true && sample.timestamp !== currentTimestamp)
    .map((sample) => {
      const samplePath = resolveRepoPath(sample.sample_path);
      if (!existsSync(samplePath)) return null;
      const doc = readJson<RuankaoIntermediateDocument>(samplePath);
      return {
        timestamp: sample.timestamp,
        title: doc.content?.title ?? sample.title,
        fingerprint: contentFingerprint(doc),
      };
    })
    .filter((item): item is FingerprintRecord => item !== null);
}

function loadQuarantineMap(): Map<string, string> {
  const result = new Map<string, string>();
  if (!existsSync(quarantineManifestPath)) return result;
  const manifest = readJson<QuarantineManifest>(quarantineManifestPath);
  for (const item of manifest.items ?? []) {
    result.set(item.timestamp, item.quarantine_reason ?? "unknown");
  }
  return result;
}

function evaluateMetadataGate(
  timestamp: string,
  metadata: MetadataShape | null,
  outerHtmlPath: string | null
): { gate: Gate; reasons: string[] } {
  const reasons: string[] = [];
  const actualText = metadata?.knowledge_node_click_text ?? metadata?.detail_entry_target_text ?? null;
  const knownGoodException =
    timestamp === historicalKnownGoodTimestamp && titleAligns(actualText, "1.3 指令系统CISC和RISC");

  if (!metadata) reasons.push("metadata_missing");
  if (!metadata?.final_url?.includes("konwledgeInfo")) reasons.push("final_url_not_detail_route");
  if (metadata?.detail_entry_route_changed !== true) reasons.push("detail_entry_route_not_changed");
  if (metadata?.detail_entry_strategy === "global_fallback") reasons.push("detail_entry_strategy_global_fallback");
  if (!metadata?.detail_entry_strategy) reasons.push("detail_entry_strategy_missing");
  if (!actualText) reasons.push("knowledge_node_click_text_missing");
  if (!metadata?.require_leaf && !knownGoodException) reasons.push("require_leaf_false");
  if (metadata?.post_detail_content_signal !== true) reasons.push("post_detail_content_signal_false");
  if (!outerHtmlPath) reasons.push("knowInfo_ql_editor_outer_html_missing");
  if (
    metadata?.detail_content_stabilization_status === "timeout_no_container" ||
    metadata?.detail_content_stabilization_status === "timeout_unstable"
  ) {
    reasons.push("detail_content_not_stable");
  }

  if (metadata?.require_leaf === true) {
    const requested = metadata.requested_target_text ?? null;
    const resolved = metadata.resolved_leaf_text ?? null;
    if (metadata.leaf_resolution_success !== true) {
      reasons.push("leaf_resolution_not_successful");
    }
    if (resolved && actualText && !titleAligns(actualText, resolved)) {
      reasons.push("actual_node_does_not_match_resolved_leaf");
    }
    if (requested && isLeafText(requested) && actualText && !titleAligns(actualText, requested)) {
      reasons.push("actual_node_does_not_match_requested_leaf");
    }
    if (metadata.target_resolution_trusted !== true) {
      reasons.push("target_resolution_not_trusted");
    }
    if (metadata.target_leaf_exact_match !== true) {
      reasons.push("target_leaf_not_exact_match");
    }
    if (metadata.actual_node_matches_requested_target !== true) {
      reasons.push("actual_node_does_not_match_requested_target");
    }
    if (metadata.detail_entry_strategy === "global_fallback") {
      reasons.push("global_fallback_not_allowed");
    }
    if (metadata.catalog_resolver_used === true) {
      if (metadata.catalog_match_found !== true) reasons.push("catalog_match_not_found");
      if (metadata.catalog_live_replay_success !== true) reasons.push("catalog_live_replay_not_successful");
      if (!metadata.catalog_leaf_title) reasons.push("catalog_leaf_title_missing");
    }
  }

  return { gate: reasons.length === 0 ? "pass" : "fail", reasons };
}

function evaluateContentGate(
  metadata: MetadataShape | null,
  doc: RuankaoIntermediateDocument | null
): {
  gate: ContentGate;
  reasons: string[];
  expectedTokens: string[];
  matchedTokens: string[];
} {
  if (!doc) {
    return { gate: "not_available", reasons: [], expectedTokens: [], matchedTokens: [] };
  }

  const reasons: string[] = [];
  const actualText = metadata?.knowledge_node_click_text ?? metadata?.detail_entry_target_text ?? doc.navigation_context?.target_node_text ?? null;
  const title = doc.content?.title ?? null;
  const textLength = totalTextLength(doc);
  const imageRefs = doc.content?.image_refs?.length ?? 0;

  if (!titleAligns(title, actualText)) {
    reasons.push("intermediate_title_does_not_align_with_actual_target");
  }

  const expectedTokens = [
    ...tokenCandidates(title),
    ...tokenCandidates(actualText),
    ...tokenCandidates(metadata?.requested_target_text ?? null),
    ...tokenCandidates(metadata?.resolved_leaf_text ?? null),
  ];
  const uniqueExpectedTokens = [...new Set(expectedTokens)];
  const body = bodyText(doc);
  const matchedTokens = uniqueExpectedTokens.filter((token) => body.includes(token));

  if (textLength < 80 && imageRefs === 0) {
    reasons.push("low_text_without_image_refs");
  }

  if (uniqueExpectedTokens.length > 0 && matchedTokens.length === 0) {
    reasons.push("body_missing_target_tokens");
  }

  if (
    doc.classification?.content_source_classification === "MIXED_TEXT_IMAGE" &&
    imageRefs > 0 &&
    titleAligns(title, actualText) &&
    matchedTokens.length > 0
  ) {
    return { gate: reasons.filter((reason) => reason !== "low_text_without_image_refs").length === 0 ? "pass" : "fail", reasons, expectedTokens: uniqueExpectedTokens, matchedTokens };
  }

  return {
    gate: reasons.length === 0 ? "pass" : "fail",
    reasons,
    expectedTokens: uniqueExpectedTokens,
    matchedTokens,
  };
}

function evaluateDuplicateGate(
  timestamp: string,
  doc: RuankaoIntermediateDocument | null
): {
  gate: DuplicateGate;
  reasons: string[];
  duplicateMatch: PreflightReport["details"]["duplicate_match"];
} {
  if (!doc) return { gate: "unknown", reasons: [], duplicateMatch: null };

  const currentFingerprint = contentFingerprint(doc);
  const currentTitle = doc.content?.title ?? null;
  const rendererEligibleFingerprints = loadRendererEligibleFingerprints(timestamp);

  for (const record of rendererEligibleFingerprints) {
    if (record.fingerprint !== currentFingerprint) continue;
    const sameTitle = normalizeComparable(record.title) === normalizeComparable(currentTitle);
    return {
      gate: "fail",
      reasons: [sameTitle ? "duplicate_same_title_renderer_eligible" : "duplicate_different_title_renderer_eligible"],
      duplicateMatch: {
        timestamp: record.timestamp,
        title: record.title,
        kind: sameTitle ? "same_title" : "different_title",
      },
    };
  }

  return { gate: "pass", reasons: [], duplicateMatch: null };
}

function chooseRecommendedAction(
  metadataGate: Gate,
  contentGate: ContentGate,
  duplicateGate: DuplicateGate,
  failureReasons: string[]
): RecommendedAction {
  if (metadataGate === "fail") {
    return failureReasons.includes("final_url_not_detail_route") ||
      failureReasons.includes("actual_node_does_not_match_requested_leaf") ||
      failureReasons.includes("actual_node_does_not_match_requested_target") ||
      failureReasons.includes("target_resolution_not_trusted")
      ? "retry_target"
      : "diagnostic_only";
  }
  if (contentGate === "not_available" && duplicateGate === "unknown") return "parse";
  if (duplicateGate === "fail" || contentGate === "fail") return "quarantine";
  return "parse";
}

function writeReports(report: PreflightReport): void {
  mkdirSync(generatedDir, { recursive: true });
  const jsonPath = resolve(generatedDir, `phase3_8_preflight_${report.timestamp}.json`);
  const mdPath = resolve(generatedDir, `phase3_8_preflight_${report.timestamp}.md`);

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Phase 3.8 Preflight: ${report.timestamp}`,
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Gate | Result |",
    "|---|---|",
    `| metadata_gate | ${report.metadata_gate} |`,
    `| content_gate | ${report.content_gate} |`,
    `| duplicate_gate | ${report.duplicate_gate} |`,
    `| overall | ${report.overall} |`,
    `| recommended_action | ${report.recommended_action} |`,
    "",
    "## Inputs",
    "",
    `- Metadata: ${report.metadata_path ?? "(missing)"}`,
    `- Intermediate: ${report.intermediate_path ?? "(not available)"}`,
    `- Outer HTML: ${report.outer_html_path ?? "(missing)"}`,
    `- Quarantine manifest: ${report.quarantine_manifest_path ?? "(missing)"}`,
    `- Semantic audit: ${report.semantic_audit_path ?? "(missing)"}`,
    "",
    "## Failure Reasons",
    "",
    ...(report.failure_reasons.length === 0
      ? ["- None."]
      : report.failure_reasons.map((reason) => `- ${reason}`)),
    "",
    "## Details",
    "",
    "```json",
    JSON.stringify(report.details, null, 2),
    "```",
    "",
    "## Constraints",
    "",
    "- No Markdown knowledge documents generated.",
    "- No OCR used.",
    "- No encrypt=1 data decrypted.",
    "- No image table reconstructed.",
    "- No full-site batch crawl performed.",
    "- Phase 4 was not entered.",
    "",
  ];

  writeFileSync(mdPath, mdLines.join("\n"), "utf8");
  console.log(`[preflight] JSON written: ${toRepoPath(jsonPath)}`);
  console.log(`[preflight] Markdown written: ${toRepoPath(mdPath)}`);
}

function main(): void {
  const args = parseArgs();
  const timestamp = args.latest ? latestMetadataTimestamp() : args.timestamp;
  if (!timestamp) {
    console.error("[preflight] ERROR: provide --latest or --timestamp <timestamp>.");
    process.exit(1);
  }

  const metadataPath = resolve(metadataDir, `${timestamp}.json`);
  const intermediatePath = resolve(samplesDir, `${timestamp}.json`);
  const metadata = existsSync(metadataPath) ? readJson<MetadataShape>(metadataPath) : null;
  const intermediate = existsSync(intermediatePath)
    ? readJson<RuankaoIntermediateDocument>(intermediatePath)
    : null;
  const outerHtmlPath = findOuterHtmlPath(metadata, intermediate);
  const quarantineMap = loadQuarantineMap();

  const metadataResult = evaluateMetadataGate(timestamp, metadata, outerHtmlPath);
  const contentResult = evaluateContentGate(metadata, intermediate);
  const duplicateResult = evaluateDuplicateGate(timestamp, intermediate);
  const failureReasons = [
    ...metadataResult.reasons,
    ...contentResult.reasons,
    ...duplicateResult.reasons,
    ...(quarantineMap.has(timestamp) ? [`already_quarantined:${quarantineMap.get(timestamp)}`] : []),
  ];
  const overall =
    metadataResult.gate === "pass" &&
    (contentResult.gate === "pass" || contentResult.gate === "not_available") &&
    (duplicateResult.gate === "pass" || duplicateResult.gate === "unknown") &&
    !quarantineMap.has(timestamp)
      ? "pass"
      : "fail";

  const report: PreflightReport = {
    generated_at: new Date().toISOString(),
    timestamp,
    metadata_path: existsSync(metadataPath) ? toRepoPath(metadataPath) : null,
    intermediate_path: existsSync(intermediatePath) ? toRepoPath(intermediatePath) : null,
    outer_html_path: toRepoPath(outerHtmlPath),
    quarantine_manifest_path: existsSync(quarantineManifestPath) ? toRepoPath(quarantineManifestPath) : null,
    semantic_audit_path: existsSync(semanticAuditPath) ? toRepoPath(semanticAuditPath) : null,
    metadata_gate: metadataResult.gate,
    content_gate: contentResult.gate,
    duplicate_gate: duplicateResult.gate,
    overall,
    failure_reasons: failureReasons,
    recommended_action: chooseRecommendedAction(
      metadataResult.gate,
      contentResult.gate,
      duplicateResult.gate,
      failureReasons
    ),
    details: {
      final_url: metadata?.final_url ?? intermediate?.navigation_context?.final_url ?? null,
      detail_entry_route_changed:
        metadata?.detail_entry_route_changed ?? intermediate?.navigation_context?.detail_entry_route_changed ?? null,
      detail_entry_strategy:
        metadata?.detail_entry_strategy ?? intermediate?.navigation_context?.detail_entry_strategy ?? null,
      knowledge_node_click_text:
        metadata?.knowledge_node_click_text ?? metadata?.detail_entry_target_text ?? intermediate?.navigation_context?.target_node_text ?? null,
      requested_target_text: metadata?.requested_target_text ?? null,
      require_leaf: metadata?.require_leaf ?? null,
      resolved_leaf_text: metadata?.resolved_leaf_text ?? null,
      target_resolution_trusted: metadata?.target_resolution_trusted ?? null,
      target_leaf_exact_match: metadata?.target_leaf_exact_match ?? null,
      actual_node_matches_requested_target: metadata?.actual_node_matches_requested_target ?? null,
      target_resolution_failure_reason: metadata?.target_resolution_failure_reason ?? null,
      catalog_resolver_used: metadata?.catalog_resolver_used ?? null,
      catalog_match_found: metadata?.catalog_match_found ?? null,
      catalog_match_strategy: metadata?.catalog_match_strategy ?? null,
      catalog_chapter_title: metadata?.catalog_chapter_title ?? null,
      catalog_leaf_title: metadata?.catalog_leaf_title ?? null,
      catalog_live_replay_success: metadata?.catalog_live_replay_success ?? null,
      live_replay_visible_chapter_count: metadata?.live_replay_visible_chapter_count ?? null,
      live_replay_visible_leaf_count: metadata?.live_replay_visible_leaf_count ?? null,
      live_replay_top_candidates: metadata?.live_replay_top_candidates ?? [],
      live_replay_debug_paths: metadata?.live_replay_debug_paths ?? null,
      post_detail_content_signal: metadata?.post_detail_content_signal ?? null,
      title: intermediate?.content?.title ?? null,
      total_text_length: intermediate ? totalTextLength(intermediate) : null,
      image_refs_count: intermediate?.content?.image_refs?.length ?? null,
      expected_tokens: contentResult.expectedTokens,
      matched_tokens: contentResult.matchedTokens,
      quarantined: quarantineMap.has(timestamp),
      duplicate_match: duplicateResult.duplicateMatch,
      detail_content_stabilization_status: metadata?.detail_content_stabilization_status ?? null,
      detail_content_stabilization_text_length: metadata?.detail_content_stabilization_text_length ?? null,
      detail_content_stabilization_img_count: metadata?.detail_content_stabilization_img_count ?? null,
    },
  };

  writeReports(report);

  console.log("[preflight] Sample preflight complete");
  console.log(`  timestamp:          ${report.timestamp}`);
  console.log(`  metadata_gate:      ${report.metadata_gate}`);
  console.log(`  content_gate:       ${report.content_gate}`);
  console.log(`  duplicate_gate:     ${report.duplicate_gate}`);
  console.log(`  overall:            ${report.overall}`);
  console.log(`  recommended_action: ${report.recommended_action}`);
}

main();
