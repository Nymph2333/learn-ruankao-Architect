/**
 * Phase 3.16: detail-body binding and parser timestamp integrity audit.
 *
 * This script reads existing Phase 3.15 acquisition outputs and raw artifacts.
 * It does not crawl, parse new samples, decrypt encrypt=1 payloads, run OCR,
 * reconstruct image tables, generate Markdown knowledge documents, or enter
 * Phase 4.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const phase315ReportPath = resolve(generatedDir, "phase3_15_live_replay_verified_acquisition_run.json");
const semanticAuditPath = resolve(generatedDir, "phase3_7_semantic_alignment_audit.json");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const outerHtmlDir = resolve(repoRoot, "sources/ruankaodaren/raw/outer-html");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");

type BindingStatus =
  | "bound"
  | "stale_body"
  | "wrong_timestamp"
  | "weak_text_unknown"
  | "parser_container_mismatch"
  | "semantic_audit_false_positive"
  | "unknown";

interface Phase315TargetResult {
  target_id?: string;
  title_hint: string;
  produced_timestamp?: string | null;
  produced_metadata_path?: string | null;
  produced_intermediate_path?: string | null;
  produced_manifest_path?: string | null;
  crawl_timestamp?: string | null;
  metadata_path?: string | null;
  intermediate_path?: string | null;
  outer_html_paths?: string[];
  dom_text_path?: string | null;
  screenshot_path?: string | null;
  latest_success_timestamp_used_by_parser?: string | null;
  semantic_audit_sample_path?: string | null;
  semantic_audit_reason?: string | null;
}

interface Phase315Report {
  per_target_results?: Phase315TargetResult[];
}

interface MetadataShape {
  requested_target_text?: string | null;
  knowledge_node_click_text?: string | null;
  detail_entry_target_text?: string | null;
  resolved_target_text?: string | null;
  resolved_leaf_text?: string | null;
  final_url?: string;
  captured_at?: string;
  target_resolution_trusted?: boolean;
  catalog_live_replay_success?: boolean | null;
  detail_entry_route_changed?: boolean;
  detail_entry_strategy?: string | null;
  detail_content_text_preview?: string;
  detail_content_text_length?: number;
  outer_html_paths?: string[];
  screenshot_path?: string;
  dom_text_path?: string;
  container_text_path?: string;
  before_detail_screenshot_path?: string;
  after_detail_screenshot_path?: string;
}

interface SemanticAuditReport {
  samples?: SemanticAuditSample[];
}

interface SemanticAuditSample {
  sample_path?: string;
  timestamp: string;
  title?: string | null;
  alignment?: string;
  body_alignment?: string;
  expected_tokens?: string[];
  matched_body_tokens?: string[];
  matched_expected_tokens?: string[];
  conflicting_tokens?: string[];
  text_preview_used?: string;
  image_refs_surrounding_text_used?: string[];
  html_fragment_text_used?: string;
  detected_body_signals?: string[];
  quarantined?: boolean;
  quarantine_reason?: string | null;
  renderer_eligible?: boolean;
}

interface BindingTrace {
  target_title: string;
  crawl_timestamp: string | null;
  metadata_path: string | null;
  outer_html_paths: string[];
  intermediate_path: string | null;
  metadata: {
    requested_target_text: string | null;
    knowledge_node_click_text: string | null;
    resolved_target_text: string | null;
    final_url: string | null;
    target_resolution_trusted: boolean | null;
    catalog_live_replay_success: boolean | null;
    detail_entry_route_changed: boolean | null;
    detail_entry_strategy: string | null;
    detail_content_text_preview: string;
    detail_content_text_length: number;
  };
  raw_outer_html: {
    knowInfo_ql_editor_path: string | null;
    text_preview: string;
    text_length: number;
    contains_target_number: boolean;
    contains_target_keywords: boolean;
    matched_target_keywords: string[];
    contains_other_known_sample_tokens: string[];
  };
  intermediate: {
    title: string | null;
    source_timestamp: string | null;
    text_preview: string;
    text_length: number;
    key_terms: string[];
    image_refs: string[];
    classification: string | null;
    raw_paths: RuankaoIntermediateDocument["source"]["raw_paths"] | null;
  };
  semantic_audit: {
    alignment: string | null;
    body_alignment: string | null;
    expected_tokens: string[];
    matched_expected_tokens: string[];
    conflicting_tokens: string[];
    text_preview_used: string;
    image_refs_surrounding_text_used: string[];
    html_fragment_text_used: string;
    detected_body_signals: string[];
    quarantine_reason: string | null;
    renderer_eligible: boolean | null;
  };
  screenshot_debug: {
    screenshot_path: string | null;
    screenshot_exists: boolean;
    before_detail_screenshot_path: string | null;
    before_detail_screenshot_exists: boolean;
    after_detail_screenshot_path: string | null;
    after_detail_screenshot_exists: boolean;
  };
  timestamp_integrity: {
    metadata_timestamp: string | null;
    intermediate_source_timestamp: string | null;
    metadata_matches_intermediate: boolean;
    parser_selected_timestamp: string | null;
    parser_timestamp_matches_crawl: boolean;
  };
  binding_status: BindingStatus;
  evidence: string[];
  recommended_fix: string;
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function resolveRepoPath(repoPath: string | null | undefined): string | null {
  if (!repoPath) return null;
  return resolve(repoRoot, repoPath.replace(/\//g, "\\"));
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function maybeReadJson<T>(absPath: string | null): T | null {
  if (!absPath || !existsSync(absPath)) return null;
  return readJson<T>(absPath);
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

function truncate(value: string, maxLength = 260): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, "").trim().toLowerCase();
}

function sectionNumber(value: string | null | undefined): string | null {
  return (value ?? "").trim().match(/^(\d+(?:\.\d+)+)/)?.[1] ?? null;
}

function titleWithoutNumber(value: string | null | undefined): string {
  return (value ?? "").replace(/^\s*\d+(?:\.\d+)+\s*/, "").trim();
}

