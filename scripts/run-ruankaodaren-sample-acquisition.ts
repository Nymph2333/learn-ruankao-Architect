/**
 * Phase 3.3: Controlled multi-sample acquisition runner.
 *
 * This script orchestrates the existing ruankaodaren commands for at most
 * three pending sample targets. It does not parse encrypted XHR, does not run
 * OCR, does not generate Markdown knowledge documents, and does not batch
 * crawl the full site.
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const maxTargets = 3;

const sampleConfigPath = resolve(repoRoot, "config/ruankaodaren-sample-targets.yaml");
const generatedDir = resolve(repoRoot, "verification/generated");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const diagnosticsDir = resolve(repoRoot, "data/intermediate/ruankaodaren/diagnostics");
const manifestsDir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");
const coverageJsonPath = resolve(repoRoot, "verification/generated/phase3_2_sample_coverage.json");
const semanticAuditPath = resolve(repoRoot, "verification/generated/phase3_7_semantic_alignment_audit.json");
const qualityAuditPath = resolve(repoRoot, "verification/generated/phase3_4_sample_quality_audit.json");

type StepName =
  | "crawl"
  | "preflight_metadata"
  | "parse"
  | "preflight_content"
  | "validate_intermediate"
  | "capture_assets"
  | "validate_assets"
  | "audit_semantic"
  | "audit_quality"
  | "report_coverage";

interface SampleTarget {
  id: string;
  title_hint: string;
  expected_shape: string | null;
  chapter_hint: string | null;
  expected_classification: string | null;
  status: string;
  timestamp: string | null;
  require_leaf: string | null;
  require_preflight: string | null;
  source_catalog: string | null;
}

interface CommandStep {
  name: StepName;
  command: string;
  exit_code: number;
  success: boolean;
  stdout_summary: string;
  stderr_summary: string;
  duration_ms: number;
}

interface TargetRun {
  target_id: string;
  title_hint: string;
  expected_classification: string | null;
  status: "success" | "failed";
  failure_reason: string | null;
  asset_failure_reason: string | null;
  steps: CommandStep[];
  produced_timestamp: string | null;
  produced_metadata_path: string | null;
  produced_intermediate_path: string | null;
  produced_manifest_path: string | null;
  new_sample_added: boolean;
  actual_knowledge_node_click_text: string | null;
  require_leaf: boolean;
  chapter_level_hit: boolean;
  chapter_level_rejected: boolean;
  leaf_resolution_success: boolean;
  resolved_leaf_text: string | null;
  resolved_leaf_strategy: string | null;
  target_resolution_trusted: boolean | null;
  target_resolution_failure_reason: string | null;
  target_leaf_exact_match: boolean | null;
  actual_node_matches_requested_target: boolean | null;
  catalog_resolver_used: boolean | null;
  catalog_match_found: boolean | null;
  catalog_live_replay_success: boolean | null;
  catalog_match_strategy: string | null;
  live_replay_visible_chapter_count: number | null;
  live_replay_visible_leaf_count: number | null;
  live_replay_top_candidates: string[];
  live_replay_debug_paths: Record<string, string> | null;
  parse_timestamp_alignment: "matched" | "mismatched" | "unknown";
  classification: string | null;
  image_refs_count: number | null;
  downloaded_assets: number | null;
  manual_review_assets: number | null;
  text_blocks_count: number | null;
  total_text_length: number | null;
  content_ready: boolean | null;
  content_readiness_reason: string | null;
  diagnostic_sample: boolean;
  constraint_violations: string[];
  asset_manifest_status:
    | "not_run"
    | "present"
    | "missing"
    | "capture_failed"
    | "validation_failed"
    | "validated";
}

interface IntermediateShape {
  source?: {
    timestamp?: string;
  };
  content?: {
    title?: string | null;
    text_blocks?: Array<{ text?: string }>;
    key_terms?: Array<{ text?: string }>;
    image_refs?: unknown[];
  };
  classification?: {
    content_source_classification?: string;
  };
  constraints?: Record<string, unknown>;
}

interface MetadataShape {
  captured_at?: string;
  knowledge_node_click_text?: string | null;
  detail_entry_target_text?: string | null;
  final_url?: string;
  require_leaf?: boolean;
  chapter_level_hit?: boolean;
  chapter_level_text?: string | null;
  leaf_resolution_success?: boolean;
  resolved_leaf_text?: string | null;
  resolved_leaf_strategy?: string | null;
  leaf_requirement_failed?: boolean;
  target_resolution_trusted?: boolean;
  target_resolution_failure_reason?: string | null;
  target_leaf_exact_match?: boolean;
  actual_node_matches_requested_target?: boolean;
  catalog_resolver_used?: boolean;
  catalog_match_found?: boolean;
  catalog_live_replay_success?: boolean | null;
  catalog_match_strategy?: string | null;
  live_replay_visible_chapter_count?: number | null;
  live_replay_visible_leaf_count?: number | null;
  live_replay_top_candidates?: string[];
  live_replay_debug_paths?: Record<string, string> | null;
}

interface ManifestShape {
  source_timestamp?: string;
  asset_count?: number;
  assets?: Array<{
    asset_status?: string;
    requires_manual_review?: boolean;
  }>;
}

interface CoverageShape {
  total_samples?: number;
  classification_distribution?: Record<string, number>;
  total_image_refs?: number;
  samples_with_asset_manifests?: number;
  samples_without_asset_manifests?: number;
  total_downloaded_assets?: number;
  total_manual_review_assets?: number;
  constraint_violations_total?: number;
}

interface PreflightReport {
  timestamp: string;
  metadata_gate?: "pass" | "fail";
  content_gate?: "pass" | "fail" | "not_available";
  duplicate_gate?: "pass" | "fail" | "unknown";
  overall?: "pass" | "fail";
  failure_reasons?: string[];
  recommended_action?: string;
}

interface SemanticAuditShape {
  samples?: Array<{
    timestamp?: string;
    title?: string;
    renderer_eligible?: boolean;
  }>;
}

interface QualityAuditShape {
  overall_gate?: {
    phase4_renderer_allowed: boolean;
    required_before_phase4: string[];
  };
  summary?: {
    renderer_eligible_leaf_count?: number;
  };
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function stripYamlValue(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseSampleTargets(yamlText: string): SampleTarget[] {
  const targets: SampleTarget[] = [];
  let current: Partial<SampleTarget> | null = null;

  function flush(): void {
    if (current?.id && current.title_hint && current.status) {
      targets.push({
        id: current.id,
        title_hint: current.title_hint,
        expected_shape: current.expected_shape ?? null,
        chapter_hint: current.chapter_hint ?? null,
        expected_classification: current.expected_classification ?? null,
        status: current.status,
        timestamp: current.timestamp ?? null,
        require_leaf: current.require_leaf ?? null,
        require_preflight: current.require_preflight ?? null,
        source_catalog: current.source_catalog ?? null,
      });
    }
  }

  for (const line of yamlText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;

    const idMatch = trimmed.match(/^- id:\s*(.+)$/);
    if (idMatch) {
      flush();
      current = { id: stripYamlValue(idMatch[1] ?? "") };
      continue;
    }

    if (!current) continue;
    const kvMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1] as keyof SampleTarget;
    const value = stripYamlValue(kvMatch[2] ?? "");
    if (
      key === "title_hint" ||
      key === "expected_shape" ||
      key === "chapter_hint" ||
      key === "expected_classification" ||
      key === "status" ||
      key === "timestamp" ||
      key === "require_leaf" ||
      key === "require_preflight" ||
      key === "source_catalog"
    ) {
      current[key] = value;
    }
  }

  flush();
  return targets;
}

function commandArg(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function isChapterLevelText(text: string | null | undefined): boolean {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim();
  return /^第\s*\d+\s*章/.test(normalized) || (normalized.startsWith("第") && normalized.includes("章"));
}

function isLeafLevelText(text: string | null | undefined): boolean {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized || isChapterLevelText(normalized)) return false;
  return /^\d+(?:\.\d+)+\s*\S+/.test(normalized);
}

function outputToText(value: string | Buffer | null | undefined): string {
  if (typeof value === "string") return value;
  return value?.toString("utf8") ?? "";
}

function summarizeOutput(output: string, maxChars = 3_000): string {
  const lines = output
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
  const tail = lines.slice(-30).join("\n");
  if (tail.length <= maxChars) return tail;
  return tail.slice(tail.length - maxChars);
}

function runCommand(name: StepName, command: string): CommandStep {
  console.log(`[phase3.3] running ${name}: ${command}`);
  const started = Date.now();
  const result = spawnSync(command, {
    cwd: repoRoot,
    shell: true,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 20 * 1024 * 1024,
  });
  const durationMs = Date.now() - started;
  const errorText = result.error ? `\n${String(result.error)}` : "";
  const stderr = `${outputToText(result.stderr)}${errorText}`;
  const exitCode = typeof result.status === "number" ? result.status : result.error ? 1 : 0;
  const step: CommandStep = {
    name,
    command,
    exit_code: exitCode,
    success: exitCode === 0,
    stdout_summary: summarizeOutput(outputToText(result.stdout)),
    stderr_summary: summarizeOutput(stderr),
    duration_ms: durationMs,
  };
  console.log(`[phase3.3] ${name}: ${step.success ? "success" : `failed (${exitCode})`}`);
  return step;
}

function listJsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json") && file !== ".gitkeep")
    .sort();
}

function filenameSet(dir: string): Set<string> {
  return new Set(listJsonFiles(dir));
}

function newestFile(dir: string, before?: Set<string>): string | null {
  const files = listJsonFiles(dir);
  const candidates = before ? files.filter((file) => !before.has(file)) : files;
  const pool = candidates.length > 0 ? candidates : files;
  if (pool.length === 0) return null;
  return resolve(dir, pool.sort().at(-1) ?? pool[pool.length - 1]);
}

function readJson<T>(absPath: string | null): T | null {
  if (!absPath || !existsSync(absPath)) return null;
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function timestampFromMetadataPath(absPath: string | null): string | null {
  if (!absPath) return null;
  return basename(absPath, ".json");
}

function intermediatePathForTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;
  const absPath = resolve(samplesDir, `${timestamp}.json`);
  return existsSync(absPath) ? absPath : null;
}

function manifestPathForTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;
  const absPath = resolve(manifestsDir, `${timestamp}.json`);
  return existsSync(absPath) ? absPath : null;
}

function preflightReportPathForTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null;
  const absPath = resolve(generatedDir, `phase3_8_preflight_${timestamp}.json`);
  return existsSync(absPath) ? absPath : null;
}

function findProducedIntermediate(before: Set<string>, timestamp: string | null): string | null {
  const byTimestamp = intermediatePathForTimestamp(timestamp);
  if (byTimestamp) return byTimestamp;
  return newestFile(samplesDir, before);
}

function findProducedManifest(before: Set<string>, timestamp: string | null): string | null {
  const byTimestamp = manifestPathForTimestamp(timestamp);
  if (byTimestamp) return byTimestamp;
  return newestFile(manifestsDir, before);
}

function checkIntermediateConstraints(doc: IntermediateShape | null): string[] {
  if (!doc) return ["intermediate document unavailable"];
  const constraints = doc.constraints ?? {};
  const requiredFalse = [
    "ocr_used",
    "encrypted_xhr_decrypted",
    "image_table_reconstructed",
    "markdown_generated",
  ];
  return requiredFalse.filter((key) => constraints[key] !== false).map((key) => `${key} !== false`);
}

function totalTextLength(doc: IntermediateShape | null): number {
  return (doc?.content?.text_blocks ?? []).reduce((sum, block) => sum + (block.text?.length ?? 0), 0);
}

function textBlocksCount(doc: IntermediateShape | null): number {
  return doc?.content?.text_blocks?.length ?? 0;
}

function assessContentReadiness(doc: IntermediateShape | null): {
  contentReady: boolean;
  reason: string;
} {
  if (!doc) {
    return { contentReady: false, reason: "intermediate_unavailable" };
  }

  const textBlocks = textBlocksCount(doc);
  const totalLength = totalTextLength(doc);
  const imageRefs = doc.content?.image_refs?.length ?? 0;
  const classification = doc.classification?.content_source_classification ?? "UNKNOWN";

  if (textBlocks >= 2 && totalLength >= 120) {
    return { contentReady: true, reason: "text_blocks>=2_and_total_text_length>=120" };
  }

  if (imageRefs >= 1 && textBlocks >= 1) {
    return { contentReady: true, reason: "image_refs>=1_and_text_blocks>=1" };
  }

  if (classification === "HTML_RICH_TEXT" && totalLength >= 100) {
    return { contentReady: true, reason: "HTML_RICH_TEXT_and_total_text_length>=100" };
  }

  return { contentReady: false, reason: "not_ready_low_text" };
}

function normalizeForAlignment(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, "").trim().toLowerCase();
}

function titleSignalTerms(title: string | null | undefined): string[] {
  const withoutNumber = (title ?? "").replace(/^\d+(?:\.\d+)+\s*/, "").trim();
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
    const term = normalizeForAlignment(rawTerm);
    if (term.length < 2 || weakTerms.has(term) || seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }

  return terms;
}

