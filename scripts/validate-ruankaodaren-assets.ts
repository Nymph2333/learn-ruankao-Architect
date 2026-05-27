/**
 * Phase 2.15: Asset manifest validator for ruankaodaren.
 *
 * Validates manifest JSON files against:
 *   1. JSON Schema (schemas/ruankaodaren-asset-manifest.schema.json) via AJV
 *   2. Invariant checks (constraints, file existence, SHA-256 verification)
 *
 * Usage:
 *   pnpm validate:assets
 *   pnpm validate:assets -- --file sources/ruankaodaren/raw/assets/manifests/2026-05-26T09-40-21-903Z.json
 *
 * HARD CONSTRAINTS: no OCR, no decryption, no Markdown generation.
 * This script only reads and verifies; it never writes or transforms content.
 */

import { existsSync, readFileSync, readdirSync, createReadStream } from "node:fs";
import { resolve, relative } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import type {
  RuankaoAssetManifest,
  RuankaoCapturedAsset,
} from "../packages/domain-types/ruankaodaren-asset-manifest.js";

// ---------------------------------------------------------------------------
// AJV CJS interop
// ---------------------------------------------------------------------------

const _require = createRequire(import.meta.url);

interface AjvError {
  instancePath: string;
  message?: string;
}
interface AjvValidateFunction {
  (data: unknown): boolean;
  errors?: AjvError[] | null;
}
interface AjvInstance {
  compile(schema: object): AjvValidateFunction;
}
type AjvConstructor = new (opts: Record<string, unknown>) => AjvInstance;
type AddFormatsFn = (ajv: AjvInstance) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AjvCtor = ((_require("ajv") as any).default ?? _require("ajv")) as AjvConstructor;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = ((_require("ajv-formats") as any).default ?? _require("ajv-formats")) as AddFormatsFn;

// ---------------------------------------------------------------------------

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { file?: string } {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--file");
  if (idx !== -1 && args[idx + 1]) return { file: args[idx + 1] };
  return {};
}

// ---------------------------------------------------------------------------
// AJV setup
// ---------------------------------------------------------------------------

