/**
 * Phase 3.19 – Detail Content Stabilization Test
 *
 * Tests waitForStableDetailContent() for a single target without generating
 * any formal samples, parsed intermediates, or Markdown docs.
 *
 * Usage:
 *   pnpm test:detail-stabilization -- --target "13.3 软件架构风格"
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(__dirname, "..");
const metadataDir = resolve(repoRoot, "sources/ruankaodaren/raw/metadata");
const generatedDir = resolve(repoRoot, "verification/generated");

interface ParsedArgs {
  target: string;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let target = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target" && i + 1 < args.length) {
      target = args[i + 1] ?? "";
      i++;
    }
  }
  if (!target) {
    console.error("[test:detail-stabilization] ERROR: --target is required");
    process.exit(1);
  }
  return { target };
}

interface CrawlMetadata {
  final_url?: string;
  detail_entry_route_changed?: boolean;
  detail_content_stabilization_attempted?: boolean;
  detail_content_stabilization_status?: string;
  detail_content_stabilization_selector?: string | null;
  detail_content_stabilization_text_length?: number;
  detail_content_stabilization_outer_html_length?: number;
  detail_content_stabilization_img_count?: number;
  detail_content_stabilization_waited_ms?: number;
  detail_content_stabilization_rounds?: unknown[];
  [key: string]: unknown;
}

function safeFilename(title: string): string {
  return title.replace(/[^A-Za-z0-9\u4e00-\u9fff]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
}

function listMetadataFiles(): string[] {
  if (!existsSync(metadataDir)) return [];
  return readdirSync(metadataDir)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

function findNewestMetadataAfter(afterMtime: number): string | null {
  const files = listMetadataFiles();
  let newest: string | null = null;
  let newestMtime = afterMtime;
  for (const file of files) {
    const absPath = resolve(metadataDir, file);
    const mtime = statSync(absPath).mtimeMs;
    if (mtime > newestMtime) {
      newestMtime = mtime;
      newest = absPath;
    }
  }
  return newest;
}

function readJson<T>(absPath: string): T | null {
  if (!existsSync(absPath)) return null;
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch {
    return null;
  }
}

type Recommendation = "safe_for_probe" | "low_text" | "retry_with_longer_wait" | "inspect_container";

function deriveRecommendation(status: string | undefined, textLength: number): Recommendation {
  if (status === "stable_rich") return "safe_for_probe";
  if (status === "stable_with_assets") return "safe_for_probe";
  if (status === "stable_but_low_text") return "low_text";
  if (status === "timeout_no_container") return "inspect_container";
  if (status === "timeout_unstable") return "retry_with_longer_wait";
  if (!status && textLength === 0) return "inspect_container";
  return "retry_with_longer_wait";
}

async function main(): Promise<void> {
  const { target } = parseArgs();
  console.log(`[test:detail-stabilization] target: ${target}`);

  const beforeMtime = Date.now();

  console.log(`[test:detail-stabilization] launching crawler for: ${target}`);
  const result = spawnSync(
    `pnpm crawl:ruankaodaren -- --target "${target}" --require-leaf`,
    { cwd: repoRoot, shell: true, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
  );

  if (result.error) {
    console.error(`[test:detail-stabilization] spawn error: ${result.error.message}`);
    process.exit(1);
  }

  const exitCode = typeof result.status === "number" ? result.status : 1;
  if (exitCode !== 0) {
    const stderr = result.stderr ?? "";
    const stdout = result.stdout ?? "";
    console.error(`[test:detail-stabilization] crawler exited with code ${exitCode}`);
    console.error(stderr.slice(-2000) || stdout.slice(-2000));
    process.exit(1);
  }

  const metadataPath = findNewestMetadataAfter(beforeMtime);
  if (!metadataPath) {
    console.error("[test:detail-stabilization] ERROR: no new metadata file found after crawl");
    process.exit(1);
  }

  console.log(`[test:detail-stabilization] reading metadata: ${basename(metadataPath)}`);
  const metadata = readJson<CrawlMetadata>(metadataPath);
  if (!metadata) {
    console.error("[test:detail-stabilization] ERROR: failed to parse metadata");
    process.exit(1);
  }

  const stabStatus = metadata.detail_content_stabilization_status;
  const stabSelector = metadata.detail_content_stabilization_selector ?? null;
  const stabTextLength = metadata.detail_content_stabilization_text_length ?? 0;
  const stabOuterHtmlLength = metadata.detail_content_stabilization_outer_html_length ?? 0;
  const stabImgCount = metadata.detail_content_stabilization_img_count ?? 0;
  const stabWaitedMs = metadata.detail_content_stabilization_waited_ms ?? 0;
  const stabRounds = metadata.detail_content_stabilization_rounds ?? [];
  const recommendation = deriveRecommendation(stabStatus, stabTextLength);

  const report = {
    target,
    final_url: metadata.final_url ?? null,
    route_changed: metadata.detail_entry_route_changed ?? false,
    stabilization_attempted: metadata.detail_content_stabilization_attempted ?? false,
    stabilization_status: stabStatus ?? null,
    selected_selector: stabSelector,
    text_length: stabTextLength,
    outer_html_length: stabOuterHtmlLength,
    img_count: stabImgCount,
    paragraph_count: 0,
    waited_ms: stabWaitedMs,
    rounds: stabRounds,
    recommendation,
  };

  mkdirSync(generatedDir, { recursive: true });
  const safeTarget = safeFilename(target);
  const jsonPath = resolve(generatedDir, `phase3_19_detail_stabilization_${safeTarget}.json`);
  const mdPath = resolve(generatedDir, `phase3_19_detail_stabilization_${safeTarget}.md`);

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    `# Phase 3.19 Detail Stabilization: ${target}`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `| Field | Value |`,
    `|---|---|`,
    `| target | ${target} |`,
    `| route_changed | ${report.route_changed} |`,
    `| stabilization_status | ${stabStatus ?? "(none)"} |`,
    `| selected_selector | ${stabSelector ?? "(none)"} |`,
    `| text_length | ${stabTextLength} |`,
    `| img_count | ${stabImgCount} |`,
    `| waited_ms | ${stabWaitedMs} |`,
    `| recommendation | ${recommendation} |`,
    "",
    "## Rounds",
    "",
    `Total rounds sampled: ${stabRounds.length}`,
    "",
    "## Constraints",
    "",
    "- No formal samples generated.",
    "- No Markdown docs generated.",
    "- No OCR used.",
    "- No encrypt=1 decrypted.",
    "- No image tables reconstructed.",
    "- No Phase 4 entry.",
    "",
  ];
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  console.log(`[test:detail-stabilization] stabilization_status: ${stabStatus ?? "(none)"}`);
  console.log(`[test:detail-stabilization] selected_selector: ${stabSelector ?? "(none)"}`);
  console.log(`[test:detail-stabilization] text_length: ${stabTextLength}`);
  console.log(`[test:detail-stabilization] img_count: ${stabImgCount}`);
  console.log(`[test:detail-stabilization] waited_ms: ${stabWaitedMs}`);
  console.log(`[test:detail-stabilization] recommendation: ${recommendation}`);
  console.log(`[test:detail-stabilization] JSON: verification/generated/${basename(jsonPath)}`);
  console.log(`[test:detail-stabilization] MD: verification/generated/${basename(mdPath)}`);
}

main().catch((err: unknown) => {
  console.error(`[test:detail-stabilization] ERROR: ${String(err)}`);
  process.exit(1);
});
