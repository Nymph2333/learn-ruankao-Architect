/**
 * Phase 3.25: Renderer Input Contract Freeze builder.
 *
 * Reads only the Phase 3.23 unique renderer baseline manifest and writes a
 * frozen Phase 4 input contract. This script does not read raw HTML/XHR, does
 * not perform OCR, and does not generate Markdown knowledge documents.
 *
 * Usage:
 *   pnpm build:renderer-input-contract
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  RuankaoRenderAs,
  RuankaoRendererInputContract,
  RuankaoRendererInputItem,
  RuankaoRendererPolicy,
} from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const baselineManifestPath = resolve(generatedDir, "phase3_23_renderer_baseline_manifest.json");
const outputJsonPath = resolve(generatedDir, "phase3_25_renderer_input_contract.json");
const outputMdPath = resolve(generatedDir, "phase3_25_renderer_input_contract.md");

const REQUIRED_RENDERER_SECTIONS = [
  "Core Concept / 核心概念",
  "Architectural Topology & Visualization / 架构拓扑与可视化",
  "Deterministic Constraints / 决定论约束",
  "Ruankao Alignment / 软考考点映射",
  "Case Study Answer Pattern / 案例分析答题模式",
  "Paper Usage / 论文可复用方式",
  "Source Reference / 来源引用",
];

const ALLOWED_INPUTS = [
  "renderer_baseline_manifest",
  "intermediate_json",
  "asset_manifest",
  "asset_files",
] as const;

const FORBIDDEN_INPUTS = [
  "raw_html_direct_read",
  "raw_xhr_direct_read",
  "web_requests",
  "ocr",
  "encrypted_xhr_decryption",
  "image_table_reconstruction",
  "content_invention",
] as const;

interface BaselineRendererPolicy {
  render_as: string;
  preserve_asset_refs: boolean;
  allow_markdown_generation_later: boolean;
  notes: string[];
}

interface BaselineItem {
  canonical_title: string;
  canonical_sample_path: string;
  timestamp: string;
  readiness_class: string;
  content_shape: string;
  renderer_policy: BaselineRendererPolicy | null;
  asset_manifest_path: string | null;
  duplicate_sample_paths: string[];
  manual_review_required: boolean;
  constraints?: {
    ocr_used?: boolean;
    encrypted_xhr_decrypted?: boolean;
    image_table_reconstructed?: boolean;
    markdown_generated?: boolean;
  };
}

interface BaselineManifest {
  created_at: string;
  source_name: "ruankaodaren";
  baseline_count: number;
  unique_title_count: number;
  phase4_input_contract_ready: boolean;
  required_before_phase4: string[];
  baseline_items: BaselineItem[];
}

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function fail(message: string): never {
  console.error(`[build:renderer-input-contract] ERROR: ${message}`);
  process.exit(1);
}

function isRenderAs(value: string): value is RuankaoRenderAs {
  return value === "short_card" ||
    value === "asset_card" ||
    value === "concept_card" ||
    value === "manual_review_card";
}

function normalizePolicy(policy: BaselineRendererPolicy | null, title: string): RuankaoRendererPolicy {
  if (!policy) fail(`baseline item "${title}" is missing renderer_policy`);
  if (!isRenderAs(policy.render_as)) {
    fail(`baseline item "${title}" has unsupported render_as="${policy.render_as}"`);
  }

  return {
    render_as: policy.render_as,
    preserve_asset_refs: policy.preserve_asset_refs,
    allow_markdown_generation_later: policy.allow_markdown_generation_later,
    notes: policy.notes ?? [],
  };
}

function ensureSafeBaselineItem(item: BaselineItem): void {
  if (!item.canonical_title) fail("baseline item missing canonical_title");
  if (!item.canonical_sample_path) fail(`baseline item "${item.canonical_title}" missing canonical_sample_path`);
  if (!item.timestamp) fail(`baseline item "${item.canonical_title}" missing timestamp`);
  if (!item.renderer_policy) fail(`baseline item "${item.canonical_title}" missing renderer_policy`);

  const policy = item.renderer_policy;
  if (
    (item.content_shape === "MIXED_TEXT_IMAGE" || item.content_shape === "IMAGE_ASSET_CARD" || policy.render_as === "asset_card") &&
    policy.preserve_asset_refs !== true
  ) {
    fail(`asset-bearing baseline item "${item.canonical_title}" must preserve asset refs`);
  }

  const constraints = item.constraints ?? {};
  if (constraints.ocr_used === true) fail(`baseline item "${item.canonical_title}" violates ocr_used=false`);
  if (constraints.encrypted_xhr_decrypted === true) {
    fail(`baseline item "${item.canonical_title}" violates encrypted_xhr_decrypted=false`);
  }
  if (constraints.image_table_reconstructed === true) {
    fail(`baseline item "${item.canonical_title}" violates image_table_reconstructed=false`);
  }
  if (constraints.markdown_generated === true) {
    fail(`baseline item "${item.canonical_title}" violates markdown_generated=false`);
  }
}

function buildContractItem(item: BaselineItem): RuankaoRendererInputItem {
  ensureSafeBaselineItem(item);
  const policy = normalizePolicy(item.renderer_policy, item.canonical_title);

  return {
    canonical_title: item.canonical_title,
    canonical_sample_path: item.canonical_sample_path,
    timestamp: item.timestamp,
    readiness_class: item.readiness_class,
    content_shape: item.content_shape,
    renderer_policy: policy,
    asset_manifest_path: item.asset_manifest_path,
    manual_review_required: item.manual_review_required,
    required_renderer_sections: REQUIRED_RENDERER_SECTIONS,
    constraints: {
      ocr_used: false,
      encrypted_xhr_decrypted: false,
      image_table_reconstructed: false,
      markdown_generated: false,
    },
  };
}

function buildContract(manifest: BaselineManifest): RuankaoRendererInputContract {
  if (manifest.source_name !== "ruankaodaren") fail(`unexpected source_name="${manifest.source_name}"`);
  if (manifest.phase4_input_contract_ready !== true) {
    fail("baseline manifest is not phase4_input_contract_ready; not generating a renderer input contract");
  }
  if (manifest.unique_title_count < 3) {
    fail(`unique_title_count must be >= 3, got ${manifest.unique_title_count}`);
  }
  if ((manifest.baseline_items ?? []).length < 3) {
    fail(`baseline_items.length must be >= 3, got ${(manifest.baseline_items ?? []).length}`);
  }
  if ((manifest.required_before_phase4 ?? []).length > 0) {
    fail(`baseline manifest still has required_before_phase4: ${manifest.required_before_phase4.join("; ")}`);
  }

  const baselineItems = manifest.baseline_items.map(buildContractItem);
  const uniqueTitles = new Set(baselineItems.map((item) => item.canonical_title));
  if (uniqueTitles.size !== baselineItems.length) {
    fail("baseline_items must have unique canonical_title values");
  }

  const allItemsHaveRendererPolicy = baselineItems.every((item) => item.renderer_policy !== null);
  const allConstraintsSafe = baselineItems.every(
    (item) =>
      item.constraints.ocr_used === false &&
      item.constraints.encrypted_xhr_decrypted === false &&
      item.constraints.image_table_reconstructed === false &&
      item.constraints.markdown_generated === false
  );

  return {
    contract_version: "phase3.25",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    phase4_allowed:
      manifest.phase4_input_contract_ready &&
      uniqueTitles.size >= 3 &&
      allItemsHaveRendererPolicy &&
      allConstraintsSafe,
    renderer_input_policy: {
      allowed_inputs: [...ALLOWED_INPUTS],
      forbidden_inputs: [...FORBIDDEN_INPUTS],
      baseline_unit: "unique_title",
      manual_review_required_for_asset_cards: true,
    },
    baseline_manifest_path: toRepoPath(baselineManifestPath),
    baseline_items: baselineItems,
    phase4_entry_conditions: {
      unique_baseline_titles_min: 3,
      unique_baseline_titles_actual: uniqueTitles.size,
      renderer_baseline_manifest_ready: manifest.phase4_input_contract_ready,
      all_items_have_renderer_policy: allItemsHaveRendererPolicy,
      all_constraints_safe: allConstraintsSafe,
    },
  };
}

function writeMarkdown(contract: RuankaoRendererInputContract): void {
  const renderDistribution: Record<string, number> = {};
  for (const item of contract.baseline_items) {
    renderDistribution[item.renderer_policy.render_as] =
      (renderDistribution[item.renderer_policy.render_as] ?? 0) + 1;
  }

  const lines: string[] = [
    "# Phase 3.25 Renderer Input Contract",
    "",
    `Generated at: ${contract.created_at}`,
    "",
    "## Summary",
    "",
    "| Field | Value |",
    "|---|---|",
    `| contract_version | ${contract.contract_version} |`,
    `| source_name | ${contract.source_name} |`,
    `| phase4_allowed | ${contract.phase4_allowed} |`,
    `| baseline_manifest_path | ${contract.baseline_manifest_path} |`,
    `| baseline_items | ${contract.baseline_items.length} |`,
    "",
    "## Allowed Inputs",
    "",
    ...contract.renderer_input_policy.allowed_inputs.map((input) => `- ${input}`),
    "",
    "## Forbidden Inputs",
    "",
    ...contract.renderer_input_policy.forbidden_inputs.map((input) => `- ${input}`),
    "",
    "## Renderer Policy Distribution",
    "",
    "| render_as | Count |",
    "|---|---:|",
    ...Object.entries(renderDistribution).map(([renderAs, count]) => `| ${renderAs} | ${count} |`),
    "",
    "## Baseline Items",
    "",
  ];

  for (const item of contract.baseline_items) {
    lines.push(`### ${item.canonical_title}`);
    lines.push("");
    lines.push(`- **canonical_sample_path**: \`${item.canonical_sample_path}\``);
    lines.push(`- **timestamp**: ${item.timestamp}`);
    lines.push(`- **readiness_class**: ${item.readiness_class}`);
    lines.push(`- **content_shape**: ${item.content_shape}`);
    lines.push(`- **render_as**: ${item.renderer_policy.render_as}`);
    lines.push(`- **preserve_asset_refs**: ${item.renderer_policy.preserve_asset_refs}`);
    lines.push(`- **allow_markdown_generation_later**: ${item.renderer_policy.allow_markdown_generation_later}`);
    lines.push(`- **manual_review_required**: ${item.manual_review_required}`);
    lines.push(`- **asset_manifest_path**: ${item.asset_manifest_path ?? "(none)"}`);
    if (item.renderer_policy.notes.length > 0) {
      lines.push("- **notes**:");
      for (const note of item.renderer_policy.notes) lines.push(`  - ${note}`);
    }
    lines.push("- **required_renderer_sections**:");
    for (const section of item.required_renderer_sections) lines.push(`  - ${section}`);
    lines.push("");
  }

  lines.push("## Asset Policy");
  lines.push("");
  lines.push("- Asset-card items must preserve asset references.");
  lines.push("- Image content may be linked as an asset reference only.");
  lines.push("- OCR and image-table reconstruction remain forbidden.");
  lines.push("- Manual review is required for asset cards.");
  lines.push("");
  lines.push("## Manual Review Policy");
  lines.push("");
  lines.push("- Short-card and asset-card rendering must not inflate, infer, or supplement source content.");
  lines.push("- Any later renderer may format validated intermediate fields only.");
  lines.push("- Human review remains required where the baseline item marks it.");
  lines.push("");
  lines.push("## Phase 4 Entry Conditions");
  lines.push("");
  lines.push("| Condition | Value |");
  lines.push("|---|---|");
  lines.push(`| unique_baseline_titles_min | ${contract.phase4_entry_conditions.unique_baseline_titles_min} |`);
  lines.push(`| unique_baseline_titles_actual | ${contract.phase4_entry_conditions.unique_baseline_titles_actual} |`);
  lines.push(`| renderer_baseline_manifest_ready | ${contract.phase4_entry_conditions.renderer_baseline_manifest_ready} |`);
  lines.push(`| all_items_have_renderer_policy | ${contract.phase4_entry_conditions.all_items_have_renderer_policy} |`);
  lines.push(`| all_constraints_safe | ${contract.phase4_entry_conditions.all_constraints_safe} |`);
  lines.push("");
  lines.push("## Explicit Prohibitions");
  lines.push("");
  lines.push("- No raw HTML direct read by the Phase 4 renderer.");
  lines.push("- No raw XHR direct read by the Phase 4 renderer.");
  lines.push("- No web requests by the Phase 4 renderer.");
  lines.push("- No OCR.");
  lines.push("- No encrypted XHR decryption.");
  lines.push("- No image table reconstruction.");
  lines.push("- No content invention.");
  lines.push("- This phase does not generate Markdown knowledge documents.");
  lines.push("- This phase does not enter Phase 4 implementation.");
  lines.push("");

  writeFileSync(outputMdPath, lines.join("\n"), "utf8");
}

function main(): void {
  if (!existsSync(baselineManifestPath)) {
    fail("phase3_23_renderer_baseline_manifest.json not found; run pnpm build:renderer-baseline first");
  }

  const manifest = readJson<BaselineManifest>(baselineManifestPath);
  const contract = buildContract(manifest);

  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(outputJsonPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  writeMarkdown(contract);

  const renderDistribution: Record<string, number> = {};
  for (const item of contract.baseline_items) {
    renderDistribution[item.renderer_policy.render_as] =
      (renderDistribution[item.renderer_policy.render_as] ?? 0) + 1;
  }

  console.log("[build:renderer-input-contract] Renderer input contract built");
  console.log(`  baseline_items:       ${contract.baseline_items.length}`);
  console.log(`  canonical_titles:     ${contract.baseline_items.map((item) => item.canonical_title).join(", ")}`);
  console.log(`  render_as_distribution: ${JSON.stringify(renderDistribution)}`);
  console.log(`  phase4_allowed:       ${contract.phase4_allowed}`);
  console.log(`  JSON:                 ${toRepoPath(outputJsonPath)}`);
  console.log(`  MD:                   ${toRepoPath(outputMdPath)}`);
}

main();
