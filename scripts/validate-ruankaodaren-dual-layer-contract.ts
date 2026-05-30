/**
 * Phase 5.0 dual-layer document contract validator.
 *
 * Validates the schema and contract artifacts only. It intentionally does not
 * generate dual-layer document instances, AI learning content, source packets,
 * official Markdown, crawler output, or renderer output.
 *
 * Usage:
 *   pnpm validate:dual-layer-contract
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);

interface AjvError {
  instancePath?: string;
  schemaPath?: string;
  message?: string;
}

interface AjvInstance {
  compile(schema: object): unknown;
  validateSchema(schema: object): boolean | Promise<boolean>;
  errors?: AjvError[] | null;
}

type AjvConstructor = new (opts: Record<string, unknown>) => AjvInstance;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AjvCtor = (((_require("ajv") as any).default ?? _require("ajv")) as AjvConstructor);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-dual-layer-document.schema.json");
const contractDocPath = resolve(repoRoot, "verification/phase5_0_source_ai_dual_layer_contract_check.md");

type JsonObject = Record<string, unknown>;

function fail(message: string): never {
  console.error(`[validate:dual-layer-contract] ERROR: ${message}`);
  process.exit(1);
}

function readJson(absPath: string): JsonObject {
  return JSON.parse(readFileSync(absPath, "utf8")) as JsonObject;
}

function asObject(value: unknown, path: string): JsonObject {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }
  fail(`${path} must be an object`);
}

function asStringArray(value: unknown, path: string): string[] {
  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
    return value;
  }
  fail(`${path} must be a string array`);
}

function getDef(schema: JsonObject, name: string): JsonObject {
  const defs = asObject(schema.$defs, "$defs");
  return asObject(defs[name], `$defs.${name}`);
}

function getProperties(definition: JsonObject, path: string): JsonObject {
  return asObject(definition.properties, `${path}.properties`);
}

function formatAjvErrors(errors: AjvError[] | null | undefined): string[] {
  return (errors ?? []).map((error) => {
    const location = error.instancePath || error.schemaPath || "schema";
    return `${location} ${error.message ?? "invalid"}`;
  });
}

function assertIncludesAll(actual: string[], required: string[], label: string, errors: string[]): void {
  for (const item of required) {
    if (!actual.includes(item)) errors.push(`${label} missing required field: ${item}`);
  }
}

function invariantCheck(schema: JsonObject): string[] {
  const errors: string[] = [];

  const topRequired = asStringArray(schema.required, "schema.required");
  assertIncludesAll(topRequired, ["source_layer", "ai_learning_layer", "review", "taxonomy"], "schema.required", errors);

  const topProperties = getProperties(schema, "schema");
  if (!topProperties.source_layer) errors.push("schema.properties.source_layer missing");
  if (!topProperties.ai_learning_layer) errors.push("schema.properties.ai_learning_layer missing");
  if (schema.additionalProperties !== false) errors.push("schema.additionalProperties must be false");

  const taxonomy = getDef(schema, "RuankaoTaxonomyInfo");
  const taxonomyRequired = asStringArray(taxonomy.required, "$defs.RuankaoTaxonomyInfo.required");
  const taxonomyProperties = getProperties(taxonomy, "$defs.RuankaoTaxonomyInfo");
  if (!taxonomyRequired.includes("taxonomy_suspect")) {
    errors.push("taxonomy_suspect must be required in taxonomy");
  }
  if (!taxonomyProperties.taxonomy_suspect) {
    errors.push("taxonomy_suspect property missing in taxonomy");
  }

  const sourceLayer = getDef(schema, "RuankaoSourceLayer");
  const sourceRequired = asStringArray(sourceLayer.required, "$defs.RuankaoSourceLayer.required");
  const sourceProperties = getProperties(sourceLayer, "$defs.RuankaoSourceLayer");
  assertIncludesAll(
    sourceRequired,
    ["source_content_type", "source_text_blocks", "source_key_terms", "asset_refs", "source_paths", "source_integrity", "constraints"],
    "$defs.RuankaoSourceLayer.required",
    errors
  );
  for (const aiOnlyField of ["ai_generated", "generation_status", "allowed_sections", "source_dependency", "review_status"]) {
    if (sourceProperties[aiOnlyField]) errors.push(`source_layer must not contain AI-only field: ${aiOnlyField}`);
  }
  if (sourceLayer.additionalProperties !== false) {
    errors.push("source_layer.additionalProperties must be false");
  }

  const aiLayer = getDef(schema, "RuankaoAiLearningLayer");
  const aiRequired = asStringArray(aiLayer.required, "$defs.RuankaoAiLearningLayer.required");
  const aiProperties = getProperties(aiLayer, "$defs.RuankaoAiLearningLayer");
  assertIncludesAll(
    aiRequired,
    ["ai_generated", "generation_status", "allowed_sections", "source_dependency", "review_status"],
    "$defs.RuankaoAiLearningLayer.required",
    errors
  );
  for (const sourceOnlyField of ["source_text_blocks", "source_key_terms", "asset_refs", "source_paths", "source_integrity", "constraints"]) {
    if (aiProperties[sourceOnlyField]) errors.push(`ai_learning_layer must not contain source-only field: ${sourceOnlyField}`);
  }
  const aiGenerated = asObject(aiProperties.ai_generated, "$defs.RuankaoAiLearningLayer.properties.ai_generated");
  if (aiGenerated.const !== true) errors.push("ai_learning_layer.ai_generated must exist and be const true");
  const generationStatus = asObject(aiProperties.generation_status, "$defs.RuankaoAiLearningLayer.properties.generation_status");
  if (generationStatus.default === "generated") {
    errors.push("generation_status default must not be generated");
  }
  if (generationStatus.default !== "not_generated") {
    errors.push("generation_status default must be not_generated");
  }
  if (aiLayer.additionalProperties !== false) {
    errors.push("ai_learning_layer.additionalProperties must be false");
  }

  const sourceConstraints = getDef(schema, "RuankaoSourceConstraints");
  const constraintRequired = asStringArray(sourceConstraints.required, "$defs.RuankaoSourceConstraints.required");
  const constraintProperties = getProperties(sourceConstraints, "$defs.RuankaoSourceConstraints");
  const requiredConstraintFlags = [
    "ocr_used",
    "encrypted_xhr_decrypted",
    "image_table_reconstructed",
    "raw_html_used_by_renderer",
    "raw_xhr_used_by_renderer",
  ];
  assertIncludesAll(constraintRequired, requiredConstraintFlags, "$defs.RuankaoSourceConstraints.required", errors);
  for (const flag of requiredConstraintFlags) {
    const flagSchema = asObject(constraintProperties[flag], `$defs.RuankaoSourceConstraints.properties.${flag}`);
    if (flagSchema.const !== false) errors.push(`${flag} must be const false`);
  }

  const review = getDef(schema, "RuankaoDualLayerReview");
  const reviewRequired = asStringArray(review.required, "$defs.RuankaoDualLayerReview.required");
  const reviewProperties = getProperties(review, "$defs.RuankaoDualLayerReview");
  assertIncludesAll(reviewRequired, ["source_fidelity_review", "ai_pedagogy_review", "release_status"], "$defs.RuankaoDualLayerReview.required", errors);
  const releaseStatus = asObject(reviewProperties.release_status, "$defs.RuankaoDualLayerReview.properties.release_status");
  if (releaseStatus.default === "ready") errors.push("review.release_status default must not be ready");
  if (releaseStatus.default !== "not_ready") errors.push("review.release_status default must be not_ready");

  return errors;
}

function main(): void {
  if (!existsSync(schemaPath)) fail("dual-layer document schema missing");
  if (!existsSync(contractDocPath)) fail("Phase 5.0 contract check document missing");

  const schema = readJson(schemaPath);
  const ajv = new AjvCtor({ allErrors: true, strict: false });
  const schemaIsValid = ajv.validateSchema(schema);
  if (schemaIsValid !== true) {
    const details = formatAjvErrors(ajv.errors).join("\n  - ");
    fail(`schema meta-validation failed${details ? `:\n  - ${details}` : ""}`);
  }

  try {
    ajv.compile(schema);
  } catch (error) {
    fail(`AJV could not compile schema: ${error instanceof Error ? error.message : String(error)}`);
  }

  const errors = invariantCheck(schema);
  if (errors.length > 0) {
    console.error("[validate:dual-layer-contract] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:dual-layer-contract] Phase 5.0 dual-layer contract validation passed");
  console.log(`  schema:        ${schemaPath}`);
  console.log(`  contract_doc:  ${contractDocPath}`);
  console.log("  instances:     not generated");
  console.log("  ai_content:    not generated");
}

main();
