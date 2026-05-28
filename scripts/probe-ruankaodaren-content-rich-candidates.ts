/**
 * Phase 3.18: probe content-rich candidate leaf knowledge points.
 *
 * This script reads the Phase 3.11 reachable leaf catalog, selects up to 8
 * candidate leaves that are likely content-rich, crawls each one using the
 * existing pnpm crawl:ruankaodaren command, and evaluates the resulting
 * outerHTML for content richness and topic alignment.
 *
 * Constraints:
 * - Does NOT write formal intermediate JSON to data/intermediate/ruankaodaren/samples/
 * - Does NOT invoke the Markdown renderer
 * - Does NOT use OCR or decrypt encrypt=1 content
 * - Does NOT reconstruct image tables
 * - Does NOT perform full-site batch crawl
 * - Does NOT enter Phase 4
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import * as cheerio from "cheerio";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const catalogPath = resolve(generatedDir, "phase3_11_reachable_leaf_catalog.json");
const quarantineManifestPath = resolve(repoRoot, "data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json");
const sampleTargetsPath = resolve(repoRoot, "config/ruankaodaren-sample-targets.yaml");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const probesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/probes");

const RENDERER_ELIGIBLE_TITLE = "1.3 指令系统CISC和RISC";
const MAX_CANDIDATES = 8;

const GENERIC_TOKENS = new Set([
  "系统", "设计", "模型", "基础", "概述", "知识", "组成", "框架",
  "方法", "分析", "应用", "研究"
]);

const CONFLICTING_TOKENS = ["码距", "纠错", "检错"];

const TOPIC_PRIORITIES: Array<{ pattern: RegExp; topic: string; weight: number }> = [
  { pattern: /SQL|规范化|索引|数据仓库|数据挖掘|E-R|关系代数|NoSQL|反规范化|分布式数据库/, topic: "database", weight: 8 },
  { pattern: /架构风格|质量属性|中间件|微服务|SOA|分层|管道|事件驱动|架构设计/, topic: "architecture", weight: 8 },
  { pattern: /安全技术|抗攻击|加密|认证|防火墙|PKI|VPN|访问控制|漏洞/, topic: "security", weight: 7 },
  { pattern: /测试|需求|配置管理|软件工程|UML|CMM|敏捷|项目管理|软件过程/, topic: "software_eng", weight: 7 },
  { pattern: /TCP|IP|OSI|以太网|路由|交换|传输协议|网络安全|HTTP|DNS/, topic: "network", weight: 6 },
];

interface CatalogLeaf {
  title: string;
  raw_text_preview: string;
  chapter_title: string;
  section_number: string;
  chapter_number: string;
}

interface CatalogChapter {
  chapter_title: string;
  leaves: CatalogLeaf[];
}

interface Catalog {
  chapters: CatalogChapter[];
}

interface QuarantineItem {
  title: string;
}

interface QuarantineManifest {
  items: QuarantineItem[];
}

interface CrawlMetadata {
  detail_entry_route_changed?: boolean;
  outer_html_paths?: string[];
  dom_text_path?: string;
  final_url?: string;
  screenshot_path?: string;
  after_detail_screenshot_path?: string;
  detail_content_stabilization_attempted?: boolean;
  detail_content_stabilization_status?: string;
  detail_content_stabilization_selector?: string | null;
  detail_content_stabilization_text_length?: number;
  detail_content_stabilization_outer_html_length?: number;
  detail_content_stabilization_img_count?: number;
  detail_content_stabilization_waited_ms?: number;
}

export interface ProbeResult {
  target_title: string;
  timestamp: string;
  live_replay_success: boolean;
  preflight_pass: boolean;
  final_url: string;
  outer_html_path: string;
  screenshot_path: string;
  body_text_length: number;
  knowInfo_text_length: number;
  direct_text_length: number;
  image_count: number;
  img_srcs: string[];
  target_tokens: string[];
  matched_target_tokens: string[];
  content_richness: "high" | "medium" | "low";
  alignment_status: "matched" | "likely_matched" | "weak_unknown" | "mismatched";
  recommended_for_acquisition: boolean;
  reject_reason: string;
  stabilization_status: string | null;
  stabilization_selector: string | null;
  stabilization_text_length: number;
  stabilization_img_count: number;
  stabilization_waited_ms: number;
}

interface ProbeReport {
  generated_at: string;
  probed_count: number;
  live_replay_pass_count: number;
  preflight_pass_count: number;
  high_richness_count: number;
  medium_richness_count: number;
  recommended_count: number;
  stable_rich_count: number;
  stable_with_assets_count: number;
  stable_but_low_text_count: number;
  timeout_count: number;
  probes: ProbeResult[];
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function buildExclusionSet(): Set<string> {
  const excluded = new Set<string>();
  excluded.add(RENDERER_ELIGIBLE_TITLE);

  if (existsSync(quarantineManifestPath)) {
    const manifest = readJson<QuarantineManifest>(quarantineManifestPath);
    for (const item of manifest.items) {
      excluded.add(item.title);
    }
  }

  if (existsSync(sampleTargetsPath)) {
    const yamlText = readFileSync(sampleTargetsPath, "utf8");
    const statusQuarantinedPattern = /title_hint:\s*"([^"]+)"[\s\S]*?status:\s*quarantined/g;
    let match: RegExpExecArray | null;
    while ((match = statusQuarantinedPattern.exec(yamlText)) !== null) {
      excluded.add(match[1]);
    }
  }

  return excluded;
}

function extractKnowledgePointCount(rawTextPreview: string): number {
  const match = rawTextPreview.match(/\/\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function topicWeight(title: string): number {
  let weight = 0;
  for (const { pattern, weight: w } of TOPIC_PRIORITIES) {
    if (pattern.test(title)) {
      weight = Math.max(weight, w);
    }
  }
  return weight;
}

function extractTargetTokens(title: string): string[] {
  const withoutSectionNumber = title.replace(/^\d+(?:\.\d+)*\s+/, "");
  const tokens: string[] = [];

  const chineseTerms = withoutSectionNumber.match(/[\u4e00-\u9fff]{2,}/g) ?? [];
  for (const term of chineseTerms) {
    if (!GENERIC_TOKENS.has(term)) {
      tokens.push(term);
    }
  }

  const asciiTerms = withoutSectionNumber.match(/[A-Za-z0-9][-A-Za-z0-9_.]*/g) ?? [];
  for (const term of asciiTerms) {
    if (term.length >= 2) {
      tokens.push(term);
    }
  }

  return [...new Set(tokens)];
}

