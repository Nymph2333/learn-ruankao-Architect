# Phase 3.9 Preflight-gated Renderer Baseline Acquisition Check

## 1. Background

Phase 3.8 moved semantic preflight gates to the front of the acquisition pipeline. Before Phase 3.9, the current quality audit shows:

- `total_samples = 7`
- `quarantined_count = 6`
- `renderer_eligible_count = 1` (only the original 1.3 指令系统CISC和RISC)
- `phase4_renderer_allowed = false`

The six quarantined samples were rejected for duplicate actual content, low-text evidence, or target/body mismatch — the body did not contain the expected title signal terms. Acquisition without the preflight gate repeatedly produced unusable samples.

Phase 3.8 introduced a three-stage preflight: metadata gate, content gate, and duplicate gate. Only samples that pass all three gates may advance to parse, intermediate validation, semantic audit, and asset capture.

## 2. Objective

Acquire at most 3 new leaf-level samples that each pass the Phase 3.8 preflight gate and satisfy the semantic audit `renderer_eligible` criterion, raising `renderer_eligible_count` from 1 toward at least 3.

Samples that fail the preflight gate are written as diagnostics and do not count toward the renderer baseline. Samples that pass preflight but fail the semantic audit are quarantined and do not count.

## 3. Scope

Allowed:
- Controlled attempt of at most 3 leaf-level targets selected in `config/ruankaodaren-sample-targets.yaml`
- Each target must have `require_leaf: "true"` and `require_preflight: "true"`
- Each attempted target must pass metadata preflight before parse
- Each parsed sample must pass content preflight and duplicate gate before asset capture
- Each successful sample must pass semantic audit `renderer_eligible` before counting toward baseline
- Generate Phase 3.9 baseline acquisition report

Forbidden:
- Full-site crawling
- Markdown renderer
- OCR
- Decrypting `encrypt=1` data
- Automatic image table reconstruction
- Modifying exam content
- Entering Phase 4

## 4. Gate Sequence

```
crawl --target "<title_hint>" --require-leaf
  → metadata preflight (metadata_gate)
  → parse --latest-success
  → content preflight (content_gate + duplicate_gate)
  → validate:intermediate
  → semantic audit (renderer_eligible check)
  → [if renderer_eligible] asset capture
  → [if renderer_eligible] asset validation
  → quality audit
  → coverage report
```

Preflight fail at metadata_gate → diagnostic, no parse, skip to next target.
Preflight fail at content_gate or duplicate_gate → diagnostic, no asset capture.
Semantic audit renderer_eligible = false → quarantine, not counted in baseline.
Asset capture fail → sample preserved with asset risk flag; only added to baseline if no image_refs.

## 5. Success Criteria

Minimum success:
- `run:sample-acquisition` completes without unhandled errors
- Every failed target has a recorded reject reason (preflight fail, semantic audit fail, or quality audit fail)
- No new samples enter the renderer baseline without passing all gates
- `typecheck` and `verify` pass

Ideal success:
- `renderer_eligible_count >= 3`
- `phase4_renderer_allowed = true`

If renderer_eligible_count < 3 after this phase:
- `phase4_renderer_allowed = false`
- `required_before_phase4` states how many more renderer-eligible samples are needed

## 6. Failure Handling

If preflight fails at metadata_gate:
- Do not parse
- Do not generate a formal intermediate sample
- Write diagnostic to `data/intermediate/ruankaodaren/diagnostics/`

If semantic audit returns renderer_eligible = false:
- Quarantine the sample in `data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json`
- Do not count toward renderer baseline
- Continue to next target

If asset capture fails:
- The sample may be preserved in intermediate storage
- Mark asset risk in quality audit
- Do not include in renderer baseline unless `image_refs = 0`
- Do not enter Phase 4

Phase 3.10 adds deterministic target resolution after Phase 3.9 showed all candidate targets failed actual-node matching.

## 7. Phase 3.9 Report

The acquisition run writes two reports:

- `verification/generated/phase3_9_renderer_baseline_acquisition_run.json`
- `verification/generated/phase3_9_renderer_baseline_acquisition_run.md`

Required fields:
- `attempted_target_count`
- `target_list` with `title_hint` per target
- `preflight_result` per target
- `semantic_audit_result` per target
- `renderer_eligible` per target
- `preflight_pass_count`
- `preflight_fail_count`
- `renderer_eligible_added_count`
- `renderer_eligible_added_titles`
- `rejected_by_preflight`
- `rejected_by_semantic_audit`
- `rejected_by_quality_audit`
- `final_renderer_eligible_count`
- `phase4_renderer_allowed`
- `required_before_phase4`