function targetKeywordTokens(value: string | null | undefined): string[] {
  const text = titleWithoutNumber(value);
  const rawTokens = [
    text,
    text.replace(/(常识|基础|知识|系统|技术|处理|设计|模型)$/, ""),
    ...text.split(/[的和与及、，,：:（）()—\-]/),
  ];
  const topicWords = [
    "数据库",
    "网络",
    "软件测试",
    "架构",
    "信息安全",
    "信息系统",
    "事务",
    "索引",
    "规范化",
    "TCP",
    "IP",
  ];
  for (const word of topicWords) {
    if (text.includes(word)) rawTokens.push(word);
  }

  const weak = new Set(["系统", "信息", "技术", "处理", "设计", "模型", "基础", "知识", "概述"]);
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const raw of rawTokens) {
    const token = raw.trim();
    const comparable = normalize(token);
    if (comparable.length < 2 || weak.has(comparable) || seen.has(comparable)) continue;
    seen.add(comparable);
    tokens.push(token);
  }
  return tokens;
}

function titleAligns(left: string | null | undefined, right: string | null | undefined): boolean {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const aSection = sectionNumber(left);
  const bSection = sectionNumber(right);
  if (aSection && bSection) return aSection === bSection;
  return (a.length >= 4 && b.includes(a)) || (b.length >= 4 && a.includes(b));
}

function relFileExists(repoPath: string | null): boolean {
  const absPath = resolveRepoPath(repoPath);
  return absPath !== null && existsSync(absPath);
}

function timestampFromPath(repoPath: string | null): string | null {
  if (!repoPath) return null;
  return basename(repoPath, ".json");
}

function metadataPathForTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;
  const absPath = resolve(metadataDir, `${timestamp}.json`);
  return existsSync(absPath) ? absPath : null;
}

function intermediatePathForTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;
  const absPath = resolve(samplesDir, `${timestamp}.json`);
  return existsSync(absPath) ? absPath : null;
}

function findMetadataByTarget(targetTitle: string): { timestamp: string; path: string } | null {
  if (!existsSync(metadataDir)) return null;
  const files = readdirSync(metadataDir)
    .filter((file) => file.endsWith(".json") && file !== ".gitkeep")
    .sort()
    .reverse();

  for (const file of files) {
    const absPath = resolve(metadataDir, file);
    const metadata = readJson<MetadataShape>(absPath);
    const candidates = [
      metadata.requested_target_text,
      metadata.knowledge_node_click_text,
      metadata.resolved_target_text,
      metadata.resolved_leaf_text,
      metadata.detail_entry_target_text,
    ];
    if (candidates.some((candidate) => titleAligns(candidate, targetTitle))) {
      return { timestamp: basename(file, ".json"), path: absPath };
    }
  }

  return null;
}

function outerHtmlPathsForTimestamp(timestamp: string | null, metadata: MetadataShape | null): string[] {
  const paths = metadata?.outer_html_paths ?? [];
  if (paths.length > 0) return paths;
  if (!timestamp || !existsSync(outerHtmlDir)) return [];
  return readdirSync(outerHtmlDir)
    .filter((file) => file.startsWith(`${timestamp}-`) && file.endsWith(".html"))
    .sort()
    .map((file) => `sources/ruankaodaren/raw/outer-html/${file}`);
}

function findKnowInfoPath(paths: string[]): string | null {
  return paths.find((path) => path.includes("knowInfo_ql-editor")) ?? null;
}

function readOuterHtmlText(repoPath: string | null): { rawHtml: string; text: string } {
  const absPath = resolveRepoPath(repoPath);
  if (!absPath || !existsSync(absPath)) return { rawHtml: "", text: "" };
  const rawHtml = readFileSync(absPath, "utf8");
  return { rawHtml, text: stripHtml(rawHtml) };
}

function documentText(doc: RuankaoIntermediateDocument | null): string {
  if (!doc) return "";
  return [
    ...(doc.content?.text_blocks ?? []).map((block) => block.text),
    ...(doc.content?.key_terms ?? []).map((term) => term.text),
    ...(doc.content?.image_refs ?? []).map((ref) => ref.surrounding_text ?? ""),
    ...(doc.content?.html_fragments ?? []).map((fragment) => stripHtml(fragment.outer_html ?? "")),
  ].join(" ");
}

function textBlocksText(doc: RuankaoIntermediateDocument | null): string {
  if (!doc) return "";
  return (doc.content?.text_blocks ?? []).map((block) => block.text).join(" ");
}

function textBlocksLength(doc: RuankaoIntermediateDocument | null): number {
  if (!doc) return 0;
  return (doc.content?.text_blocks ?? []).reduce((sum, block) => sum + block.text.length, 0);
}

function matchedKeywords(targetTitle: string, text: string): string[] {
  const normalizedText = normalize(text);
  return targetKeywordTokens(targetTitle).filter((token) => normalizedText.includes(normalize(token)));
}

function otherKnownSampleTokens(targetTitle: string, text: string): string[] {
  const normalizedText = normalize(text);
  const expected = new Set(targetKeywordTokens(targetTitle).map(normalize));
  const known = [
    "CISC",
    "RISC",
    "指令系统",
    "存储系统",
    "流水",
    "校验码",
    "纠错",
    "检错",
  ];
  return known.filter((token) => !expected.has(normalize(token)) && normalizedText.includes(normalize(token)));
}

function semanticForTimestamp(timestamp: string | null): SemanticAuditSample | null {
  if (!timestamp || !existsSync(semanticAuditPath)) return null;
  const audit = readJson<SemanticAuditReport>(semanticAuditPath);
  return (audit.samples ?? []).find((sample) => sample.timestamp === timestamp) ?? null;
}

