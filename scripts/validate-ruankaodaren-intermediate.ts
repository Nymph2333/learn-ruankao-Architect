/**
 * Phase 3.1: Intermediate JSON validator for ruankaodaren intermediate documents.
 *
 * Validates against:
 *   1. JSON Schema (schemas/ruankaodaren-intermediate.schema.json) via AJV
 *   2. Invariant checks hardcoded below
 *
 * Usage:
 *   pnpm validate:intermediate
 *   pnpm validate:intermediate -- --file data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json
 *
 * HARD CONSTRAINTS: no OCR, no encrypt=1 decryption, no Markdown generation.
 * This script only reads and validates; it never writes or transforms content.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { RuankaoIntermediateDocument } from "../packages/domain-types/ruankaodaren-intermediate.js";

// ---------------------------------------------------------------------------
// AJV CJS interop
// AJV v8 and ajv-formats have no "exports" in package.json.
// createRequire avoids TypeScript NodeNext ESM/CJS default import failures.
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
const AjvCtor = (((_require("ajv") as any).default ?? _require("ajv")) as AjvConstructor);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = (((_require("ajv-formats") as any).default ?? _require("ajv-formats")) as AddFormatsFn);

// ---------------------------------------------------------------------------

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const VALID_CLASSIFICATIONS = new Set([
  "TEXT_DOM",
  "HTML_RICH_TEXT",
  "IMAGE_EMBEDDED",
  "MIXED_TEXT_IMAGE",
  "UNSTABLE_OR_INCOMPLETE",
]);

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { file?: string } {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--file");
  if (idx !== -1 && args[idx + 1]) {
    return { file: args[idx + 1] };
  }
  return {};
}

// ---------------------------------------------------------------------------
// AJV schema compilation
// ---------------------------------------------------------------------------

function buildValidator(): (data: unknown) => string[] {
  const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-intermediate.schema.json");
  if (!existsSync(schemaPath)) {
    console.error("[validate] ERROR: schema file not found:", schemaPath);
    process.exit(1);
  }

  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  const ajv: AjvInstance = new AjvCtor({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate: AjvValidateFunction = ajv.compile(schema);

  return (data: unknown): string[] => {
    const valid = validate(data);
    if (valid) return [];
    return (validate.errors ?? []).map(
      (e) => `schema: ${e.instancePath || "root"} ${e.message ?? "invalid"}`
    );
  };
}

// ---------------------------------------------------------------------------
// Invariant checks
// ---------------------------------------------------------------------------

function invariantCheck(doc: RuankaoIntermediateDocument): string[] {
  const errors: string[] = [];

  // source invariants
  if (doc.source?.source_name !== "ruankaodaren") {
    errors.push(`invariant: source.source_name must be "ruankaodaren", got "${doc.source?.source_name}"`);
  }
  if (!doc.source?.timestamp) {
    errors.push("invariant: source.timestamp must be present and non-empty");
  }

  // navigation_context invariants
  if (!doc.navigation_context?.target_node_text) {
    errors.push("invariant: navigation_context.target_node_text must be present and non-empty");
  }

  // content invariants
  if (!doc.content?.title) {
    errors.push("invariant: content.title must be present and non-null/empty");
  }
  if (!Array.isArray(doc.content?.text_blocks)) {
    errors.push("invariant: content.text_blocks must be an array");
  }
  if (!Array.isArray(doc.content?.image_refs)) {
    errors.push("invariant: content.image_refs must be an array");
  }

  // classification invariants
  const cls = doc.classification?.content_source_classification;
  if (!VALID_CLASSIFICATIONS.has(cls)) {
    errors.push(`invariant: classification.content_source_classification "${cls}" is not a valid value`);
  }

  // hard constraint invariants — these must NEVER be true
  if (doc.constraints?.ocr_used !== false) {
    errors.push("invariant: constraints.ocr_used must be false");
  }
  if (doc.constraints?.encrypted_xhr_decrypted !== false) {
    errors.push("invariant: constraints.encrypted_xhr_decrypted must be false");
  }
  if (doc.constraints?.image_table_reconstructed !== false) {
    errors.push("invariant: constraints.image_table_reconstructed must be false");
  }
  if (doc.constraints?.markdown_generated !== false) {
    errors.push("invariant: constraints.markdown_generated must be false");
  }

  // MIXED_TEXT_IMAGE extra invariants
  if (cls === "MIXED_TEXT_IMAGE") {
    if (!doc.content?.image_refs || doc.content.image_refs.length < 1) {
      errors.push("invariant[MIXED_TEXT_IMAGE]: image_refs.length must be >= 1");
    }
    if (doc.classification?.requires_manual_review !== true) {
      errors.push("invariant[MIXED_TEXT_IMAGE]: requires_manual_review must be true");
    }
    if (!doc.classification?.manual_review_reasons || doc.classification.manual_review_reasons.length === 0) {
      errors.push("invariant[MIXED_TEXT_IMAGE]: manual_review_reasons must be non-empty");
    }
    if (doc.classification?.parser_confidence === "high") {
      errors.push(
        "invariant[MIXED_TEXT_IMAGE]: parser_confidence must not be 'high' for MIXED_TEXT_IMAGE (image content unverified)"
      );
    }
  }

  // image_ref field invariants
  for (let i = 0; i < (doc.content?.image_refs?.length ?? 0); i++) {
    const ref = doc.content.image_refs[i];
    if (ref.src === undefined || ref.src === null) {
      errors.push(`invariant: image_refs[${i}].src must be present`);
    }
    if (typeof ref.order !== "number") {
      errors.push(`invariant: image_refs[${i}].order must be a number`);
    }
    if (!ref.asset_status) {
      errors.push(`invariant: image_refs[${i}].asset_status must be present`);
    }
    if (ref.requires_manual_review !== true) {
      errors.push(`invariant: image_refs[${i}].requires_manual_review must be true`);
    }
    if (!ref.manual_review_reason) {
      errors.push(`invariant: image_refs[${i}].manual_review_reason must be present and non-empty`);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// File resolution
// ---------------------------------------------------------------------------

function resolveTargetFiles(fileArg?: string): string[] {
  if (fileArg) {
    const abs = resolve(repoRoot, fileArg);
    if (!existsSync(abs)) {
      console.error("[validate] ERROR: file not found:", abs);
      console.error("[validate] Run pnpm parse:ruankaodaren first to generate intermediate samples.");
      process.exit(1);
    }
    return [abs];
  }

  const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
  if (!existsSync(samplesDir)) {
    console.error("[validate] ERROR: samples directory not found:", samplesDir);
    console.error("[validate] Run pnpm parse:ruankaodaren first to generate intermediate samples.");
    process.exit(1);
  }

  const files = readdirSync(samplesDir)
    .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
    .map((f) => resolve(samplesDir, f));

  if (files.length === 0) {
    console.error("[validate] ERROR: no intermediate JSON files found in", samplesDir);
    console.error("[validate] Run pnpm parse:ruankaodaren first to generate intermediate samples.");
    process.exit(1);
  }

  return files;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { file: fileArg } = parseArgs();
const schemaValidate = buildValidator();
const targetFiles = resolveTargetFiles(fileArg);

let anyFailed = false;
let failCount = 0;

console.log(`[validate] validating ${targetFiles.length} file(s)...\n`);

for (const filePath of targetFiles) {
  const raw = readFileSync(filePath, "utf8");
  const doc = JSON.parse(raw) as RuankaoIntermediateDocument;

  const schemaErrors = schemaValidate(doc);
  const invariantErrors = invariantCheck(doc);
  const allErrors = [...schemaErrors, ...invariantErrors];

  const title = doc.content?.title ?? "(no title)";
  const cls = doc.classification?.content_source_classification ?? "(unknown)";
  const imageCount = doc.content?.image_refs?.length ?? 0;
  const textBlockCount = doc.content?.text_blocks?.length ?? 0;
  const keyTermCount = doc.content?.key_terms?.length ?? 0;

  if (allErrors.length > 0) {
    console.error(`[FAIL] ${filePath}`);
    for (const err of allErrors) {
      console.error(`  ✗ ${err}`);
    }
    anyFailed = true;
    failCount++;
  } else {
    console.log(`[PASS] ${filePath}`);
    console.log(`  title:          ${title}`);
    console.log(`  classification: ${cls}`);
    console.log(`  text_blocks:    ${textBlockCount}`);
    console.log(`  key_terms:      ${keyTermCount}`);
    console.log(`  image_refs:     ${imageCount}`);
    console.log(`  constraints:    ocr_used=${doc.constraints.ocr_used}  encrypted_xhr_decrypted=${doc.constraints.encrypted_xhr_decrypted}  image_table_reconstructed=${doc.constraints.image_table_reconstructed}  markdown_generated=${doc.constraints.markdown_generated}`);
  }
  console.log();
}

console.log(`Validated: ${targetFiles.length} file(s). Failures: ${failCount}/${targetFiles.length}`);

if (anyFailed) {
  console.error("[validate] Validation failed. Fix errors above.");
  process.exit(1);
}

console.log("[validate] All files passed schema and invariant checks.");
console.log("[validate] Semantic alignment is not checked here; run pnpm audit:semantic-alignment.");
