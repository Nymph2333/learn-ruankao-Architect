/**
 * Phase 4.2: Three-baseline official render.
 *
 * Renders exactly the three frozen canonical baseline items from the Phase 3.25
 * renderer input contract. This is a controlled baseline-set render, not full
 * knowledge-base batch generation.
 *
 * HARD CONSTRAINTS: no OCR, no encrypt=1 decryption, no raw HTML/XHR reads,
 * no web requests, no Playwright/crawler use, no image table reconstruction,
 * and no content invention.
 *
 * Usage:
 *   pnpm render:baseline-set
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuankaoAssetManifest } from "../packages/domain-types/ruankaodaren-asset-manifest.js";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";
import type {
  RuankaoRenderAs,
  RuankaoRendererInputContract,
  RuankaoRendererInputItem,
} from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const officialOutputDir = resolve(repoRoot, "docs/ruankaodaren/baseline");
const contractPath = resolve(generatedDir, "phase3_25_renderer_input_contract.json");

const REQUIRED_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

const REQUIRED_FORBIDDEN_INPUTS = [
  "raw_html_direct_read",
  "raw_xhr_direct_read",
  "web_requests",
  "ocr",
  "encrypted_xhr_decryption",
  "image_table_reconstruction",
  "content_invention",
];

interface BaselineSetTraceItem {
  title: string;
  render_as: RuankaoRenderAs;
  official_output_path: string;
  intermediate_path: string;
  asset_manifest_path: string | null;
  sections_rendered: string[];
  asset_refs_preserved: boolean;
  source_reference_rendered: boolean;
  ocr_used: false;
  image_table_reconstructed: false;
  content_invented: false;
  raw_html_read: false;
  raw_xhr_read: false;
  web_requests_used: false;
}

interface BaselineSetTrace {
  phase: "4.2";
  rendered_count: number;
  batch_render: false;
  controlled_baseline_set_render: true;
  input_contract_path: string;
  official_output_dir: string;
  items: BaselineSetTraceItem[];
  allowed_inputs_used: string[];
  forbidden_inputs_touched: string[];
  constraints: {
    ocr_used: false;
    encrypted_xhr_decrypted: false;
    image_table_reconstructed: false;
    content_invented: false;
    raw_html_read: false;
    raw_xhr_read: false;
    web_requests_used: false;
  };
}

function fail(message: string): never {
  console.error(`[render:baseline-set] ERROR: ${message}`);
  process.exit(1);
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
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
    if (result.error) console.error(`[render:baseline-set] validator spawn error: ${result.error.message}`);
    fail("renderer input contract validation failed; baseline-set render aborted");
  }
}

function assertContract(contract: RuankaoRendererInputContract): void {
  if (contract.phase4_allowed !== true) fail("renderer input contract does not allow Phase 4 rendering");
  if (contract.baseline_items.length !== 3) {
    fail(`Phase 4.2 requires exactly 3 baseline items, got ${contract.baseline_items.length}`);
  }

  const titles = contract.baseline_items.map((item) => item.canonical_title);
  if (new Set(titles).size !== titles.length) fail("canonical baseline titles must be unique");

  for (const forbiddenInput of REQUIRED_FORBIDDEN_INPUTS) {
    if (!contract.renderer_input_policy.forbidden_inputs.includes(forbiddenInput as never)) {
      fail(`renderer input contract missing forbidden input: ${forbiddenInput}`);
    }
  }

  for (const item of contract.baseline_items) {
    if (!item.renderer_policy?.render_as) fail(`baseline item missing renderer_policy: ${item.canonical_title}`);
    if (item.constraints.ocr_used !== false) fail(`ocr constraint violated: ${item.canonical_title}`);
    if (item.constraints.encrypted_xhr_decrypted !== false) {
      fail(`encrypted_xhr_decrypted constraint violated: ${item.canonical_title}`);
    }
    if (item.constraints.image_table_reconstructed !== false) {
      fail(`image_table_reconstructed constraint violated: ${item.canonical_title}`);
    }
    if (item.constraints.markdown_generated !== false) {
      fail(`intermediate markdown_generated constraint violated: ${item.canonical_title}`);
    }
  }
}

function safeTitle(title: string): string {
  return title
    .replace(/[\\/:*?"<>|#]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function collectText(doc: RuankaoIntermediateDocument): string[] {
  return (doc.content?.text_blocks ?? [])
    .map((block) => block.text.trim())
    .filter((text) => text.length > 0);
}

function splitLongExtractedText(text: string): string[] {
  if (text.length <= 240) return [text];
  const segments = text
    .split(/(?<=[。；;])\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length <= 1) return [text];

  const chunks: string[] = [];
  let current = "";
  for (const segment of segments) {
    const next = current ? `${current}${segment}` : segment;
    if (next.length > 240 && current) {
      chunks.push(current);
      current = segment;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function renderExtractedTextBlocks(textBlocks: string[]): string[] {
  return textBlocks.flatMap((text) =>
    splitLongExtractedText(text).map((chunk) => `- ${chunk}`)
  );
}

function renderCoreConcept(item: RuankaoRendererInputItem, doc: RuankaoIntermediateDocument): string {
  const textBlocks = collectText(doc);
  const policy = item.renderer_policy.render_as;
  const lines = [
    `Renderer policy: \`${policy}\`.`,
    "中间层文本有限；本节仅呈现已抽取内容，不补写缺失内容。",
  ];

  if (policy === "short_card") {
    lines.push("短文本卡片，后续可人工补充；renderer 不因内容短而补写。");
  }

  if (textBlocks.length === 0) {
    lines.push("原始中间层文本不足，需人工复核；本 renderer 不补写缺失内容。");
  } else {
    lines.push("", "已抽取内容（保持原始含义，仅做列表化呈现）：", "", ...renderExtractedTextBlocks(textBlocks));
  }

  const keyTerms = (doc.content?.key_terms ?? []).map((term) => term.text.trim()).filter(Boolean);
  if (keyTerms.length > 0) {
    lines.push("", "已抽取 key_terms（仅来自 intermediate JSON）：", "", ...keyTerms.map((term) => `- ${term}`));
  }

  return lines.join("\n");
}

function renderTopologyPlaceholder(item: RuankaoRendererInputItem): string {
  return [
    "Renderer-generated structural placeholder; not reconstructed from image content.",
    "",
    "```mermaid",
    "flowchart TD",
    `    A["${item.canonical_title}"] --> B["Intermediate JSON"]`,
    `    B --> C["${item.renderer_policy.render_as} renderer policy"]`,
    "    C --> D[\"Manual review before broader publication\"]",
    "```",
  ].join("\n");
}

function renderAssetSection(
  item: RuankaoRendererInputItem,
  doc: RuankaoIntermediateDocument,
  manifest: RuankaoAssetManifest | null
): string {
  const imageRefs = doc.content?.image_refs ?? [];
  if (item.renderer_policy.render_as !== "asset_card") {
    return [
      `Renderer policy: \`${item.renderer_policy.render_as}\`.`,
      "Renderer 未 OCR，未还原图片表格；如后续出现图片型资料，只保留 asset_ref，不解释图片内容。",
    ].join("\n");
  }

  const lines = [
    "Renderer policy: `asset_card`.",
    "本知识点包含图片型资料。",
    "图片只作为 asset_ref 保留。",
    "asset_ref 只是引用，不代表 renderer 已理解图片内容。",
    "Renderer 未 OCR。",
    "Renderer 未还原图片表格。",
    "图片内容需人工复核。",
    "sha256 / saved_path / content_type / dimensions 是资产定位信息，不是知识解释。",
    "不根据图片内容自动还原，不根据图片自动写 CISC/RISC 对比表内容。",
    "",
    "Asset refs:",
    "",
  ];

  if (imageRefs.length === 0) {
    lines.push("- No image_refs found in intermediate JSON; requires manual review.");
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

function renderRuankaoAlignment(item: RuankaoRendererInputItem): string {
  return [
    `基于标题和已抽取文本的保守映射：\`${item.canonical_title}\`。`,
    "本节不写未来源支持的考试结论，不改写软考内容，不补写缺失内容。",
  ].join("\n");
}

function renderCaseStudyPattern(): string {
  return [
    "- 问题背景：待人工结合正式题目补充。",
    "- 关键约束：待人工结合正式题目补充。",
    "- 失效模式：待人工结合正式题目补充。",
    "- 改造方向：待人工结合正式题目补充。",
    "",
    "本 official render 只输出答题框架，不写具体答案，不补写缺失内容。",
  ].join("\n");
}

function renderPaperUsage(): string {
  return [
    "- 可作为论文素材索引项。",
    "- 需人工复核后再提炼为论文表述。",
    "- 本 renderer 不生成未来源支持的论文段落，不补写缺失内容。",
  ].join("\n");
}

function renderSourceReference(
  item: RuankaoRendererInputItem,
  doc: RuankaoIntermediateDocument,
  manifest: RuankaoAssetManifest | null,
  contract: RuankaoRendererInputContract
): string {
  const assetShaList = manifest?.assets.map((asset) => asset.sha256 ?? "(not available)").join(", ") ?? "(none)";
  const assetPathList = manifest?.assets.map((asset) => asset.saved_path ?? "(not available)").join(", ") ?? "(none)";
  const assetTypes = manifest?.assets.map((asset) => asset.content_type ?? "(not available)").join(", ") ?? "(none)";
  const assetSizes =
    manifest?.assets.map((asset) => `${asset.width ?? "unknown"}x${asset.height ?? "unknown"}`).join(", ") ?? "(none)";

  return [
    `- renderer input contract path: \`${toRepoPath(contractPath)}\``,
    `- renderer baseline manifest path: \`${contract.baseline_manifest_path}\``,
    `- intermediate JSON path: \`${item.canonical_sample_path}\``,
    `- asset manifest path: \`${item.asset_manifest_path ?? "(none)"}\``,
    `- source timestamp: \`${doc.source.timestamp}\``,
    `- asset sha256: \`${assetShaList}\``,
    `- asset saved_path: \`${assetPathList}\``,
    `- asset content_type: \`${assetTypes}\``,
    `- asset width / height: \`${assetSizes}\``,
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
  ].join("\n");
}

function renderHumanReviewChecklist(item: RuankaoRendererInputItem): string {
  const base = [
    "- [ ] 内容是否与正式教材一致。",
    "- [ ] 是否需要补充定义 / 特点 / 优缺点。",
    "- [ ] 是否需要补充案例分析答题点。",
    "- [ ] 是否需要补充论文可用表达。",
    "- [ ] 是否需要复核图片资产。",
    "- [ ] 是否确认 renderer 未补写缺失内容。",
  ];

  const policySpecific: Record<RuankaoRenderAs, string[]> = {
    asset_card: [
      "- [ ] `asset_ref` 只是引用，不代表已理解图片内容。",
      "- [ ] 图片内容必须人工阅读。",
      "- [ ] `sha256` / `saved_path` / `content_type` / dimensions 只用于资产定位。",
      "- [ ] 不允许根据图片自动写 CISC/RISC 对比表内容。",
    ],
    short_card: [
      "- [ ] 短文本是经过 discovery / stabilization 验证的真实短内容。",
      "- [ ] Renderer 不因内容短而扩写。",
      "- [ ] 需人工补充教材定义、案例点、论文段落后再扩展。",
    ],
    concept_card: [
      "- [ ] 只基于 intermediate `text_blocks` / `key_terms` 做保守组织。",
      "- [ ] 不引入未来源支持的考点判断。",
      "- [ ] 不生成未来源支持的考试结论。",
      "- [ ] 不生成可直接套用论文段落。",
    ],
    manual_review_card: [
      "- [ ] 该文档只作为人工复核任务卡。",
      "- [ ] 该文档不作为最终学习卡片。",
      "- [ ] 人工确认前不得进入批量发布。",
    ],
  };

  return [...base, "", `Renderer policy review: \`${item.renderer_policy.render_as}\``, "", ...policySpecific[item.renderer_policy.render_as]].join("\n");
}

function renderRendererBoundary(): string {
  return [
    "- 未 OCR。",
    "- 未解密 `encrypt=1`。",
    "- 未还原图片表格。",
    "- 未读取 raw HTML。",
    "- 未读取 raw XHR。",
    "- 未访问网页。",
    "- 未使用 web requests。",
    "- 未补写缺失内容。",
  ].join("\n");
}

function renderMarkdown(
  item: RuankaoRendererInputItem,
  doc: RuankaoIntermediateDocument,
  manifest: RuankaoAssetManifest | null,
  contract: RuankaoRendererInputContract
): string {
  return [
    `# ${item.canonical_title}`,
    "",
    `> Phase 4.2 controlled baseline-set official render. Renderer policy: \`${item.renderer_policy.render_as}\`. This document uses only the frozen renderer input contract, intermediate JSON, and asset manifest metadata when present.`,
    "",
    "## Core Concept / 核心概念",
    "",
    renderCoreConcept(item, doc),
    "",
    "## Architectural Topology & Visualization / 架构拓扑与可视化",
    "",
    renderTopologyPlaceholder(item),
    "",
    renderAssetSection(item, doc, manifest),
    "",
    "## Deterministic Constraints / 决定论约束",
    "",
    "本节需要人工根据正式教材或考试大纲补充；renderer 不从图片或缺失上下文推断，不补写缺失内容。",
    "",
    "## Ruankao Alignment / 软考考点映射",
    "",
    renderRuankaoAlignment(item),
    "",
    "## Case Study Answer Pattern / 案例分析答题模式",
    "",
    renderCaseStudyPattern(),
    "",
    "## Paper Usage / 论文可复用方式",
    "",
    renderPaperUsage(),
    "",
    "## Source Reference / 来源引用",
    "",
    renderSourceReference(item, doc, manifest, contract),
    "",
    "## Human Review Checklist / 人工复核清单",
    "",
    renderHumanReviewChecklist(item),
    "",
    "## Renderer Boundary / 渲染边界",
    "",
    renderRendererBoundary(),
    "",
  ].join("\n");
}

function renderItem(contract: RuankaoRendererInputContract, item: RuankaoRendererInputItem): BaselineSetTraceItem {
  const intermediatePath = resolve(repoRoot, item.canonical_sample_path);
  if (!existsSync(intermediatePath)) fail(`intermediate JSON not found: ${item.canonical_sample_path}`);
  const doc = readJson<RuankaoIntermediateDocument>(intermediatePath);

  let manifest: RuankaoAssetManifest | null = null;
  if (item.asset_manifest_path) {
    const manifestPath = resolve(repoRoot, item.asset_manifest_path);
    if (!existsSync(manifestPath)) fail(`asset manifest not found: ${item.asset_manifest_path}`);
    manifest = readJson<RuankaoAssetManifest>(manifestPath);
  }

  if (item.renderer_policy.render_as === "asset_card" && item.renderer_policy.preserve_asset_refs !== true) {
    fail(`asset_card must preserve asset refs: ${item.canonical_title}`);
  }

  const outputPath = resolve(officialOutputDir, `${safeTitle(item.canonical_title)}.md`);
  const markdown = renderMarkdown(item, doc, manifest, contract);
  writeFileSync(outputPath, markdown, "utf8");

  return {
    title: item.canonical_title,
    render_as: item.renderer_policy.render_as,
    official_output_path: toRepoPath(outputPath),
    intermediate_path: item.canonical_sample_path,
    asset_manifest_path: item.asset_manifest_path,
    sections_rendered: REQUIRED_SECTIONS,
    asset_refs_preserved: item.renderer_policy.render_as !== "asset_card" || item.renderer_policy.preserve_asset_refs === true,
    source_reference_rendered: true,
    ocr_used: false,
    image_table_reconstructed: false,
    content_invented: false,
    raw_html_read: false,
    raw_xhr_read: false,
    web_requests_used: false,
  };
}

function writeTraceMarkdown(trace: BaselineSetTrace): void {
  const mdPath = resolve(generatedDir, "phase4_2_baseline_set_render_trace.md");
  const lines = [
    "# Phase 4.2 Baseline Set Render Trace",
    "",
    "## Summary",
    "",
    "| Field | Value |",
    "|---|---|",
    `| phase | ${trace.phase} |`,
    `| rendered_count | ${trace.rendered_count} |`,
    `| controlled_baseline_set_render | ${trace.controlled_baseline_set_render} |`,
    `| batch_render | ${trace.batch_render} |`,
    `| forbidden_inputs_touched | ${trace.forbidden_inputs_touched.length} |`,
    "",
    "## Official Outputs",
    "",
    ...trace.items.map((item) => `- ${item.title}: \`${item.official_output_path}\` (${item.render_as})`),
    "",
    "## Allowed Inputs Used",
    "",
    ...trace.allowed_inputs_used.map((input) => `- ${input}`),
    "",
    "## Constraints",
    "",
    `- ocr_used: ${trace.constraints.ocr_used}`,
    `- encrypted_xhr_decrypted: ${trace.constraints.encrypted_xhr_decrypted}`,
    `- image_table_reconstructed: ${trace.constraints.image_table_reconstructed}`,
    `- content_invented: ${trace.constraints.content_invented}`,
    `- raw_html_read: ${trace.constraints.raw_html_read}`,
    `- raw_xhr_read: ${trace.constraints.raw_xhr_read}`,
    `- web_requests_used: ${trace.constraints.web_requests_used}`,
    "",
  ];
  writeFileSync(mdPath, lines.join("\n"), "utf8");
}

function main(): void {
  if (process.argv.slice(2).length > 0) {
    fail("Phase 4.2 does not accept title arguments; it renders only the frozen contract baseline set");
  }

  runContractValidation();
  if (!existsSync(contractPath)) fail("renderer input contract not found; run pnpm build:renderer-input-contract");
  const contract = readJson<RuankaoRendererInputContract>(contractPath);
  assertContract(contract);

  mkdirSync(officialOutputDir, { recursive: true });
  mkdirSync(generatedDir, { recursive: true });

  const items = contract.baseline_items.map((item) => renderItem(contract, item));
  const allowedInputsUsed = Array.from(
    new Set(["renderer_input_contract", "intermediate_json", ...items.flatMap((item) => item.asset_manifest_path ? ["asset_manifest"] : [])])
  );

  const trace: BaselineSetTrace = {
    phase: "4.2",
    rendered_count: items.length,
    batch_render: false,
    controlled_baseline_set_render: true,
    input_contract_path: toRepoPath(contractPath),
    official_output_dir: "docs/ruankaodaren/baseline",
    items,
    allowed_inputs_used: allowedInputsUsed,
    forbidden_inputs_touched: [],
    constraints: {
      ocr_used: false,
      encrypted_xhr_decrypted: false,
      image_table_reconstructed: false,
      content_invented: false,
      raw_html_read: false,
      raw_xhr_read: false,
      web_requests_used: false,
    },
  };

  const tracePath = resolve(generatedDir, "phase4_2_baseline_set_render_trace.json");
  writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`, "utf8");
  writeTraceMarkdown(trace);

  console.log("[render:baseline-set] Controlled baseline set rendered");
  console.log(`  rendered_count:                   ${trace.rendered_count}`);
  console.log(`  controlled_baseline_set_render:   ${trace.controlled_baseline_set_render}`);
  console.log(`  batch_render:                     ${trace.batch_render}`);
  console.log(`  official_output_dir:              ${trace.official_output_dir}`);
  console.log(`  trace:                            ${toRepoPath(tracePath)}`);
  console.log(`  forbidden_inputs_touched:         ${trace.forbidden_inputs_touched.length}`);
}

main();
