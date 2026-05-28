/**
 * Phase 4.0: Markdown renderer scaffold and single-sample dry run.
 *
 * This script renders exactly one baseline item into verification/generated.
 * It consumes only the frozen Phase 3.25 renderer input contract plus allowed
 * intermediate/asset manifest inputs. It does not read raw HTML, raw XHR, the
 * web, or Playwright/crawler output beyond validated intermediate artifacts.
 *
 * Usage:
 *   pnpm render:dry-run
 *   pnpm render:dry-run -- --title "1.3 指令系统CISC和RISC"
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
const contractPath = resolve(generatedDir, "phase3_25_renderer_input_contract.json");
const templateDir = resolve(repoRoot, "templates/renderer");

const REQUIRED_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

interface RenderTrace {
  title: string;
  render_as: RuankaoRenderAs;
  input_contract_path: string;
  intermediate_path: string;
  asset_manifest_path: string | null;
  output_markdown_path: string;
  allowed_inputs_used: string[];
  forbidden_inputs_touched: string[];
  sections_rendered: string[];
  asset_refs_preserved: boolean;
  ocr_used: false;
  image_table_reconstructed: false;
  content_invented: false;
  raw_html_read: false;
  raw_xhr_read: false;
  web_requests_used: false;
  markdown_generated_to_docs: false;
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function fail(message: string): never {
  console.error(`[render:dry-run] ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(): { title?: string } {
  const args = process.argv.slice(2);
  const titleIndex = args.indexOf("--title");
  if (titleIndex !== -1 && args[titleIndex + 1]) {
    return { title: args[titleIndex + 1] };
  }
  return {};
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
      console.error(`[render:dry-run] validator spawn error: ${result.error.message}`);
    }
    fail("renderer input contract validation failed; dry-run render aborted");
  }
}

function safeTitle(title: string): string {
  return title
    .replace(/[\\/:*?"<>|#]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function templatePath(renderAs: RuankaoRenderAs): string {
  const fileNameByRenderAs: Record<RuankaoRenderAs, string> = {
    concept_card: "concept-card-renderer.md",
    short_card: "short-card-renderer.md",
    asset_card: "asset-card-renderer.md",
    manual_review_card: "manual-review-card-renderer.md",
  };
  return resolve(templateDir, fileNameByRenderAs[renderAs]);
}

function selectItem(contract: RuankaoRendererInputContract, title?: string): RuankaoRendererInputItem {
  if (!title) return contract.baseline_items[0];
  const item = contract.baseline_items.find((candidate) => candidate.canonical_title === title);
  if (!item) {
    fail(`baseline title not found in renderer input contract: ${title}`);
  }
  return item;
}

function collectText(doc: RuankaoIntermediateDocument): string[] {
  return (doc.content?.text_blocks ?? [])
    .map((block) => block.text.trim())
    .filter((text) => text.length > 0);
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function renderCoreConcept(doc: RuankaoIntermediateDocument): string {
  const textBlocks = collectText(doc);
  const combined = textBlocks.join("\n\n");
  if (combined.trim().length < 30) {
    return "原始中间层文本不足，需人工复核；本 renderer 不补写缺失内容。";
  }
  const excerpt = truncate(combined, 360);
  return [
    "以下内容仅来自 `intermediate.content.text_blocks`，未从 raw HTML / raw XHR 读取，也不补写缺失内容。",
    "",
    excerpt,
  ].join("\n");
}

function renderTopologyPlaceholder(title: string, renderAs: RuankaoRenderAs): string {
  return [
    "Renderer-generated structure placeholder. This Mermaid diagram is a dry-run scaffold, not a recovered source diagram.",
    "",
    "```mermaid",
    "flowchart TD",
    `    A[\"${title}\"] --> B[\"Validated intermediate text\"]`,
    `    B --> C[\"${renderAs} dry-run card\"]`,
    "    C --> D[\"Manual review before formal docs\"]",
    "```",
  ].join("\n");
}

function renderAssetRefs(
  item: RuankaoRendererInputItem,
  doc: RuankaoIntermediateDocument,
  manifest: RuankaoAssetManifest | null
): string {
  if (item.renderer_policy.render_as !== "asset_card") return "";

  const lines = [
    "### Asset refs / 资产引用",
    "",
    "The renderer preserves asset references only. It does not describe image contents, use OCR, or reconstruct image tables.",
    "",
  ];

  const imageRefs = doc.content?.image_refs ?? [];
  if (imageRefs.length === 0) {
    lines.push("- No image_refs found in intermediate JSON.");
    return lines.join("\n");
  }

  for (const ref of imageRefs) {
    const asset = manifest?.assets.find((candidate) => candidate.order === ref.order) ?? null;
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

function renderSourceReference(
  item: RuankaoRendererInputItem,
  doc: RuankaoIntermediateDocument,
  contractRepoPath: string,
  assetManifestPath: string | null
): string {
  return [
    "- intermediate path: `" + item.canonical_sample_path + "`",
    "- asset manifest path: `" + (assetManifestPath ?? "(none)") + "`",
    "- source timestamp: `" + doc.source.timestamp + "`",
    "- renderer input contract path: `" + contractRepoPath + "`",
    "- constraints:",
    `  - ocr_used: ${doc.constraints.ocr_used}`,
    `  - encrypted_xhr_decrypted: ${doc.constraints.encrypted_xhr_decrypted}`,
    `  - image_table_reconstructed: ${doc.constraints.image_table_reconstructed}`,
    `  - markdown_generated: ${doc.constraints.markdown_generated}`,
    "- renderer boundary: 不补写缺失内容，不读取 raw HTML / raw XHR，不访问网页。",
  ].join("\n");
}

function renderMarkdown(
  template: string,
  item: RuankaoRendererInputItem,
  doc: RuankaoIntermediateDocument,
  manifest: RuankaoAssetManifest | null,
  contractRepoPath: string
): string {
  const replacements: Record<string, string> = {
    title: item.canonical_title,
    core_concept: renderCoreConcept(doc),
    topology_placeholder: renderTopologyPlaceholder(item.canonical_title, item.renderer_policy.render_as),
    asset_refs: renderAssetRefs(item, doc, manifest),
    deterministic_constraints:
      "本节需人工依据正式教材/考试要求补充；renderer 不从图片或缺失上下文推断，不补写缺失内容。",
    ruankao_alignment:
      `基于标题的保守映射：\`${item.canonical_title}\`。dry-run 不补写考试结论，不改写软考内容。`,
    case_study_pattern:
      "Dry-run 仅保留案例分析结构框架：问题背景、约束、失效模式、改造方向。此处不写具体答案。",
    paper_usage:
      "Dry-run 仅保留论文素材结构框架：项目背景、技术选型、质量属性、效果评估。此处不生成可直接套用段落。",
    source_reference: renderSourceReference(item, doc, contractRepoPath, item.asset_manifest_path),
  };

  let rendered = template;
  for (const [key, value] of Object.entries(replacements)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }
  return rendered;
}

function main(): void {
  runContractValidation();

  if (!existsSync(contractPath)) fail("renderer input contract not found; run pnpm build:renderer-input-contract first");
  const contract = readJson<RuankaoRendererInputContract>(contractPath);
  if (contract.phase4_allowed !== true) fail("renderer input contract does not allow Phase 4 dry-run");

  const { title } = parseArgs();
  const item = selectItem(contract, title);
  const renderAs = item.renderer_policy.render_as;

  const templateFile = templatePath(renderAs);
  if (!existsSync(templateFile)) fail(`renderer template missing: ${templateFile}`);

  const intermediatePath = resolve(repoRoot, item.canonical_sample_path);
  if (!existsSync(intermediatePath)) fail(`intermediate JSON not found: ${item.canonical_sample_path}`);
  const intermediate = readJson<RuankaoIntermediateDocument>(intermediatePath);

  let assetManifest: RuankaoAssetManifest | null = null;
  const allowedInputsUsed = ["intermediate_json"];
  if (item.asset_manifest_path) {
    const assetManifestPath = resolve(repoRoot, item.asset_manifest_path);
    if (!existsSync(assetManifestPath)) {
      fail(`asset manifest declared by contract is missing: ${item.asset_manifest_path}`);
    }
    assetManifest = readJson<RuankaoAssetManifest>(assetManifestPath);
    allowedInputsUsed.push("asset_manifest");
  }

  if (renderAs === "asset_card" && item.renderer_policy.preserve_asset_refs !== true) {
    fail("asset_card renderer policy must preserve asset refs");
  }

  const template = readFileSync(templateFile, "utf8");
  const markdown = renderMarkdown(template, item, intermediate, assetManifest, toRepoPath(contractPath));
  const safe = safeTitle(item.canonical_title);
  const markdownPath = resolve(generatedDir, `phase4_0_dry_run_${safe}.md`);
  const tracePath = resolve(generatedDir, `phase4_0_dry_run_${safe}.json`);

  const assetRefsPreserved =
    renderAs !== "asset_card" ||
    (item.renderer_policy.preserve_asset_refs === true &&
      markdown.includes("asset_ref") &&
      (assetManifest?.assets.length ?? 0) === (intermediate.content?.image_refs?.length ?? 0));

  const trace: RenderTrace = {
    title: item.canonical_title,
    render_as: renderAs,
    input_contract_path: toRepoPath(contractPath),
    intermediate_path: item.canonical_sample_path,
    asset_manifest_path: item.asset_manifest_path,
    output_markdown_path: toRepoPath(markdownPath),
    allowed_inputs_used: allowedInputsUsed,
    forbidden_inputs_touched: [],
    sections_rendered: REQUIRED_SECTIONS,
    asset_refs_preserved: assetRefsPreserved,
    ocr_used: false,
    image_table_reconstructed: false,
    content_invented: false,
    raw_html_read: false,
    raw_xhr_read: false,
    web_requests_used: false,
    markdown_generated_to_docs: false,
  };

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(markdownPath, markdown, "utf8");
  writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`, "utf8");

  console.log("[render:dry-run] Dry-run Markdown generated");
  console.log(`  title:                    ${trace.title}`);
  console.log(`  render_as:                ${trace.render_as}`);
  console.log(`  markdown:                 ${trace.output_markdown_path}`);
  console.log(`  trace:                    ${toRepoPath(tracePath)}`);
  console.log(`  sections_rendered:        ${trace.sections_rendered.length}`);
  console.log(`  allowed_inputs_used:      ${trace.allowed_inputs_used.join(", ")}`);
  console.log(`  forbidden_inputs_touched: ${trace.forbidden_inputs_touched.length}`);
  console.log(`  asset_refs_preserved:     ${trace.asset_refs_preserved}`);
}

main();