function contentMentionsTitleSignal(doc: IntermediateShape | null): boolean {
  const title = doc?.content?.title ?? null;
  if (!isLeafLevelText(title)) return true;
  const terms = titleSignalTerms(title);
  if (terms.length === 0) return true;

  const body = normalizeForAlignment(
    [
      ...(doc?.content?.text_blocks ?? []).map((block) => block.text ?? ""),
      ...(doc?.content?.key_terms ?? []).map((term) => term.text ?? ""),
    ].join("\n")
  );

  return terms.some((term) => body.includes(term));
}

function countManifestAssets(manifest: ManifestShape | null): {
  downloaded_assets: number | null;
  manual_review_assets: number | null;
} {
  if (!manifest) return { downloaded_assets: null, manual_review_assets: null };
  const assets = manifest.assets ?? [];
  return {
    downloaded_assets: assets.filter((asset) => asset.asset_status === "downloaded").length,
    manual_review_assets: assets.filter((asset) => asset.requires_manual_review === true).length,
  };
}

function readCoverageSummary(): CoverageShape | null {
  return readJson<CoverageShape>(coverageJsonPath);
}

function readPreflightReport(timestamp: string | null): PreflightReport | null {
  return readJson<PreflightReport>(preflightReportPathForTimestamp(timestamp));
}

function semanticItemForTimestamp(timestamp: string | null): {
  timestamp?: string;
  title?: string;
  renderer_eligible?: boolean;
} | null {
  if (!timestamp) return null;
  const semanticAudit = readJson<SemanticAuditShape>(semanticAuditPath);
  return (semanticAudit?.samples ?? []).find((sample) => sample.timestamp === timestamp) ?? null;
}

function failureFromStep(step: CommandStep): string {
  const stderr = step.stderr_summary ? ` stderr: ${step.stderr_summary}` : "";
  const stdout = step.stdout_summary ? ` stdout: ${step.stdout_summary}` : "";
  return `${step.name} exited ${step.exit_code}.${stderr || stdout}`.slice(0, 1_000);
}

function diagnosticFileName(targetId: string, timestamp: string | null, stage: string): string {
  const safeTarget = targetId.replace(/[^A-Za-z0-9_.-]+/g, "_");
  const safeTimestamp = (timestamp ?? "no-timestamp").replace(/[^A-Za-z0-9_.-]+/g, "_");
  return `${safeTimestamp}-${safeTarget}-${stage}.json`;
}

