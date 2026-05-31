# Phase 5.2 Source Artifact Recovery and Taxonomy Live Recheck

## 1. Objective

Phase 5.2 performs controlled source artifact recovery for the current three baseline titles and reruns the `13.3 软件架构风格` taxonomy live recheck after restoring local Playwright Chromium.

This phase is still source-layer work only. It does not generate AI learning content, rewrite official Markdown, sign off human review, or enter Phase 4.6.

## 2. Recovery Scope

Allowed recovery targets are exactly:

- `1.3 指令系统CISC和RISC`
- `13.3 软件架构风格`
- `9.1 信息安全基础知识`

Recovery may use exact-title live replay, exact-title `--require-leaf` crawl, parser, preflight, and asset capture. It must not run full-site batch crawl or full-library rendering.

## 3. Recovery Report

The recovery command writes:

- `verification/generated/phase5_2_source_artifact_recovery.json`
- `verification/generated/phase5_2_source_artifact_recovery.md`

Each item records:

- `intermediate_before` / `intermediate_after`
- `asset_manifest_before` / `asset_manifest_after`
- `asset_files_after`
- `recovery_status`
- `taxonomy_suspect`
- command outcomes and notes

`phase5_2_ai_generation_allowed` remains `false`.

## 4. Source Packet Refresh

After recovery, `pnpm build:source-packets` recalculates source availability. If a recovered artifact has a new timestamp, it is recorded as an effective recovered path instead of being copied into the old canonical path.

The source packet may include:

- `effective_intermediate_path`
- `recovered_intermediate_path`
- `effective_asset_manifest_path`
- `recovered_asset_manifest_path`
- `recovery_status`
- `taxonomy_suspect`
- `taxonomy_notes`
- `source_packet_recovered_at`

## 5. Taxonomy Live Recheck

`pnpm recheck:taxonomy` performs catalog-level DOM inspection only. It may expand catalog directory nodes and read visible directory text. It must not click `去掌握`, enter detail pages, parse content, run acquisition, OCR, decrypt `encrypt=1`, reconstruct image tables, or read raw XHR directly.

The recheck searches for:

- `13.3 软件架构风格`
- `13.3.1 软件系统结构风格`
- `13.3.1 软件体系结构风格`
- `13.3.2 基本架构风格`
- `13.3.3 层次结构风格`
- `13.3.4 面向服务的架构 SOA`
- `SOA`
- `软件架构风格`

If children are found, `recommended_action` is `replace_parent_with_children`. If no children are found but the catalog keeps the `0/59` multi-card signal, `recommended_action` is `model_as_multi_card_sequence`. If Chromium is missing or live recheck fails, the script records a clear failure reason and keeps `taxonomy_suspect=true` without guessing.

## 6. Commands

```bash
pnpm exec playwright install chromium
pnpm recover:baseline-source-artifacts
pnpm build:source-packets
pnpm validate:source-packets
pnpm recheck:taxonomy
pnpm validate:dual-layer-contract
pnpm validate:human-review-status
pnpm validate:controlled-expansion-plan
pnpm typecheck
pnpm verify
```

## 7. Forbidden Actions

- No AI learning content generation.
- No official Markdown rewrite.
- No automatic human-review signoff.
- No OCR.
- No `encrypt=1` decryption.
- No image table reconstruction.
- No raw XHR direct read.
- No full-site batch crawl.
- No full-site batch rendering.
- No Phase 4.6 entry.

Phase 5.3 repairs the baseline detail-entry recovery contract after Phase 5.2 showed live replay succeeded but parser-ready detail snapshots were not captured.
