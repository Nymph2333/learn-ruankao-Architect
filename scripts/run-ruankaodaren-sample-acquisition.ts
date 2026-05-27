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
const manifestsDir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");
const coverageJsonPath = resolve(repoRoot, "verification/generated/phase3_2_sample_coverage.json");

type StepName =
  | "crawl"
  | "parse"
  | "validate_intermediate"
  | "capture_assets"
  | "validate_assets"
  | "report_coverage";

interface SampleTarget {
  id: string;
  title_hint: string;
  expected_classification: string | null;
  status: string;
  timestamp: string | null;
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
  parse_timestamp_alignment: "matched" | "mismatched" | "unknown";
  classification: string | null;
  image_refs_count: number | null;
  downloaded_assets: number | null;
  manual_review_assets: number | null;
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
        expected_classification: current.expected_classification ?? null,
        status: current.status,
        timestamp: current.timestamp ?? null,
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
    if (key === "title_hint" || key === "expected_classification" || key === "status" || key === "timestamp") {
      current[key] = value;
    }
  }

  flush();
  return targets;
}

function commandArg(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
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

function failureFromStep(step: CommandStep): string {
  const stderr = step.stderr_summary ? ` stderr: ${step.stderr_summary}` : "";
  const stdout = step.stdout_summary ? ` stdout: ${step.stdout_summary}` : "";
  return `${step.name} exited ${step.exit_code}.${stderr || stdout}`.slice(0, 1_000);
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
    `| Final coverage total samples | ${coverage?.total_samples ?? "unknown"} |`,
    `| Final coverage image_refs | ${coverage?.total_image_refs ?? "unknown"} |`,
    `| Samples with asset manifests | ${coverage?.samples_with_asset_manifests ?? "unknown"} |`,
    `| Constraint violations | ${coverage?.constraint_violations_total ?? "unknown"} |`,
    "",
    "## Target Results",
    "",
    "| Target | Hint | Status | Actual title | Classification | image_refs | Asset status | New sample |",
    "|---|---|---|---|---|---:|---|---|",
    ...results.map(
      (result) =>
        `| ${result.target_id} | ${result.title_hint} | ${result.status} | ${result.actual_knowledge_node_click_text ?? ""} | ${result.classification ?? ""} | ${result.image_refs_count ?? ""} | ${result.asset_manifest_status} | ${result.new_sample_added ? "yes" : "no"} |`
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
    parse_timestamp_alignment: "unknown",
    classification: null,
    image_refs_count: null,
    downloaded_assets: null,
    manual_review_assets: null,
    constraint_violations: [],
    asset_manifest_status: "not_run",
  };

  console.log(`\n[phase3.3] target ${target.id}: ${target.title_hint}`);

  const metadataBefore = filenameSet(metadataDir);
  const crawlStep = runCommand(
    "crawl",
    `pnpm crawl:ruankaodaren -- --target ${commandArg(target.title_hint)}`
  );
  run.steps.push(crawlStep);
  if (!crawlStep.success) {
    run.failure_reason = failureFromStep(crawlStep);
    return run;
  }

  const metadataPath = newestFile(metadataDir, metadataBefore);
  const metadata = readJson<MetadataShape>(metadataPath);
  run.produced_metadata_path = toRepoPath(metadataPath);
  run.produced_timestamp = timestampFromMetadataPath(metadataPath);
  run.actual_knowledge_node_click_text =
    metadata?.knowledge_node_click_text ?? metadata?.detail_entry_target_text ?? null;

  const intermediateBefore = filenameSet(samplesDir);
  const parseStep = runCommand("parse", "pnpm parse:ruankaodaren -- --latest-success");
  run.steps.push(parseStep);
  if (!parseStep.success) {
    run.failure_reason = failureFromStep(parseStep);
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
  run.constraint_violations = checkIntermediateConstraints(intermediate);
  if (!run.actual_knowledge_node_click_text) {
    run.actual_knowledge_node_click_text = intermediate?.content?.title ?? null;
  }
  if (!run.produced_timestamp) {
    run.produced_timestamp = intermediate?.source?.timestamp ?? null;
  }

  if (run.parse_timestamp_alignment === "mismatched") {
    run.failure_reason = `parse_timestamp_mismatch: crawl timestamp ${run.produced_timestamp} but parsed intermediate timestamp ${intermediateTimestamp}`;
    return run;
  }

  if (
    run.actual_knowledge_node_click_text &&
    intermediate?.content?.title &&
    run.actual_knowledge_node_click_text !== intermediate.content.title
  ) {
    run.failure_reason = `target_mismatch: crawler actual title "${run.actual_knowledge_node_click_text}" but parser title "${intermediate.content.title}"`;
    return run;
  }

  const validateIntermediateStep = runCommand("validate_intermediate", "pnpm validate:intermediate");
  run.steps.push(validateIntermediateStep);
  if (!validateIntermediateStep.success) {
    run.failure_reason = failureFromStep(validateIntermediateStep);
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
  const pendingTargets = targets.filter((target) => target.status === "pending_capture");
  const selectedTargets = pendingTargets.slice(0, maxTargets);

  console.log("[phase3.3] controlled sample acquisition started");
  console.log(`[phase3.3] pending targets found: ${pendingTargets.length}`);
  console.log(`[phase3.3] targets selected: ${selectedTargets.length}`);

  const results: TargetRun[] = [];
  for (const target of selectedTargets) {
    results.push(runTarget(target));
  }

  writeReports(results, pendingTargets);

  const coverage = readCoverageSummary();
  console.log("\n[phase3.3] acquisition summary");
  console.log(`  attempted targets:      ${results.length}`);
  console.log(`  successful samples:     ${results.filter((result) => result.status === "success").length}`);
  console.log(`  successful new samples: ${results.filter((result) => result.new_sample_added).length}`);
  console.log(`  failed targets:         ${results.filter((result) => result.status === "failed").length}`);
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