function writeDiagnostic(
  run: TargetRun,
  stage: string,
  failureReason: string,
  preflight: PreflightReport | null = null
): void {
  mkdirSync(diagnosticsDir, { recursive: true });
  const absPath = resolve(diagnosticsDir, diagnosticFileName(run.target_id, run.produced_timestamp, stage));
  const diagnostic = {
    created_at: new Date().toISOString(),
    source_name: "ruankaodaren",
    phase: "3.12",
    target_id: run.target_id,
    title_hint: run.title_hint,
    stage,
    failure_reason: failureReason,
    produced_timestamp: run.produced_timestamp,
    produced_metadata_path: run.produced_metadata_path,
    produced_intermediate_path: run.produced_intermediate_path,
    actual_knowledge_node_click_text: run.actual_knowledge_node_click_text,
    resolved_leaf_text: run.resolved_leaf_text,
    target_resolution_trusted: run.target_resolution_trusted,
    target_resolution_failure_reason: run.target_resolution_failure_reason,
    target_leaf_exact_match: run.target_leaf_exact_match,
    actual_node_matches_requested_target: run.actual_node_matches_requested_target,
    catalog_resolver_used: run.catalog_resolver_used,
    catalog_match_found: run.catalog_match_found,
    catalog_live_replay_success: run.catalog_live_replay_success,
    catalog_match_strategy: run.catalog_match_strategy,
    live_replay_visible_chapter_count: run.live_replay_visible_chapter_count,
    live_replay_visible_leaf_count: run.live_replay_visible_leaf_count,
    live_replay_top_candidates: run.live_replay_top_candidates,
    live_replay_debug_paths: run.live_replay_debug_paths,
    catalog_live_replay_note:
      run.target_resolution_failure_reason === "catalog_live_replay_mismatch"
        ? "catalog said reachable, live replay failed"
        : null,
    excluded_from_renderer_baseline: true,
    preflight_report_path: toRepoPath(preflightReportPathForTimestamp(run.produced_timestamp)),
    preflight,
  };
  writeFileSync(absPath, `${JSON.stringify(diagnostic, null, 2)}\n`, "utf8");
  console.log(`[phase3.3] diagnostic written: ${toRepoPath(absPath)}`);
}

function applyMetadataToRun(run: TargetRun, metadata: MetadataShape | null): void {
  run.actual_knowledge_node_click_text =
    metadata?.knowledge_node_click_text ?? metadata?.detail_entry_target_text ?? null;
  run.chapter_level_hit = metadata?.chapter_level_hit === true;
  run.leaf_resolution_success = metadata?.leaf_resolution_success === true;
  run.resolved_leaf_text = metadata?.resolved_leaf_text ?? null;
  run.resolved_leaf_strategy = metadata?.resolved_leaf_strategy ?? null;
  run.target_resolution_trusted = metadata?.target_resolution_trusted ?? null;
  run.target_resolution_failure_reason = metadata?.target_resolution_failure_reason ?? null;
  run.target_leaf_exact_match = metadata?.target_leaf_exact_match ?? null;
  run.actual_node_matches_requested_target = metadata?.actual_node_matches_requested_target ?? null;
  run.catalog_resolver_used = metadata?.catalog_resolver_used ?? null;
  run.catalog_match_found = metadata?.catalog_match_found ?? null;
  run.catalog_live_replay_success = metadata?.catalog_live_replay_success ?? null;
  run.catalog_match_strategy = metadata?.catalog_match_strategy ?? null;
  run.live_replay_visible_chapter_count = metadata?.live_replay_visible_chapter_count ?? null;
  run.live_replay_visible_leaf_count = metadata?.live_replay_visible_leaf_count ?? null;
  run.live_replay_top_candidates = metadata?.live_replay_top_candidates ?? [];
  run.live_replay_debug_paths = metadata?.live_replay_debug_paths ?? null;
}

function distributionFromResults(results: TargetRun[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const result of results) {
    if (!result.classification) continue;
    distribution[result.classification] = (distribution[result.classification] ?? 0) + 1;
  }
  return distribution;
}

function imageRefDistributionFromResults(results: TargetRun[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const result of results) {
    if (result.image_refs_count === null) continue;
    const key = String(result.image_refs_count);
    distribution[key] = (distribution[key] ?? 0) + 1;
  }
  return distribution;
}

