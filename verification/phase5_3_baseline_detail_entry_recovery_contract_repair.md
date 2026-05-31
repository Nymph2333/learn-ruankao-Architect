# Phase 5.3 Baseline Detail-entry Recovery Contract Repair

## 1. Background

Phase 5.2 source recovery showed that live replay and exact-title `--require-leaf` crawl could locate the three baseline leaves, but recovery still failed because parser-ready detail snapshots were not captured.

The observed blocker was:

- `final_url` did not enter `konwledgeInfo`.
- `detail_entry_route_changed` was `false`.
- `.knowInfo.ql-editor` outerHTML was missing.

## 2. Objective

This phase repairs the contract from exact leaf match to detail page to parser-ready snapshot. Recovery is allowed only for the three current baseline titles and remains source-layer work.

## 3. Scope

Allowed:

- Detail-entry recovery for the three baseline exact titles.
- Entering the detail page.
- Saving parser-ready metadata and `.knowInfo.ql-editor` outerHTML.
- Parsing exact timestamps.
- Capturing assets when source image refs exist.
- Rebuilding source packets.

Forbidden:

- AI learning generation.
- Official Markdown rewrite.
- OCR.
- `encrypt=1` decryption.
- Image table reconstruction.
- Raw XHR direct read.
- No raw XHR direct read.
- Full-site batch crawl.
- Phase 4.6 entry.

## 4. Parser Contract Requirements

A metadata snapshot is parser-ready only when:

- `final_url` contains `konwledgeInfo`.
- `detail_entry_route_changed = true`.
- `detail_entry_success = true`.
- `.knowInfo.ql-editor` outerHTML exists.
- `parser_contract_ready = true`.
- Parse uses strict `--timestamp` mode without fallback.

## 5. Detail Entry Binding Policy

Detail entry must bind to the matched leaf row/container. Recovery must not click a global first visible `去掌握` button. If the matched leaf itself is clickable, it may be clicked only as part of the matched-leaf flow, followed by a row-bound detail-entry action when needed.

`13.3 软件架构风格` remains `taxonomy_suspect` and should be modeled as a multi-card sequence unless later verified otherwise.

## 6. Commands

```bash
pnpm test:baseline-detail-entry -- --title "1.3 指令系统CISC和RISC"
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

## 7. Success Criteria

- Detail-entry test script exists and runs.
- Recovery report includes `parser_contract_ready` per item.
- Exact timestamp parse succeeds for at least one baseline, or failure reason is exact.
- Source packet updates availability.
- No AI content generated.
- Typecheck and structure verification pass.

Ideal success:

- Three baseline intermediates recovered.
- `1.3` asset manifest/files recovered if source images are available.
- Source packet complete count improves.

## 8. Failure Handling

If detail entry fails:

- Do not parse.
- Record failure.

If parser contract is not ready:

- Do not parse.
- Record failure.

If asset capture fails:

- Keep intermediate.
- Mark asset missing.
- Do not OCR.
