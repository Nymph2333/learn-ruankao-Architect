/**
 * Phase 3.17: reparse selected existing raw outerHTML samples.
 *
 * Only reparses timestamps listed in the Phase 3.16 detail-binding audit.
 * It does not crawl, run acquisition, decrypt encrypt=1 data, OCR images,
 * reconstruct image tables, generate Markdown knowledge documents, or enter
 * Phase 4.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const detailBindingAuditPath = resolve(generatedDir, "phase3_16_detail_binding_audit.json");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const backupDir = resolve(repoRoot, "data/intermediate/ruankaodaren/diagnostics/reparse-backups");

interface DetailBindingTrace {
  target_title: string;
  crawl_timestamp: string | null;
  intermediate_path?: string | null;
}

interface DetailBindingAudit {
  traces?: DetailBindingTrace[];
}

interface SampleStats {
  exists: boolean;
  text_blocks: number;
  total_text_length: number;
  classification: string | null;
}

interface ReparseResult {
  title: string;
  timestamp: string;
  command: string;
  exit_code: number;
  success: boolean;
  backup_path: string | null;
  before: SampleStats;
  after: SampleStats;
  stdout_summary: string;
  stderr_summary: string;
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function outputText(value: string | Buffer | null | undefined): string {
  if (typeof value === "string") return value;
  return value?.toString("utf8") ?? "";
}

function summarize(output: string, maxChars = 2_000): string {
  const clean = output.replace(/\r/g, "").trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(clean.length - maxChars);
}

function statsForTimestamp(timestamp: string): SampleStats {
  const samplePath = resolve(samplesDir, `${timestamp}.json`);
  if (!existsSync(samplePath)) {
    return {
      exists: false,
      text_blocks: 0,
      total_text_length: 0,
      classification: null,
    };
  }

  const doc = readJson<RuankaoIntermediateDocument>(samplePath);
  return {
    exists: true,
    text_blocks: doc.content?.text_blocks?.length ?? 0,
    total_text_length: (doc.content?.text_blocks ?? []).reduce((sum, block) => sum + block.text.length, 0),
    classification: doc.classification?.content_source_classification ?? null,
  };
}

function backupSample(timestamp: string): string | null {
  const samplePath = resolve(samplesDir, `${timestamp}.json`);
  if (!existsSync(samplePath)) return null;
  mkdirSync(backupDir, { recursive: true });
  const backupPath = resolve(backupDir, `${timestamp}.json`);
  writeFileSync(backupPath, readFileSync(samplePath, "utf8"), "utf8");
  return backupPath;
}

function timestampFromTrace(trace: DetailBindingTrace): string | null {
  if (trace.crawl_timestamp) return trace.crawl_timestamp;
  if (trace.intermediate_path) return basename(trace.intermediate_path, ".json");
  return null;
}

function runReparse(trace: DetailBindingTrace): ReparseResult {
  const timestamp = timestampFromTrace(trace);
  if (!timestamp) {
    return {
      title: trace.target_title,
      timestamp: "",
      command: "(not run)",
      exit_code: 1,
      success: false,
      backup_path: null,
      before: { exists: false, text_blocks: 0, total_text_length: 0, classification: null },
      after: { exists: false, text_blocks: 0, total_text_length: 0, classification: null },
      stdout_summary: "",
      stderr_summary: "timestamp_missing",
    };
  }

  const before = statsForTimestamp(timestamp);
  const backupPath = backupSample(timestamp);
  const command = `pnpm parse:ruankaodaren -- --timestamp "${timestamp}"`;
  console.log(`[reparse] ${trace.target_title}: ${command}`);
  const result = spawnSync(command, {
    cwd: repoRoot,
    shell: true,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 20 * 1024 * 1024,
  });
  const exitCode = typeof result.status === "number" ? result.status : result.error ? 1 : 0;
  const stderr = `${outputText(result.stderr)}${result.error ? `\n${String(result.error)}` : ""}`;

  return {
    title: trace.target_title,
    timestamp,
    command,
    exit_code: exitCode,
    success: exitCode === 0,
    backup_path: toRepoPath(backupPath),
    before,
    after: statsForTimestamp(timestamp),
    stdout_summary: summarize(outputText(result.stdout)),
    stderr_summary: summarize(stderr),
  };
}

function writeReports(results: ReparseResult[]): void {
  mkdirSync(generatedDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const report = {
    generated_at: generatedAt,
    phase: "3.17",
    source_report: "verification/generated/phase3_16_detail_binding_audit.json",
    reparsed_count: results.filter((result) => result.success).length,
    failed_count: results.filter((result) => !result.success).length,
    results,
    constraints: {
      no_crawl: true,
      no_acquisition: true,
      no_markdown_generated: true,
      no_ocr: true,
      no_encrypt1_decrypted: true,
      no_image_table_reconstructed: true,
      no_full_site_crawl: true,
      phase4_not_entered: true,
    },
  };

  const jsonPath = resolve(generatedDir, "phase3_17_reparse_selected_samples.json");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    "# Phase 3.17 Reparse Selected Samples",
    "",
    `Generated at: ${generatedAt}`,
    "",
    "## Summary",
    "",
    `- reparsed_count: ${report.reparsed_count}`,
    `- failed_count: ${report.failed_count}`,
    "",
    "## Results",
    "",
    "| Title | Timestamp | Success | Text blocks before | Text blocks after | Text length before | Text length after | Classification before | Classification after | Backup |",
    "|---|---|---|---:|---:|---:|---:|---|---|---|",
    ...results.map((result) =>
      `| ${result.title} | ${result.timestamp} | ${result.success} | ${result.before.text_blocks} | ${result.after.text_blocks} | ${result.before.total_text_length} | ${result.after.total_text_length} | ${result.before.classification ?? ""} | ${result.after.classification ?? ""} | ${result.backup_path ?? ""} |`
    ),
    "",
    "## Constraints",
    "",
    "- No crawl performed.",
    "- No acquisition performed.",
    "- No Markdown knowledge documents generated.",
    "- No OCR used.",
    "- No encrypt=1 data decrypted.",
    "- No image table reconstructed.",
    "- No full-site batch crawl performed.",
    "- Phase 4 was not entered.",
    "",
  ];
  const mdPath = resolve(generatedDir, "phase3_17_reparse_selected_samples.md");
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log("[reparse] Selected sample reparse complete");
  console.log(`  reparsed: ${report.reparsed_count}`);
  console.log(`  failed:   ${report.failed_count}`);
  console.log(`  JSON report: ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report: ${toRepoPath(mdPath)}`);
}

function main(): void {
  if (!existsSync(detailBindingAuditPath)) {
    console.error("[reparse] ERROR: detail binding audit missing:", detailBindingAuditPath);
    process.exit(1);
  }

  const audit = readJson<DetailBindingAudit>(detailBindingAuditPath);
  const traces = audit.traces ?? [];
  if (traces.length === 0) {
    console.error("[reparse] ERROR: no traces found in detail binding audit.");
    process.exit(1);
  }

  writeReports(traces.map(runReparse));
}

main();