function getLatestMetadataTimestamp(): number {
  if (!existsSync(metadataDir)) return 0;
  let latest = 0;
  for (const file of readdirSync(metadataDir)) {
    if (!file.endsWith(".json")) continue;
    const mtime = statSync(resolve(metadataDir, file)).mtimeMs;
    if (mtime > latest) latest = mtime;
  }
  return latest;
}

function findNewMetadataFile(afterTimestamp: number): string | null {
  if (!existsSync(metadataDir)) return null;
  let newestFile: string | null = null;
  let newestTime = afterTimestamp;
  for (const file of readdirSync(metadataDir)) {
    if (!file.endsWith(".json")) continue;
    const absPath = resolve(metadataDir, file);
    const mtime = statSync(absPath).mtimeMs;
    if (mtime > newestTime) {
      newestTime = mtime;
      newestFile = absPath;
    }
  }
  return newestFile;
}

function classifyRichness(
  knowInfoTextLength: number,
  imageCount: number
): "high" | "medium" | "low" {
  if (knowInfoTextLength >= 200 || (imageCount >= 1 && knowInfoTextLength >= 80)) return "high";
  if (knowInfoTextLength >= 120 || (imageCount >= 1 && knowInfoTextLength >= 40)) return "medium";
  return "low";
}

function classifyAlignment(
  text: string,
  targetTokens: string[],
  matchedTokens: string[],
  sectionNumber: string
): "matched" | "likely_matched" | "weak_unknown" | "mismatched" {
  for (const ct of CONFLICTING_TOKENS) {
    if (text.includes(ct)) return "mismatched";
  }

  if (matchedTokens.length >= 1 && targetTokens.length > 0 &&
      matchedTokens.length >= targetTokens.length * 0.4) {
    return "matched";
  }

  if (text.includes(sectionNumber) && matchedTokens.length === 0) {
    return "likely_matched";
  }

  if (matchedTokens.length > 0) {
    return "likely_matched";
  }

  return "weak_unknown";
}

