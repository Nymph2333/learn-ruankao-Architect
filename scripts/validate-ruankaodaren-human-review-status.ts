/**
 * Phase 4.5 human review status validator.
 *
 * Validates the pending-review signoff package. The validator intentionally
 * rejects machine-generated acceptance in this phase.
 *
 * Usage:
 *   pnpm validate:human-review-status
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type {
  RuankaoHumanReviewRequiredChecks,
  RuankaoHumanReviewStatus,
} from "../packages/domain-types/ruankaodaren-human-review-status.js";

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
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-human-review-status.schema.json");
const statusPath = resolve(repoRoot, "reviews/ruankaodaren/baseline/human-review-status.json");

function fail(message: string): never {
  console.error(`[validate:human-review-status] ERROR: ${message}`);
  process.exit(1);
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function buildSchemaValidator(): (data: unknown) => string[] {
  if (!existsSync(schemaPath)) fail(`schema file not found: ${schemaPath}`);
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

function allChecksFalse(checks: RuankaoHumanReviewRequiredChecks): boolean {
  return Object.values(checks).every((value) => value === false);
}

function invariantCheck(status: RuankaoHumanReviewStatus): string[] {
  const errors: string[] = [];

  if (status.auto_approval !== false) errors.push("auto_approval must be false");
  if (status.overall_status !== "pending_review") {
    errors.push(`overall_status must remain pending_review in Phase 4.5, got ${status.overall_status}`);
  }
  if (status.phase4_6_expansion_allowed !== false) {
    errors.push("phase4_6_expansion_allowed must be false while human review is pending");
  }
  if (status.items.length !== 3) errors.push(`items.length must be 3, got ${status.items.length}`);

  for (const item of status.items) {
    const prefix = `items[${item.title}]`;
    if (item.review_status !== "pending_review") errors.push(`${prefix}.review_status must be pending_review`);
    if (item.reviewer !== null) errors.push(`${prefix}.reviewer must be null`);
    if (item.reviewed_at !== null) errors.push(`${prefix}.reviewed_at must be null`);
    if (!allChecksFalse(item.required_checks)) errors.push(`${prefix}.required_checks must all be false`);
    if (item.release_decision !== "not_ready") errors.push(`${prefix}.release_decision must be not_ready`);
    if (!existsSync(resolve(repoRoot, item.official_doc_path))) {
      errors.push(`${prefix}.official_doc_path does not exist: ${item.official_doc_path}`);
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(statusPath)) {
    fail("human review status missing; run pnpm build:human-review-status");
  }

  const status = readJson<RuankaoHumanReviewStatus>(statusPath);
  const errors = [...buildSchemaValidator()(status), ...invariantCheck(status)];

  if (errors.length > 0) {
    console.error("[validate:human-review-status] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:human-review-status] Human review status validation passed");
  console.log(`  item_count:                 ${status.items.length}`);
  console.log(`  review_statuses:            ${[...new Set(status.items.map((item) => item.review_status))].join(", ")}`);
  console.log(`  auto_approval:              ${status.auto_approval}`);
  console.log(`  overall_status:             ${status.overall_status}`);
  console.log(`  phase4_6_expansion_allowed: ${status.phase4_6_expansion_allowed}`);
}

main();