function recommendedFixFor(status: BindingStatus): string {
  switch (status) {
    case "wrong_timestamp":
      return "Use strict timestamp parsing and keep crawl metadata, selected outerHTML, and intermediate source.timestamp aligned before semantic audit.";
    case "stale_body":
      return "After detail navigation, wait for the detail container text/hash to change and reject captures that still contain old known sample tokens.";
    case "weak_text_unknown":
      return "Do not count this sample as renderer baseline; either choose a richer leaf or add a detail-body completeness gate before parse.";
    case "parser_container_mismatch":
      return "Enhance the parser to preserve direct root text and inline text from .knowInfo.ql-editor, not only p/li blocks.";
    case "semantic_audit_false_positive":
      return "Improve semantic token evidence to recognize decisive target terms without weakening quarantine for unrelated content.";
    case "bound":
      return "Binding is coherent; keep this sample behind quality/semantic gates until renderer readiness is separately proven.";
    case "unknown":
      return "Collect missing trace evidence before acquisition continues.";
  }
}

function decideBindingStatus(args: {
  timestampMismatch: boolean;
  intermediateTitleMismatch: boolean;
  outerText: string;
  intermediateTextLength: number;
  rawTextLength: number;
  imageRefsCount: number;
  containsTargetKeywords: boolean;
  otherTokens: string[];
  semantic: SemanticAuditSample | null;
  missingArtifacts: string[];
}): { status: BindingStatus; evidence: string[] } {
  const evidence: string[] = [];
  if (args.missingArtifacts.length > 0) {
    evidence.push(`artifact_missing: ${args.missingArtifacts.join(", ")}`);
  }
  if (args.timestampMismatch) {
    evidence.push("metadata/intermediate timestamp mismatch");
    return { status: "wrong_timestamp", evidence };
  }
  if (args.intermediateTitleMismatch) {
    evidence.push("intermediate title does not align with target title");
    return { status: "wrong_timestamp", evidence };
  }
  if (args.otherTokens.length > 0) {
    evidence.push(`outerHTML contains other known sample token(s): ${args.otherTokens.join(", ")}`);
    return { status: "stale_body", evidence };
  }
  if (args.rawTextLength - args.intermediateTextLength >= 80) {
    evidence.push(
      `raw outerHTML text length (${args.rawTextLength}) is much larger than parsed text_blocks length (${args.intermediateTextLength})`
    );
    return { status: "parser_container_mismatch", evidence };
  }
  if (args.containsTargetKeywords && args.semantic?.renderer_eligible !== true) {
    evidence.push("raw outerHTML contains target keyword evidence but semantic audit still rejects renderer eligibility");
    return { status: "semantic_audit_false_positive", evidence };
  }
  if (args.rawTextLength < 120 && args.imageRefsCount === 0) {
    evidence.push(`detail body is short (${args.rawTextLength} chars) and has no image_refs`);
    return { status: "weak_text_unknown", evidence };
  }
  if (args.semantic?.renderer_eligible === true) {
    evidence.push("semantic audit marks sample renderer eligible");
    return { status: "bound", evidence };
  }
  evidence.push("no decisive binding evidence found");
  return { status: "unknown", evidence };
}

