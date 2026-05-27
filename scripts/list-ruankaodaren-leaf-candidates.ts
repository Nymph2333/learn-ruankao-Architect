/**
 * Phase 3.5: list leaf-level candidate titles from existing raw snapshots.
 *
 * This is not a parser and not a Markdown renderer. It only scans already
 * captured raw text/html/container artifacts for candidate titles such as
 * "3.1 xxx" so humans can refine controlled sample targets.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const rawRoot = resolve(repoRoot, "sources/ruankaodaren/raw");
const generatedDir = resolve(repoRoot, "verification/generated");

type CandidateSource = "dom-text" | "html" | "container";
type CandidateConfidence = "high" | "medium" | "low";

interface LeafCandidate {
  title: string;
  chapter: string | null;
  shape: "leaf_knowledge_point";
  confidence: CandidateConfidence;
  source: CandidateSource;
}

interface CandidateReport {
  generated_at: string;
  source_status: "available" | "unavailable";
  raw_files_checked: string[];
  candidate_count: number;
  candidates: LeafCandidate[];
  notes: string[];
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function latestFiles(dir: string, ext: string, limit = 5): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(ext) && file !== ".gitkeep")
    .sort()
    .slice(-limit)
    .map((file) => resolve(dir, file));
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function isChapterLine(line: string): boolean {
  return /^第\s*\d+\s*章/.test(line);
}

function isLeafLine(line: string): boolean {
  return /^\d+(?:\.\d+)+\s*\S+/.test(line) && !line.includes("掌握程度");
}

function chapterNumber(chapter: string | null): string | null {
  return chapter?.match(/^第\s*(\d+)\s*章/)?.[1] ?? null;
}

function candidateConfidence(title: string, chapter: string | null): CandidateConfidence {
  const num = title.match(/^(\d+)\./)?.[1] ?? null;
  const chapterNum = chapterNumber(chapter);
  if (num && chapterNum && num === chapterNum) return "high";
  if (chapter) return "medium";
  return "low";
}

function addCandidatesFromText(
  text: string,
  source: CandidateSource,
  candidatesByTitle: Map<string, LeafCandidate>
): void {
  let currentChapter: string | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = normalizeLine(rawLine);
    if (!line) continue;

    if (isChapterLine(line)) {
      currentChapter = line;
      continue;
    }

    if (!isLeafLine(line)) continue;

    const existing = candidatesByTitle.get(line);
    const next: LeafCandidate = {
      title: line,
      chapter: currentChapter,
      shape: "leaf_knowledge_point",
      confidence: candidateConfidence(line, currentChapter),
      source,
    };

    if (!existing) {
      candidatesByTitle.set(line, next);
      continue;
    }

    const rank: Record<CandidateConfidence, number> = { high: 3, medium: 2, low: 1 };
    if (rank[next.confidence] > rank[existing.confidence]) {
      candidatesByTitle.set(line, next);
    }
  }
}

function extractTextFromContainerJson(raw: string): string {
  const parsed = JSON.parse(raw) as { containers?: Array<{ text?: string }> };
  return (parsed.containers ?? []).map((container) => container.text ?? "").join("\n");
}

function main(): void {
  const checkedFiles: string[] = [];
  const candidatesByTitle = new Map<string, LeafCandidate>();
  const notes: string[] = [];

  const domTextFiles = latestFiles(resolve(rawRoot, "dom-text"), ".txt");
  for (const file of domTextFiles) {
    checkedFiles.push(toRepoPath(file));
    addCandidatesFromText(readFileSync(file, "utf8"), "dom-text", candidatesByTitle);
  }

  const containerFiles = latestFiles(resolve(rawRoot, "containers"), ".json");
  for (const file of containerFiles) {
    checkedFiles.push(toRepoPath(file));
    try {
      addCandidatesFromText(extractTextFromContainerJson(readFileSync(file, "utf8")), "container", candidatesByTitle);
    } catch (error) {
      notes.push(`container read failed: ${toRepoPath(file)} (${String(error)})`);
    }
  }

  const htmlFiles = latestFiles(resolve(rawRoot, "html"), ".html", 2);
  for (const file of htmlFiles) {
    checkedFiles.push(toRepoPath(file));
    addCandidatesFromText(stripHtml(readFileSync(file, "utf8")), "html", candidatesByTitle);
  }

  const candidates = [...candidatesByTitle.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "zh-Hans-CN")
  );

  if (checkedFiles.length === 0) {
    notes.push("No raw dom-text, container, or html files were available.");
  }
  if (candidates.length === 0) {
    notes.push("No leaf-like titles were found in existing raw snapshots.");
  }

  const report: CandidateReport = {
    generated_at: new Date().toISOString(),
    source_status: checkedFiles.length > 0 ? "available" : "unavailable",
    raw_files_checked: checkedFiles,
    candidate_count: candidates.length,
    candidates,
    notes,
  };

  mkdirSync(generatedDir, { recursive: true });
  const jsonPath = resolve(generatedDir, "phase3_5_leaf_candidates.json");
  const mdPath = resolve(generatedDir, "phase3_5_leaf_candidates.md");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdLines = [
    "# Phase 3.5 Leaf Candidate Report",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    `Source status: ${report.source_status}`,
    "",
    `Candidate count: ${report.candidate_count}`,
    "",
    "## Candidates",
    "",
    "| Title | Chapter | Shape | Confidence | Source |",
    "|---|---|---|---|---|",
    ...candidates.map(
      (candidate) =>
        `| ${candidate.title} | ${candidate.chapter ?? ""} | ${candidate.shape} | ${candidate.confidence} | ${candidate.source} |`
    ),
    "",
    "## Notes",
    "",
    ...(notes.length > 0 ? notes.map((note) => `- ${note}`) : ["- None."]),
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

  console.log("[leaf-candidates] report generated");
  console.log(`  files checked:    ${checkedFiles.length}`);
  console.log(`  candidate count: ${candidates.length}`);
  console.log(`  JSON report:     ${toRepoPath(jsonPath)}`);
  console.log(`  Markdown report: ${toRepoPath(mdPath)}`);
}

main();
