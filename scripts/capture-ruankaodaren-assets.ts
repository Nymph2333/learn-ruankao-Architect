/**
 * Phase 2.15: Asset capture for ruankaodaren image_refs.
 *
 * Reads intermediate JSON documents, downloads referenced images,
 * hashes them, records dimensions, and writes an asset manifest.
 *
 * Usage:
 *   pnpm capture:assets
 *   pnpm capture:assets -- --file data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json
 *
 * HARD CONSTRAINTS (never violated by this script):
 *   - No OCR
 *   - No encrypt=1 decryption
 *   - No Markdown generation
 *   - No image table reconstruction
 *   - No forged API requests — only fetch URLs found in image_refs[].src
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";
import type {
  RuankaoAssetManifest,
  RuankaoCapturedAsset,
  RuankaoAssetConstraints,
} from "../packages/domain-types/ruankaodaren-asset-manifest.js";

// ---------------------------------------------------------------------------
// image-size CJS interop (v1.x is CJS-only)
// ---------------------------------------------------------------------------

const _require = createRequire(import.meta.url);

interface ImageDimensions {
  width?: number;
  height?: number;
  type?: string;
}
type ImageSizeFn = (buf: Buffer) => ImageDimensions;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const imageSizeMod = _require("image-size") as any;
const imageSizeFn: ImageSizeFn = (imageSizeMod.default ?? imageSizeMod) as ImageSizeFn;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const IMAGES_DIR = resolve(repoRoot, "sources/ruankaodaren/raw/assets/images");
const MANIFESTS_DIR = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");

const HARD_CONSTRAINTS: RuankaoAssetConstraints = {
  ocr_used: false,
  image_table_reconstructed: false,
  markdown_generated: false,
  encrypted_xhr_decrypted: false,
};

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(): { file?: string } {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--file");
  if (idx !== -1 && args[idx + 1]) return { file: args[idx + 1] };
  return {};
}

function resolveIntermediateFiles(fileArg?: string): string[] {
  if (fileArg) {
    const abs = resolve(repoRoot, fileArg);
    if (!existsSync(abs)) {
      console.error("[capture] ERROR: file not found:", abs);
      console.error("[capture] Run pnpm parse:ruankaodaren first.");
      process.exit(1);
    }
    return [abs];
  }
  const dir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
  if (!existsSync(dir)) {
    console.error("[capture] ERROR: samples directory not found:", dir);
    process.exit(1);
  }
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
    .map((f) => resolve(dir, f));
  if (files.length === 0) {
    console.error("[capture] ERROR: no intermediate JSON files found. Run pnpm parse:ruankaodaren first.");
    process.exit(1);
  }
  return files;
}

function inferExtension(contentType: string, url: string): string {
  const ct = contentType.split(";")[0].trim().toLowerCase();
  if (CONTENT_TYPE_EXT[ct]) return CONTENT_TYPE_EXT[ct];

  // Scan URL pathname for known image extensions
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = /\.(jpe?g|png|webp|gif|svg)(?:[^a-z]|$)/i.exec(pathname);
    if (match) {
      const raw = match[1].toLowerCase();
      return "." + (raw === "jpeg" ? "jpg" : raw);
    }
  } catch {
    // invalid URL — fall through
  }
  return ".bin";
}

async function downloadImage(
  url: string
): Promise<{ buffer: Buffer; contentType: string } | { error: string }> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ruankao-asset-capture/1.0; +https://github.com/)",
        Accept: "image/*,*/*",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!resp.ok) {
      return { error: `HTTP ${resp.status} ${resp.statusText}` };
    }
    const contentType = resp.headers.get("content-type") ?? "application/octet-stream";
    const arrayBuf = await resp.arrayBuffer();
    return { buffer: Buffer.from(arrayBuf), contentType };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function computeSha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function getImageDimensions(buf: Buffer): { width: number | null; height: number | null; dimension_error: string | null } {
  try {
    const dims = imageSizeFn(buf);
    return {
      width: dims.width ?? null,
      height: dims.height ?? null,
      dimension_error: null,
    };
  } catch (err: unknown) {
    return {
      width: null,
      height: null,
      dimension_error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Process one intermediate file
// ---------------------------------------------------------------------------

async function processIntermediate(filePath: string): Promise<void> {
  const relPath = relative(repoRoot, filePath).replace(/\\/g, "/");
  console.log(`\n[capture] Processing: ${relPath}`);

  const doc = JSON.parse(readFileSync(filePath, "utf8")) as RuankaoIntermediateDocument;
  const imageRefs = doc.content?.image_refs ?? [];

  const sourceTitle = doc.content?.title ?? "(unknown)";
  const sourceTimestamp = doc.source?.timestamp ?? new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-");
  const capturedAt = new Date().toISOString();

  if (imageRefs.length === 0) {
    console.log("[capture] No image_refs found. Generating empty manifest.");
    const manifest: RuankaoAssetManifest = {
      source_name: "ruankaodaren",
      source_intermediate_path: relPath,
      source_title: sourceTitle,
      source_timestamp: sourceTimestamp,
      captured_at: capturedAt,
      asset_count: 0,
      assets: [],
      constraints: HARD_CONSTRAINTS,
    };
    writeManifest(sourceTimestamp, manifest);
    return;
  }

  const assets: RuankaoCapturedAsset[] = [];
  let downloadedCount = 0;
  let failedCount = 0;

  for (const ref of imageRefs) {
    const order = ref.order;
    const src = ref.src ?? "";

    // Skip non-http/https and empty/data URLs
    if (!src || src.startsWith("data:")) {
      console.log(`  [skip] order=${order} src="${src.slice(0, 60)}" — skipped (not an HTTP URL)`);
      assets.push({
        order,
        original_url: src,
        saved_path: null,
        sha256: null,
        size_bytes: null,
        content_type: null,
        width: null,
        height: null,
        dimension_error: null,
        surrounding_text: ref.surrounding_text ?? null,
        asset_status: "skipped",
        error_message: "not an HTTP/HTTPS URL",
        requires_manual_review: true,
        manual_review_reason: ref.manual_review_reason ?? "image may contain table or non-text instructional content",
        ocr_used: false,
        image_table_reconstructed: false,
      });
      continue;
    }
    if (!src.startsWith("http://") && !src.startsWith("https://")) {
      console.log(`  [skip] order=${order} — not http/https`);
      assets.push({
        order,
        original_url: src,
        saved_path: null,
        sha256: null,
        size_bytes: null,
        content_type: null,
        width: null,
        height: null,
        dimension_error: null,
        surrounding_text: ref.surrounding_text ?? null,
        asset_status: "skipped",
        error_message: "not an HTTP/HTTPS URL",
        requires_manual_review: true,
        manual_review_reason: ref.manual_review_reason ?? "image may contain table or non-text instructional content",
        ocr_used: false,
        image_table_reconstructed: false,
      });
      continue;
    }

    console.log(`  [download] order=${order} url=${src}`);
    const result = await downloadImage(src);

    if ("error" in result) {
      console.error(`  [FAIL] order=${order} error: ${result.error}`);
      failedCount++;
      assets.push({
        order,
        original_url: src,
        saved_path: null,
        sha256: null,
        size_bytes: null,
        content_type: null,
        width: null,
        height: null,
        dimension_error: null,
        surrounding_text: ref.surrounding_text ?? null,
        asset_status: "download_failed",
        error_message: result.error,
        requires_manual_review: true,
        manual_review_reason: ref.manual_review_reason ?? "image may contain table or non-text instructional content",
        ocr_used: false,
        image_table_reconstructed: false,
      });
      continue;
    }

    const { buffer, contentType } = result;
    const sha256 = computeSha256(buffer);
    const ext = inferExtension(contentType, src);
    const filename = `${sha256}${ext}`;
    const savedAbsPath = resolve(IMAGES_DIR, filename);
    const savedRelPath = relative(repoRoot, savedAbsPath).replace(/\\/g, "/");

    writeFileSync(savedAbsPath, buffer);

    const dims = getImageDimensions(buffer);

    downloadedCount++;
    console.log(`  [saved]  ${savedRelPath}`);
    console.log(`           sha256=${sha256}`);
    console.log(`           size=${buffer.length} bytes  type=${contentType}`);
    console.log(
      `           dimensions=${dims.width ?? "?"}x${dims.height ?? "?"}${dims.dimension_error ? " (error: " + dims.dimension_error + ")" : ""}`
    );

    assets.push({
      order,
      original_url: src,
      saved_path: savedRelPath,
      sha256,
      size_bytes: buffer.length,
      content_type: contentType,
      width: dims.width,
      height: dims.height,
      dimension_error: dims.dimension_error,
      surrounding_text: ref.surrounding_text ?? null,
      asset_status: "downloaded",
      error_message: null,
      requires_manual_review: true,
      manual_review_reason: ref.manual_review_reason ?? "image may contain table or non-text instructional content",
      ocr_used: false,
      image_table_reconstructed: false,
    });
  }

  const manifest: RuankaoAssetManifest = {
    source_name: "ruankaodaren",
    source_intermediate_path: relPath,
    source_title: sourceTitle,
    source_timestamp: sourceTimestamp,
    captured_at: capturedAt,
    asset_count: assets.length,
    assets,
    constraints: HARD_CONSTRAINTS,
  };

  const manifestPath = writeManifest(sourceTimestamp, manifest);

  console.log(`\n[capture] Summary for "${sourceTitle}":`);
  console.log(`  total image_refs: ${imageRefs.length}`);
  console.log(`  downloaded:       ${downloadedCount}`);
  console.log(`  failed:           ${failedCount}`);
  console.log(`  manifest:         ${manifestPath}`);

  if (failedCount > 0 && downloadedCount === 0) {
    console.error("[capture] All downloads failed. Exiting with error.");
    process.exit(1);
  }
}

function writeManifest(timestamp: string, manifest: RuankaoAssetManifest): string {
  mkdirSync(MANIFESTS_DIR, { recursive: true });
  const filename = `${timestamp}.json`;
  const abs = resolve(MANIFESTS_DIR, filename);
  const rel = relative(repoRoot, abs).replace(/\\/g, "/");
  writeFileSync(abs, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`[capture] Manifest written: ${rel}`);
  return rel;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

mkdirSync(IMAGES_DIR, { recursive: true });
mkdirSync(MANIFESTS_DIR, { recursive: true });

const { file: fileArg } = parseArgs();
const intermediateFiles = resolveIntermediateFiles(fileArg);

console.log(`[capture] Processing ${intermediateFiles.length} intermediate file(s)...`);

for (const f of intermediateFiles) {
  await processIntermediate(f);
}

console.log("\n[capture] Done.");