function buildValidator(): (data: unknown) => string[] {
  const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-asset-manifest.schema.json");
  if (!existsSync(schemaPath)) {
    console.error("[validate:assets] ERROR: schema not found:", schemaPath);
    process.exit(1);
  }
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  const ajv: AjvInstance = new AjvCtor({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate: AjvValidateFunction = ajv.compile(schema);
  return (data: unknown): string[] => {
    if (validate(data)) return [];
    return (validate.errors ?? []).map(
      (e) => `schema: ${e.instancePath || "root"} ${e.message ?? "invalid"}`
    );
  };
}

// ---------------------------------------------------------------------------
// SHA-256 computation (sync from buffer)
// ---------------------------------------------------------------------------

function computeSha256File(absPath: string): string {
  const buf = readFileSync(absPath);
  return createHash("sha256").update(buf).digest("hex");
}

// ---------------------------------------------------------------------------
// Invariant checks
// ---------------------------------------------------------------------------

function invariantCheck(manifest: RuankaoAssetManifest, manifestPath: string): string[] {
  const errors: string[] = [];

  if (manifest.source_name !== "ruankaodaren") {
    errors.push(`invariant: source_name must be "ruankaodaren", got "${manifest.source_name}"`);
  }
  if (manifest.asset_count !== manifest.assets.length) {
    errors.push(
      `invariant: asset_count (${manifest.asset_count}) must equal assets.length (${manifest.assets.length})`
    );
  }

  // Top-level constraints
  if (manifest.constraints?.ocr_used !== false) errors.push("invariant: constraints.ocr_used must be false");
  if (manifest.constraints?.image_table_reconstructed !== false)
    errors.push("invariant: constraints.image_table_reconstructed must be false");
  if (manifest.constraints?.markdown_generated !== false)
    errors.push("invariant: constraints.markdown_generated must be false");
  if (manifest.constraints?.encrypted_xhr_decrypted !== false)
    errors.push("invariant: constraints.encrypted_xhr_decrypted must be false");

  for (let i = 0; i < manifest.assets.length; i++) {
    const asset: RuankaoCapturedAsset = manifest.assets[i];
    const prefix = `assets[${i}] (order=${asset.order})`;

    // Per-asset constraint checks
    if (asset.ocr_used !== false) errors.push(`invariant: ${prefix}.ocr_used must be false`);
    if (asset.image_table_reconstructed !== false)
      errors.push(`invariant: ${prefix}.image_table_reconstructed must be false`);
    if (asset.requires_manual_review !== true)
      errors.push(`invariant: ${prefix}.requires_manual_review must be true`);
    if (!asset.manual_review_reason)
      errors.push(`invariant: ${prefix}.manual_review_reason must be non-empty`);

    // For downloaded assets: verify file exists and SHA-256 matches
    if (asset.asset_status === "downloaded") {
      if (!asset.saved_path) {
        errors.push(`invariant: ${prefix}.saved_path must be set for downloaded asset`);
      } else {
        const absPath = resolve(repoRoot, asset.saved_path);
        if (!existsSync(absPath)) {
          errors.push(`invariant: ${prefix} saved_path file does not exist: ${asset.saved_path}`);
        } else {
          const actualSha256 = computeSha256File(absPath);
          if (actualSha256 !== asset.sha256) {
            errors.push(
              `invariant: ${prefix} sha256 mismatch: manifest=${asset.sha256} actual=${actualSha256}`
            );
          }
        }
      }
      if (!asset.sha256) errors.push(`invariant: ${prefix}.sha256 must be set for downloaded asset`);
      if (asset.size_bytes == null) errors.push(`invariant: ${prefix}.size_bytes must be set for downloaded asset`);
      if (!asset.content_type) errors.push(`invariant: ${prefix}.content_type must be set for downloaded asset`);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// File resolution
// ---------------------------------------------------------------------------

function resolveManifests(fileArg?: string): string[] {
  if (fileArg) {
    const abs = resolve(repoRoot, fileArg);
    if (!existsSync(abs)) {
      console.error("[validate:assets] ERROR: file not found:", abs);
      console.error("[validate:assets] Run pnpm capture:assets first.");
      process.exit(1);
    }
    return [abs];
  }
  const dir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");
  if (!existsSync(dir)) {
    console.error("[validate:assets] ERROR: manifests directory not found:", dir);
    process.exit(1);
  }
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
    .map((f) => resolve(dir, f));
  if (files.length === 0) {
    console.error("[validate:assets] ERROR: no manifest JSON files found.");
    console.error("[validate:assets] Run pnpm capture:assets first.");
    process.exit(1);
  }
  return files;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { file: fileArg } = parseArgs();
const schemaValidate = buildValidator();
const manifests = resolveManifests(fileArg);

let anyFailed = false;
let failCount = 0;

console.log(`[validate:assets] Validating ${manifests.length} manifest(s)...\n`);

for (const manifestPath of manifests) {
  const rel = relative(repoRoot, manifestPath).replace(/\\/g, "/");
  const raw = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as RuankaoAssetManifest;

  const schemaErrors = schemaValidate(manifest);
  const invErrors = invariantCheck(manifest, manifestPath);
  const allErrors = [...schemaErrors, ...invErrors];

  if (allErrors.length > 0) {
    console.error(`[FAIL] ${rel}`);
    for (const err of allErrors) {
      console.error(`  ✗ ${err}`);
    }
    anyFailed = true;
    failCount++;
  } else {
    const downloaded = manifest.assets.filter((a) => a.asset_status === "downloaded");
    const failed = manifest.assets.filter((a) => a.asset_status === "download_failed");
    console.log(`[PASS] ${rel}`);
    console.log(`  source_title:    ${manifest.source_title}`);
    console.log(`  source_timestamp: ${manifest.source_timestamp}`);
    console.log(`  asset_count:     ${manifest.asset_count}`);
    console.log(`  downloaded:      ${downloaded.length}`);
    console.log(`  failed:          ${failed.length}`);
    for (const asset of downloaded) {
      console.log(`  [asset order=${asset.order}]`);
      console.log(`    saved_path:   ${asset.saved_path}`);
      console.log(`    sha256:       ${asset.sha256}`);
      console.log(`    size_bytes:   ${asset.size_bytes}`);
      console.log(`    content_type: ${asset.content_type}`);
      console.log(`    dimensions:   ${asset.width ?? "?"}x${asset.height ?? "?"}${asset.dimension_error ? " (error: " + asset.dimension_error + ")" : ""}`);
    }
    console.log(`  constraints:     ocr_used=${manifest.constraints.ocr_used}  image_table_reconstructed=${manifest.constraints.image_table_reconstructed}  markdown_generated=${manifest.constraints.markdown_generated}  encrypted_xhr_decrypted=${manifest.constraints.encrypted_xhr_decrypted}`);
  }
  console.log();
}

console.log(`Validated: ${manifests.length} manifest(s). Failures: ${failCount}/${manifests.length}`);

if (anyFailed) {
  console.error("[validate:assets] Validation failed. Fix errors above.");
  process.exit(1);
}

console.log("[validate:assets] All manifests passed schema and invariant checks.");
