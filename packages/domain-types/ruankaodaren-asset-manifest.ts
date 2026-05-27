/**
 * Phase 2.15: TypeScript types for ruankaodaren asset capture manifests.
 *
 * These mirror the JSON Schema in schemas/ruankaodaren-asset-manifest.schema.json.
 *
 * HARD CONSTRAINTS — none of these are ever true in a valid manifest:
 *   ocr_used = false
 *   image_table_reconstructed = false
 *   markdown_generated = false
 *   encrypted_xhr_decrypted = false
 */

export interface RuankaoAssetConstraints {
  ocr_used: false;
  image_table_reconstructed: false;
  markdown_generated: false;
  encrypted_xhr_decrypted: false;
}

export type AssetStatus = "downloaded" | "download_failed" | "skipped";

export interface RuankaoCapturedAsset {
  order: number;
  original_url: string;
  saved_path: string | null;
  sha256: string | null;
  size_bytes: number | null;
  content_type: string | null;
  width: number | null;
  height: number | null;
  dimension_error: string | null;
  surrounding_text: string | null;
  asset_status: AssetStatus;
  error_message: string | null;
  requires_manual_review: true;
  manual_review_reason: string;
  ocr_used: false;
  image_table_reconstructed: false;
}

export interface RuankaoAssetManifest {
  source_name: "ruankaodaren";
  source_intermediate_path: string;
  source_title: string;
  source_timestamp: string;
  captured_at: string;
  asset_count: number;
  assets: RuankaoCapturedAsset[];
  constraints: RuankaoAssetConstraints;
}
