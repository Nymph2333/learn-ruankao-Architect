/**
 * Phase 3.24: third unique renderer baseline discovery and promotion.
 *
 * Discovery-first orchestration for at most three exact reachable leaf targets.
 * This script does not implement a Markdown renderer, does not OCR images,
 * does not decrypt encrypt=1 payloads, and does not batch crawl the site.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const configPath = resolve(repoRoot, "config/ruankaodaren-sample-targets.yaml");
const baselineManifestPath = resolve(
  repoRoot,
  "verification/generated/phase3_23_renderer_baseline_manifest.json"
);
const reachableCatalogPath = resolve(
  repoRoot,
  "verification/generated/phase3_11_reachable_leaf_catalog.json"
);
const quarantineManifestPath = resolve(
  repoRoot,
  "data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json"
);
const sampleQualityAuditPath = resolve(repoRoot, "verification/generated/phase3_4_sample_quality_audit.json");

const preferredCandidates = [
  "9.1 信息安全基础知识",
  "9.2 信息安全系统的组成框架",
  "12.2 软件配置管理",
  "10.2 需求工程",
  "3.11 SQL语言",
];

const hardExcludedTitles = new Set([
  "1.3 指令系统CISC和RISC",
  "13.3 软件架构风格",
  "第3章 数据库系统",
  "第5章 计算机网络",
  "3.1 数据库系统常识",
  "1.5 存储系统",
  "1.4 指令的流水处理",
  "3.3 数据库的设计",
  "5.1 网络概述和模型",
  "8.8 典型信息系统架构模型",
]);

type PromotionResult = "success" | "failed" | "skipped";

interface CommandResult {
  command: string;
  exit_code: number;
  success: boolean;
  stdout_summary: string;
  stderr_summary: string;
  duration_ms: number;
}

interface BaselineManifest {
  unique_title_count?: number;
  phase4_input_contract_ready?: boolean;
  phase4_renderer_allowed?: boolean;
  required_before_phase4?: string[];
  baseline_items?: Array<{ canonical_title?: string }>;
  excluded_items?: Array<{ title?: string | null; reason?: string | null }>;
}

interface SampleQualityAudit {
  overall_gate?: {
    phase4_renderer_allowed?: boolean;
    required_before_phase4?: string[];
  };
}

interface ReachableCatalog {
  chapters?: Array<{
    leaves?: Array<{ title?: string; section_number?: string; chapter_title?: string }>;
  }>;
}

interface QuarantineManifest {
  items?: Array<{ title?: string | null; quarantine_reason?: string | null }>;
}

interface DiscoveryReport {
  target?: string;
  final_url?: string;
  stabilization?: {
    status?: string;
    text_length?: number;
  } | null;
  baseline?: {
    body_text_length?: number;
    ql_editor_text_length?: number;
    img_count?: number;
  };
  click_results?: Array<{
    text_length_delta?: number;
    img_count_delta?: number;
    url_changed?: boolean;
    error?: string | null;
  }>;
  alternate_container_max_text_length?: number;
  conclusion?: {
    content_access_pattern?: string;
    recommended_next_action?: string;
    notes?: string;
  };
}

interface CandidateAttempt {
  title: string;
  discovery_command: string | null;
  discovery_report_path: string | null;
  discovery_result: "pass" | "fail" | "skipped";
  content_access_pattern: string | null;
  promotion_decision: "promote" | "reject" | "skipped";
  promotion_reason: string | null;
  reject_reason: string | null;
  config_target_id: string | null;
  acquisition_command: string | null;
  acquisition_result: "pass" | "fail" | "skipped";
  post_audit_commands: CommandResult[];
  renderer_eligibility: boolean | null;
}

interface PromotionRunReport {
  generated_at: string;
  attempted_candidates: string[];
  discovery_results: CandidateAttempt[];
  promotion_attempted: boolean;
  promoted_title: string | null;
  promotion_result: PromotionResult;
  final_unique_title_count: number;
  canonical_baseline_titles: string[];
  phase4_input_contract_ready: boolean;
  phase4_renderer_allowed: boolean;
  required_before_phase4: string[];
}

function readJson<T>(absPath: string): T | null {
  if (!existsSync(absPath)) return null;
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch {
    return null;
  }
}

function toRepoPath(absPath: string | null): string | null {
  return absPath ? relative(repoRoot, absPath).replace(/\\/g, "/") : null;
}

function safeFilename(title: string): string {
  return title
    .replace(/[^A-Za-z0-9\u4e00-\u9fff]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function yamlQuote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function commandArg(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function summarizeOutput(value: string | Buffer | null | undefined, maxChars = 2_000): string {
  const text = typeof value === "string" ? value : value?.toString("utf8") ?? "";
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
  const tail = lines.slice(-25).join("\n");
  if (tail.length <= maxChars) return tail;
  return tail.slice(tail.length - maxChars);
}

function runCommand(command: string, extraEnv?: Record<string, string>): CommandResult {
  console.log(`[phase3.24] running: ${command}`);
  const started = Date.now();
  const result = spawnSync(command, {
    cwd: repoRoot,
    shell: true,
    encoding: "utf8",
    windowsHide: true,
    env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
    maxBuffer: 25 * 1024 * 1024,
  });
  const exitCode = typeof result.status === "number" ? result.status : result.error ? 1 : 0;
  const errorText = result.error ? `\n${String(result.error)}` : "";
  const step = {
    command,
    exit_code: exitCode,
    success: exitCode === 0,
    stdout_summary: summarizeOutput(result.stdout),
    stderr_summary: summarizeOutput(`${result.stderr ?? ""}${errorText}`),
    duration_ms: Date.now() - started,
  };
  console.log(`[phase3.24] ${step.success ? "success" : `failed (${exitCode})`}: ${command}`);
  return step;
}

function normalizeTitle(title: string | null | undefined): string {
  return (title ?? "").replace(/\s+/g, "").trim().toLowerCase();
}

function isChapterTitle(title: string): boolean {
  return /^第\s*\d+\s*章/.test(title.trim());
}

function loadBaseline(): BaselineManifest {
  return readJson<BaselineManifest>(baselineManifestPath) ?? {};
}

function loadReachableTitles(): Set<string> {
  const catalog = readJson<ReachableCatalog>(reachableCatalogPath);
  const titles = new Set<string>();
  for (const chapter of catalog?.chapters ?? []) {
    for (const leaf of chapter.leaves ?? []) {
      if (leaf.title) titles.add(leaf.title);
    }
  }
  return titles;
}

function loadQuarantineTitles(): Set<string> {
  const manifest = readJson<QuarantineManifest>(quarantineManifestPath);
  const titles = new Set<string>();
  for (const item of manifest?.items ?? []) {
    if (item.title) titles.add(item.title);
  }
  return titles;
}

function selectCandidates(): string[] {
  const baseline = loadBaseline();
  const canonicalTitles = new Set(
    (baseline.baseline_items ?? [])
      .map((item) => item.canonical_title)
      .filter((title): title is string => typeof title === "string" && title.length > 0)
  );
  const baselineExcludedTitles = new Set(
    (baseline.excluded_items ?? [])
      .map((item) => item.title)
      .filter((title): title is string => typeof title === "string" && title.length > 0)
  );
  const quarantineTitles = loadQuarantineTitles();
  const reachableTitles = loadReachableTitles();

  const selected: string[] = [];
  for (const title of preferredCandidates) {
    if (selected.length >= 3) break;
    if (!reachableTitles.has(title)) continue;
    if (isChapterTitle(title)) continue;
    if (hardExcludedTitles.has(title)) continue;
    if (canonicalTitles.has(title)) continue;
    if (baselineExcludedTitles.has(title)) continue;
    if (quarantineTitles.has(title)) continue;
    selected.push(title);
  }
  return selected;
}

function discoveryReportPath(title: string): string {
  return resolve(generatedDir, `phase3_20_detail_interaction_discovery_${safeFilename(title)}.json`);
}

function discoveryMarkdownPath(title: string): string {
  return resolve(generatedDir, `phase3_20_detail_interaction_discovery_${safeFilename(title)}.md`);
}

function maxClickTextDelta(report: DiscoveryReport): number {
  return Math.max(0, ...(report.click_results ?? []).map((item) => item.text_length_delta ?? 0));
}

function discoveryQualifies(report: DiscoveryReport): {
  qualifies: boolean;
  expectedClassification: "STATIC_LOW_TEXT_VERIFIED" | "UNKNOWN";
  reason: string;
  rejectReason: string | null;
} {
  const pattern = report.conclusion?.content_access_pattern ?? "unknown";
  const stabilizationStatus = report.stabilization?.status ?? "unknown";
  const stabilizedTextLength = report.stabilization?.text_length ?? 0;
  const alternateMax = report.alternate_container_max_text_length ?? 0;
  const clickDelta = maxClickTextDelta(report);
  const imgCount = report.baseline?.img_count ?? 0;
  const finalUrl = report.final_url ?? "";

  if (!finalUrl.includes("konwledgeInfo")) {
    return {
      qualifies: false,
      expectedClassification: "UNKNOWN",
      reason: "discovery final_url is not a detail route",
      rejectReason: "discovery_not_detail_route",
    };
  }

  if (
    pattern === "static_low_text" &&
    stabilizedTextLength > 0 &&
    clickDelta < 100 &&
    alternateMax < 120 &&
    !stabilizationStatus.includes("timeout")
  ) {
    return {
      qualifies: true,
      expectedClassification: "STATIC_LOW_TEXT_VERIFIED",
      reason: `static_low_text verified: text=${stabilizedTextLength}, max_click_delta=${clickDelta}, alternate_max=${alternateMax}`,
      rejectReason: null,
    };
  }

  if (alternateMax >= 120 && pattern !== "unknown") {
    return {
      qualifies: true,
      expectedClassification: "UNKNOWN",
      reason: `rich text verified: alternate_container_max_text_length=${alternateMax}`,
      rejectReason: null,
    };
  }

  if (imgCount >= 1 && stabilizedTextLength > 0 && pattern !== "unknown") {
    return {
      qualifies: true,
      expectedClassification: "UNKNOWN",
      reason: `asset-card verified: img_count=${imgCount}, surrounding_text_length=${stabilizedTextLength}`,
      rejectReason: null,
    };
  }

  return {
    qualifies: false,
    expectedClassification: "UNKNOWN",
    reason: "discovery did not prove static_low_text, rich_text, or asset-card stability",
    rejectReason: "discovery_not_promotion_qualified",
  };
}

function phase324TargetId(title: string): string {
  return `phase324_${safeFilename(title).toLowerCase()}`;
}

function upsertConfigTarget(
  title: string,
  expectedClassification: "STATIC_LOW_TEXT_VERIFIED" | "UNKNOWN",
  discoveryEvidenceMdRepoPath: string
): string {
  const id = phase324TargetId(title);
  const block = [
    `    - id: ${id}`,
    `      title_hint: ${yamlQuote(title)}`,
    `      expected_shape: "leaf_knowledge_point"`,
    `      expected_classification: ${yamlQuote(expectedClassification)}`,
    `      status: "pending_capture"`,
    `      require_leaf: "true"`,
    `      require_preflight: "true"`,
    `      require_live_replay: "true"`,
    `      require_discovery_evidence: "true"`,
    `      discovery_evidence: ${yamlQuote(discoveryEvidenceMdRepoPath)}`,
    `      source_catalog: "verification/generated/phase3_11_reachable_leaf_catalog.md"`,
    `      selection_reason: "Phase 3.24 discovery-first third unique renderer baseline promotion candidate"`,
  ].join("\n");

  const text = readFileSync(configPath, "utf8");
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existingBlock = new RegExp(
    `\\n    - id: ${escapedId}\\n(?:      [^\\n]*\\n?)*?(?=\\n    - id:|\\n# Notes:|\\s*$)`,
    "m"
  );

  let nextText: string;
  if (existingBlock.test(text)) {
    nextText = text.replace(existingBlock, `\n${block}`);
  } else {
    const notesIndex = text.indexOf("\n# Notes:");
    if (notesIndex >= 0) {
      nextText = `${text.slice(0, notesIndex).trimEnd()}\n\n${block}\n${text.slice(notesIndex)}`;
    } else {
      nextText = `${text.trimEnd()}\n\n${block}\n`;
    }
  }

  writeFileSync(configPath, nextText, "utf8");
  return id;
}

function runPostPromotionAudits(): CommandResult[] {
  const commands = [
    "pnpm audit:renderer-readiness",
    "pnpm audit:semantic-alignment",
    "pnpm build:renderer-baseline",
    "pnpm audit:sample-quality",
    "pnpm report:sample-coverage",
    "pnpm validate:intermediate",
    "pnpm validate:assets",
  ];
  return commands.map((command) => runCommand(command));
}

function buildReport(attempts: CandidateAttempt[], promotionAttempted: boolean): PromotionRunReport {
  const baseline = loadBaseline();
  const quality = readJson<SampleQualityAudit>(sampleQualityAuditPath);
  const canonicalBaselineTitles = (baseline.baseline_items ?? [])
    .map((item) => item.canonical_title ?? "")
    .filter(Boolean);
  const promoted = attempts.find((attempt) => attempt.renderer_eligibility === true);
  const promotionResult: PromotionResult = promoted ? "success" : promotionAttempted ? "failed" : "skipped";
  return {
    generated_at: new Date().toISOString(),
    attempted_candidates: attempts.map((attempt) => attempt.title),
    discovery_results: attempts,
    promotion_attempted: promotionAttempted,
    promoted_title: promoted?.title ?? null,
    promotion_result: promotionResult,
    final_unique_title_count: baseline.unique_title_count ?? 0,
    canonical_baseline_titles: canonicalBaselineTitles,
    phase4_input_contract_ready: baseline.phase4_input_contract_ready ?? false,
    phase4_renderer_allowed: quality?.overall_gate?.phase4_renderer_allowed ?? false,
    required_before_phase4:
      quality?.overall_gate?.required_before_phase4 ?? baseline.required_before_phase4 ?? [],
  };
}

function writeReport(report: PromotionRunReport): void {
  mkdirSync(generatedDir, { recursive: true });
  const jsonPath = resolve(generatedDir, "phase3_24_third_baseline_promotion_run.json");
  const mdPath = resolve(generatedDir, "phase3_24_third_baseline_promotion_run.md");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines: string[] = [
    "# Phase 3.24 Third Baseline Promotion Run",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    `- attempted_candidates: ${report.attempted_candidates.length}`,
    `- promotion_attempted: ${report.promotion_attempted}`,
    `- promoted_title: ${report.promoted_title ?? "(none)"}`,
    `- promotion_result: ${report.promotion_result}`,
    `- final_unique_title_count: ${report.final_unique_title_count}`,
    `- phase4_input_contract_ready: ${report.phase4_input_contract_ready}`,
    `- phase4_renderer_allowed: ${report.phase4_renderer_allowed}`,
    "",
    "## Canonical Baseline Titles",
    "",
    ...(report.canonical_baseline_titles.length === 0
      ? ["- None."]
      : report.canonical_baseline_titles.map((title) => `- ${title}`)),
    "",
    "## Required Before Phase 4",
    "",
    ...(report.required_before_phase4.length === 0
      ? ["- (none)"]
      : report.required_before_phase4.map((item) => `- ${item}`)),
    "",
    "## Candidate Attempts",
    "",
  ];

  for (const attempt of report.discovery_results) {
    mdLines.push(`### ${attempt.title}`);
    mdLines.push("");
    mdLines.push(`- discovery_result: ${attempt.discovery_result}`);
    mdLines.push(`- content_access_pattern: ${attempt.content_access_pattern ?? "(unknown)"}`);
    mdLines.push(`- promotion_decision: ${attempt.promotion_decision}`);
    mdLines.push(`- promotion_reason: ${attempt.promotion_reason ?? "(none)"}`);
    mdLines.push(`- reject_reason: ${attempt.reject_reason ?? "(none)"}`);
    mdLines.push(`- config_target_id: ${attempt.config_target_id ?? "(none)"}`);
    mdLines.push(`- acquisition_result: ${attempt.acquisition_result}`);
    mdLines.push(`- renderer_eligibility: ${attempt.renderer_eligibility ?? "(unknown)"}`);
    mdLines.push(`- discovery_report: ${attempt.discovery_report_path ?? "(none)"}`);
    mdLines.push("");
  }

  mdLines.push("## Constraints");
  mdLines.push("");
  mdLines.push("- No Markdown generated.");
  mdLines.push("- No OCR used.");
  mdLines.push("- No encrypt=1 decrypted.");
  mdLines.push("- No image table reconstructed.");
  mdLines.push("- No full-site batch crawl performed.");
  mdLines.push("- Phase 4 implementation was not entered.");
  mdLines.push("");

  writeFileSync(mdPath, mdLines.join("\n"), "utf8");
  console.log(`[phase3.24] JSON: ${toRepoPath(jsonPath)}`);
  console.log(`[phase3.24] MD:   ${toRepoPath(mdPath)}`);
}

function targetIsBaseline(title: string): boolean {
  const baseline = loadBaseline();
  return (baseline.baseline_items ?? []).some(
    (item) => normalizeTitle(item.canonical_title) === normalizeTitle(title)
  );
}

function main(): void {
  mkdirSync(generatedDir, { recursive: true });

  const candidates = selectCandidates();
  console.log(`[phase3.24] selected candidates: ${candidates.join(", ") || "(none)"}`);
  const attempts: CandidateAttempt[] = [];
  let promotionAttempted = false;

  for (const title of candidates) {
    const attempt: CandidateAttempt = {
      title,
      discovery_command: null,
      discovery_report_path: null,
      discovery_result: "skipped",
      content_access_pattern: null,
      promotion_decision: "skipped",
      promotion_reason: null,
      reject_reason: null,
      config_target_id: null,
      acquisition_command: null,
      acquisition_result: "skipped",
      post_audit_commands: [],
      renderer_eligibility: null,
    };

    const discoverCommand = `pnpm discover:detail-interactions -- --target ${commandArg(title)}`;
    attempt.discovery_command = discoverCommand;
    const discoveryStep = runCommand(discoverCommand);
    if (!discoveryStep.success) {
      attempt.discovery_result = "fail";
      attempt.promotion_decision = "reject";
      attempt.reject_reason = `discovery_failed: ${discoveryStep.stderr_summary || discoveryStep.stdout_summary}`;
      attempts.push(attempt);
      continue;
    }

    const discoveryJsonPath = discoveryReportPath(title);
    const discoveryReport = readJson<DiscoveryReport>(discoveryJsonPath);
    attempt.discovery_report_path = toRepoPath(discoveryJsonPath);
    if (!discoveryReport) {
      attempt.discovery_result = "fail";
      attempt.promotion_decision = "reject";
      attempt.reject_reason = "discovery_report_missing_or_unreadable";
      attempts.push(attempt);
      continue;
    }

    attempt.discovery_result = "pass";
    attempt.content_access_pattern = discoveryReport.conclusion?.content_access_pattern ?? "unknown";
    const decision = discoveryQualifies(discoveryReport);
    attempt.promotion_reason = decision.reason;

    if (!decision.qualifies) {
      attempt.promotion_decision = "reject";
      attempt.reject_reason = decision.rejectReason;
      attempts.push(attempt);
      continue;
    }

    attempt.promotion_decision = "promote";
    const discoveryMdRepoPath = toRepoPath(discoveryMarkdownPath(title));
    if (!discoveryMdRepoPath) {
      attempt.reject_reason = "discovery_md_path_unavailable";
      attempt.acquisition_result = "skipped";
      attempts.push(attempt);
      continue;
    }

    const targetId = upsertConfigTarget(title, decision.expectedClassification, discoveryMdRepoPath);
    attempt.config_target_id = targetId;
    promotionAttempted = true;

    const acquisitionCommand = "pnpm run:sample-acquisition";
    attempt.acquisition_command = acquisitionCommand;
    const acquisitionStep = runCommand(acquisitionCommand, {
      RUANKAODAREN_SAMPLE_TARGET_ID: targetId,
    });
    attempt.acquisition_result = acquisitionStep.success ? "pass" : "fail";

    const postAuditCommands = runPostPromotionAudits();
    attempt.post_audit_commands = postAuditCommands;
    attempt.renderer_eligibility = targetIsBaseline(title);

    if (attempt.renderer_eligibility) {
      attempts.push(attempt);
      break;
    }

    attempt.reject_reason =
      acquisitionStep.success && postAuditCommands.every((step) => step.success)
        ? "promotion_completed_but_title_not_in_baseline_manifest"
        : "promotion_pipeline_failed";
    attempts.push(attempt);
  }

  const report = buildReport(attempts, promotionAttempted);
  writeReport(report);

  console.log("[phase3.24] completed");
  console.log(`  attempted_candidates:        ${report.attempted_candidates.length}`);
  console.log(`  promoted_title:              ${report.promoted_title ?? "(none)"}`);
  console.log(`  final_unique_title_count:    ${report.final_unique_title_count}`);
  console.log(`  phase4_input_contract_ready: ${report.phase4_input_contract_ready}`);
  console.log(`  phase4_renderer_allowed:     ${report.phase4_renderer_allowed}`);
}

main();
