# Phase 5.3.2 Source Packet Completeness Policy Repair

## 1. Background

Phase 5.3.1 restored the local runtime, Playwright Chromium, and authenticated ruankaodaren storage state. The baseline recovery then produced three intermediate JSON files, one asset manifest, and one asset file. The recovery report had no failed items, but the source packet still showed `complete_count = 2` and `incomplete_count = 1` because `13.3 软件架构风格` was marked `asset_missing`.

## 2. Problem

The source packet builder required an asset manifest too broadly. `13.3 软件架构风格` is a `short_card` / static-low-text baseline item. Its recovered intermediate has no `image_refs` and no explicit asset refs, so the legacy `asset_manifest_path` from the renderer input contract should not make the source packet incomplete by itself.

## 3. Objective

Repair source packet completeness policy so that asset manifest and asset files are required only when the source artifact actually carries asset-bearing content or when renderer policy requires preserving assets.

## 4. Asset Requirement Rules

Asset artifacts are required when any of the following is true:

- `image_refs_count > 0`
- `asset_refs_count > 0`
- `renderer_policy.render_as = asset_card`
- `content_shape = MIXED_TEXT_IMAGE`
- `renderer_policy.preserve_asset_refs = true`

Asset artifacts are not required when all of the following are true:

- `image_refs_count = 0`
- `asset_refs_count = 0`
- `render_as = short_card` or `render_as = concept_card`
- `content_shape` does not indicate asset/image content

If a legacy `asset_manifest_path` exists but no image refs or asset refs are detected, the source packet records `asset_requirement = not_required` and adds the reason `legacy asset_manifest_path present but no image_refs detected`.

If assets are required but the manifest or files are missing, the source packet records `asset_requirement = missing_required`, keeps `source_layer_status = asset_missing`, and keeps `source_packet_complete = false`.

## 5. Source Packet Result

Before repair:

- `complete_count = 2`
- `incomplete_count = 1`
- `13.3 软件架构风格`: `source_layer_status = asset_missing`
- `phase5_2_ai_generation_allowed = false`

After repair:

- `complete_count = 3`
- `incomplete_count = 0`
- `1.3 指令系统CISC和RISC`: `asset_requirement = required`
- `13.3 软件架构风格`: `asset_requirement = not_required`
- `9.1 信息安全基础知识`: `asset_requirement = not_required`
- `phase5_2_ai_generation_allowed = false`

AI generation remains disallowed because source packet completeness is not the same as explicit AI learning prompt contract approval or human review signoff.

## 6. Commands

```bash
pnpm build:source-packets
pnpm validate:source-packets
pnpm validate:dual-layer-contract
pnpm validate:human-review-status
pnpm validate:controlled-expansion-plan
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- Source packet validator passes.
- Asset requirement is explicit per baseline item.
- No AI learning content is generated.
- `phase5_2_ai_generation_allowed` remains `false`.
- Typecheck and structure verification pass.

## 8. Failure Handling

If an item has image refs or asset refs but no asset manifest, keep it incomplete, do not OCR, and do not reconstruct image tables.

Phase 5.4 defines the AI Learning Layer prompt contract after source packets became complete, without generating AI learning content.