function buildTrace(result: Phase315TargetResult): BindingTrace {
  const targetTitle = result.title_hint;
  const reportTimestamp =
    result.crawl_timestamp ?? result.produced_timestamp ?? timestampFromPath(result.produced_metadata_path ?? null);
  const metadataFromTarget = reportTimestamp
    ? null
    : findMetadataByTarget(targetTitle);
  const crawlTimestamp = reportTimestamp ?? metadataFromTarget?.timestamp ?? null;
  const metadataPathAbs =
    resolveRepoPath(result.metadata_path ?? result.produced_metadata_path) ??
    metadataPathForTimestamp(crawlTimestamp) ??
    metadataFromTarget?.path ??
    null;
  const metadata = maybeReadJson<MetadataShape>(metadataPathAbs);
  const metadataTimestamp = crawlTimestamp ?? timestampFromPath(toRepoPath(metadataPathAbs));
  const outerPaths = result.outer_html_paths?.length
    ? result.outer_html_paths
    : outerHtmlPathsForTimestamp(metadataTimestamp, metadata);
  const knowInfoPath = findKnowInfoPath(outerPaths);
  const outer = readOuterHtmlText(knowInfoPath);
  const intermediatePathAbs =
    resolveRepoPath(result.intermediate_path ?? result.produced_intermediate_path) ??
    intermediatePathForTimestamp(metadataTimestamp);
  const intermediate = maybeReadJson<RuankaoIntermediateDocument>(intermediatePathAbs);
  const semantic = semanticForTimestamp(metadataTimestamp);
  const targetNumber = sectionNumber(targetTitle);
  const matchedTargetKeywords = matchedKeywords(targetTitle, outer.text);
  const otherTokens = otherKnownSampleTokens(targetTitle, outer.text);
  const sourceTimestamp = intermediate?.source?.timestamp ?? null;
  const parserSelectedTimestamp = result.latest_success_timestamp_used_by_parser ?? sourceTimestamp;
  const intermediateTextLength = textBlocksLength(intermediate);
  const intermediateTitle = intermediate?.content?.title ?? null;
  const imageRefs = (intermediate?.content?.image_refs ?? []).map((ref) => ref.src);
  const missingArtifacts = [
    metadataPathAbs && existsSync(metadataPathAbs) ? null : "metadata",
    knowInfoPath && relFileExists(knowInfoPath) ? null : "knowInfo_ql-editor outerHTML",
    intermediatePathAbs && existsSync(intermediatePathAbs) ? null : "intermediate JSON",
  ].filter((item): item is string => item !== null);

  const timestampMismatch =
    metadataTimestamp !== null &&
    sourceTimestamp !== null &&
    metadataTimestamp !== sourceTimestamp;
  const titleMismatch =
    intermediateTitle !== null &&
    !titleAligns(intermediateTitle, targetTitle);
  const binding = decideBindingStatus({
    timestampMismatch,
    intermediateTitleMismatch: titleMismatch,
    outerText: outer.text,
    intermediateTextLength,
    rawTextLength: outer.text.length,
    imageRefsCount: imageRefs.length,
    containsTargetKeywords: matchedTargetKeywords.length > 0,
    otherTokens,
    semantic,
    missingArtifacts,
  });

  return {
    target_title: targetTitle,
    crawl_timestamp: metadataTimestamp,
    metadata_path: toRepoPath(metadataPathAbs),
    outer_html_paths: outerPaths,
    intermediate_path: toRepoPath(intermediatePathAbs),
    metadata: {
      requested_target_text: metadata?.requested_target_text ?? null,
      knowledge_node_click_text: metadata?.knowledge_node_click_text ?? metadata?.detail_entry_target_text ?? null,
      resolved_target_text: metadata?.resolved_target_text ?? metadata?.resolved_leaf_text ?? null,
      final_url: metadata?.final_url ?? null,
      target_resolution_trusted: metadata?.target_resolution_trusted ?? null,
      catalog_live_replay_success: metadata?.catalog_live_replay_success ?? null,
      detail_entry_route_changed: metadata?.detail_entry_route_changed ?? null,
      detail_entry_strategy: metadata?.detail_entry_strategy ?? null,
      detail_content_text_preview: truncate(metadata?.detail_content_text_preview ?? ""),
      detail_content_text_length: metadata?.detail_content_text_length ?? 0,
    },
    raw_outer_html: {
      knowInfo_ql_editor_path: knowInfoPath,
      text_preview: truncate(outer.text),
      text_length: outer.text.length,
      contains_target_number: targetNumber ? outer.text.includes(targetNumber) : false,
      contains_target_keywords: matchedTargetKeywords.length > 0,
      matched_target_keywords: matchedTargetKeywords,
      contains_other_known_sample_tokens: otherTokens,
    },
    intermediate: {
      title: intermediateTitle,
      source_timestamp: sourceTimestamp,
      text_preview: truncate(textBlocksText(intermediate)),
      text_length: intermediateTextLength,
      key_terms: (intermediate?.content?.key_terms ?? []).map((term) => term.text),
      image_refs: imageRefs,
      classification: intermediate?.classification?.content_source_classification ?? null,
      raw_paths: intermediate?.source?.raw_paths ?? null,
    },
    semantic_audit: {
      alignment: semantic?.alignment ?? null,
      body_alignment: semantic?.body_alignment ?? null,
      expected_tokens: semantic?.expected_tokens ?? [],
      matched_expected_tokens: semantic?.matched_expected_tokens ?? semantic?.matched_body_tokens ?? [],
      conflicting_tokens: semantic?.conflicting_tokens ?? [],
      text_preview_used: truncate(semantic?.text_preview_used ?? ""),
      image_refs_surrounding_text_used: semantic?.image_refs_surrounding_text_used ?? [],
      html_fragment_text_used: truncate(semantic?.html_fragment_text_used ?? ""),
      detected_body_signals: semantic?.detected_body_signals ?? [],
      quarantine_reason: semantic?.quarantine_reason ?? null,
      renderer_eligible: semantic?.renderer_eligible ?? null,
    },
    screenshot_debug: {
      screenshot_path: metadata?.screenshot_path ?? null,
      screenshot_exists: relFileExists(metadata?.screenshot_path ?? null),
      before_detail_screenshot_path: metadata?.before_detail_screenshot_path ?? null,
      before_detail_screenshot_exists: relFileExists(metadata?.before_detail_screenshot_path ?? null),
      after_detail_screenshot_path: metadata?.after_detail_screenshot_path ?? null,
      after_detail_screenshot_exists: relFileExists(metadata?.after_detail_screenshot_path ?? null),
    },
    timestamp_integrity: {
      metadata_timestamp: metadataTimestamp,
      intermediate_source_timestamp: sourceTimestamp,
      metadata_matches_intermediate: !timestampMismatch && metadataTimestamp !== null && sourceTimestamp !== null,
      parser_selected_timestamp: parserSelectedTimestamp,
      parser_timestamp_matches_crawl:
        metadataTimestamp !== null &&
        parserSelectedTimestamp !== null &&
        metadataTimestamp === parserSelectedTimestamp,
    },
    binding_status: binding.status,
    evidence: binding.evidence,
    recommended_fix: recommendedFixFor(binding.status),
  };
}