function runProbe(leaf: CatalogLeaf): ProbeResult {
  const title = leaf.title;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace(/-(\d{3})-$/, "-$1Z");
  const probeId = timestamp + "-" + title.replace(/[^\u4e00-\u9fffa-zA-Z0-9]/g, "_").slice(0, 40);

  const failResult = (reason: string): ProbeResult => ({
    target_title: title,
    timestamp: new Date().toISOString(),
    live_replay_success: false,
    preflight_pass: false,
    final_url: "",
    outer_html_path: "",
    screenshot_path: "",
    body_text_length: 0,
    knowInfo_text_length: 0,
    direct_text_length: 0,
    image_count: 0,
    img_srcs: [],
    target_tokens: extractTargetTokens(title),
    matched_target_tokens: [],
    content_richness: "low",
    alignment_status: "weak_unknown",
    recommended_for_acquisition: false,
    reject_reason: reason,
    stabilization_status: null,
    stabilization_selector: null,
    stabilization_text_length: 0,
    stabilization_img_count: 0,
    stabilization_waited_ms: 0,
  });

  console.log(`[probe] Probing: ${title}`);

  const preTimestamp = getLatestMetadataTimestamp();

  const crawlCmd = `pnpm crawl:ruankaodaren -- --target "${title.replace(/"/g, '\\"')}" --require-leaf`;
  const result = spawnSync(crawlCmd, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    console.error(`[probe] Crawl spawn error for "${title}": ${result.error.message}`);
    const r = failResult(`crawl spawn error: ${result.error.message}`);
    writeProbeArtifact(probeId, r);
    return r;
  }

  const newMetaPath = findNewMetadataFile(preTimestamp);
  if (!newMetaPath) {
    console.warn(`[probe] No new metadata found for "${title}"`);
    const r = failResult("no new metadata file after crawl");
    writeProbeArtifact(probeId, r);
    return r;
  }

  let meta: CrawlMetadata;
  try {
    meta = readJson<CrawlMetadata>(newMetaPath);
  } catch (e) {
    const r = failResult(`failed to read metadata: ${String(e)}`);
    writeProbeArtifact(probeId, r);
    return r;
  }

  if (!meta.detail_entry_route_changed) {
    console.warn(`[probe] detail_entry_route_changed is false for "${title}"`);
    const r: ProbeResult = {
      ...failResult("detail_entry_route_changed is false"),
      final_url: meta.final_url ?? "",
      screenshot_path: meta.after_detail_screenshot_path ?? meta.screenshot_path ?? "",
    };
    writeProbeArtifact(probeId, r);
    return r;
  }

  const outerHtmlRelPath = (meta.outer_html_paths ?? []).find(
    (p) => p.includes("knowInfo_ql-editor")
  );

  if (!outerHtmlRelPath) {
    const r: ProbeResult = {
      ...failResult("no knowInfo_ql-editor outer_html_paths entry"),
      live_replay_success: true,
      final_url: meta.final_url ?? "",
      screenshot_path: meta.after_detail_screenshot_path ?? meta.screenshot_path ?? "",
    };
    writeProbeArtifact(probeId, r);
    return r;
  }

  const outerHtmlAbsPath = resolve(repoRoot, outerHtmlRelPath);
  if (!existsSync(outerHtmlAbsPath)) {
    const r: ProbeResult = {
      ...failResult(`outer_html file not found: ${outerHtmlRelPath}`),
      live_replay_success: true,
      preflight_pass: false,
      final_url: meta.final_url ?? "",
      outer_html_path: outerHtmlRelPath,
      screenshot_path: meta.after_detail_screenshot_path ?? meta.screenshot_path ?? "",
    };
    writeProbeArtifact(probeId, r);
    return r;
  }

  const outerHtml = readFileSync(outerHtmlAbsPath, "utf8");
  const $ = cheerio.load(outerHtml);

  const knowInfoText = ($(".ql-editor").length > 0
    ? $(".ql-editor").text()
    : $.root().text()
  ).trim();

  const knowInfoTextLength = knowInfoText.length;

  const directTextLength = (() => {
    let len = 0;
    const editor = $(".ql-editor");
    const targetContents = editor.length > 0
      ? editor.contents()
      : $("body").contents();
    targetContents.each((_, node) => {
      if (node.type === "text") {
        len += (node as { data?: string }).data?.trim().length ?? 0;
      }
    });
    return len;
  })();

  const imageCount = $(".ql-editor img").length > 0
    ? $(".ql-editor img").length
    : $("img").length;

  const imgSrcs = ($(".ql-editor img").length > 0
    ? $(".ql-editor img")
    : $("img")
  ).map((_, el) => $(el).attr("src") ?? "").get();

  let bodyTextLength = 0;
  const domTextRelPath = meta.dom_text_path;
  if (domTextRelPath) {
    const domTextAbsPath = resolve(repoRoot, domTextRelPath);
    if (existsSync(domTextAbsPath)) {
      bodyTextLength = readFileSync(domTextAbsPath, "utf8").length;
    }
  }

  const targetTokens = extractTargetTokens(title);
  const matchedTargetTokens = targetTokens.filter((token) =>
    knowInfoText.includes(token)
  );

  const stabStatus = meta.detail_content_stabilization_status ?? null;
  const stabSelector = meta.detail_content_stabilization_selector ?? null;
  const stabTextLength = meta.detail_content_stabilization_text_length ?? 0;
  const stabImgCount = meta.detail_content_stabilization_img_count ?? 0;
  const stabWaitedMs = meta.detail_content_stabilization_waited_ms ?? 0;

  const effectiveTextLength = stabTextLength > 0 ? stabTextLength : knowInfoTextLength;
  const richness = classifyRichness(effectiveTextLength, imageCount);
  const alignment = classifyAlignment(
    knowInfoText,
    targetTokens,
    matchedTargetTokens,
    leaf.section_number
  );

  let recommended = (richness === "high" || richness === "medium") &&
    (alignment === "matched" || alignment === "likely_matched") &&
    (stabStatus === "stable_rich" || stabStatus === "stable_with_assets");

  let rejectReason = "";
  if (!recommended) {
    const parts: string[] = [];
    if (stabStatus === "stable_but_low_text") {
      parts.push("stable_but_low_text");
    } else if (stabStatus === "timeout_no_container" || stabStatus === "timeout_unstable") {
      parts.push("detail_content_not_stable");
    } else {
      if (richness === "low") parts.push(`low richness (knowInfo_text_length=${knowInfoTextLength}, image_count=${imageCount})`);
      if (alignment === "mismatched") parts.push("mismatched alignment (conflicting tokens detected)");
      if (alignment === "weak_unknown") parts.push("weak_unknown alignment");
      if (stabStatus && stabStatus !== "stable_rich" && stabStatus !== "stable_with_assets") {
        parts.push(`stabilization_status=${stabStatus}`);
      }
    }
    rejectReason = parts.join("; ");
  }

  const probeResult: ProbeResult = {
    target_title: title,
    timestamp: new Date().toISOString(),
    live_replay_success: true,
    preflight_pass: true,
    final_url: meta.final_url ?? "",
    outer_html_path: outerHtmlRelPath,
    screenshot_path: meta.after_detail_screenshot_path ?? meta.screenshot_path ?? "",
    body_text_length: bodyTextLength,
    knowInfo_text_length: knowInfoTextLength,
    direct_text_length: directTextLength,
    image_count: imageCount,
    img_srcs: imgSrcs,
    target_tokens: targetTokens,
    matched_target_tokens: matchedTargetTokens,
    content_richness: richness,
    alignment_status: alignment,
    recommended_for_acquisition: recommended,
    reject_reason: rejectReason,
    stabilization_status: stabStatus,
    stabilization_selector: stabSelector,
    stabilization_text_length: stabTextLength,
    stabilization_img_count: stabImgCount,
    stabilization_waited_ms: stabWaitedMs,
  };

  writeProbeArtifact(probeId, probeResult);
  return probeResult;
}

