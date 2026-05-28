/**
 * Phase 3.25: Renderer input contract validator.
 *
 * Validates verification/generated/phase3_25_renderer_input_contract.json
 * against JSON Schema and explicit invariants. This script does not implement
 * a renderer and does not generate Markdown knowledge documents.
 *
 * Usage:
 *   pnpm validate:renderer-input-contract
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type {
  RuankaoRendererForbiddenInput,
  RuankaoRendererInputContract,
  RuankaoRenderAs,
} from "../packages/domain-types/ruankaodaren-renderer-input-contract.js";

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

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-renderer-input-contract.schema.json");
const contractPath = resolve(repoRoot, "verification/generated/phase3_25_renderer_input_contract.json");

const REQUIRED_FORBIDDEN_INPUTS: RuankaoRendererForbiddenInput[] = [
  "ocr",
  "encrypted_xhr_decryption",
  "image_table_reconstruction",
  "content_invention",
  "raw_xhr_direct_read",
  "web_requests",
];

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function buildSchemaValidator(): (data: unknown) => string[] {
  if (!existsSync(schemaPath)) {
    console.error("[validate:renderer-input-contract] ERROR: schema file not found:", schemaPath);
    process.exit(1);
  }

  const schema = readJson<object>(schemaPath);
  const ajv: AjvInstance = new AjvCtor({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate: AjvValidateFunction = ajv.compile(schema);

  return (data: unknown): string[] => {
    if (validate(data)) return [];
    return (validate.errors ?? []).map(
      (error) => `schema: ${error.instancePath || "root"} ${error.message ?? "invalid"}`
    );
  };
}

function invariantCheck(contract: RuankaoRendererInputContract): string[] {
  const errors: string[] = [];

  if (!contract.contract_version) errors.push("invariant: contract_version must exist");
  if (contract.baseline_items.length < 3) errors.push("invariant: baseline_items.length must be >= 3");

  const titles = contract.baseline_items.map((item) => item.canonical_title);
  if (new Set(titles).size !== titles.length) {
    errors.push("invariant: canonical_title must be unique across baseline_items");
  }

  for (const required of REQUIRED_FORBIDDEN_INPUTS) {
    if (!contract.renderer_input_policy.forbidden_inputs.includes(required)) {
      errors.push(`invariant: forbidden_inputs must include ${required}`);
    }
  }

  for (const item of contract.baseline_items) {
    const prefix = `baseline_items[${item.canonical_title}]`;
    if (item.constraints.ocr_used !== false) errors.push(`invariant: ${prefix}.constraints.ocr_used must be false`);
    if (item.constraints.encrypted_xhr_decrypted !== false) {
      errors.push(`invariant: ${prefix}.constraints.encrypted_xhr_decrypted must be false`);
    }
    if (item.constraints.image_table_reconstructed !== false) {
      errors.push(`invariant: ${prefix}.constraints.image_table_reconstructed must be false`);
    }
    if (item.constraints.markdown_generated !== false) {
      errors.push(`invariant: ${prefix}.constraints.markdown_generated must be false`);
    }
    if (!item.renderer_policy.render_as) {
      errors.push(`invariant: ${prefix}.renderer_policy.render_as must exist`);
    }
    if (item.renderer_policy.preserve_asset_refs === true && !item.asset_manifest_path && item.manual_review_required !== true) {
      errors.push(
        `invariant: ${prefix} preserve_asset_refs=true requires asset_manifest_path or manual_review_required=true`
      );
    }
  }

  if (contract.phase4_entry_conditions.unique_baseline_titles_actual !== contract.baseline_items.length) {
    errors.push(
      "invariant: phase4_entry_conditions.unique_baseline_titles_actual must equal baseline_items.length"
    );
  }
  if (contract.phase4_allowed !== true) {
    errors.push("invariant: phase4_allowed must be true for the frozen Phase 3.25 contract");
  }
  if (contract.phase4_entry_conditions.renderer_baseline_manifest_ready !== true) {
    errors.push("invariant: renderer_baseline_manifest_ready must be true");
  }
  if (contract.phase4_entry_conditions.all_items_have_renderer_policy !== true) {
    errors.push("invariant: all_items_have_renderer_policy must be true");
  }
  if (contract.phase4_entry_conditions.all_constraints_safe !== true) {
    errors.push("invariant: all_constraints_safe must be true");
  }

  return errors;
}

function countByRenderAs(contract: RuankaoRendererInputContract): Record<RuankaoRenderAs, number> {
  const result = {
    short_card: 0,
    asset_card: 0,
    concept_card: 0,
    manual_review_card: 0,
  } satisfies Record<RuankaoRenderAs, number>;

  for (const item of contract.baseline_items) {
    result[item.renderer_policy.render_as] += 1;
  }

  return result;
}

function main(): void {
  if (!existsSync(contractPath)) {
    console.error(
      "[validate:renderer-input-contract] ERROR: contract file not found. Run pnpm build:renderer-input-contract first."
    );
    process.exit(1);
  }

  const contract = readJson<RuankaoRendererInputContract>(contractPath);
  const schemaErrors = buildSchemaValidator()(contract);
  const invariantErrors = invariantCheck(contract);
  const errors = [...schemaErrors, ...invariantErrors];

  if (errors.length > 0) {
    console.error("[validate:renderer-input-contract] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  const distribution = countByRenderAs(contract);

  console.log("[validate:renderer-input-contract] Contract validation passed");
  console.log(`  baseline item count:       ${contract.baseline_items.length}`);
  console.log(`  canonical titles:          ${contract.baseline_items.map((item) => item.canonical_title).join(", ")}`);
  console.log(`  render_as distribution:    ${JSON.stringify(distribution)}`);
  console.log(
    `  forbidden input checks:    ${REQUIRED_FORBIDDEN_INPUTS.map((input) => `${input}=present`).join(", ")}`
  );
  console.log(`  phase4_allowed:            ${contract.phase4_allowed}`);
  console.log(
    `  entry conditions:          unique=${contract.phase4_entry_conditions.unique_baseline_titles_actual}/${contract.phase4_entry_conditions.unique_baseline_titles_min}, manifest_ready=${contract.phase4_entry_conditions.renderer_baseline_manifest_ready}, policies=${contract.phase4_entry_conditions.all_items_have_renderer_policy}, constraints=${contract.phase4_entry_conditions.all_constraints_safe}`
  );
}

main();
