# Phase 4.5 Controlled Expansion Plan

This plan is a gate, not an expansion run. It does not render new official Markdown, approve documents, crawl, access raw HTML/XHR, use OCR, or access the web.

## Current Status

- official_baseline_docs: 3
- human_review_overall_status: `pending_review`
- expansion_allowed: false
- boundary_violation_count: 0

## Source Reports

- human_review_status: `reviews/ruankaodaren/baseline/human-review-status.json`
- renderer_input_contract: `verification/generated/phase3_25_renderer_input_contract.json`
- renderer_baseline_manifest: `verification/generated/phase3_23_renderer_baseline_manifest.json`
- render_quality_audit: `verification/generated/phase4_3_render_quality_audit.json`
- renderer_policy_refinement_report: `verification/generated/phase4_4_renderer_policy_refinement_report.json`

## Phase 4.6 Entry Conditions

- [ ] All three baseline items are accepted or accepted_with_notes by a human reviewer.
- [ ] Every required human review check is true.
- [x] No renderer boundary violations exist.
- [x] Baseline renderer validation still passes.
- [x] Renderer input contract remains valid and constraints-safe.
- [x] Forbidden input policy remains unchanged.

## Phase 4.6 Expansion Scope Proposal

- mode: `controlled_expansion_dry_run`
- additional reachable leaf nodes: 3-5

### Requirements

- Each new node must come from a reachable leaf catalog or an equivalent validated reachable-leaf source.
- Each new node must enter the renderer baseline manifest before official rendering.
- Each new node must have an explicit renderer_policy.
- Each new node must pass render dry-run before official rendering.
- Each new node must preserve the Phase 3.25 forbidden-input policy.

### Prohibited Scope

- No full-library rendering.
- No rendering outside a controlled 3-5 node expansion.
- No rendering of nodes that are not in a renderer baseline manifest.

## Explicit Prohibitions

- no full-site rendering
- no OCR
- no raw HTML direct read
- no raw XHR direct read
- no web requests
- no image table reconstruction
- no encrypted XHR decryption
- no content invention

## Recommended Next Phase

- manual_human_review
