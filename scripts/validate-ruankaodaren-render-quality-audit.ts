/**
 * Phase 4.3 render quality audit validator.
 *
 * Validates Phase 4.3 generated audit/checklist artifacts and confirms no new
 * official Markdown files exist beyond the three frozen baseline docs.
 *
 * Usage:
 *   pnpm validate:render-quality-audit
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const generatedDir = resolve(repoRoot, "verification/generated");
const officialDir = resolve(repoRoot, "docs/ruankaodaren/baseline");

const auditJsonPath = resolve(generatedDir, "phase4_3_render_quality_audit.json");
const auditMdPath = resolve(generatedDir, "phase4_3_render_quality_audit.md");
const checklistJsonPath = resolve(generatedDir, "phase4_3_human_review_checklist.json");
const checklistMdPath = resolve(generatedDir, "phase4_3_human_review_checklist.md");

const EXPECTED_DOCS = [
  "1.3_指令系统CISC和RISC.md",
  "13.3_软件架构风格.md",
  "9.1_信息安全基础知识.md",
];

interface AuditDocument {
  title: string;
  path: string;
  quality_status?: string;
  recommended_action?: string;
  boundary_violations: string[];
}

interface QualityAudit {
  audited_doc_count: number;
  fail_count: number;
  boundary_violation_count: number;
  documents: AuditDocument[];
}

interface Checklist {
  checklist_count: number;
  items: Array<{
    title: string;
    path: string;
    suggested_release_decision: string;
  }>;
}

function fail(message: string): never {
  console.error(`[validate:render-quality-audit] ERROR: ${message}`);
  process.exit(1);
}

function readJson<T>(absPath: string): T {
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function assertExists(absPath: string, label: string): void {
  if (!existsSync(absPath)) fail(`${label} missing: ${absPath}`);
}

function main(): void {
  assertExists(auditJsonPath, "quality audit JSON");
  assertExists(auditMdPath, "quality audit Markdown");
  assertExists(checklistJsonPath, "human review checklist JSON");
  assertExists(checklistMdPath, "human review checklist Markdown");
  assertExists(officialDir, "official baseline directory");

  const audit = readJson<QualityAudit>(auditJsonPath);
  const checklist = readJson<Checklist>(checklistJsonPath);
  const errors: string[] = [];

  if (audit.audited_doc_count !== 3) errors.push(`audited_doc_count must be 3, got ${audit.audited_doc_count}`);
  if (audit.fail_count !== 0) errors.push(`no fail status allowed in Phase 4.3 audit, got ${audit.fail_count}`);
  if (audit.boundary_violation_count !== 0) {
    errors.push(`boundary_violation_count must be 0, got ${audit.boundary_violation_count}`);
  }
  if (audit.documents.length !== 3) errors.push(`audit.documents length must be 3, got ${audit.documents.length}`);

  for (const document of audit.documents) {
    if (!document.quality_status) errors.push(`${document.title} missing quality_status`);
    if (!document.recommended_action) errors.push(`${document.title} missing recommended_action`);
    if (document.boundary_violations.length > 0) {
      errors.push(`${document.title} has boundary violations: ${document.boundary_violations.join(", ")}`);
    }
  }

  if (checklist.checklist_count !== 3) errors.push(`checklist_count must be 3, got ${checklist.checklist_count}`);
  for (const document of audit.documents) {
    const checklistItem = checklist.items.find((item) => item.title === document.title);
    if (!checklistItem) errors.push(`${document.title} missing from human review checklist`);
  }

  const actualMdFiles = readdirSync(officialDir).filter((file) => file.endsWith(".md")).sort();
  const expectedMdFiles = [...EXPECTED_DOCS].sort();
  for (const expected of expectedMdFiles) {
    if (!actualMdFiles.includes(expected)) errors.push(`expected official Markdown missing: ${expected}`);
  }
  for (const actual of actualMdFiles) {
    if (!expectedMdFiles.includes(actual)) errors.push(`unexpected official Markdown found: ${actual}`);
  }

  if (errors.length > 0) {
    console.error("[validate:render-quality-audit] Validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log("[validate:render-quality-audit] Render quality audit validation passed");
  console.log(`  audited_doc_count:        ${audit.audited_doc_count}`);
  console.log(`  boundary_violation_count: ${audit.boundary_violation_count}`);
  console.log(`  checklist_count:          ${checklist.checklist_count}`);
  console.log(`  official_docs:            ${actualMdFiles.join(", ")}`);
}

main();
