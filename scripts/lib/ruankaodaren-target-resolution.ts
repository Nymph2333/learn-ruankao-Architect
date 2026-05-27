import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const defaultCatalogPath = resolve(repoRoot, "verification/generated/phase3_11_reachable_leaf_catalog.json");

export type CatalogMatchStrategy =
  | "exact_full_title"
  | "normalized_exact"
  | "section_number"
  | "token_overlap"
  | "not_found";

export type CatalogConfidence = "high" | "medium" | "low";

export interface ParsedTargetSection {
  target_section_number: string;
  target_chapter_number: string;
  target_leaf_number: string;
  target_title_remainder: string;
}

export interface CatalogLeaf {
  title: string;
  normalized_title?: string;
  section_number?: string;
  chapter_number?: string;
  chapter_title?: string;
  confidence?: CatalogConfidence;
  visible?: boolean;
  has_detail_entry_signal?: boolean;
  raw_text_preview?: string;
  dom_order?: number;
  chapter_dom_order?: number;
  [key: string]: unknown;
}

export interface CatalogChapter {
  chapter_title: string;
  expanded?: boolean;
  leaf_count?: number;
  leaves?: CatalogLeaf[];
  [key: string]: unknown;
}

export interface ReachableLeafCatalog {
  captured_at?: string;
  source_url?: string;
  final_url?: string;
  chapter_count?: number;
  leaf_count?: number;
  chapters?: CatalogChapter[];
  [key: string]: unknown;
}

export interface CatalogLeafMatch {
  found: boolean;
  match_strategy: CatalogMatchStrategy;
  chapter_title: string | null;
  leaf_title: string | null;
  section_number: string | null;
  chapter_number: string | null;
  confidence: CatalogConfidence | null;
  raw_catalog_item: CatalogLeaf | null;
}

interface FlatCatalogLeaf extends CatalogLeaf {
  title: string;
  normalized_title: string;
  section_number: string;
  chapter_number: string;
  chapter_title: string;
  confidence: CatalogConfidence;
}

