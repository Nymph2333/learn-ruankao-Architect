/**
 * Phase 5.1 source packet builder.
 *
 * Builds an auditable source packet for the three baseline official docs. This
 * script records missing artifacts; it does not rebuild them, read raw XHR,
 * perform OCR, reconstruct image tables, generate AI learning content, or
 * render official Markdown.
 *
 * Usage:
 *   pnpm build:source-packets
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  RuankaoSourcePacket,
  RuankaoSourcePacketAssetRequirement,
  RuankaoSourcePacketConstraints,
  RuankaoSourcePacketItem,
  RuankaoSourcePacketRecommendedAction,
  RuankaoSourcePacketRecoveryStatus,
  RuankaoSourcePacketRenderAs,
  RuankaoSourceLayerStatus,
} from "../packages/domain-types/ruankaodaren-source-packet.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const rendererInputContractPath = "verification/generated/phase3_25_renderer_input_contract.json";
const baselineManifestPath = "verification/generated/phase3_23_renderer_baseline_manifest.json";
const humanReviewStatusPath = "reviews/ruankaodaren/baseline/human-review-status.json";
const packetDir = resolve(repoRoot, "source-packets/ruankaodaren/baseline");
const generatedDir = resolve(repoRoot, "verification/generated");
const packetJsonPath = resolve(packetDir, "source-packet.json");
const packetMdPath = resolve(packetDir, "source-packet.md");
const auditJsonPath = resolve(generatedDir, "phase5_1_source_packet_audit.json");
const auditMdPath = resolve(generatedDir, "phase5_1_source_packet_audit.md");
const samplesDir = resolve(repoRoot, "data/intermediate/ruankaodaren/samples");
const assetManifestsDir = resolve(repoRoot, "sources/ruankaodaren/raw/assets/manifests");

interface RendererInputContract {
  baseline_items: Array<{
    canonical_title: string;
    canonical_sample_path: string;
    readiness_class: string;
    content_shape: string;
    asset_manifest_path: string | null;
    renderer_policy: {
      render_as: RuankaoSourcePacketRenderAs;
      preserve_asset_refs: boolean;
    };
  }>;
}

interface AssetManifest {
  source_title?: string;
  source_timestamp?: string;
  source_intermediate_path?: string;
  assets?: Array<{
    saved_path?: string | null;
    asset_status?: string;
  }>;
}

interface IntermediateDocumentLike {
  source?: {
    timestamp?: string;
    captured_at?: string;
  };
  navigation_context?: {
    target_node_text?: string | null;
  };
  content?: {
    title?: string | null;
    text_blocks?: Array<{ text?: string }>;
    image_refs?: unknown[];
    asset_refs?: unknown[];
    html_fragments?: Array<{
      contains_image?: boolean;
      outer_html?: string;
    }>;
  };
  classification?: {
    content_source_classification?: string;
    manual_review_reasons?: string[];
  };
}

interface IntermediateResolution {
  effectivePath: string | null;
  recoveredPath: string | null;
  document: IntermediateDocumentLike | null;
}

interface ManifestResolution {
  effectivePath: string | null;
  recoveredPath: string | null;
  manifest: AssetManifest | null;
}

interface AssetRequirementDecision {
  requirement: RuankaoSourcePacketAssetRequirement;
  reason: string;
  required: boolean;
}

const constraints: RuankaoSourcePacketConstraints = {
  official_markdown_used_as_source_of_truth: false,
  ocr_used: false,
  encrypted_xhr_decrypted: false,
  image_table_reconstructed: false,
  raw_xhr_used: false,
  content_invented: false,
};

function toRepoPath(absPath: string): string {
  return relative(repoRoot, absPath).replace(/\\/g, "/");
}

function readJson<T>(relativePath: string): T {
  const absPath = resolve(repoRoot, relativePath);
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function readJsonIfExists<T>(relativePath: string | null): T | null {
  if (!relativePath) return null;
  const absPath = resolve(repoRoot, relativePath);
  if (!existsSync(absPath)) return null;
  return JSON.parse(readFileSync(absPath, "utf8")) as T;
}

function readJsonAbsIfExists<T>(absPath: string): T | null {
  if (!existsSync(absPath)) return null;
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch {
    return null;
  }
}

function officialMarkdownPathForTitle(title: string): string {
  return `docs/ruankaodaren/baseline/${title.replace(/\s+/, "_")}.md`;
}

function normalizeComparable(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, "").trim();
}

function titleFromIntermediate(doc: IntermediateDocumentLike): string {
  return doc.content?.title ?? doc.navigation_context?.target_node_text ?? "";
}

function findRecoveredIntermediate(title: string, canonicalPath: string): IntermediateResolution {
  const canonicalDoc = readJsonIfExists<IntermediateDocumentLike>(canonicalPath);
  if (canonicalDoc) {
    return {
      effectivePath: canonicalPath,
      recoveredPath: null,
      document: canonicalDoc,
    };
  }

  if (!existsSync(samplesDir)) {
    return { effectivePath: null, recoveredPath: null, document: null };
  }

  const target = normalizeComparable(title);
  const candidates = readdirSync(samplesDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .reverse();

  for (const file of candidates) {
    const absPath = resolve(samplesDir, file);
    const doc = readJsonAbsIfExists<IntermediateDocumentLike>(absPath);
    if (!doc) continue;
    if (normalizeComparable(titleFromIntermediate(doc)) !== target) continue;
    const relativePath = toRepoPath(absPath);
    return {
      effectivePath: relativePath,
      recoveredPath: relativePath === canonicalPath ? null : relativePath,
      document: doc,
    };
  }

  return { effectivePath: null, recoveredPath: null, document: null };
}

function manifestTitleMatches(manifest: AssetManifest, title: string): boolean {
  return normalizeComparable(manifest.source_title) === normalizeComparable(title);
}

function findRecoveredManifest(
  title: string,
  expectedPath: string | null,
  effectiveIntermediatePath: string | null,
  intermediate: IntermediateDocumentLike | null,
): ManifestResolution {
  const expectedManifest = readJsonIfExists<AssetManifest>(expectedPath);
  if (expectedManifest && expectedPath) {
    return {
      effectivePath: expectedPath,
      recoveredPath: null,
      manifest: expectedManifest,
    };
  }

  if (!existsSync(assetManifestsDir)) {
    return { effectivePath: null, recoveredPath: null, manifest: null };
  }

  const timestamp = intermediate?.source?.timestamp;
  const preferredPath = timestamp ? `sources/ruankaodaren/raw/assets/manifests/${timestamp}.json` : null;
  const preferredManifest = readJsonIfExists<AssetManifest>(preferredPath);
  if (preferredManifest && (manifestTitleMatches(preferredManifest, title) || preferredManifest.source_intermediate_path === effectiveIntermediatePath)) {
    return {
      effectivePath: preferredPath,
      recoveredPath: preferredPath === expectedPath ? null : preferredPath,
      manifest: preferredManifest,
    };
  }

  const candidates = readdirSync(assetManifestsDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .reverse();
  for (const file of candidates) {
    const absPath = resolve(assetManifestsDir, file);
    const manifest = readJsonAbsIfExists<AssetManifest>(absPath);
    if (!manifest) continue;
    const matchesTitle = manifestTitleMatches(manifest, title);
    const matchesIntermediate = Boolean(effectiveIntermediatePath && manifest.source_intermediate_path === effectiveIntermediatePath);
    if (!matchesTitle && !matchesIntermediate) continue;
    const relativePath = toRepoPath(absPath);
    return {
      effectivePath: relativePath,
      recoveredPath: relativePath === expectedPath ? null : relativePath,
      manifest,
    };
  }

  return { effectivePath: null, recoveredPath: null, manifest: null };
}

function extractAssetFiles(assetManifestPath: string | null): string[] {
  const manifest = readJsonIfExists<AssetManifest>(assetManifestPath);
  if (!manifest?.assets) return [];
  return manifest.assets
    .filter((asset) => asset.asset_status === "downloaded" && typeof asset.saved_path === "string" && asset.saved_path.length > 0)
    .map((asset) => asset.saved_path as string);
}

function imageRefsCount(intermediate: IntermediateDocumentLike | null): number {
  return intermediate?.content?.image_refs?.length ?? 0;
}

function assetRefsCount(intermediate: IntermediateDocumentLike | null): number {
  return intermediate?.content?.asset_refs?.length ?? 0;
}

function contentShapeIndicatesAssets(contentShape: string | null | undefined): boolean {
  return contentShape === "MIXED_TEXT_IMAGE" || contentShape === "IMAGE_ASSET_CARD";
}

function decideAssetRequirement(args: {
  imageRefsCount: number;
  assetRefsCount: number;
  renderAs: RuankaoSourcePacketRenderAs;
  contentShape: string;
  preserveAssetRefs: boolean;
  legacyAssetManifestPath: string | null;
  assetManifestExists: boolean;
  assetFilesExist: boolean;
}): AssetRequirementDecision {
  const requirementReasons: string[] = [];
  if (args.imageRefsCount > 0) requirementReasons.push(`image_refs_count=${args.imageRefsCount}`);
  if (args.assetRefsCount > 0) requirementReasons.push(`asset_refs_count=${args.assetRefsCount}`);
  if (args.renderAs === "asset_card") requirementReasons.push("render_as=asset_card");
  if (contentShapeIndicatesAssets(args.contentShape)) requirementReasons.push(`content_shape=${args.contentShape}`);
  if (args.preserveAssetRefs) requirementReasons.push("renderer_policy.preserve_asset_refs=true");

  if (requirementReasons.length > 0) {
    const artifactStatus = args.assetManifestExists && args.assetFilesExist ? "present" : "missing";
    return {
      requirement: artifactStatus === "present" ? "required" : "missing_required",
      reason: `asset artifacts required because ${requirementReasons.join("; ")}; artifacts ${artifactStatus}`,
      required: true,
    };
  }

  const legacyNote = args.legacyAssetManifestPath
    ? "; legacy asset_manifest_path present but no image_refs detected"
    : "";
  return {
    requirement: "not_required",
    reason: `asset artifacts not required because image_refs_count=0; asset_refs_count=0; render_as=${args.renderAs}; content_shape=${args.contentShape}; preserve_asset_refs=${args.preserveAssetRefs}${legacyNote}`,
    required: false,
  };
}

function sourceLayerStatus(args: {
  officialMarkdownExists: boolean;
  intermediateJsonExists: boolean;
  assetRequirement: RuankaoSourcePacketAssetRequirement;
}): RuankaoSourceLayerStatus {
  if (!args.officialMarkdownExists && !args.intermediateJsonExists) return "incomplete";
  if (!args.intermediateJsonExists) return args.officialMarkdownExists ? "intermediate_missing" : "incomplete";
  if (args.assetRequirement === "missing_required") return "asset_missing";
  return "complete";
}

function recommendedAction(args: {
  complete: boolean;
  intermediateJsonExists: boolean;
  assetProblem: boolean;
  taxonomySuspect: boolean;
}): RuankaoSourcePacketRecommendedAction {
  if (args.taxonomySuspect) return "manual_review_required";
  if (args.complete) return "accept_source_packet";
  if (!args.intermediateJsonExists) return "rebuild_source_artifact";
  if (args.assetProblem) return "reacquire_source";
  return "manual_review_required";
}

function taxonomyNotesFor(title: string, intermediate: IntermediateDocumentLike | null): string[] {
  const notes: string[] = [];
  if (title === "13.3 软件架构风格") {
    notes.push("13.3 remains taxonomy_suspect until live taxonomy recheck confirms whether it is a parent node or a multi-card sequence.");
  }
  if (!intermediate) return notes;
  const totalTextLength = (intermediate.content?.text_blocks ?? []).reduce((sum, block) => sum + (block.text?.length ?? 0), 0);
  if (totalTextLength > 0 && totalTextLength < 180) {
    notes.push(`effective intermediate has low extracted text length: ${totalTextLength}`);
  }
  if (intermediate.classification?.content_source_classification) {
    notes.push(`content_source_classification: ${intermediate.classification.content_source_classification}`);
  }
  return notes;
}

function recoveryStatus(args: {
  complete: boolean;
  hasEffectiveIntermediate: boolean;
  recoveredIntermediatePath: string | null;
  recoveredManifestPath: string | null;
}): RuankaoSourcePacketRecoveryStatus {
  if (!args.hasEffectiveIntermediate) return "failed";
  if (!args.recoveredIntermediatePath && !args.recoveredManifestPath) return "already_exists";
  return args.complete ? "recovered" : "partially_recovered";
}

function buildItem(item: RendererInputContract["baseline_items"][number]): RuankaoSourcePacketItem {
  const title = item.canonical_title;
  const officialMarkdownPath = officialMarkdownPathForTitle(title);
  const officialMarkdownExists = existsSync(resolve(repoRoot, officialMarkdownPath));
  const intermediateResolution = findRecoveredIntermediate(title, item.canonical_sample_path);
  const intermediateJsonExists = intermediateResolution.effectivePath !== null;
  const manifestResolution = findRecoveredManifest(
    title,
    item.asset_manifest_path,
    intermediateResolution.effectivePath,
    intermediateResolution.document,
  );
  const assetManifestExists = manifestResolution.effectivePath !== null;
  const assetFiles = extractAssetFiles(manifestResolution.effectivePath);
  const imageRefTotal = imageRefsCount(intermediateResolution.document);
  const assetRefTotal = assetRefsCount(intermediateResolution.document);
  const assetFilesExist = assetFiles.length > 0 && assetFiles.every((assetPath) => existsSync(resolve(repoRoot, assetPath)));
  const assetRequirement = decideAssetRequirement({
    imageRefsCount: imageRefTotal,
    assetRefsCount: assetRefTotal,
    renderAs: item.renderer_policy.render_as,
    contentShape: item.content_shape,
    preserveAssetRefs: item.renderer_policy.preserve_asset_refs,
    legacyAssetManifestPath: item.asset_manifest_path,
    assetManifestExists,
    assetFilesExist,
  });
  const taxonomySuspect = title === "13.3 软件架构风格";
  const taxonomyNotes = taxonomyNotesFor(title, intermediateResolution.document);
  if (intermediateResolution.recoveredPath) {
    taxonomyNotes.push(`canonical_sample_path missing; effective recovered intermediate used: ${intermediateResolution.recoveredPath}`);
  }
  if (manifestResolution.recoveredPath) {
    taxonomyNotes.push(`canonical asset_manifest_path missing; effective recovered manifest used: ${manifestResolution.recoveredPath}`);
  }
  if (assetRequirement.requirement === "not_required" && item.asset_manifest_path) {
    taxonomyNotes.push("legacy asset_manifest_path present but no image_refs detected; asset manifest not required for completeness");
  }
  taxonomyNotes.push(`asset_requirement_reason: ${assetRequirement.reason}`);

  const missingArtifacts: string[] = [];
  if (!officialMarkdownExists) missingArtifacts.push(officialMarkdownPath);
  if (!intermediateResolution.effectivePath) missingArtifacts.push(item.canonical_sample_path);
  if (assetRequirement.requirement === "missing_required" && !assetManifestExists) {
    missingArtifacts.push(item.asset_manifest_path ?? "asset_manifest: required but no manifest path available");
  }
  if (assetRequirement.requirement === "missing_required" && assetManifestExists && assetFiles.length === 0) {
    missingArtifacts.push("asset_files: none discoverable from required asset manifest");
  }
  for (const assetPath of assetFiles) {
    if (!existsSync(resolve(repoRoot, assetPath))) missingArtifacts.push(assetPath);
  }

  const complete =
    officialMarkdownExists &&
    intermediateJsonExists &&
    assetRequirement.requirement !== "missing_required";
  const assetProblem = assetRequirement.requirement === "missing_required";
  const status = recoveryStatus({
    complete,
    hasEffectiveIntermediate: intermediateJsonExists,
    recoveredIntermediatePath: intermediateResolution.recoveredPath,
    recoveredManifestPath: manifestResolution.recoveredPath,
  });

  return {
    title,
    render_as: item.renderer_policy.render_as,
    official_markdown_path: officialMarkdownPath,
    renderer_input_contract_path: rendererInputContractPath,
    baseline_manifest_path: baselineManifestPath,
    canonical_sample_path: item.canonical_sample_path,
    asset_manifest_path: item.asset_manifest_path,
    effective_intermediate_path: intermediateResolution.effectivePath,
    recovered_intermediate_path: intermediateResolution.recoveredPath,
    effective_asset_manifest_path: manifestResolution.effectivePath,
    recovered_asset_manifest_path: manifestResolution.recoveredPath,
    asset_files: assetFiles,
    asset_requirement: assetRequirement.requirement,
    asset_requirement_reason: assetRequirement.reason,
    image_refs_count: imageRefTotal,
    asset_refs_count: assetRefTotal,
    source_availability: {
      official_markdown_exists: officialMarkdownExists,
      intermediate_json_exists: intermediateJsonExists,
      asset_manifest_exists: assetManifestExists,
      asset_files_exist: assetRequirement.required ? assetFilesExist : false,
      source_packet_complete: complete,
    },
    missing_artifacts: missingArtifacts,
    source_layer_status: sourceLayerStatus({
      officialMarkdownExists,
      intermediateJsonExists,
      assetRequirement: assetRequirement.requirement,
    }),
    ai_learning_layer_status: "not_generated",
    constraints,
    recommended_action: recommendedAction({
      complete,
      intermediateJsonExists,
      assetProblem,
      taxonomySuspect,
    }),
    recovery_status: status,
    taxonomy_suspect: taxonomySuspect,
    taxonomy_notes: taxonomyNotes,
    source_packet_recovered_at: status === "recovered" || status === "partially_recovered" ? new Date().toISOString() : null,
  };
}

function renderMarkdown(packet: RuankaoSourcePacket): string {
  const completeCount = packet.items.filter((item) => item.source_availability.source_packet_complete).length;
  const incompleteCount = packet.items.length - completeCount;
  const lines = [
    "# Phase 5.1 Source Packet Audit",
    "",
    `Generated at: ${packet.created_at}`,
    "",
    "## Summary",
    "",
    `- source_name: ${packet.source_name}`,
    `- scope: ${packet.scope}`,
    `- item_count: ${packet.items.length}`,
    `- complete_count: ${completeCount}`,
    `- incomplete_count: ${incompleteCount}`,
    `- overall_source_packet_status: ${packet.overall_source_packet_status}`,
    `- phase5_2_ai_generation_allowed: ${packet.phase5_2_ai_generation_allowed}`,
    "",
    "## Items",
    "",
  ];

  for (const item of packet.items) {
    lines.push(
      `### ${item.title}`,
      "",
      `- render_as: ${item.render_as}`,
      `- official_markdown_path: \`${item.official_markdown_path}\``,
      `- canonical_sample_path: \`${item.canonical_sample_path}\``,
      `- effective_intermediate_path: \`${item.effective_intermediate_path ?? "(none)"}\``,
      `- asset_manifest_path: \`${item.asset_manifest_path ?? "(none)"}\``,
      `- effective_asset_manifest_path: \`${item.effective_asset_manifest_path ?? "(none)"}\``,
      `- asset_requirement: ${item.asset_requirement}`,
      `- asset_requirement_reason: ${item.asset_requirement_reason}`,
      `- image_refs_count: ${item.image_refs_count}`,
      `- asset_refs_count: ${item.asset_refs_count}`,
      `- source_layer_status: ${item.source_layer_status}`,
      `- recommended_action: ${item.recommended_action}`,
      `- recovery_status: ${item.recovery_status}`,
      `- taxonomy_suspect: ${item.taxonomy_suspect}`,
      `- ai_learning_layer_status: ${item.ai_learning_layer_status}`,
      "- availability:",
      `  - official_markdown_exists: ${item.source_availability.official_markdown_exists}`,
      `  - intermediate_json_exists: ${item.source_availability.intermediate_json_exists}`,
      `  - asset_manifest_exists: ${item.source_availability.asset_manifest_exists}`,
      `  - asset_files_exist: ${item.source_availability.asset_files_exist}`,
      `  - source_packet_complete: ${item.source_availability.source_packet_complete}`,
      "- taxonomy_notes:",
      ...(item.taxonomy_notes.length > 0 ? item.taxonomy_notes.map((note) => `  - ${note}`) : ["  - (none)"]),
      "- missing_artifacts:",
      ...(item.missing_artifacts.length > 0 ? item.missing_artifacts.map((artifact) => `  - \`${artifact}\``) : ["  - (none)"]),
      "",
    );
  }

  lines.push(
    "## Constraints",
    "",
    "- Official Markdown was not used as the source of truth.",
    "- No OCR was used.",
    "- No encrypt=1 data was decrypted.",
    "- No image table was reconstructed.",
    "- No raw XHR was read directly.",
    "- No AI learning content was generated.",
    "",
  );

  return lines.join("\n");
}

function main(): void {
  const contractAbsPath = resolve(repoRoot, rendererInputContractPath);
  const manifestAbsPath = resolve(repoRoot, baselineManifestPath);
  if (!existsSync(contractAbsPath)) {
    console.error(`[build:source-packets] ERROR: missing renderer input contract: ${rendererInputContractPath}`);
    process.exit(1);
  }
  if (!existsSync(manifestAbsPath)) {
    console.error(`[build:source-packets] ERROR: missing baseline manifest: ${baselineManifestPath}`);
    process.exit(1);
  }
  if (!existsSync(resolve(repoRoot, humanReviewStatusPath))) {
    console.error(`[build:source-packets] ERROR: missing human review status: ${humanReviewStatusPath}`);
    process.exit(1);
  }

  const contract = readJson<RendererInputContract>(rendererInputContractPath);
  const items = contract.baseline_items.map(buildItem);
  const packet: RuankaoSourcePacket = {
    packet_schema_version: "phase5.1",
    source_name: "ruankaodaren",
    created_at: new Date().toISOString(),
    scope: "baseline_official_docs",
    items,
    overall_source_packet_status: items.every((item) => item.source_availability.source_packet_complete)
      ? "complete"
      : "incomplete",
    phase5_2_ai_generation_allowed: false,
  };
  const markdown = renderMarkdown(packet);

  mkdirSync(packetDir, { recursive: true });
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(packetJsonPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  writeFileSync(packetMdPath, markdown, "utf8");
  writeFileSync(auditJsonPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  writeFileSync(auditMdPath, markdown, "utf8");

  const completeCount = items.filter((item) => item.source_availability.source_packet_complete).length;
  console.log("[build:source-packets] Source packet audit built");
  console.log(`  item_count:                     ${items.length}`);
  console.log(`  complete_count:                 ${completeCount}`);
  console.log(`  incomplete_count:               ${items.length - completeCount}`);
  console.log(`  phase5_2_ai_generation_allowed: ${packet.phase5_2_ai_generation_allowed}`);
  console.log(`  source_packet_json:             ${toRepoPath(packetJsonPath)}`);
  console.log(`  source_packet_md:               ${toRepoPath(packetMdPath)}`);
  console.log(`  audit_json:                     ${toRepoPath(auditJsonPath)}`);
  console.log(`  audit_md:                       ${toRepoPath(auditMdPath)}`);
}

main();
