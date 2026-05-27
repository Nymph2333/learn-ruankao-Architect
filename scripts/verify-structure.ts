import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type CheckResult = {
  label: string;
  ok: boolean;
  detail?: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const requiredDirectories = [
  "sources",
  "sources/ruankaodaren/raw/html",
  "sources/ruankaodaren/raw/xhr",
  "sources/ruankaodaren/raw/screenshots",
  "sources/ruankaodaren/raw/screenshots/debug",
  "sources/ruankaodaren/raw/metadata",
  "sources/ruankaodaren/raw/dom-text",
  "sources/ruankaodaren/raw/containers",
  "sources/ruankaodaren/raw/accessibility",
  "sources/ruankaodaren/raw/storage",
  "sources/ruankaodaren/raw/outer-html",
  "sources/ruankaodaren/raw/network",
  "sources/ruankaodaren/raw/console",
  "sources/ruankaodaren/raw/assets",
  "sources/ruankaodaren/raw/assets/images",
  "sources/ruankaodaren/raw/assets/manifests",
  "data",
  "data/intermediate/ruankaodaren/samples",
  "schemas",
  "packages/domain-types",
  "docs",
  "templates",
  "scripts",
  "verification",
  "config"
];

const requiredFiles = [
  "AGENTS.md",
  "README.md",
  "config/crawler.yaml",
  "config/sources.yaml",
  "config/taxonomy.yaml",
  "templates/concept-card.md",
  "templates/case-analysis-card.md",
  "templates/paper-template.md",
  "verification/phase0-structure-check.md",
  "verification/phase2-crawler-check.md",
  "verification/phase2_6_auth_state_check.md",
  "verification/phase2_7_context_selection_check.md",
  "verification/phase2_9_interactive_content_harvesting_check.md",
  "verification/phase2_11_detail_entry_harvesting_check.md",
  "verification/phase2_12_detail_entry_snapshot_inspection.md",
  "verification/phase2_13_target_scoped_detail_entry_check.md",
  "verification/phase2_14_matched_detail_snapshot_inspection.md",
  "verification/phase3_0_parser_contract_check.md",
  "verification/phase3_1_intermediate_validation_check.md",
  "verification/phase2_15_asset_capture_check.md",
  "verification/phase3_2_multi_sample_parser_validation_check.md",
  "verification/phase3_3_controlled_multi_sample_acquisition_check.md",
  "schemas/ruankaodaren-intermediate.schema.json",
  "schemas/ruankaodaren-asset-manifest.schema.json",
  "packages/domain-types/ruankaodaren-intermediate.ts",
  "packages/domain-types/ruankaodaren-asset-manifest.ts",
  "scripts/parse-ruankaodaren-outer-html.ts",
  "scripts/validate-ruankaodaren-intermediate.ts",
  "config/ruankaodaren-sample-targets.yaml",
  "scripts/run-ruankaodaren-sample-acquisition.ts",
  "scripts/report-ruankaodaren-sample-coverage.ts",
  "scripts/capture-ruankaodaren-assets.ts",
  "scripts/validate-ruankaodaren-assets.ts",
  "scripts/auth-ruankaodaren.ts",
  "scripts/crawl-ruankaodaren.ts",
  "scripts/verify-structure.ts",
  "package.json",
  "tsconfig.json",
  ".gitignore"
];

const requiredContent: Record<string, string[]> = {
  "AGENTS.md": ["Non-Negotiable Output Structure"],
  "package.json": ["auth:ruankaodaren", "crawl:ruankaodaren", "parse:ruankaodaren", "validate:intermediate", "capture:assets", "validate:assets", "report:sample-coverage", "run:sample-acquisition"],
  "templates/concept-card.md": [
    "# <Concept English> / <中文术语>",
    "## 1. Core Concept / 核心概念",
    "## 2. Architectural Topology & Visualization / 架构拓扑与可视化",
    "```mermaid",
    "## 3. Deterministic Constraints / 决定论约束",
    "## 4. Trade-off Analysis / 权衡分析",
    "## 5. Failure Modes / 失效模式",
    "## 6. Ruankao Alignment / 软考考点映射",
    "Case Study Answer Pattern / 案例分析答题模式",
    "Paper Usage / 论文可复用方式",
    "## 7. Source Reference / 来源引用"
  ],
  "templates/case-analysis-card.md": [
    "## 1. Problem Background / 问题背景",
    "## 2. Current Architecture / 架构现状",
    "## 3. Key Constraints / 关键约束",
    "## 4. Failure Cause / 失效原因",
    "## 5. Improvement Plan / 改造方案",
    "## 6. Exam Answer Structure / 考试答题结构"
  ],
  "templates/paper-template.md": [
    "## 1. Project Background / 项目背景",
    "## 2. Architectural Problem / 架构问题",
    "## 3. Technology Selection / 技术选型",
    "## 4. Design Process / 设计过程",
    "## 5. Quality Attributes / 质量属性",
    "## 6. Effect Evaluation / 效果评估",
    "## 7. Reusable Expression / 可复用表达"
  ]
};

function pathFromRoot(relativePath: string): string {
  return resolve(repoRoot, relativePath);
}

function checkDirectory(relativePath: string): CheckResult {
  const absolutePath = pathFromRoot(relativePath);

  if (!existsSync(absolutePath)) {
    return {
      label: `directory ${relativePath}/`,
      ok: false,
      detail: "missing"
    };
  }

  if (!statSync(absolutePath).isDirectory()) {
    return {
      label: `directory ${relativePath}/`,
      ok: false,
      detail: "exists but is not a directory"
    };
  }

  return { label: `directory ${relativePath}/`, ok: true };
}

function checkFile(relativePath: string): CheckResult {
  const absolutePath = pathFromRoot(relativePath);

  if (!existsSync(absolutePath)) {
    return {
      label: `file ${relativePath}`,
      ok: false,
      detail: "missing"
    };
  }

  if (!statSync(absolutePath).isFile()) {
    return {
      label: `file ${relativePath}`,
      ok: false,
      detail: "exists but is not a file"
    };
  }

  return { label: `file ${relativePath}`, ok: true };
}

function checkContent(relativePath: string, snippets: string[]): CheckResult[] {
  const absolutePath = pathFromRoot(relativePath);

  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    return snippets.map((snippet) => ({
      label: `content ${relativePath} contains "${snippet}"`,
      ok: false,
      detail: "file missing"
    }));
  }

  const content = readFileSync(absolutePath, "utf8");

  return snippets.map((snippet) => ({
    label: `content ${relativePath} contains "${snippet}"`,
    ok: content.includes(snippet),
    detail: content.includes(snippet) ? undefined : "snippet missing"
  }));
}

function printResult(result: CheckResult): void {
  const marker = result.ok ? "[PASS]" : "[FAIL]";
  const detail = result.detail ? ` - ${result.detail}` : "";
  console.log(`${marker} ${result.label}${detail}`);
}

const results = [
  ...requiredDirectories.map(checkDirectory),
  ...requiredFiles.map(checkFile),
  ...Object.entries(requiredContent).flatMap(([relativePath, snippets]) =>
    checkContent(relativePath, snippets)
  )
];

for (const result of results) {
  printResult(result);
}

const failures = results.filter((result) => !result.ok);

if (failures.length > 0) {
  console.error(`\nStructure verification failed: ${failures.length} check(s) failed.`);
  process.exit(1);
}

console.log("\nStructure verification passed.");