function writeReports(results: TargetRun[], pendingTargets: SampleTarget[]): void {
  mkdirSync(generatedDir, { recursive: true });
  const coverage = readCoverageSummary();
  const successfulSamples = results.filter((result) => result.status === "success").length;
  const failedTargets = results.filter((result) => result.status === "failed").length;
  const successfulNewSamples = results.filter((result) => result.new_sample_added).length;
  const commandsExecuted = results.flatMap((result) =>
    result.steps.map((step) => ({
      target_id: result.target_id,
      command: step.command,
      exit_code: step.exit_code,
      success: step.success,
    }))
  );

  const report = {
    generated_at: new Date().toISOString(),
    config_path: "config/ruankaodaren-sample-targets.yaml",
    attempted_target_count: results.length,
    max_target_count: maxTargets,
    pending_target_count: pendingTargets.length,
    successful_sample_count: successfulSamples,
    successful_new_sample_count: successfulNewSamples,
    failed_target_count: failedTargets,
    content_ready_success_count: results.filter((result) => result.content_ready === true).length,
    low_text_rejected_count: results.filter(
      (result) => result.content_readiness_reason === "not_ready_low_text"
    ).length,
    diagnostic_sample_count: results.filter((result) => result.diagnostic_sample).length,
    renderer_baseline_candidate_titles: results
      .filter((result) => result.content_ready === true)
      .map((result) => result.actual_knowledge_node_click_text)
      .filter((title): title is string => typeof title === "string" && title.length > 0),
    chapter_level_rejected_count: results.filter((result) => result.chapter_level_rejected).length,
    leaf_resolution_success_count: results.filter((result) => result.leaf_resolution_success).length,
    leaf_resolution_failed_count: results.filter(
      (result) => result.require_leaf && !result.leaf_resolution_success
    ).length,
    target_resolution_trusted_count: results.filter((result) => result.target_resolution_trusted === true).length,
    target_resolution_failed_count: results.filter(
      (result) => result.require_leaf && result.target_resolution_trusted !== true
    ).length,
    exact_leaf_match_count: results.filter((result) => result.target_leaf_exact_match === true).length,
    target_resolution_failure_reasons: results
      .filter((result) => result.target_resolution_failure_reason || result.failure_reason?.includes("target_resolution"))
      .map((result) => ({
        target_id: result.target_id,
        reason: result.target_resolution_failure_reason ?? result.failure_reason,
      })),
    resolved_leaf_titles: results
      .map((result) => result.resolved_leaf_text)
      .filter((title): title is string => typeof title === "string" && title.length > 0),
    actual_titles: results
      .map((result) => result.actual_knowledge_node_click_text)
      .filter((title): title is string => typeof title === "string" && title.length > 0),
    classification_distribution: distributionFromResults(results),
    image_refs_distribution: imageRefDistributionFromResults(results),
    asset_manifest_status: Object.fromEntries(
      results.map((result) => [result.target_id, result.asset_manifest_status])
    ),
    constraint_violations: results.flatMap((result) =>
      result.constraint_violations.map((violation) => ({
        target_id: result.target_id,
        violation,
      }))
    ),
    commands_executed: commandsExecuted,
    failure_reasons: results
      .filter((result) => result.failure_reason || result.asset_failure_reason)
      .map((result) => ({
        target_id: result.target_id,
        failure_reason: result.failure_reason,
        asset_failure_reason: result.asset_failure_reason,
      })),
    final_coverage_report_path: existsSync(coverageJsonPath)
      ? "verification/generated/phase3_2_sample_coverage.json"
      : null,
    final_coverage_summary: coverage,
    targets: results,
  };

  const jsonPath = resolve(generatedDir, "phase3_3_sample_acquisition_run.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdLines = [
    "# Phase 3.3 Sample Acquisition Run",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Attempted targets | ${report.attempted_target_count} |`,
    `| Successful samples | ${report.successful_sample_count} |`,
    `| Successful new samples | ${report.successful_new_sample_count} |`,
    `| Failed targets | ${report.failed_target_count} |`,
    `| Content-ready success | ${report.content_ready_success_count} |`,
    `| Low-text rejected | ${report.low_text_rejected_count} |`,
    `| Diagnostic samples | ${report.diagnostic_sample_count} |`,
    `| Chapter-level rejected | ${report.chapter_level_rejected_count} |`,
    `| Leaf resolution success | ${report.leaf_resolution_success_count} |`,
    `| Leaf resolution failed | ${report.leaf_resolution_failed_count} |`,
    `| Target resolution trusted | ${report.target_resolution_trusted_count} |`,
    `| Target resolution failed | ${report.target_resolution_failed_count} |`,
    `| Exact leaf match | ${report.exact_leaf_match_count} |`,
    `| Final coverage total samples | ${coverage?.total_samples ?? "unknown"} |`,
    `| Final coverage image_refs | ${coverage?.total_image_refs ?? "unknown"} |`,
    `| Samples with asset manifests | ${coverage?.samples_with_asset_manifests ?? "unknown"} |`,
    `| Constraint violations | ${coverage?.constraint_violations_total ?? "unknown"} |`,
    "",
    "## Target Results",
    "",
    "| Target | Hint | Status | Actual title | Resolved leaf | Trusted | Exact leaf | Content-ready | Text length | Classification | image_refs | Asset status | New sample |",
    "|---|---|---|---|---|---|---|---|---:|---|---:|---|---|",
    ...results.map(
      (result) =>
        `| ${result.target_id} | ${result.title_hint} | ${result.status} | ${result.actual_knowledge_node_click_text ?? ""} | ${result.resolved_leaf_text ?? ""} | ${result.target_resolution_trusted === null ? "" : result.target_resolution_trusted ? "yes" : "no"} | ${result.target_leaf_exact_match === null ? "" : result.target_leaf_exact_match ? "yes" : "no"} | ${result.content_ready === null ? "" : result.content_ready ? "yes" : "no"} | ${result.total_text_length ?? ""} | ${result.classification ?? ""} | ${result.image_refs_count ?? ""} | ${result.asset_manifest_status} | ${result.new_sample_added ? "yes" : "no"} |`
    ),
    "",
    "## Classification Distribution",
    "",
    "```json",
    JSON.stringify(report.classification_distribution, null, 2),
    "```",
    "",
    "## Image Refs Distribution",
    "",
    "```json",
    JSON.stringify(report.image_refs_distribution, null, 2),
    "```",
    "",
    "## Failures",
    "",
  ];

  if (report.failure_reasons.length === 0) {
    mdLines.push("- None recorded.");
  } else {
    for (const failure of report.failure_reasons) {
      mdLines.push(`- ${failure.target_id}: ${failure.failure_reason ?? failure.asset_failure_reason}`);
    }
  }

  mdLines.push("");
  mdLines.push("## Commands Executed");
  mdLines.push("");
  for (const result of results) {
    mdLines.push(`### ${result.target_id}`);
    mdLines.push("");
    for (const step of result.steps) {
      mdLines.push(`- \`${step.command}\` -> exit ${step.exit_code}`);
    }
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

  const mdPath = resolve(generatedDir, "phase3_3_sample_acquisition_run.md");
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log(`[phase3.3] JSON report written: ${toRepoPath(jsonPath)}`);
  console.log(`[phase3.3] Markdown report written: ${toRepoPath(mdPath)}`);
}

function writePhase39Reports(results: TargetRun[]): void {
  mkdirSync(generatedDir, { recursive: true });

  const semanticAudit = readJson<SemanticAuditShape>(semanticAuditPath);
  const qualityAudit = readJson<QualityAuditShape>(qualityAuditPath);
  const semanticEligibleTimestamps = new Set(
    (semanticAudit?.samples ?? [])
      .filter((s) => s.renderer_eligible === true)
      .map((s) => s.timestamp)
      .filter((ts): ts is string => typeof ts === "string")
  );

  const preflightFailed: Array<{ target_id: string; title_hint: string; reason: string }> = [];
  const rejectedBySemantic: Array<{ target_id: string; title_hint: string; timestamp: string | null; reason: string }> = [];
  const rejectedByQuality: Array<{ target_id: string; title_hint: string; reason: string }> = [];
  const rendererEligibleAdded: Array<{ target_id: string; title_hint: string; timestamp: string }> = [];

  let preflightPassCount = 0;
  let preflightFailCount = 0;

  for (const run of results) {
    const hadPreflightMetadata = run.steps.some((s) => s.name === "preflight_metadata");
    const preflightMetadataStep = run.steps.find((s) => s.name === "preflight_metadata");
    const preflightContentStep = run.steps.find((s) => s.name === "preflight_content");

    const metadataFailed = hadPreflightMetadata && preflightMetadataStep && !preflightMetadataStep.success;
    const contentFailed = preflightContentStep && !preflightContentStep.success;

    if (metadataFailed) {
      preflightFailCount++;
      preflightFailed.push({
        target_id: run.target_id,
        title_hint: run.title_hint,
        reason: run.failure_reason ?? "metadata_preflight_failed",
      });
      continue;
    }

    if (contentFailed) {
      preflightFailCount++;
      preflightFailed.push({
        target_id: run.target_id,
        title_hint: run.title_hint,
        reason: run.failure_reason ?? "content_preflight_failed",
      });
      continue;
    }

    if (run.failure_reason?.startsWith("metadata_preflight_failed") || run.failure_reason?.startsWith("content_preflight_failed")) {
      preflightFailCount++;
      preflightFailed.push({ target_id: run.target_id, title_hint: run.title_hint, reason: run.failure_reason });
      continue;
    }

    if (run.failure_reason?.includes("target_resolution_failed")) {
      preflightFailCount++;
      preflightFailed.push({ target_id: run.target_id, title_hint: run.title_hint, reason: run.failure_reason });
      continue;
    }

    if (run.status === "failed") {
      // Failed before or during parse — not a preflight rejection
      continue;
    }

    preflightPassCount++;

    if (run.produced_timestamp && semanticEligibleTimestamps.has(run.produced_timestamp)) {
      rendererEligibleAdded.push({
        target_id: run.target_id,
        title_hint: run.title_hint,
        timestamp: run.produced_timestamp,
      });
    } else if (run.produced_timestamp) {
      rejectedBySemantic.push({
        target_id: run.target_id,
        title_hint: run.title_hint,
        timestamp: run.produced_timestamp,
        reason: run.failure_reason ?? "semantic_audit_renderer_eligible_false",
      });
    }
  }

  const finalRendererEligibleCount = qualityAudit?.summary?.renderer_eligible_leaf_count ?? semanticEligibleTimestamps.size;
  const phase4Allowed = qualityAudit?.overall_gate?.phase4_renderer_allowed ?? false;
  const requiredBeforePhase4 = qualityAudit?.overall_gate?.required_before_phase4 ?? [
    `acquire ${Math.max(0, 3 - finalRendererEligibleCount)} more renderer-eligible leaf samples`,
  ];

  const perTargetResults = results.map((run) => {
    const preflightContentStep = run.steps.find((s) => s.name === "preflight_content");
    const preflightMetadataStep = run.steps.find((s) => s.name === "preflight_metadata");
    const preflightPass =
      (preflightMetadataStep?.success ?? false) && (preflightContentStep?.success ?? false);
    const rendererEligible =
      run.produced_timestamp != null && semanticEligibleTimestamps.has(run.produced_timestamp);
    return {
      target_id: run.target_id,
      title_hint: run.title_hint,
      preflight_result: preflightPass
        ? "pass"
        : run.failure_reason?.includes("preflight") || run.failure_reason?.includes("target_resolution")
          ? "fail"
          : "not_reached",
      target_resolution_trusted: run.target_resolution_trusted,
      target_leaf_exact_match: run.target_leaf_exact_match,
      target_resolution_failure_reason: run.target_resolution_failure_reason,
      semantic_audit_result: rendererEligible
        ? "pass"
        : run.produced_timestamp
          ? "fail_not_renderer_eligible"
          : "not_reached",
      renderer_eligible: rendererEligible,
      reject_reason: run.failure_reason ?? null,
    };
  });

  const phase39Report = {
    generated_at: new Date().toISOString(),
    phase: "3.9",
    attempted_target_count: results.length,
    target_list: results.map((r) => ({ target_id: r.target_id, title_hint: r.title_hint })),
    per_target_results: perTargetResults,
    preflight_pass_count: preflightPassCount,
    preflight_fail_count: preflightFailCount,
    target_resolution_trusted_count: results.filter((run) => run.target_resolution_trusted === true).length,
    target_resolution_failed_count: results.filter((run) => run.require_leaf && run.target_resolution_trusted !== true).length,
    exact_leaf_match_count: results.filter((run) => run.target_leaf_exact_match === true).length,
    target_resolution_failure_reasons: results
      .filter((run) => run.target_resolution_failure_reason || run.failure_reason?.includes("target_resolution"))
      .map((run) => ({
        target_id: run.target_id,
        reason: run.target_resolution_failure_reason ?? run.failure_reason,
      })),
    renderer_eligible_added_count: rendererEligibleAdded.length,
    renderer_eligible_added_titles: rendererEligibleAdded.map((r) => r.title_hint),
    rejected_by_preflight: preflightFailed,
    rejected_by_semantic_audit: rejectedBySemantic,
    rejected_by_quality_audit: rejectedByQuality,
    final_renderer_eligible_count: finalRendererEligibleCount,
    phase4_renderer_allowed: phase4Allowed,
    required_before_phase4: requiredBeforePhase4,
    constraints: {
      no_markdown_generated: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_full_site_crawl: true,
      phase4_not_entered: true,
    },
  };

  const jsonPath = resolve(generatedDir, "phase3_9_renderer_baseline_acquisition_run.json");
  writeFileSync(jsonPath, JSON.stringify(phase39Report, null, 2), "utf8");

  const mdLines: string[] = [
    "# Phase 3.9 Renderer Baseline Acquisition Run",
    "",
    `Generated at: ${phase39Report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Attempted targets | ${phase39Report.attempted_target_count} |`,
    `| Preflight pass | ${phase39Report.preflight_pass_count} |`,
    `| Preflight fail | ${phase39Report.preflight_fail_count} |`,
    `| Target resolution trusted | ${phase39Report.target_resolution_trusted_count} |`,
    `| Target resolution failed | ${phase39Report.target_resolution_failed_count} |`,
    `| Exact leaf match | ${phase39Report.exact_leaf_match_count} |`,
    `| Renderer eligible added | ${phase39Report.renderer_eligible_added_count} |`,
    `| Final renderer eligible count | ${phase39Report.final_renderer_eligible_count} |`,
    `| Phase 4 renderer allowed | ${phase39Report.phase4_renderer_allowed} |`,
    "",
    "## Per-Target Results",
    "",
    "| Target | Hint | Preflight | Trusted | Exact leaf | Semantic Audit | Renderer Eligible | Reject Reason |",
    "|---|---|---|---|---|---|---|---|",
    ...perTargetResults.map(
      (r) =>
        `| ${r.target_id} | ${r.title_hint} | ${r.preflight_result} | ${r.target_resolution_trusted === null ? "" : r.target_resolution_trusted ? "yes" : "no"} | ${r.target_leaf_exact_match === null ? "" : r.target_leaf_exact_match ? "yes" : "no"} | ${r.semantic_audit_result} | ${r.renderer_eligible ? "yes" : "no"} | ${r.reject_reason ?? ""} |`
    ),
    "",
    "## Renderer Eligible Added",
    "",
    ...(rendererEligibleAdded.length === 0
      ? ["- None added in this run."]
      : rendererEligibleAdded.map((r) => `- ${r.title_hint} (${r.timestamp})`)),
    "",
    "## Rejected by Preflight",
    "",
    ...(preflightFailed.length === 0
      ? ["- None."]
      : preflightFailed.map((r) => `- ${r.target_id}: ${r.reason}`)),
    "",
    "## Rejected by Semantic Audit",
    "",
    ...(rejectedBySemantic.length === 0
      ? ["- None."]
      : rejectedBySemantic.map((r) => `- ${r.target_id}: ${r.reason}`)),
    "",
    "## Phase 4 Gate",
    "",
    `- **phase4_renderer_allowed**: ${phase39Report.phase4_renderer_allowed}`,
    "- **required_before_phase4**:",
    ...(requiredBeforePhase4.length === 0 ? ["  - (none)"] : requiredBeforePhase4.map((item) => `  - ${item}`)),
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

  const mdPath = resolve(generatedDir, "phase3_9_renderer_baseline_acquisition_run.md");
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log(`[phase3.9] JSON report written: ${toRepoPath(jsonPath)}`);
  console.log(`[phase3.9] Markdown report written: ${toRepoPath(mdPath)}`);
  console.log(`[phase3.9] renderer_eligible_added_count: ${phase39Report.renderer_eligible_added_count}`);
  console.log(`[phase3.9] final_renderer_eligible_count: ${phase39Report.final_renderer_eligible_count}`);
  console.log(`[phase3.9] phase4_renderer_allowed: ${phase39Report.phase4_renderer_allowed}`);
}

function writePhase312Reports(results: TargetRun[]): void {
  mkdirSync(generatedDir, { recursive: true });

  const semanticAudit = readJson<SemanticAuditShape>(semanticAuditPath);
  const qualityAudit = readJson<QualityAuditShape>(qualityAuditPath);
  const semanticEligibleTimestamps = new Set(
    (semanticAudit?.samples ?? [])
      .filter((s) => s.renderer_eligible === true)
      .map((s) => s.timestamp)
      .filter((ts): ts is string => typeof ts === "string")
  );

  const perTargetResults = results.map((run) => {
    const metadataPreflightStep = run.steps.find((s) => s.name === "preflight_metadata");
    const contentPreflightStep = run.steps.find((s) => s.name === "preflight_content");
    const parseStep = run.steps.find((s) => s.name === "parse");
    const semanticStep = run.steps.find((s) => s.name === "audit_semantic");
    const captureStep = run.steps.find((s) => s.name === "capture_assets");
    const validateAssetsStep = run.steps.find((s) => s.name === "validate_assets");
    const preflightPass =
      (metadataPreflightStep?.success ?? false) &&
      (contentPreflightStep ? contentPreflightStep.success : run.failure_reason !== null ? false : false);
    const rendererEligible =
      run.produced_timestamp !== null && semanticEligibleTimestamps.has(run.produced_timestamp);
    const preflightResult =
      run.failure_reason?.includes("preflight") || run.failure_reason?.includes("target_resolution")
        ? "fail"
        : metadataPreflightStep?.success && (!contentPreflightStep || contentPreflightStep.success)
          ? "pass"
          : metadataPreflightStep
            ? "fail"
            : "not_reached";

    return {
      target_id: run.target_id,
      title_hint: run.title_hint,
      commands: run.steps.map((step) => ({
        name: step.name,
        command: step.command,
        exit_code: step.exit_code,
        success: step.success,
      })),
      preflight_result: preflightPass ? "pass" : preflightResult,
      parse_result: parseStep ? (parseStep.success ? "pass" : "fail") : "not_reached",
      semantic_audit_result: rendererEligible
        ? "pass"
        : semanticStep
          ? semanticStep.success
            ? "fail_not_renderer_eligible"
            : "fail"
          : "not_reached",
      asset_capture_result: captureStep
        ? captureStep.success
          ? validateAssetsStep
            ? validateAssetsStep.success
              ? "validated"
              : "validation_failed"
            : "captured"
          : "failed"
        : "not_reached",
      renderer_eligible: rendererEligible,
      produced_timestamp: run.produced_timestamp,
      produced_intermediate_path: run.produced_intermediate_path,
      produced_manifest_path: run.produced_manifest_path,
      target_resolution_trusted: run.target_resolution_trusted,
      target_leaf_exact_match: run.target_leaf_exact_match,
      actual_node_matches_requested_target: run.actual_node_matches_requested_target,
      catalog_resolver_used: run.catalog_resolver_used,
      catalog_match_found: run.catalog_match_found,
      catalog_live_replay_success: run.catalog_live_replay_success,
      catalog_match_strategy: run.catalog_match_strategy,
      live_replay_visible_chapter_count: run.live_replay_visible_chapter_count,
      live_replay_visible_leaf_count: run.live_replay_visible_leaf_count,
      live_replay_top_candidates: run.live_replay_top_candidates,
      live_replay_debug_paths: run.live_replay_debug_paths,
      actual_knowledge_node_click_text: run.actual_knowledge_node_click_text,
      failure_reason: run.failure_reason ?? run.asset_failure_reason,
    };
  });

  const rendererEligibleAdded = results.filter(
    (run) => run.produced_timestamp !== null && semanticEligibleTimestamps.has(run.produced_timestamp)
  );
  const finalRendererEligibleCount =
    qualityAudit?.summary?.renderer_eligible_leaf_count ?? semanticEligibleTimestamps.size;
  const phase4Allowed = qualityAudit?.overall_gate?.phase4_renderer_allowed ?? false;
  const requiredBeforePhase4 = qualityAudit?.overall_gate?.required_before_phase4 ?? [
    `acquire ${Math.max(0, 3 - finalRendererEligibleCount)} more renderer-eligible leaf samples`,
  ];

  const phase312Report = {
    generated_at: new Date().toISOString(),
    phase: "3.12",
    target_list: results.map((run) => ({
      target_id: run.target_id,
      title_hint: run.title_hint,
    })),
    attempted_target_count: results.length,
    exact_leaf_target_count: results.filter((run) => run.require_leaf).length,
    preflight_pass_count: perTargetResults.filter((run) => run.preflight_result === "pass").length,
    preflight_fail_count: perTargetResults.filter((run) => run.preflight_result === "fail").length,
    semantic_pass_count: perTargetResults.filter((run) => run.semantic_audit_result === "pass").length,
    semantic_fail_count: perTargetResults.filter((run) =>
      String(run.semantic_audit_result).startsWith("fail")
    ).length,
    renderer_eligible_added_count: rendererEligibleAdded.length,
    renderer_eligible_added_titles: rendererEligibleAdded
      .map((run) => run.actual_knowledge_node_click_text ?? run.title_hint)
      .filter((title): title is string => typeof title === "string" && title.length > 0),
    rejected_targets: perTargetResults
      .filter((run) => run.renderer_eligible !== true)
      .map((run) => ({
        target_id: run.target_id,
        title_hint: run.title_hint,
        reason: run.failure_reason ?? run.semantic_audit_result,
      })),
    per_target_results: perTargetResults,
    final_renderer_eligible_count: finalRendererEligibleCount,
    phase4_renderer_allowed: phase4Allowed,
    required_before_phase4: requiredBeforePhase4,
    constraints: {
      no_markdown_generated: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_full_site_crawl: true,
      phase4_not_entered: true,
    },
  };

  const jsonPath = resolve(generatedDir, "phase3_12_reachable_leaf_acquisition_run.json");
  writeFileSync(jsonPath, `${JSON.stringify(phase312Report, null, 2)}\n`, "utf8");

  const mdLines: string[] = [
    "# Phase 3.12 Reachable-leaf Acquisition Run",
    "",
    `Generated at: ${phase312Report.generated_at}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Attempted targets | ${phase312Report.attempted_target_count} |`,
    `| Exact leaf targets | ${phase312Report.exact_leaf_target_count} |`,
    `| Preflight pass | ${phase312Report.preflight_pass_count} |`,
    `| Preflight fail | ${phase312Report.preflight_fail_count} |`,
    `| Semantic pass | ${phase312Report.semantic_pass_count} |`,
    `| Semantic fail | ${phase312Report.semantic_fail_count} |`,
    `| Renderer eligible added | ${phase312Report.renderer_eligible_added_count} |`,
    `| Final renderer eligible count | ${phase312Report.final_renderer_eligible_count} |`,
    `| Phase 4 renderer allowed | ${phase312Report.phase4_renderer_allowed} |`,
    "",
    "## Target Results",
    "",
    "| Target | Hint | Preflight | Parse | Semantic Audit | Asset Capture | Renderer Eligible | Reject Reason |",
    "|---|---|---|---|---|---|---|---|",
    ...perTargetResults.map(
      (run) =>
        `| ${run.target_id} | ${run.title_hint} | ${run.preflight_result} | ${run.parse_result} | ${run.semantic_audit_result} | ${run.asset_capture_result} | ${run.renderer_eligible ? "yes" : "no"} | ${run.failure_reason ?? ""} |`
    ),
    "",
    "## Renderer Eligible Added",
    "",
    ...(phase312Report.renderer_eligible_added_titles.length === 0
      ? ["- None added in this run."]
      : phase312Report.renderer_eligible_added_titles.map((title) => `- ${title}`)),
    "",
    "## Rejected Targets",
    "",
    ...(phase312Report.rejected_targets.length === 0
      ? ["- None."]
      : phase312Report.rejected_targets.map((target) => `- ${target.target_id}: ${target.reason}`)),
    "",
    "## Phase 4 Gate",
    "",
    `- **phase4_renderer_allowed**: ${phase312Report.phase4_renderer_allowed}`,
    "- **required_before_phase4**:",
    ...(requiredBeforePhase4.length === 0 ? ["  - (none)"] : requiredBeforePhase4.map((item) => `  - ${item}`)),
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

  const mdPath = resolve(generatedDir, "phase3_12_reachable_leaf_acquisition_run.md");
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log(`[phase3.12] JSON report written: ${toRepoPath(jsonPath)}`);
  console.log(`[phase3.12] Markdown report written: ${toRepoPath(mdPath)}`);
  console.log(`[phase3.12] renderer_eligible_added_count: ${phase312Report.renderer_eligible_added_count}`);
  console.log(`[phase3.12] final_renderer_eligible_count: ${phase312Report.final_renderer_eligible_count}`);
  console.log(`[phase3.12] phase4_renderer_allowed: ${phase312Report.phase4_renderer_allowed}`);
}

function runTarget(target: SampleTarget): TargetRun {
  const run: TargetRun = {
    target_id: target.id,
    title_hint: target.title_hint,
    expected_classification: target.expected_classification,
    status: "failed",
    failure_reason: null,
    asset_failure_reason: null,
    steps: [],
    produced_timestamp: null,
    produced_metadata_path: null,
    produced_intermediate_path: null,
    produced_manifest_path: null,
    new_sample_added: false,
    actual_knowledge_node_click_text: null,
    require_leaf: target.expected_shape === "leaf_knowledge_point" && target.require_leaf === "true",
    chapter_level_hit: false,
    chapter_level_rejected: false,
    leaf_resolution_success: false,
    resolved_leaf_text: null,
    resolved_leaf_strategy: null,
    target_resolution_trusted: null,
    target_resolution_failure_reason: null,
    target_leaf_exact_match: null,
    actual_node_matches_requested_target: null,
    catalog_resolver_used: null,
    catalog_match_found: null,
    catalog_live_replay_success: null,
    catalog_match_strategy: null,
    live_replay_visible_chapter_count: null,
    live_replay_visible_leaf_count: null,
    live_replay_top_candidates: [],
    live_replay_debug_paths: null,
    parse_timestamp_alignment: "unknown",
    classification: null,
    image_refs_count: null,
    downloaded_assets: null,
    manual_review_assets: null,
    text_blocks_count: null,
    total_text_length: null,
    content_ready: null,
    content_readiness_reason: null,
    diagnostic_sample: false,
    constraint_violations: [],
    asset_manifest_status: "not_run",
  };

  console.log(`\n[phase3.3] target ${target.id}: ${target.title_hint}`);

  const metadataBefore = filenameSet(metadataDir);
  const requireLeafArg = run.require_leaf ? " --require-leaf" : "";
  const crawlStep = runCommand(
    "crawl",
    `pnpm crawl:ruankaodaren -- --target ${commandArg(target.title_hint)}${requireLeafArg}`
  );
  run.steps.push(crawlStep);
  if (!crawlStep.success) {
    const failedMetadataPath = newestFile(metadataDir, metadataBefore);
    const failedMetadata = readJson<MetadataShape>(failedMetadataPath);
    run.produced_metadata_path = toRepoPath(failedMetadataPath);
    run.produced_timestamp = timestampFromMetadataPath(failedMetadataPath);
    applyMetadataToRun(run, failedMetadata);
    run.chapter_level_rejected = run.require_leaf && isChapterLevelText(run.actual_knowledge_node_click_text);
    run.failure_reason =
      run.require_leaf && failedMetadata?.leaf_requirement_failed === true
        ? failedMetadata.target_resolution_failure_reason ?? "leaf_resolution_failed"
        : failureFromStep(crawlStep);
    writeDiagnostic(run, "crawl", run.failure_reason);
    return run;
  }

  const metadataPath = newestFile(metadataDir, metadataBefore);
  const metadata = readJson<MetadataShape>(metadataPath);
  run.produced_metadata_path = toRepoPath(metadataPath);
  run.produced_timestamp = timestampFromMetadataPath(metadataPath);
  applyMetadataToRun(run, metadata);

  if (run.require_leaf && (metadata?.leaf_requirement_failed === true || !run.leaf_resolution_success)) {
    run.failure_reason = metadata?.target_resolution_failure_reason ?? "leaf_resolution_failed";
    writeDiagnostic(run, "metadata_gate", run.failure_reason);
    return run;
  }

  if (
    run.require_leaf &&
    (
      metadata?.target_resolution_trusted !== true ||
      metadata?.target_leaf_exact_match !== true ||
      metadata?.actual_node_matches_requested_target !== true
    )
  ) {
    run.failure_reason = `target_resolution_failed: ${metadata?.target_resolution_failure_reason ?? "untrusted_or_inexact_target"}`;
    writeDiagnostic(run, "metadata_gate", run.failure_reason);
    return run;
  }

  if (run.require_leaf && !isLeafLevelText(run.actual_knowledge_node_click_text)) {
    run.chapter_level_rejected = isChapterLevelText(run.actual_knowledge_node_click_text);
    run.failure_reason = run.chapter_level_rejected ? "chapter_level_sample_rejected" : "non_leaf_sample_rejected";
    writeDiagnostic(run, "metadata_gate", run.failure_reason);
    return run;
  }

  if (!run.produced_timestamp) {
    run.failure_reason = "metadata_timestamp_missing";
    writeDiagnostic(run, "metadata_gate", run.failure_reason);
    return run;
  }

  const preflightMetadataStep = runCommand(
    "preflight_metadata",
    `pnpm preflight:sample -- --timestamp ${commandArg(run.produced_timestamp)}`
  );
  run.steps.push(preflightMetadataStep);
  const metadataPreflight = readPreflightReport(run.produced_timestamp);
  if (!preflightMetadataStep.success || !metadataPreflight || metadataPreflight.metadata_gate !== "pass" || metadataPreflight.overall !== "pass") {
    const reason = metadataPreflight
      ? ((metadataPreflight.failure_reasons ?? []).join("; ") || metadataPreflight.recommended_action || "unknown")
      : failureFromStep(preflightMetadataStep);
    run.failure_reason = metadataPreflight
      ? `metadata_preflight_failed: ${reason}`
      : reason;
    writeDiagnostic(run, "metadata_gate", run.failure_reason, metadataPreflight);
    return run;
  }

  const intermediateBefore = filenameSet(samplesDir);
  const parseStep = runCommand("parse", "pnpm parse:ruankaodaren -- --latest-success");
  run.steps.push(parseStep);
  if (!parseStep.success) {
    run.failure_reason = failureFromStep(parseStep);
    writeDiagnostic(run, "parse", run.failure_reason);
    return run;
  }

  const intermediatePath = findProducedIntermediate(intermediateBefore, run.produced_timestamp);
  const intermediate = readJson<IntermediateShape>(intermediatePath);
  run.produced_intermediate_path = toRepoPath(intermediatePath);
  run.new_sample_added = intermediatePath
    ? !intermediateBefore.has(basename(intermediatePath))
    : false;
  const intermediateTimestamp = intermediate?.source?.timestamp ?? (intermediatePath ? basename(intermediatePath, ".json") : null);
  if (run.produced_timestamp && intermediateTimestamp) {
    run.parse_timestamp_alignment =
      run.produced_timestamp === intermediateTimestamp ? "matched" : "mismatched";
  }
  run.classification = intermediate?.classification?.content_source_classification ?? null;
  run.image_refs_count = intermediate?.content?.image_refs?.length ?? null;
  run.text_blocks_count = textBlocksCount(intermediate);
  run.total_text_length = totalTextLength(intermediate);
  const contentReadiness = assessContentReadiness(intermediate);
  run.content_ready = contentReadiness.contentReady;
  run.content_readiness_reason = contentReadiness.reason;
  if (!contentReadiness.contentReady) {
    run.diagnostic_sample = true;
    run.failure_reason = "not_ready_low_text";
  }
  run.constraint_violations = checkIntermediateConstraints(intermediate);
  if (!run.actual_knowledge_node_click_text) {
    run.actual_knowledge_node_click_text = intermediate?.content?.title ?? null;
  }
  if (!run.produced_timestamp) {
    run.produced_timestamp = intermediate?.source?.timestamp ?? null;
  }

  if (run.parse_timestamp_alignment === "mismatched") {
    run.failure_reason = `parse_timestamp_mismatch: crawl timestamp ${run.produced_timestamp} but parsed intermediate timestamp ${intermediateTimestamp}`;
    writeDiagnostic(run, "post_parse_alignment", run.failure_reason);
    return run;
  }

  if (
    run.require_leaf &&
    isLeafLevelText(target.title_hint) &&
    intermediate?.content?.title &&
    normalizeForAlignment(intermediate.content.title) !== normalizeForAlignment(target.title_hint)
  ) {
    run.content_ready = false;
    run.content_readiness_reason = "target_mismatch";
    run.diagnostic_sample = true;
    run.failure_reason = `target_mismatch: requested "${target.title_hint}" but captured "${intermediate.content.title}"`;
    writeDiagnostic(run, "post_parse_alignment", run.failure_reason);
    return run;
  }

  if (
    run.actual_knowledge_node_click_text &&
    intermediate?.content?.title &&
    run.actual_knowledge_node_click_text !== intermediate.content.title
  ) {
    run.failure_reason = `target_mismatch: crawler actual title "${run.actual_knowledge_node_click_text}" but parser title "${intermediate.content.title}"`;
    writeDiagnostic(run, "post_parse_alignment", run.failure_reason);
    return run;
  }

  if (run.require_leaf && isChapterLevelText(intermediate?.content?.title)) {
    run.chapter_level_rejected = true;
    run.failure_reason = "chapter_level_sample_rejected";
    writeDiagnostic(run, "post_parse_alignment", run.failure_reason);
    return run;
  }

  if (run.require_leaf && !contentMentionsTitleSignal(intermediate)) {
    run.content_ready = false;
    run.content_readiness_reason = "target_mismatch_content_body";
    run.diagnostic_sample = true;
    run.failure_reason = "target_mismatch_content_body";
    writeDiagnostic(run, "post_parse_alignment", run.failure_reason);
    const semanticAuditStep = runCommand("audit_semantic", "pnpm audit:semantic-alignment");
    run.steps.push(semanticAuditStep);
    if (!semanticAuditStep.success) {
      run.asset_failure_reason = failureFromStep(semanticAuditStep);
    }
    return run;
  }

  if (!run.produced_timestamp) {
    run.failure_reason = "post_parse_timestamp_missing";
    writeDiagnostic(run, "content_gate", run.failure_reason);
    return run;
  }

  const preflightContentStep = runCommand(
    "preflight_content",
    `pnpm preflight:sample -- --timestamp ${commandArg(run.produced_timestamp)}`
  );
  run.steps.push(preflightContentStep);
  const contentPreflight = readPreflightReport(run.produced_timestamp);
  if (!preflightContentStep.success || !contentPreflight || contentPreflight.overall !== "pass" || contentPreflight.content_gate !== "pass") {
    const reason = contentPreflight
      ? ((contentPreflight.failure_reasons ?? []).join("; ") || contentPreflight.recommended_action || "unknown")
      : failureFromStep(preflightContentStep);
    run.content_ready = false;
    run.diagnostic_sample = true;
    run.failure_reason = contentPreflight
      ? `content_preflight_failed: ${reason}`
      : reason;
    writeDiagnostic(run, "content_gate", run.failure_reason, contentPreflight);
    const semanticAuditStep = runCommand("audit_semantic", "pnpm audit:semantic-alignment");
    run.steps.push(semanticAuditStep);
    if (!semanticAuditStep.success) {
      run.asset_failure_reason = failureFromStep(semanticAuditStep);
    }
    return run;
  }

  const validateIntermediateStep = runCommand("validate_intermediate", "pnpm validate:intermediate");
  run.steps.push(validateIntermediateStep);
  if (!validateIntermediateStep.success) {
    run.failure_reason = failureFromStep(validateIntermediateStep);
    return run;
  }

  const semanticAuditStep = runCommand("audit_semantic", "pnpm audit:semantic-alignment");
  run.steps.push(semanticAuditStep);
  if (!semanticAuditStep.success) {
    run.failure_reason = failureFromStep(semanticAuditStep);
    writeDiagnostic(run, "semantic_audit", run.failure_reason);
    return run;
  }

  const semanticItem = semanticItemForTimestamp(run.produced_timestamp);
  if (semanticItem?.renderer_eligible !== true) {
    run.content_ready = false;
    run.diagnostic_sample = true;
    run.failure_reason = "semantic_audit_renderer_eligible_false";
    writeDiagnostic(run, "semantic_audit", run.failure_reason);
    return run;
  }

  const manifestsBefore = filenameSet(manifestsDir);
  const captureAssetsStep = runCommand("capture_assets", "pnpm capture:assets");
  run.steps.push(captureAssetsStep);
  if (!captureAssetsStep.success) {
    run.asset_manifest_status = "capture_failed";
    run.asset_failure_reason = failureFromStep(captureAssetsStep);
    run.status = "success";
    return run;
  }

  const manifestPath = findProducedManifest(manifestsBefore, run.produced_timestamp);
  const manifest = readJson<ManifestShape>(manifestPath);
  const manifestCounts = countManifestAssets(manifest);
  run.produced_manifest_path = toRepoPath(manifestPath);
  run.downloaded_assets = manifestCounts.downloaded_assets;
  run.manual_review_assets = manifestCounts.manual_review_assets;
  run.asset_manifest_status = manifestPath ? "present" : "missing";

  const validateAssetsStep = runCommand("validate_assets", "pnpm validate:assets");
  run.steps.push(validateAssetsStep);
  if (!validateAssetsStep.success) {
    run.asset_manifest_status = "validation_failed";
    run.asset_failure_reason = failureFromStep(validateAssetsStep);
  } else if (run.asset_manifest_status === "present") {
    run.asset_manifest_status = "validated";
  }

  const qualityAuditStep = runCommand("audit_quality", "pnpm audit:sample-quality");
  run.steps.push(qualityAuditStep);
  if (!qualityAuditStep.success) {
    run.asset_failure_reason = failureFromStep(qualityAuditStep);
  }

  const reportCoverageStep = runCommand("report_coverage", "pnpm report:sample-coverage");
  run.steps.push(reportCoverageStep);
  if (!reportCoverageStep.success) {
    run.asset_failure_reason = failureFromStep(reportCoverageStep);
  }

  run.status = "success";
  return run;
}

function main(): void {
  if (!existsSync(sampleConfigPath)) {
    console.error(`[phase3.3] ERROR: sample config missing: ${sampleConfigPath}`);
    process.exit(1);
  }

  const yamlText = readFileSync(sampleConfigPath, "utf8");
  const targets = parseSampleTargets(yamlText);
  const pendingTargets = targets.filter(
    (target) =>
      target.status === "pending_capture" &&
      target.expected_shape === "leaf_knowledge_point" &&
      target.require_leaf === "true" &&
      target.require_preflight === "true"
  );
  const phase312Targets = pendingTargets.filter(
    (target) =>
      target.source_catalog === "verification/generated/phase3_11_reachable_leaf_catalog.md" ||
      target.id.startsWith("phase312_")
  );
  const selectedTargets = (phase312Targets.length > 0 ? phase312Targets : pendingTargets).slice(0, maxTargets);

  console.log("[phase3.3] controlled sample acquisition started");
  console.log(`[phase3.3] pending targets found: ${pendingTargets.length}`);
  console.log(`[phase3.3] phase 3.12 reachable-leaf targets found: ${phase312Targets.length}`);
  console.log(`[phase3.3] targets selected: ${selectedTargets.length}`);

  const results: TargetRun[] = [];
  for (const target of selectedTargets) {
    results.push(runTarget(target));
  }

  writeReports(results, pendingTargets);
  writePhase39Reports(results);
  writePhase312Reports(results);

  const coverage = readCoverageSummary();
  console.log("\n[phase3.3] acquisition summary");
  console.log(`  attempted targets:      ${results.length}`);
  console.log(`  successful samples:     ${results.filter((result) => result.status === "success").length}`);
  console.log(`  successful new samples: ${results.filter((result) => result.new_sample_added).length}`);
  console.log(`  failed targets:         ${results.filter((result) => result.status === "failed").length}`);
  console.log(`  content-ready success:  ${results.filter((result) => result.content_ready === true).length}`);
  console.log(`  low-text rejected:      ${results.filter((result) => result.content_readiness_reason === "not_ready_low_text").length}`);
  console.log(`  diagnostic samples:     ${results.filter((result) => result.diagnostic_sample).length}`);
  console.log(`  coverage total samples: ${coverage?.total_samples ?? "unknown"}`);
  console.log(`  coverage image_refs:    ${coverage?.total_image_refs ?? "unknown"}`);
  console.log(`  constraint violations:  ${coverage?.constraint_violations_total ?? "unknown"}`);

  for (const result of results) {
    if (result.failure_reason) {
      console.log(`  failure ${result.target_id}: ${result.failure_reason}`);
    }
    if (result.asset_failure_reason) {
      console.log(`  asset warning ${result.target_id}: ${result.asset_failure_reason}`);
    }
  }

  if (results.length === 0) {
    console.log("[phase3.3] no pending targets selected; report still generated.");
  }

  for (const dir of [generatedDir, metadataDir, samplesDir, manifestsDir]) {
    if (existsSync(dir) && !statSync(dir).isDirectory()) {
      console.warn(`[phase3.3] warning: expected directory path is not a directory: ${dir}`);
    }
  }

  console.log("[phase3.3] completed");
}

main();
