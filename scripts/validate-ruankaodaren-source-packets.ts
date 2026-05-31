/**
 * Phase 5.1 source packet validator.
 *
 * Validates the generated source packet and enforces Phase 5.1 invariants. It
 * does not rebuild artifacts, read raw XHR, generate AI content, or render docs.
 *
 * Usage:
 *   pnpm validate:source-packets
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { RuankaoSourcePacket } from "../packages/domain-types/ruankaodaren-source-packet.js";

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
const schemaPath = resolve(repoRoot, "schemas/ruankaodaren-source-packet.schema.json");
const packetPath = resolve(repoRoot, "source-packets/ruankaodaren/baseline/source-packet.json");

function fail(message: string): never {
  console.error(`[validate:source-packets] ERROR: ${message}`);
  process.exit(1);
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function buildSchemaValidator(): (data: unknown) => string[] {
  if (!existsSync(schemaPath)) fail(`schema missing: ${schemaPath}`);
  const schema = readJson<object>(schemaPath);
  const ajv = new AjvCtor({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  return (data: unknown): string[] => {
    if (validate(data)) return [];
    return (validate.errors ?? []).map((error) => `schema: ${error.instancePath || "root"} ${error.message ?? "invalid"}`);
  };
}

function invariantCheck(packet: RuankaoSourcePacket): string[] {
  const errors: string[] = [];
  if (packet.items.length !== 3) errors.push(`items.length must be 3, got ${packet.items.length}`);
  const titles = new Set(packet.items.map((item) => item.title));
  if (titles.size !== packet.items.length) errors.push("item titles must be unique");
  if (packet.phase5_2_ai_generation_allowed !== false) {
    errors.push("phase5_2_ai_generation_allowed must remain false in Phase 5.1");
  }

  for (const item of packet.items) {
    const prefix = `items[${item.title}]`;
    if (item.source_availability.official_markdown_exists !== true) {
      errors.push(`${prefix}.official_markdown_exists must be true`);
    }
    if (item.ai_learning_layer_status !== "not_generated") {
      errors.push(`${prefix}.ai_learning_layer_status must be not_generated`);
    }
    if (item.constraints.official_markdown_used_as_source_of_truth !== false) {
      errors.push(`${prefix}.official_markdown_used_as_source_of_truth must be false`);
    }
    if (item.constraints.ocr_used !== false) errors.push(`${prefix}.ocr_used must be false`);
    if (item.constraints.encrypted_xhr_decrypted !== false) {
      errors.push(`${prefix}.encrypted_xhr_decrypted must be false`);
    }
    if (item.constraints.image_table_reconstructed !== false) {
      errors.push(`${prefix}.image_table_reconstructed must be false`);
    }
    if (item.constraints.raw_xhr_used !== false) errors.push(`${prefix}.raw_xhr_used must be false`);
    if (item.constraints.content_invented !== false) errors.push(`${prefix}.content_invented must be false`);
    if (item.source_availability.intermediate_json_exists === false &&
      packet.phase5_2_ai_generation_allowed !== false) {
      errors.push("missing intermediate JSON requires phase5_2_ai_generation_allowed=false");
    }
    const assetCardMissingArtifact =
      item.render_as === "asset_card" &&
      (item.source_availability.asset_manifest_exists === false || item.source_availability.asset_files_exist === false);
    if (assetCardMissingArtifact && item.recommended_action === "accept_source_packet") {
      errors.push(`${prefix} asset_card missing asset artifacts cannot be accepted`);
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(packetPath)) fail("source packet JSON missing; run pnpm build:source-packets");
  const packet = readJson<RuankaoSourcePacket>(packetPath);
  const errors = [...buildSchemaValidator()(packet), ...invariantCheck(packet)];

  if (errors.length > 0) {
    console.error("[validate:source-packets] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  const completeCount = packet.items.filter((item) => item.source_availability.source_packet_complete).length;
  console.log("[validate:source-packets] Source packet validation passed");
  console.log(`  item_count:                     ${packet.items.length}`);
  console.log(`  complete_count:                 ${completeCount}`);
  console.log(`  incomplete_count:               ${packet.items.length - completeCount}`);
  console.log(`  phase5_2_ai_generation_allowed: ${packet.phase5_2_ai_generation_allowed}`);
}

main();