export function normalizeTitle(text: string | null | undefined): string {
  return (text ?? "")
    .replace(/\u3000/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[（）]/g, (value) => (value === "（" ? "(" : ")"))
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

export function visibleTitle(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function parseTargetSection(target: string | null | undefined): ParsedTargetSection | null {
  const normalized = visibleTitle(target);
  const match = normalized.match(/^(\d+)\.(\d+)\s+(.+)$/);
  if (!match) return null;
  return {
    target_section_number: `${match[1]}.${match[2]}`,
    target_chapter_number: match[1] ?? "",
    target_leaf_number: `${match[1]}.${match[2]}`,
    target_title_remainder: visibleTitle(match[3] ?? ""),
  };
}

export function isChapterTitle(text: string | null | undefined): boolean {
  const normalized = visibleTitle(text);
  return /^第\s*\d+\s*章/.test(normalized) || (normalized.startsWith("第") && normalized.includes("章"));
}

export function isLeafTitle(text: string | null | undefined): boolean {
  const normalized = visibleTitle(text);
  if (!normalized || isChapterTitle(normalized)) return false;
  return /^\d+(?:\.\d+)+\s*\S+/.test(normalized);
}

export function titleTokens(text: string | null | undefined): string[] {
  const normalized = visibleTitle(text).replace(/^\d+(?:\.\d+)+\s*/, "");
  const weakTerms = new Set(["系统", "技术", "处理", "设计", "常识", "基础", "知识", "概述", "模型"]);
  const rawTokens = [
    normalized,
    ...normalized.split(/[的和与及、，,：:（）()—\-]/),
    ...(normalized.match(/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g) ?? []),
    ...(normalized.match(/\p{Script=Han}{2,}/gu) ?? []),
  ];
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const rawToken of rawTokens) {
    const token = normalizeTitle(rawToken);
    if (token.length < 2 || weakTerms.has(token) || seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }
  return tokens;
}

export function isLikelySameLeaf(a: string | null | undefined, b: string | null | undefined): boolean {
  const visibleA = visibleTitle(a);
  const visibleB = visibleTitle(b);
  if (!visibleA || !visibleB) return false;
  if (visibleA === visibleB) return true;
  const normalizedA = normalizeTitle(visibleA);
  const normalizedB = normalizeTitle(visibleB);
  if (normalizedA === normalizedB) return true;

  const sectionA = parseTargetSection(visibleA)?.target_section_number;
  const sectionB = parseTargetSection(visibleB)?.target_section_number;
  if (sectionA && sectionB && sectionA !== sectionB) return false;

  const tokensA = titleTokens(visibleA);
  const tokensB = new Set(titleTokens(visibleB));
  const overlap = tokensA.filter((token) => tokensB.has(token)).length;
  return Boolean(sectionA && sectionB && overlap > 0);
}

export function loadReachableLeafCatalog(path = defaultCatalogPath): ReachableLeafCatalog | null {
  const absPath = resolve(repoRoot, path.replace(/\\/g, "/"));
  if (!existsSync(absPath)) return null;
  return JSON.parse(readFileSync(absPath, "utf8")) as ReachableLeafCatalog;
}

function flattenCatalog(catalog: ReachableLeafCatalog | null): FlatCatalogLeaf[] {
  const result: FlatCatalogLeaf[] = [];
  for (const [chapterIndex, chapter] of (catalog?.chapters ?? []).entries()) {
    const chapterTitle = visibleTitle(chapter.chapter_title);
    for (const [leafIndex, rawLeaf] of (chapter.leaves ?? []).entries()) {
      const title = visibleTitle(rawLeaf.title);
      if (!title || !isLeafTitle(title)) continue;
      const parsed = parseTargetSection(title);
      if (!parsed) continue;
      result.push({
        ...rawLeaf,
        title,
        normalized_title: rawLeaf.normalized_title ?? normalizeTitle(title),
        section_number: rawLeaf.section_number ?? parsed.target_section_number,
        chapter_number: rawLeaf.chapter_number ?? parsed.target_chapter_number,
        chapter_title: rawLeaf.chapter_title ?? chapterTitle,
        confidence: rawLeaf.confidence ?? "medium",
        dom_order: typeof rawLeaf.dom_order === "number" ? rawLeaf.dom_order : result.length,
        chapter_dom_order: typeof rawLeaf.chapter_dom_order === "number" ? rawLeaf.chapter_dom_order : chapterIndex * 1000 + leafIndex,
      });
    }
  }
  return result;
}

function toMatch(leaf: FlatCatalogLeaf, strategy: CatalogMatchStrategy): CatalogLeafMatch {
  return {
    found: true,
    match_strategy: strategy,
    chapter_title: leaf.chapter_title,
    leaf_title: leaf.title,
    section_number: leaf.section_number,
    chapter_number: leaf.chapter_number,
    confidence: leaf.confidence,
    raw_catalog_item: leaf,
  };
}

export function findCatalogLeaf(
  target: string,
  catalog: ReachableLeafCatalog | null
): CatalogLeafMatch {
  const leaves = flattenCatalog(catalog);
  const visibleTarget = visibleTitle(target);
  const normalizedTarget = normalizeTitle(visibleTarget);
  const parsed = parseTargetSection(visibleTarget);

  const exact = leaves.find((leaf) => leaf.title === visibleTarget);
  if (exact) return toMatch(exact, "exact_full_title");

  const normalizedExact = leaves.find((leaf) => leaf.normalized_title === normalizedTarget);
  if (normalizedExact) return toMatch(normalizedExact, "normalized_exact");

  if (parsed) {
    const bySectionNumber = leaves.find((leaf) => leaf.section_number === parsed.target_section_number);
    if (bySectionNumber) return toMatch(bySectionNumber, "section_number");
  }

  const targetTokens = titleTokens(visibleTarget);
  if (targetTokens.length > 0) {
    const byTokenOverlap = leaves
      .map((leaf) => ({
        leaf,
        overlap: titleTokens(leaf.title).filter((token) => targetTokens.includes(token)).length,
      }))
      .filter((item) => item.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)[0];
    if (byTokenOverlap) return toMatch(byTokenOverlap.leaf, "token_overlap");
  }

  return {
    found: false,
    match_strategy: "not_found",
    chapter_title: null,
    leaf_title: null,
    section_number: parsed?.target_section_number ?? null,
    chapter_number: parsed?.target_chapter_number ?? null,
    confidence: null,
    raw_catalog_item: null,
  };
}

export function defaultReachableLeafCatalogPath(): string {
  return defaultCatalogPath;
}