function writeProbeArtifact(probeId: string, result: ProbeResult): void {
  mkdirSync(probesDir, { recursive: true });
  const artifactPath = resolve(probesDir, `${probeId}.json`);
  writeFileSync(artifactPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`[probe] Artifact: data/intermediate/ruankaodaren/probes/${probeId}.json`);
}

function selectCandidates(catalog: Catalog, excluded: Set<string>): CatalogLeaf[] {
  const candidates: Array<{ leaf: CatalogLeaf; score: number }> = [];

  for (const chapter of catalog.chapters) {
    for (const leaf of chapter.leaves) {
      const title = leaf.title;

      if (excluded.has(title)) continue;
      if (/^第\s*\d+\s*章/.test(title)) continue;

      const textPart = title.replace(/^\d+(?:\.\d+)*\s*/, "").trim();
      if (textPart.length < 3) continue;

      const kpCount = extractKnowledgePointCount(leaf.raw_text_preview);
      const tWeight = topicWeight(title);

      const score = kpCount * 2 + tWeight * 10;
      candidates.push({ leaf, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const selected: CatalogLeaf[] = [];
  const usedChapters = new Set<string>();

  for (const { leaf } of candidates) {
    if (selected.length >= MAX_CANDIDATES) break;
    if (!usedChapters.has(leaf.chapter_title)) {
      selected.push(leaf);
      usedChapters.add(leaf.chapter_title);
    }
  }

  for (const { leaf } of candidates) {
    if (selected.length >= MAX_CANDIDATES) break;
    if (!selected.some((s) => s.title === leaf.title)) {
      selected.push(leaf);
    }
  }

  return selected.slice(0, MAX_CANDIDATES);
}

function generateMarkdownReport(report: ProbeReport): string {
  const lines: string[] = [
    "# Phase 3.18 Content-rich Candidate Probe Report",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Summary",
    "",
    `- probed_count: ${report.probed_count}`,
    `- live_replay_pass_count: ${report.live_replay_pass_count}`,
    `- preflight_pass_count: ${report.preflight_pass_count}`,
    `- high_richness_count: ${report.high_richness_count}`,
    `- medium_richness_count: ${report.medium_richness_count}`,
    `- recommended_count: ${report.recommended_count}`,
    `- stable_rich_count: ${report.stable_rich_count}`,
    `- stable_with_assets_count: ${report.stable_with_assets_count}`,
    `- stable_but_low_text_count: ${report.stable_but_low_text_count}`,
    `- timeout_count: ${report.timeout_count}`,
    "",
    "## All Probed Targets",
    "",
    "| Title | Richness | Alignment | Recommended | knowInfo_len | image_count | stab_status | stab_text_len |",
    "|---|---|---|---|---|---|---|---|",
    ...report.probes.map(
      (p) =>
        `| ${p.target_title} | ${p.content_richness} | ${p.alignment_status} | ${p.recommended_for_acquisition ? "✓" : "✗"} | ${p.knowInfo_text_length} | ${p.image_count} | ${p.stabilization_status ?? "(none)"} | ${p.stabilization_text_length} |`
    ),
    "",
  ];

  const recommended = report.probes.filter((p) => p.recommended_for_acquisition);
  const rejected = report.probes.filter((p) => !p.recommended_for_acquisition);

  lines.push("## Recommended Targets");
  lines.push("");
  if (recommended.length === 0) {
    lines.push("No targets recommended for acquisition.");
    lines.push("");
    lines.push("Action: Review probe artifacts in `data/intermediate/ruankaodaren/probes/` manually.");
    lines.push("");
  } else {
    for (const p of recommended) {
      lines.push(`### ${p.target_title}`);
      lines.push("");
      lines.push(`- content_richness: ${p.content_richness}`);
      lines.push(`- alignment_status: ${p.alignment_status}`);
      lines.push(`- knowInfo_text_length: ${p.knowInfo_text_length}`);
      lines.push(`- image_count: ${p.image_count}`);
      lines.push(`- matched_target_tokens: [${p.matched_target_tokens.join(", ")}]`);
      lines.push(`- final_url: ${p.final_url}`);
      lines.push(`- outer_html_path: ${p.outer_html_path}`);
      lines.push("");
    }
  }

  lines.push("## Rejected Targets");
  lines.push("");
  if (rejected.length === 0) {
    lines.push("No rejected targets.");
    lines.push("");
  } else {
    for (const p of rejected) {
      lines.push(`### ${p.target_title}`);
      lines.push("");
      lines.push(`- live_replay_success: ${p.live_replay_success}`);
      lines.push(`- preflight_pass: ${p.preflight_pass}`);
      lines.push(`- content_richness: ${p.content_richness}`);
      lines.push(`- alignment_status: ${p.alignment_status}`);
      lines.push(`- knowInfo_text_length: ${p.knowInfo_text_length}`);
      lines.push(`- image_count: ${p.image_count}`);
      lines.push(`- reject_reason: ${p.reject_reason || "(none recorded)"}`);
      lines.push("");
    }
  }

  lines.push("## Constraints");
  lines.push("");
  lines.push("- No formal intermediate JSON written to data/intermediate/ruankaodaren/samples/");
  lines.push("- No Markdown knowledge documents generated.");
  lines.push("- No OCR used.");
  lines.push("- No encrypt=1 data decrypted.");
  lines.push("- No image table reconstructed.");
  lines.push("- No full-site batch crawl performed.");
  lines.push("- Phase 4 was not entered.");
  lines.push("");

  return lines.join("\n");
}

function main(): void {
  if (!existsSync(catalogPath)) {
    console.error(`[probe] ERROR: catalog not found: verification/generated/phase3_11_reachable_leaf_catalog.json`);
    console.error("[probe] Run pnpm catalog:reachable-leaves first.");
    process.exit(1);
  }

  const catalog = readJson<Catalog>(catalogPath);
  const excluded = buildExclusionSet();

  console.log(`[probe] Excluded titles: ${excluded.size}`);

  const candidates = selectCandidates(catalog, excluded);
  console.log(`[probe] Selected ${candidates.length} candidates for probing:`);
  for (const c of candidates) {
    const kp = extractKnowledgePointCount(c.raw_text_preview);
    console.log(`  - ${c.title} (kp=${kp}, topic_weight=${topicWeight(c.title)})`);
  }

  mkdirSync(probesDir, { recursive: true });

  const probeResults: ProbeResult[] = [];

  for (const leaf of candidates) {
    const result = runProbe(leaf);
    probeResults.push(result);
    console.log(
      `[probe] Result: ${leaf.title} → richness=${result.content_richness}, alignment=${result.alignment_status}, recommended=${result.recommended_for_acquisition}`
    );
  }

  const report: ProbeReport = {
    generated_at: new Date().toISOString(),
    probed_count: probeResults.length,
    live_replay_pass_count: probeResults.filter((r) => r.live_replay_success).length,
    preflight_pass_count: probeResults.filter((r) => r.preflight_pass).length,
    high_richness_count: probeResults.filter((r) => r.content_richness === "high").length,
    medium_richness_count: probeResults.filter((r) => r.content_richness === "medium").length,
    recommended_count: probeResults.filter((r) => r.recommended_for_acquisition).length,
    stable_rich_count: probeResults.filter((r) => r.stabilization_status === "stable_rich").length,
    stable_with_assets_count: probeResults.filter((r) => r.stabilization_status === "stable_with_assets").length,
    stable_but_low_text_count: probeResults.filter((r) => r.stabilization_status === "stable_but_low_text").length,
    timeout_count: probeResults.filter((r) => r.stabilization_status === "timeout_no_container" || r.stabilization_status === "timeout_unstable").length,
    probes: probeResults,
  };

  mkdirSync(generatedDir, { recursive: true });
  const jsonPath = resolve(generatedDir, "phase3_18_content_rich_probe.json");
  const mdPath = resolve(generatedDir, "phase3_18_content_rich_probe.md");

  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(mdPath, generateMarkdownReport(report), "utf8");

  console.log("\n[probe] Report generated:");
  console.log(`  probed_count:           ${report.probed_count}`);
  console.log(`  live_replay_pass_count: ${report.live_replay_pass_count}`);
  console.log(`  preflight_pass_count:   ${report.preflight_pass_count}`);
  console.log(`  high_richness_count:    ${report.high_richness_count}`);
  console.log(`  medium_richness_count:  ${report.medium_richness_count}`);
  console.log(`  recommended_count:      ${report.recommended_count}`);
  console.log(`  JSON: verification/generated/phase3_18_content_rich_probe.json`);
  console.log(`  MD:   verification/generated/phase3_18_content_rich_probe.md`);

  if (report.recommended_count === 0) {
    console.warn("\n[probe] WARNING: recommended_count = 0");
    console.warn("[probe] Do not enter acquisition. Review probe artifacts manually.");
    console.warn("[probe]   data/intermediate/ruankaodaren/probes/");
  }
}

main();
