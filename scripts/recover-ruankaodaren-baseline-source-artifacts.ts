/**
 * Phase 5.3 controlled source artifact recovery for the three baseline titles.
 *
 * This script may run exact-title live replay, exact-title require-leaf crawl,
 * parser, preflight, and asset capture. It does not generate AI learning
 * content, rewrite official Markdown, sign off human review, OCR, decrypt
 * encrypt=1 data, reconstruct image tables, read raw XHR directly, or run a
 * full-site batch crawl.
 *
 * Usage:
 *   pnpm recover:baseline-source-artifacts
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoSourcePacketRenderAs } from "../packages/domain-types/ruankaodaren-source-packet.js";

const TARGET_TITLES = [
  "1.3 指令系统CISC和RISC",
  "13.3 软件架构风格",
  "9.1 信息安全基础知识",
] as const;

type TargetTitle = (typeof TARGET_TITLES)[number];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const assetManifestsDir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");
const reportJsonPath = resolve(generatedDir, "phase5_3_source_artifact_recovery.json");
const reportMdPath = resolve(generatedDir, "phase5_3_source_artifact_recovery.md");
const rendererInputContractPath = "verification/generated/phase3_25_renderer_input_contract.json";
const baselineManifestPath = "verification/generated/phase3_23_renderer_baseline_manifest.json";
const sourcePacketPath = "source-packets/ruankaodaren/baseline/source-packet.json";

interface RendererInputContract {
  baseline_items: Array<{
    canonical_title: string;
    canonical_sample_path: string;
    asset_manifest_path: string | null;
    renderer_policy: {
      render_as: RuankaoSourcePacketRenderAs;
    };
  }>;
}

interface MetadataLike {
  final_url?: string;
  detail_entry_strategy?: string;
  detail_entry_route_changed?: boolean;
  detail_entry_login_dialog_detected?: boolean;
  detail_entry_success?: boolean;
  knowledge_node_click_text?: string;
  requested_target_text?: string | null;
  resolved_target_text?: string | null;
  target_leaf_text?: string | null;
  outer_html_paths?: string[];
  knowInfo_outer_html_path?: string | null;
  parser_contract_ready?: boolean;
  parser_contract_failure_reason?: string | null;
}

interface IntermediateLike {
  source?: {
    timestamp?: string;
  };
  navigation_context?: {
    target_node_text?: string | null;
  };
  content?: {
    title?: string | null;
    text_blocks?: Array<{ text?: string }>;
    image_refs?: unknown[];
  };
  classification?: {
    content_source_classification?: string;
  };
}

interface AssetManifestLike {
  source_title?: string;
  source_timestamp?: string;
  source_intermediate_path?: string;
  assets?: Array<{
    saved_path?: string | null;
    asset_status?: string;
  }>;
}

interface CommandRecord {
  label: string;
  args: string[];
  exit_code: number | null;
  ok: boolean;
  output_tail: string;
}

interface RecoveryItemReport {
  title: TargetTitle;
  render_as: RuankaoSourcePacketRenderAs;
  canonical_sample_path: string;
  asset_manifest_path: string | null;
  intermediate_before: boolean;
  intermediate_after: boolean;
  effective_intermediate_path: string | null;
  asset_manifest_before: boolean;
  asset_manifest_after: boolean;
  effective_asset_manifest_path: string | null;
  asset_files_after: string[];
  detail_entry_test_pass: boolean;
  parser_contract_ready: boolean;
  parser_contract_failure_reason: string | null;
  metadata_path: string | null;
  outer_html_path: string | null;
  parsed_intermediate_path: string | null;
  recovered_asset_manifest_path: string | null;
  asset_files: string[];
  recovery_status: "already_exists" | "recovered" | "partially_recovered" | "failed";
  taxonomy_suspect: boolean;
  notes: string[];
  commands: CommandRecord[];
}

interface RecoveryReport {
  generated_at: string;
  phase: "5.3";
  attempted_titles: TargetTitle[];
  counts: {
    attempted_count: number;
    recovered_intermediate_count: number;
    recovered_asset_manifest_count: number;
    recovered_asset_file_count: number;
    asset_files_after_total: number;
    failed_count: number;
  };
  failed_items: string[];
  items: RecoveryItemReport[];
  phase5_2_ai_generation_allowed: false;
  constraints: {
    no_ai_learning_content: true;
    no_official_markdown_rewrite: true;
    no_human_review_signoff: true;
    no_ocr: true;
    no_encrypt1_decrypted: true;
    no_image_table_reconstructed: true;
    no_raw_xhr_direct_read: true;
    no_full_site_batch_crawl: true;
    phase4_6_not_entered: true;
  };
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8")) as T;
}

function readJsonAbsIfExists<T>(absPath: string): T | null {
  if (!existsSync(absPath)) return null;
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch {
    return null;
  }
}

function normalizeComparable(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, "").trim();
}

function officialMarkdownPathForTitle(title: string): string {
  return `docs/ruankaodaren/baseline/${title.replace(/\s+/, "_")}.md`;
}

function safeTitleName(title: string): string {
  return title
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.\-\u4e00-\u9fff]+/g, "_")
    .slice(0, 80);
}

function titleFromIntermediate(doc: IntermediateLike): string {
  return doc.content?.title ?? doc.navigation_context?.target_node_text ?? "";
}

function findEffectiveIntermediate(title: string, canonicalPath: string): {
  path: string | null;
  doc: IntermediateLike | null;
} {
  const canonicalAbsPath = resolve(repoRoot, canonicalPath);
  const canonicalDoc = readJsonAbsIfExists<IntermediateLike>(canonicalAbsPath);
  if (canonicalDoc) return { path: canonicalPath, doc: canonicalDoc };
  if (!existsSync(samplesDir)) return { path: null, doc: null };

  const target = normalizeComparable(title);
  const files = readdirSync(samplesDir).filter((file) => file.endsWith(".json")).sort().reverse();
  for (const file of files) {
    const absPath = resolve(samplesDir, file);
    const doc = readJsonAbsIfExists<IntermediateLike>(absPath);
    if (!doc) continue;
    if (normalizeComparable(titleFromIntermediate(doc)) !== target) continue;
    return { path: toRepoPath(absPath), doc };
  }
  return { path: null, doc: null };
}

function manifestMatches(manifest: AssetManifestLike, title: string, intermediatePath: string | null): boolean {
  return (
    normalizeComparable(manifest.source_title) === normalizeComparable(title) ||
    Boolean(intermediatePath && manifest.source_intermediate_path === intermediatePath)
  );
}

function findEffectiveAssetManifest(title: string, expectedPath: string | null, intermediatePath: string | null, intermediate: IntermediateLike | null): {
  path: string | null;
  manifest: AssetManifestLike | null;
} {
  if (expectedPath) {
    const expectedManifest = readJsonAbsIfExists<AssetManifestLike>(resolve(repoRoot, expectedPath));
    if (expectedManifest) return { path: expectedPath, manifest: expectedManifest };
  }

  const timestamp = intermediate?.source?.timestamp;
  if (timestamp) {
    const timestampPath = `sources/ruankaodaren/raw/assets/manifests/${timestamp}.json`;
    const timestampManifest = readJsonAbsIfExists<AssetManifestLike>(resolve(repoRoot, timestampPath));
    if (timestampManifest && manifestMatches(timestampManifest, title, intermediatePath)) {
      return { path: timestampPath, manifest: timestampManifest };
    }
  }

  if (!existsSync(assetManifestsDir)) return { path: null, manifest: null };
  const files = readdirSync(assetManifestsDir).filter((file) => file.endsWith(".json")).sort().reverse();
  for (const file of files) {
    const absPath = resolve(assetManifestsDir, file);
    const manifest = readJsonAbsIfExists<AssetManifestLike>(absPath);
    if (!manifest || !manifestMatches(manifest, title, intermediatePath)) continue;
    return { path: toRepoPath(absPath), manifest };
  }
  return { path: null, manifest: null };
}

function downloadedAssetFiles(manifestPath: string | null): string[] {
  if (!manifestPath) return [];
  const manifest = readJsonAbsIfExists<AssetManifestLike>(resolve(repoRoot, manifestPath));
  if (!manifest?.assets) return [];
  return manifest.assets
    .filter((asset) => asset.asset_status === "downloaded" && typeof asset.saved_path === "string")
    .map((asset) => asset.saved_path as string)
    .filter((assetPath) => existsSync(resolve(repoRoot, assetPath)));
}

function runPnpm(label: string, args: string[]): CommandRecord {
  const env = {
    ...process.env,
    COREPACK_ENABLE_AUTO_PIN: "0",
    pnpm_config_verify_deps_before_run: "false",
  };
  const npmExecPath = process.env.npm_execpath;
  const result = npmExecPath
    ? spawnSync(process.execPath, [npmExecPath, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        env,
        maxBuffer: 10 * 1024 * 1024,
      })
    : spawnSync("pnpm", args, {
        cwd: repoRoot,
        encoding: "utf8",
        env,
        maxBuffer: 10 * 1024 * 1024,
      });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
  return {
    label,
    args,
    exit_code: result.status,
    ok: result.status === 0,
    output_tail: output.slice(-1600),
  };
}

function metadataParserBlockers(meta: MetadataLike): string[] {
  if (meta.parser_contract_ready === true) return [];
  if (typeof meta.parser_contract_failure_reason === "string" && meta.parser_contract_failure_reason.length > 0) {
    return meta.parser_contract_failure_reason.split(";").map((item) => item.trim()).filter(Boolean);
  }
  const blockers: string[] = [];
  if (typeof meta.final_url !== "string" || !meta.final_url.includes("konwledgeInfo")) {
    blockers.push("final_url does not include konwledgeInfo");
  }
  if (meta.detail_entry_success !== true) {
    blockers.push("detail_entry_success is not true");
  }
  if (meta.detail_entry_login_dialog_detected === true) {
    blockers.push("detail_entry_login_dialog_detected is true");
  }
  if (meta.detail_entry_strategy !== "target_scoped") {
    blockers.push("detail_entry_strategy is not target_scoped");
  }
  if (meta.detail_entry_route_changed !== true) {
    blockers.push("detail_entry_route_changed is not true");
  }
  if (typeof meta.knowledge_node_click_text !== "string" || meta.knowledge_node_click_text.length === 0) {
    blockers.push("knowledge_node_click_text is missing");
  }
  if (!meta.knowInfo_outer_html_path && (!Array.isArray(meta.outer_html_paths) || !meta.outer_html_paths.some((item) => item.includes("knowInfo_ql-editor")))) {
    blockers.push("outer_html_paths does not include knowInfo_ql-editor");
  }
  return blockers;
}

function metadataMatchesTitle(meta: MetadataLike, title: string): boolean {
  const target = normalizeComparable(title);
  return [
    meta.requested_target_text,
    meta.knowledge_node_click_text,
    meta.resolved_target_text,
    meta.target_leaf_text,
  ].some((value) => normalizeComparable(value) === target);
}

function latestMatchingMetadata(title: string): {
  timestamp: string;
  path: string;
  parserBlockers: string[];
  metadata: MetadataLike;
} | null {
  if (!existsSync(metadataDir)) return null;
  const files = readdirSync(metadataDir).filter((file) => file.endsWith(".json")).sort().reverse();
  for (const file of files) {
    const metadataPath = resolve(metadataDir, file);
    const metadata = readJsonAbsIfExists<MetadataLike>(metadataPath);
    if (!metadata || !metadataMatchesTitle(metadata, title)) continue;
    return {
      timestamp: file.replace(/\.json$/, ""),
      path: toRepoPath(metadataPath),
      parserBlockers: metadataParserBlockers(metadata),
      metadata,
    };
  }
  return null;
}

function readDetailEntryTestReport(title: string): { pass: boolean; parserReady: boolean; failureReason: string | null } {
  const reportPath = resolve(generatedDir, `phase5_3_detail_entry_test_${safeTitleName(title)}.json`);
  const report = readJsonAbsIfExists<{
    metadata_compatible_with_parser?: boolean;
    detail_entry_failure_reason?: string | null;
    recommended_action?: string;
  }>(reportPath);
  if (!report) {
    return { pass: false, parserReady: false, failureReason: "detail-entry test report missing" };
  }
  const parserReady = report.metadata_compatible_with_parser === true;
  return {
    pass: parserReady,
    parserReady,
    failureReason: parserReady ? null : report.detail_entry_failure_reason ?? report.recommended_action ?? "detail-entry test failed",
  };
}

function imageRefCount(intermediatePath: string | null): number {
  if (!intermediatePath) return 0;
  const doc = readJsonAbsIfExists<IntermediateLike>(resolve(repoRoot, intermediatePath));
  return doc?.content?.image_refs?.length ?? 0;
}

function statusFor(args: {
  intermediateBefore: boolean;
  intermediateAfter: boolean;
  assetExpected: boolean;
  assetManifestBefore: boolean;
  assetManifestAfter: boolean;
  assetFilesRequired: boolean;
  assetFilesAfter: string[];
}): RecoveryItemReport["recovery_status"] {
  if (!args.intermediateAfter) return "failed";
  if (args.assetExpected && !args.assetManifestAfter) return "partially_recovered";
  if (args.assetFilesRequired && args.assetFilesAfter.length === 0) return "partially_recovered";
  if (args.intermediateBefore && (!args.assetExpected || args.assetManifestBefore)) return "already_exists";
  return "recovered";
}

function textLength(doc: IntermediateLike | null): number {
  return (doc?.content?.text_blocks ?? []).reduce((sum, block) => sum + (block.text?.length ?? 0), 0);
}

function recoverOne(item: RendererInputContract["baseline_items"][number]): RecoveryItemReport {
  const title = item.canonical_title as TargetTitle;
  const notes: string[] = [];
  const commands: CommandRecord[] = [];
  const officialMarkdownPath = officialMarkdownPathForTitle(title);
  const officialMarkdownAbsPath = resolve(repoRoot, officialMarkdownPath);
  if (existsSync(officialMarkdownAbsPath)) {
    readFileSync(officialMarkdownAbsPath, "utf8");
    notes.push(`official Markdown present and read for status only: ${officialMarkdownPath}`);
  } else {
    notes.push(`official Markdown missing: ${officialMarkdownPath}`);
  }

  const beforeIntermediate = existsSync(resolve(repoRoot, item.canonical_sample_path));
  const beforeManifest = item.asset_manifest_path ? existsSync(resolve(repoRoot, item.asset_manifest_path)) : false;
  let effective = findEffectiveIntermediate(title, item.canonical_sample_path);
  let effectiveManifest = findEffectiveAssetManifest(title, item.asset_manifest_path, effective.path, effective.doc);
  const assetExpected = item.renderer_policy.render_as === "asset_card" || item.asset_manifest_path !== null;
  const assetFilesRequired = item.renderer_policy.render_as === "asset_card";
  let detailEntryTestPass = effective.path !== null;
  let parserContractReady = effective.path !== null;
  let parserContractFailureReason: string | null = null;
  let metadataPath: string | null = null;
  let outerHtmlPath: string | null = null;
  let parsedIntermediatePath: string | null = effective.path;

  if (!effective.path) {
    commands.push(runPnpm("detail_entry_test", ["run", "test:baseline-detail-entry", "--", "--title", title]));
    const detailEntryTest = readDetailEntryTestReport(title);
    detailEntryTestPass = detailEntryTest.pass;
    parserContractReady = detailEntryTest.parserReady;
    parserContractFailureReason = detailEntryTest.failureReason;

    if (!detailEntryTestPass) {
      notes.push(`detail-entry test failed; parser was not run: ${parserContractFailureReason ?? "unknown"}`);
    } else {
      commands.push(runPnpm("crawl_require_leaf", [
        "run",
        "crawl:ruankaodaren",
        "--",
        "--target",
        title,
        "--require-leaf",
        "--require-live-replay",
        "--no-xhr-body",
      ]));

      const metadataMatch = latestMatchingMetadata(title);
      if (metadataMatch) {
        metadataPath = metadataMatch.path;
        outerHtmlPath = metadataMatch.metadata.knowInfo_outer_html_path ??
          metadataMatch.metadata.outer_html_paths?.find((candidate) => candidate.includes("knowInfo_ql-editor")) ??
          null;
        parserContractReady = metadataMatch.parserBlockers.length === 0;
        parserContractFailureReason = metadataMatch.parserBlockers.join("; ") || null;
        notes.push(`selected exact-title metadata timestamp: ${metadataMatch.timestamp}`);
        if (!parserContractReady) {
          notes.push(`metadata is not parser-eligible for the existing parser: ${parserContractFailureReason}`);
        }
        if (parserContractReady) {
          commands.push(runPnpm("parse", ["run", "parse:ruankaodaren", "--", "--timestamp", metadataMatch.timestamp]));
          effective = findEffectiveIntermediate(title, item.canonical_sample_path);
          parsedIntermediatePath = effective.path;
          if (effective.path) {
            commands.push(runPnpm("validate_intermediate", ["run", "validate:intermediate", "--", "--file", effective.path]));
            commands.push(runPnpm("preflight", ["run", "preflight:sample", "--", "--timestamp", effective.doc?.source?.timestamp ?? metadataMatch.timestamp]));
          }
        }
      } else {
        parserContractReady = false;
        parserContractFailureReason = "no exact-title metadata was available after crawler";
        notes.push(`${parserContractFailureReason}; parser was not run`);
      }
    }
  } else {
    notes.push(`effective intermediate already discoverable: ${effective.path}`);
  }

  if (title === "13.3 软件架构风格") {
    notes.push("taxonomy_suspect=true for 13.3 pending live parent/leaf/multi-card diagnosis");
    const length = textLength(effective.doc);
    if (length > 0 && length < 180) notes.push(`13.3 low extracted text signal: ${length}`);
  }

  effectiveManifest = findEffectiveAssetManifest(title, item.asset_manifest_path, effective.path, effective.doc);
  if (effective.path && imageRefCount(effective.path) > 0 && !effectiveManifest.path) {
    commands.push(runPnpm("capture_assets", ["run", "capture:assets", "--", "--file", effective.path]));
    effectiveManifest = findEffectiveAssetManifest(title, item.asset_manifest_path, effective.path, effective.doc);
    if (effectiveManifest.path) {
      commands.push(runPnpm("validate_assets", ["run", "validate:assets", "--", "--file", effectiveManifest.path]));
    }
  }

  const assetFilesAfter = downloadedAssetFiles(effectiveManifest.path);
  const afterIntermediate = effective.path !== null;
  const afterManifest = effectiveManifest.path !== null;
  const recoveryStatus = statusFor({
    intermediateBefore: beforeIntermediate,
    intermediateAfter: afterIntermediate,
    assetExpected,
    assetManifestBefore: beforeManifest,
    assetManifestAfter: afterManifest,
    assetFilesRequired,
    assetFilesAfter,
  });

  if (commands.some((command) => !command.ok)) {
    notes.push("one or more controlled recovery commands exited non-zero; see commands[].output_tail");
  }

  return {
    title,
    render_as: item.renderer_policy.render_as,
    canonical_sample_path: item.canonical_sample_path,
    asset_manifest_path: item.asset_manifest_path,
    intermediate_before: beforeIntermediate,
    intermediate_after: afterIntermediate,
    effective_intermediate_path: effective.path,
    asset_manifest_before: beforeManifest,
    asset_manifest_after: afterManifest,
    effective_asset_manifest_path: effectiveManifest.path,
    asset_files_after: assetFilesAfter,
    detail_entry_test_pass: detailEntryTestPass,
    parser_contract_ready: parserContractReady,
    parser_contract_failure_reason: parserContractFailureReason,
    metadata_path: metadataPath,
    outer_html_path: outerHtmlPath,
    parsed_intermediate_path: parsedIntermediatePath,
    recovered_asset_manifest_path: effectiveManifest.path,
    asset_files: assetFilesAfter,
    recovery_status: recoveryStatus,
    taxonomy_suspect: title === "13.3 软件架构风格",
    notes,
    commands,
  };
}

function renderMarkdown(report: RecoveryReport): string {
  const lines = [
    "# Phase 5.3 Source Artifact Recovery",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    `- attempted_titles: ${report.attempted_titles.join(", ")}`,
    `- recovered_intermediate_count: ${report.counts.recovered_intermediate_count}`,
    `- recovered_asset_manifest_count: ${report.counts.recovered_asset_manifest_count}`,
    `- recovered_asset_file_count: ${report.counts.recovered_asset_file_count}`,
    `- asset_files_after_total: ${report.counts.asset_files_after_total}`,
    `- failed_count: ${report.counts.failed_count}`,
    `- phase5_2_ai_generation_allowed: ${report.phase5_2_ai_generation_allowed}`,
    "",
    "## Items",
    "",
  ];

  for (const item of report.items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- render_as: ${item.render_as}`,
      `- intermediate_before: ${item.intermediate_before}`,
      `- intermediate_after: ${item.intermediate_after}`,
      `- effective_intermediate_path: \`${item.effective_intermediate_path ?? "(none)"}\``,
      `- asset_manifest_before: ${item.asset_manifest_before}`,
      `- asset_manifest_after: ${item.asset_manifest_after}`,
      `- effective_asset_manifest_path: \`${item.effective_asset_manifest_path ?? "(none)"}\``,
      `- asset_files_after: ${item.asset_files_after.length}`,
      `- detail_entry_test_pass: ${item.detail_entry_test_pass}`,
      `- parser_contract_ready: ${item.parser_contract_ready}`,
      `- parser_contract_failure_reason: ${item.parser_contract_failure_reason ?? "(none)"}`,
      `- metadata_path: \`${item.metadata_path ?? "(none)"}\``,
      `- outer_html_path: \`${item.outer_html_path ?? "(none)"}\``,
      `- parsed_intermediate_path: \`${item.parsed_intermediate_path ?? "(none)"}\``,
      `- recovery_status: ${item.recovery_status}`,
      `- taxonomy_suspect: ${item.taxonomy_suspect}`,
      "- notes:",
      ...(item.notes.length > 0 ? item.notes.map((note) => `  - ${note}`) : ["  - (none)"]),
      "- commands:",
      ...(item.commands.length > 0 ? item.commands.map((command) => `  - ${command.label}: ok=${command.ok}, exit_code=${command.exit_code}`) : ["  - (none)"]),
      "",
    );
  }

  lines.push(
    "## Constraints",
    "",
    "- No AI learning content was generated.",
    "- No official Markdown was rewritten.",
    "- No human-review status was signed off.",
    "- No OCR was used.",
    "- No encrypt=1 data was decrypted.",
    "- No image table was reconstructed.",
    "- No raw XHR was read directly by this script.",
    "- No full-site batch crawl was run.",
    "- Phase 4.6 was not entered.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  const contract = readJson<RendererInputContract>(rendererInputContractPath);
  readJson<unknown>(baselineManifestPath);
  if (existsSync(resolve(repoRoot, sourcePacketPath))) readJson<unknown>(sourcePacketPath);

  const items = TARGET_TITLES.map((title) => {
    const item = contract.baseline_items.find((candidate) => candidate.canonical_title === title);
    if (!item) throw new Error(`baseline item missing from renderer input contract: ${title}`);
    return recoverOne(item);
  });

  const report: RecoveryReport = {
    generated_at: new Date().toISOString(),
    phase: "5.3",
    attempted_titles: [...TARGET_TITLES],
    counts: {
      attempted_count: TARGET_TITLES.length,
      recovered_intermediate_count: items.filter((item) => !item.intermediate_before && item.intermediate_after).length,
      recovered_asset_manifest_count: items.filter((item) => !item.asset_manifest_before && item.asset_manifest_after).length,
      recovered_asset_file_count: items.reduce((sum, item) => sum + item.asset_files_after.length, 0),
      asset_files_after_total: items.reduce((sum, item) => sum + item.asset_files_after.length, 0),
      failed_count: items.filter((item) => item.recovery_status === "failed").length,
    },
    failed_items: items.filter((item) => item.recovery_status === "failed").map((item) => item.title),
    items,
    phase5_2_ai_generation_allowed: false,
    constraints: {
      no_ai_learning_content: true,
      no_official_markdown_rewrite: true,
      no_human_review_signoff: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_raw_xhr_direct_read: true,
      no_full_site_batch_crawl: true,
      phase4_6_not_entered: true,
    },
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(reportMdPath, renderMarkdown(report), "utf8");

  console.log("[recover:baseline-source-artifacts] Recovery report written");
  console.log(`  attempted_count:                  ${report.counts.attempted_count}`);
  console.log(`  recovered_intermediate_count:      ${report.counts.recovered_intermediate_count}`);
  console.log(`  recovered_asset_manifest_count:    ${report.counts.recovered_asset_manifest_count}`);
  console.log(`  recovered_asset_file_count:        ${report.counts.recovered_asset_file_count}`);
  console.log(`  asset_files_after_total:           ${report.counts.asset_files_after_total}`);
  console.log(`  failed_items:                      ${report.failed_items.join(", ") || "(none)"}`);
  console.log(`  phase5_2_ai_generation_allowed:    ${report.phase5_2_ai_generation_allowed}`);
  console.log(`  JSON report:                       ${toRepoPath(reportJsonPath)}`);
  console.log(`  Markdown report:                   ${toRepoPath(reportMdPath)}`);
}

main();
