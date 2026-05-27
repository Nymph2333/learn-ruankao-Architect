/**
 * Phase 3.6: select content-ready leaf acquisition candidates.
 *
 * This script only reads Phase 3.5 leaf candidates and existing intermediate
 * samples. It does not crawl, decrypt, OCR, reconstruct image tables, or
 * generate Markdown knowledge documents.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const leafCandidatesPath = resolve(generatedDir, "phase3_5_leaf_candidates.json");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");

type CandidateConfidence = "high" | "medium" | "low";

interface LeafCandidate {
  title: string;
  chapter: string | null;
  shape: "leaf_knowledge_point";
  confidence: CandidateConfidence;
  source: string;
}

interface LeafCandidateReport {
  candidate_count?: number;
  candidates?: LeafCandidate[];
}

interface SelectedCandidate extends LeafCandidate {
  reason: string;
  suggested_target_command: string;
}

interface ExcludedCandidate extends LeafCandidate {
  excluded_reason: string;
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function existingSampleTitles(): Set<string> {
  const titles = new Set<string>();
  if (!existsSync(samplesDir)) return titles;

  for (const fileName of readdirSync(samplesDir).filter((file) => file.endsWith(".json"))) {
    const doc = readJson<RuankaoIntermediateDocument>(resolve(samplesDir, fileName));
    const title = doc.content?.title?.trim();
    if (title) titles.add(title);
  }

  return titles;
}

function commandArg(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function leafNumber(title: string): { chapter: number; section: number } {
  const match = title.match(/^(\d+)\.(\d+)/);
  return {
    chapter: match ? Number(match[1]) : 999,
    section: match ? Number(match[2]) : 999,
  };
}

function lowValueReason(title: string): string | null {
  const normalized = title.replace(/\s+/g, "");
  const textPart = title.replace(/^\d+(?:\.\d+)+\s*/, "").trim();
  if (textPart.length < 3) return "title text is too short";
  if (normalized.includes("常识")) return "likely low-value overview/common-sense leaf";
  if (/^第\s*\d+\s*章/.test(title)) return "chapter title is not a leaf";
  return null;
}

function candidateScore(candidate: LeafCandidate): number {
  let score = 0;
  const title = candidate.title;
  const titleText = title.replace(/^\d+(?:\.\d+)+\s*/, "");

  if (candidate.confidence === "high") score += 10;
  if (candidate.confidence === "medium") score += 6;
  if (titleText.length >= 8) score += 4;
  if (/(规范化|数据仓库|数据挖掘|NoSQL|反规范化|分布式|SQL|E-R|流水|存储)/.test(title)) score += 5;
  if (title.includes("常识")) score -= 8;

  const num = leafNumber(title);
  score += Math.max(0, 10 - Math.abs(num.section - 6));
  return score;
}

function main(): void {
  if (!existsSync(leafCandidatesPath)) {
    console.error(
      `[content-ready-selection] ERROR: missing leaf candidate report: ${toRepoPath(leafCandidatesPath)}`
    );
    console.error("[content-ready-selection] Run pnpm list:leaf-candidates first.");
    process.exit(1);
  }

  const existingTitles = existingSampleTitles();
  const leafReport = readJson<LeafCandidateReport>(leafCandidatesPath);
  const candidates = (leafReport.candidates ?? []).filter(
    (candidate) => candidate.shape === "leaf_knowledge_point"
  );

  const excluded: ExcludedCandidate[] = [];
  const eligible: LeafCandidate[] = [];

  for (const candidate of candidates) {
    if (existingTitles.has(candidate.title)) {
      excluded.push({ ...candidate, excluded_reason: "already exists in intermediate samples" });
      continue;
    }

    const reason = lowValueReason(candidate.title);
    if (reason) {
      excluded.push({ ...candidate, excluded_reason: reason });
      continue;
    }

    eligible.push(candidate);
  }

  const selected: SelectedCandidate[] = [];
  const usedChapters = new Set<string>();
  const ranked = eligible
    .slice()
    .sort((a, b) => candidateScore(b) - candidateScore(a) || a.title.localeCompare(b.title, "zh-Hans-CN"));

  for (const candidate of ranked) {
    if (selected.length >= 5) break;
    const chapterKey = candidate.chapter ?? "unknown";
    const chapterDiversityPenalty = usedChapters.has(chapterKey) && selected.length < 2;
    if (chapterDiversityPenalty) continue;

    selected.push({
      ...candidate,
      reason: "Phase 3.6 content-ready leaf candidate; complete leaf title from Phase 3.5 and likely richer than overview nodes",
      suggested_target_command: `pnpm crawl:ruankaodaren -- --target ${commandArg(candidate.title)} --require-leaf`,
    });
    usedChapters.add(chapterKey);
  }

  for (const candidate of ranked) {
    if (selected.length >= 5) break;
    if (selected.some((item) => item.title === candidate.title)) continue;

    selected.push({
      ...candidate,
      reason: "Phase 3.6 content-ready leaf candidate; selected after chapter-diversity pass",
      suggested_target_command: `pnpm crawl:ruankaodaren -- --target ${commandArg(candidate.title)} --require-leaf`,
    });
  }

  const report = {
    generated_at: new Date().toISOString(),
    source_report_path: "verification/generated/phase3_5_leaf_candidates.json",
    existing_sample_titles: [...existingTitles].sort((a, b) => a.localeCompare(b, "zh-Hans-CN")),
    recommended_candidate_count: selected.length,
    selected_candidates: selected,
    excluded_candidate_count: excluded.length,
    excluded_candidates: excluded,
    constraints: {
      markdown_generated: false,
      ocr_used: false,
      encrypted_xhr_decrypted: false,
      image_table_reconstructed: false,
      full_site_batch_crawl: false,
      phase4_entered: false,
    },
  };

  mkdirSync(generatedDir, { recursive: true });
  const jsonPath = resolve(generatedDir, "phase3_6_content_ready_candidate_selection.json");
  const mdPath = resolve(generatedDir, "phase3_6_content_ready_candidate_selection.md");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdLines = [
    "# Phase 3.6 Content-ready Candidate Selection",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    `Recommended candidate count: ${report.recommended_candidate_count}`,
    "",
    "## Selected Candidates",
    "",
    "| Title | Chapter | Confidence | Reason | Suggested command |",
    "|---|---|---|---|---|",
    ...selected.map(
      (candidate) =>
        `| ${candidate.title} | ${candidate.chapter ?? ""} | ${candidate.confidence} | ${candidate.reason} | \`${candidate.suggested_target_command}\` |`
    ),
    "",
    "## Excluded Candidates",
    "",
    "| Title | Chapter | Reason |",
    "|---|---|---|",
    ...excluded.map(
      (candidate) => `| ${candidate.title} | ${candidate.chapter ?? ""} | ${candidate.excluded_reason} |`
    ),
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

  console.log("[content-ready-selection] report generated");
  console.log(`  recommended candidates: ${selected.length}`);
  console.log(`  excluded candidates:    ${excluded.length}`);
  console.log(`  JSON report:            ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report:        ${toRepoPath(mdPath)}`);
}

main();