function writeReports(traces: BindingTrace[]): void {
  mkdirSync(generatedDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const statusDistribution = traces.reduce<Record<string, number>>((acc, trace) => {
    acc[trace.binding_status] = (acc[trace.binding_status] ?? 0) + 1;
    return acc;
  }, {});
  const report = {
    generated_at: generatedAt,
    phase: "3.16",
    source_report: "verification/generated/phase3_15_live_replay_verified_acquisition_run.json",
    target_count: traces.length,
    status_distribution: statusDistribution,
    traces,
    constraints: {
      no_markdown_generated: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_full_site_crawl: true,
      phase4_not_entered: true,
    },
  };

  const jsonPath = resolve(generatedDir, "phase3_16_detail_binding_audit.json");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    "# Phase 3.16 Detail-body Binding Audit",
    "",
    `Generated at: ${generatedAt}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| Target count | ${traces.length} |`,
    ...Object.entries(statusDistribution).map(([status, count]) => `| ${status} | ${count} |`),
    "",
    "## Target Traces",
    "",
    "| Target | Binding status | Timestamp integrity | Raw text length | Intermediate text length | Semantic body alignment | Recommended fix |",
    "|---|---|---|---:|---:|---|---|",
    ...traces.map((trace) =>
      `| ${trace.target_title} | ${trace.binding_status} | ${trace.timestamp_integrity.metadata_matches_intermediate ? "matched" : "mismatch"} | ${trace.raw_outer_html.text_length} | ${trace.intermediate.text_length} | ${trace.semantic_audit.body_alignment ?? ""} | ${trace.recommended_fix} |`
    ),
    "",
    "## Evidence",
    "",
  ];

  for (const trace of traces) {
    mdLines.push(`### ${trace.target_title}`);
    mdLines.push("");
    mdLines.push(`- **crawl_timestamp**: ${trace.crawl_timestamp ?? "(missing)"}`);
    mdLines.push(`- **metadata_path**: ${trace.metadata_path ?? "(missing)"}`);
    mdLines.push(`- **intermediate_path**: ${trace.intermediate_path ?? "(missing)"}`);
    mdLines.push(`- **outerHTML**: ${trace.raw_outer_html.knowInfo_ql_editor_path ?? "(missing)"}`);
    mdLines.push(`- **metadata target**: ${trace.metadata.knowledge_node_click_text ?? "(missing)"}`);
    mdLines.push(`- **intermediate title**: ${trace.intermediate.title ?? "(missing)"}`);
    mdLines.push(`- **raw text preview**: ${trace.raw_outer_html.text_preview || "(empty)"}`);
    mdLines.push(`- **intermediate text preview**: ${trace.intermediate.text_preview || "(empty)"}`);
    mdLines.push(`- **semantic expected tokens**: ${trace.semantic_audit.expected_tokens.join(", ") || "(none)"}`);
    mdLines.push(`- **semantic matched tokens**: ${trace.semantic_audit.matched_expected_tokens.join(", ") || "(none)"}`);
    mdLines.push(`- **semantic detected signals**: ${trace.semantic_audit.detected_body_signals.join(", ") || "(none)"}`);
    mdLines.push(`- **screenshot exists**: ${trace.screenshot_debug.screenshot_exists}`);
    mdLines.push(`- **before/after debug screenshots exist**: ${trace.screenshot_debug.before_detail_screenshot_exists} / ${trace.screenshot_debug.after_detail_screenshot_exists}`);
    mdLines.push("- **evidence**:");
    if (trace.evidence.length === 0) {
      mdLines.push("  - None.");
    } else {
      for (const item of trace.evidence) mdLines.push(`  - ${item}`);
    }
    mdLines.push(`- **recommended_fix**: ${trace.recommended_fix}`);
    mdLines.push("");
  }

  mdLines.push("## Constraints");
  mdLines.push("");
  mdLines.push("- No Markdown knowledge documents generated.");
  mdLines.push("- No OCR used.");
  mdLines.push("- No encrypt=1 data decrypted.");
  mdLines.push("- No image table reconstructed.");
  mdLines.push("- No full-site batch crawl performed.");
  mdLines.push("- Phase 4 was not entered.");
  mdLines.push("");

  const mdPath = resolve(generatedDir, "phase3_16_detail_binding_audit.md");
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log("[detail-binding] Detail binding audit complete");
  console.log(`  targets: ${traces.length}`);
  for (const trace of traces) {
    console.log(`  ${trace.target_title}: ${trace.binding_status}`);
  }
  console.log(`  JSON report: ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report: ${toRepoPath(mdPath)}`);
}

function main(): void {
  if (!existsSync(phase315ReportPath)) {
    console.error("[detail-binding] ERROR: Phase 3.15 run report not found:", phase315ReportPath);
    process.exit(1);
  }

  const phase315 = readJson<Phase315Report>(phase315ReportPath);
  const targetResults = phase315.per_target_results ?? [];
  if (targetResults.length === 0) {
    console.error("[detail-binding] ERROR: Phase 3.15 run report contains no per_target_results.");
    process.exit(1);
  }

  const traces = targetResults.map(buildTrace);
  writeReports(traces);
}

main();
