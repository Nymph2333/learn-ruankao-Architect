/**
 * Phase 4.1: Single Baseline Official Render.
 *
 * Renders only the allowlisted baseline title into docs/ruankaodaren/baseline.
 * It consumes only the Phase 3.25 renderer input contract, the referenced
 * intermediate JSON, and the referenced asset manifest metadata.
 *
 * HARD CONSTRAINTS: no batch render, no OCR, no encrypt=1 decryption, no raw
 * HTML/XHR reads, no web requests, no image table reconstruction, no content
 * invention.
 *
 * Usage:
 *   pnpm render:single-baseline
 *   pnpm render:single-baseline -- --title "1.3 指令系统CISC和RISC"
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAssetManifest } from "../packages/domain-types/ruankaodaren-asset-manifest.js";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";
import type {
  RuankaoRendererInputContract,
  RuankaoRendererInputItem,
  RuankaoRenderAs,
} from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const officialOutputDir = resolve(repoRoot, "docs/ruankaodaren/baseline");
const contractPath = resolve(generatedDir, "phase3_25_renderer_input_contract.json");
const allowedTitles = new Set(["1.3 指令系统CISC和RISC"]);

const REQUIRED_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

interface OfficialRenderTrace {
  phase: "4.1";
  title: "1.3 指令系统CISC和RISC";
  render_as: RuankaoRenderAs;
  official_output_path: string;
  input_contract_path: string;
  renderer_baseline_manifest_path: string;
  intermediate_path: string;
  asset_manifest_path: string | null;
  allowed_inputs_used: string[];
  forbidden_inputs_touched: string[];
  sections_rendered: string[];
  asset_refs_preserved: boolean;
  source_reference_rendered: boolean;
  ocr_used: false;
  image_table_reconstructed: false;
  content_invented: false;
  raw_html_read: false;
  raw_xhr_read: false;
  web_requests_used: false;
  batch_render: false;
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function fail(message: string): never {
  console.error(`[render:single-baseline] ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(): { title: string } {
  const args = process.argv.slice(2);
  const titleIndex = args.indexOf("--title");
  const title = titleIndex !== -1 && args[titleIndex + 1]
    ? args[titleIndex + 1]
    : "1.3 指令系统CISC和RISC";

  if (!allowedTitles.has(title)) {
    fail(`title "${title}" is not allowed in Phase 4.1; allowed titles: ${Array.from(allowedTitles).join(", ")}`);
  }

  return { title };
}

function runContractValidation(): void {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const args = npmExecPath
    ? [npmExecPath, "validate:renderer-input-contract"]
    : ["validate:renderer-input-contract"];
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    if (result.error) {
      console.error(`[render:single-baseline] validator spawn error: ${result.error.message}`);
    }
    fail("renderer input contract validation failed; official render aborted");
  }
}

function selectItem(contract: RuankaoRendererInputContract, title: string): RuankaoRendererInputItem {
  const item = contract.baseline_items.find((candidate) => candidate.canonical_title === title);
  if (!item) fail(`allowed title not found in renderer input contract: ${title}`);
  if (item.renderer_policy.render_as !== "asset_card") {
    fail(`Phase 4.1 expected asset_card for ${title}, got ${item.renderer_policy.render_as}`);
  }
  if (item.renderer_policy.preserve_asset_refs !== true) {
    fail(`Phase 4.1 asset_card must preserve asset refs for ${title}`);
  }
  return item;
}

function collectText(doc: RuankaoIntermediateDocument): string[] {
  return (doc.content?.text_blocks ?? [])
    .map((block) => block.text.trim())
    .filter((text) => text.length > 0);
}

function renderCoreConcept(doc: RuankaoIntermediateDocument): string {
  const textBlocks = collectText(doc);
  if (textBlocks.join("").trim().length < 60) {
    return "中间层文本有限；本节仅呈现已抽取内容，不补写缺失知识。";
  }

  return [
    "中间层文本有限；本节仅呈现已抽取内容，不补写缺失知识。",
    "",
    ...textBlocks.map((text) => text),
  ].join("\n\n");
}

function renderKeyTerms(doc: RuankaoIntermediateDocument): string {
  const terms = (doc.content?.key_terms ?? []).map((term) => term.text.trim()).filter(Boolean);
  if (terms.length === 0) return "";
  return [
    "",
    "已抽取 key_terms（仅来自 intermediate JSON）：",
    "",
    ...terms.map((term) => `- ${term}`),
  ].join("\n");
}

function renderAssetRefs(doc: RuankaoIntermediateDocument, manifest: RuankaoAssetManifest): string {
  const imageRefs = doc.content?.image_refs ?? [];
  const lines: string[] = [
    "本知识点包含图片型资料。",
    "图片只作为 asset_ref 保留。",
    "Renderer 未 OCR。",
    "Renderer 未还原图片表格。",
    "需要人工复核图片内容。",
    "",
    "Asset refs:",
    "",
  ];

  for (const ref of imageRefs) {
    const asset = manifest.assets.find((candidate) => candidate.order === ref.order) ?? null;
    lines.push(`- asset_ref order=${ref.order}`);
    lines.push(`  - original_url: ${ref.src}`);
    lines.push(`  - saved_path: ${asset?.saved_path ?? "(not available)"}`);
    lines.push(`  - sha256: ${asset?.sha256 ?? "(not available)"}`);
    lines.push(`  - content_type: ${asset?.content_type ?? "(not available)"}`);
    lines.push(`  - width: ${asset?.width ?? "(unknown)"}`);
    lines.push(`  - height: ${asset?.height ?? "(unknown)"}`);
    lines.push(`  - manual_review_required: ${ref.requires_manual_review}`);
    lines.push(`  - manual_review_reason: ${ref.manual_review_reason}`);
  }

  return lines.join("\n");
}

function renderMarkdown(
  item: RuankaoRendererInputItem,
  doc: RuankaoIntermediateDocument,
  manifest: RuankaoAssetManifest,
  tracePreview: Pick<
    OfficialRenderTrace,
    "input_contract_path" | "renderer_baseline_manifest_path" | "intermediate_path" | "asset_manifest_path"
  >
): string {
  const assetShaList = manifest.assets.map((asset) => asset.sha256 ?? "(not available)").join(", ");
  const assetPathList = manifest.assets.map((asset) => asset.saved_path ?? "(not available)").join(", ");

  return [
    `# ${item.canonical_title}`,
    "",
    "> Phase 4.1 official single-baseline render. This document uses only the frozen renderer input contract, intermediate JSON, and asset manifest metadata.",
    "",
    "## Core Concept / 核心概念",
    "",
    renderCoreConcept(doc),
    renderKeyTerms(doc),
    "",
    "## Architectural Topology & Visualization / 架构拓扑与可视化",
    "",
    "Renderer-generated structural placeholder; not reconstructed from image content.",
    "",
    "```mermaid",
    "flowchart TD",
    `    A[\"${item.canonical_title}\"] --> B[\"Intermediate text blocks\"]`,
    "    B --> C[\"Asset refs preserved\"]",
    "    C --> D[\"Manual review required for image content\"]",
    "```",
    "",
    renderAssetRefs(doc, manifest),
    "",
    "## Deterministic Constraints / 决定论约束",
    "",
    "本节需要人工根据正式教材或考试大纲补充；renderer 不从图片或缺失上下文推断，不补写缺失内容。",
    "",
    "## Ruankao Alignment / 软考考点映射",
    "",
    `基于标题和已抽取文本的保守映射：\`${item.canonical_title}\`。本节不写未来源支持的考试结论，不改写软考内容。`,
    "",
    "## Case Study Answer Pattern / 案例分析答题模式",
    "",
    "- 问题背景：待人工结合正式题目补充。",
    "- 关键约束：待人工结合正式题目补充。",
    "- 失效模式：待人工结合正式题目补充。",
    "- 改造方向：待人工结合正式题目补充。",
    "",
    "本 official render 只输出答题框架，不写具体答案，不补写缺失内容。",
    "",
    "## Paper Usage / 论文可复用方式",
    "",
    "- 可作为论文素材索引项。",
    "- 需人工复核后再提炼为论文表述。",
    "- 本 renderer 不生成可直接套用段落，不补写缺失内容。",
    "",
    "## Source Reference / 来源引用",
    "",
    `- renderer input contract path: \`${tracePreview.input_contract_path}\``,
    `- renderer baseline manifest path: \`${tracePreview.renderer_baseline_manifest_path}\``,
    `- intermediate JSON path: \`${tracePreview.intermediate_path}\``,
    `- asset manifest path: \`${tracePreview.asset_manifest_path ?? "(none)"}\``,
    `- source timestamp: \`${doc.source.timestamp}\``,
    `- asset sha256: \`${assetShaList}\``,
    `- asset saved_path: \`${assetPathList}\``,
    "- constraints:",
    `  - ocr_used: ${doc.constraints.ocr_used}`,
    `  - encrypted_xhr_decrypted: ${doc.constraints.encrypted_xhr_decrypted}`,
    `  - image_table_reconstructed: ${doc.constraints.image_table_reconstructed}`,
    `  - markdown_generated_before_render: ${doc.constraints.markdown_generated}`,
    "- render boundary:",
    "  - 未 OCR",
    "  - 未还原图片表格",
    "  - 未读取 raw HTML",
    "  - 未读取 raw XHR",
    "  - 未使用 web requests",
    "  - 未进行内容补写 / 发明",
    "",
  ].join("\n");
}

function writeTraceMarkdown(trace: OfficialRenderTrace): void {
  const mdPath = resolve(generatedDir, "phase4_1_single_baseline_render_trace.md");
  const lines = [
    "# Phase 4.1 Single Baseline Render Trace",
    "",
    `Generated for: ${trace.title}`,
    "",
    "## Summary",
    "",
    "| Field | Value |",
    "|---|---|",
    `| phase | ${trace.phase} |`,
    `| title | ${trace.title} |`,
    `| render_as | ${trace.render_as} |`,
    `| official_output_path | ${trace.official_output_path} |`,
    `| asset_refs_preserved | ${trace.asset_refs_preserved} |`,
    `| batch_render | ${trace.batch_render} |`,
    "",
    "## Inputs",
    "",
    ...trace.allowed_inputs_used.map((input) => `- ${input}`),
    "",
    "## Forbidden Inputs Touched",
    "",
    trace.forbidden_inputs_touched.length === 0
      ? "- None."
      : trace.forbidden_inputs_touched.map((input) => `- ${input}`).join("\n"),
    "",
    "## Sections Rendered",
    "",
    ...trace.sections_rendered.map((section) => `- ${section}`),
    "",
    "## Constraints",
    "",
    `- ocr_used: ${trace.ocr_used}`,
    `- image_table_reconstructed: ${trace.image_table_reconstructed}`,
    `- content_invented: ${trace.content_invented}`,
    `- raw_html_read: ${trace.raw_html_read}`,
    `- raw_xhr_read: ${trace.raw_xhr_read}`,
    `- web_requests_used: ${trace.web_requests_used}`,
    "",
  ];
  writeFileSync(mdPath, lines.join("\n"), "utf8");
}

function main(): void {
  const { title } = parseArgs();
  runContractValidation();

  if (!existsSync(contractPath)) fail("renderer input contract not found; run pnpm build:renderer-input-contract");
  const contract = readJson<RuankaoRendererInputContract>(contractPath);
  if (contract.phase4_allowed !== true) fail("renderer input contract does not allow Phase 4 rendering");

  const item = selectItem(contract, title);
  const intermediatePath = resolve(repoRoot, item.canonical_sample_path);
  if (!existsSync(intermediatePath)) fail(`intermediate JSON not found: ${item.canonical_sample_path}`);
  const doc = readJson<RuankaoIntermediateDocument>(intermediatePath);

  if (!item.asset_manifest_path) fail("Phase 4.1 asset_card requires an asset manifest path");
  const assetManifestPath = resolve(repoRoot, item.asset_manifest_path);
  if (!existsSync(assetManifestPath)) fail(`asset manifest not found: ${item.asset_manifest_path}`);
  const assetManifest = readJson<RuankaoAssetManifest>(assetManifestPath);

  mkdirSync(officialOutputDir, { recursive: true });
  mkdirSync(generatedDir, { recursive: true });

  const officialOutputPath = resolve(officialOutputDir, "1.3_指令系统CISC和RISC.md");
  const trace: OfficialRenderTrace = {
    phase: "4.1",
    title: "1.3 指令系统CISC和RISC",
    render_as: item.renderer_policy.render_as,
    official_output_path: toRepoPath(officialOutputPath),
    input_contract_path: toRepoPath(contractPath),
    renderer_baseline_manifest_path: contract.baseline_manifest_path,
    intermediate_path: item.canonical_sample_path,
    asset_manifest_path: item.asset_manifest_path,
    allowed_inputs_used: ["renderer_input_contract", "intermediate_json", "asset_manifest"],
    forbidden_inputs_touched: [],
    sections_rendered: REQUIRED_SECTIONS,
    asset_refs_preserved: true,
    source_reference_rendered: true,
    ocr_used: false,
    image_table_reconstructed: false,
    content_invented: false,
    raw_html_read: false,
    raw_xhr_read: false,
    web_requests_used: false,
    batch_render: false,
  };

  const markdown = renderMarkdown(item, doc, assetManifest, trace);
  writeFileSync(officialOutputPath, markdown, "utf8");

  const tracePath = resolve(generatedDir, "phase4_1_single_baseline_render_trace.json");
  writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`, "utf8");
  writeTraceMarkdown(trace);

  console.log("[render:single-baseline] Official single baseline rendered");
  console.log(`  title:                    ${trace.title}`);
  console.log(`  render_as:                ${trace.render_as}`);
  console.log(`  official_output_path:     ${trace.official_output_path}`);
  console.log(`  trace:                    ${toRepoPath(tracePath)}`);
  console.log(`  sections_rendered:        ${trace.sections_rendered.length}`);
  console.log(`  allowed_inputs_used:      ${trace.allowed_inputs_used.join(", ")}`);
  console.log(`  forbidden_inputs_touched: ${trace.forbidden_inputs_touched.length}`);
  console.log(`  batch_render:             ${trace.batch_render}`);
  console.log(`  asset_refs_preserved:     ${trace.asset_refs_preserved}`);
}

main();
