# Phase 3.11 Reachable Leaf Catalog Check

## 1. Background

Phase 3.10 showed that the requested `3.6 关系数据库的规范化` target is not reachable in the current UI state. The previous candidate pool is therefore not reliable enough for further renderer-baseline acquisition.

## 2. Objective

Refresh the current UI reachable leaf catalog by opening the knowledge directory, expanding visible chapters, enumerating leaf titles, and recommending the next controlled targets.

## 3. Scope

Allowed:

- Open the authenticated knowledge directory.
- Expand visible chapter nodes.
- Enumerate reachable leaf titles.
- Generate a reachable catalog report.
- Recommend the next acquisition target candidates.

Forbidden:

- Entering detail pages.
- Parsing knowledge body content.
- Generating intermediate JSON.
- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Full-site crawling.

## 4. Leaf Detection Rules

- Chapter-level nodes match `第N章 xxx`.
- Leaf-level nodes match section titles such as `1.2 xxx`, `2.3 xxx`, `3.6 xxx`, or `5.1 xxx`.
- Navigation and action labels such as `首页`, `搜索`, `去掌握`, `掌握程度`, `登录`, `账号`, and `切换` are excluded.
- The catalog is scoped to the current UI reachable directory, not a claim of full knowledge-base coverage.

## 5. Candidate Recommendation Policy

Recommended candidates must come from the refreshed reachable catalog and should avoid:

- Quarantined sample titles.
- Existing renderer-eligible titles.
- Known low-text diagnostic titles.
- Duplicate or weak chapter-only candidates.

Preference is given to moderate-length leaf titles, cross-chapter coverage, and technical topic terms such as database, network, testing, architecture, reliability, and security.

## 6. Commands

```bash
pnpm catalog:reachable-leaves
pnpm diagnose:target-reachability -- --target "<candidate>"
pnpm typecheck
pnpm verify
pnpm audit:semantic-alignment
pnpm audit:sample-quality
pnpm report:sample-coverage
```

## 7. Success Criteria

- `catalog:reachable-leaves` can run.
- `verification/generated/phase3_11_reachable_leaf_catalog.md` is generated.
- `verification/generated/phase3_11_reachable_leaf_catalog.json` is generated.
- `leaf_count > 0`.
- Recommended candidates do not include quarantined or already renderer-eligible samples.
- `typecheck` and `verify` pass.

If `leaf_count = 0`, do not guess targets. Report UI state, screenshot, and warnings instead of entering acquisition.

## 8. Failure Handling

If chapters cannot be expanded, record warnings and do not generate fake leaves.

If only a small subset of chapters is visible, the report must state that the catalog scope is the current UI reachable directory and not the full knowledge base.

Phase 3.12 uses exact reachable leaf titles from the Phase 3.11 catalog for preflight-gated acquisition.
