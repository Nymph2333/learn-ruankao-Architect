# Human Review Input Template — Phase 7.4 AI Learning Generated Outputs

> **This template must be filled manually by a real human reviewer.**
> Codex / AI must not fill `reviewer`, `reviewed_at`, `decision_result`, or `issues` fields.

## Purpose

This template provides the structure for a human reviewer to record their review of the
Phase 7.4 AI learning generation execution outputs (36 items across 8 categories + 3
unsupported generation items).

## Boundary

- **Do NOT** use AI to fill this template.
- **Do NOT** fabricate reviewer identity or timestamps.
- **Do NOT** choose a `decision_result` without a real review.
- **Do NOT** fabricate issues.
- Phase 7.7 remains **blocked** until a non-template human review input artifact exists.

## Required Fields for a Valid Submission

A valid human review input artifact must include all of the following:

| Field | Description |
|-------|-------------|
| `reviewer` | Real reviewer name or identifier (not null) |
| `reviewed_at` | ISO-8601 timestamp of when the review was completed (not null) |
| `review_scope.reviewed_output_category_count` | Number of output categories actually reviewed |
| `review_scope.reviewed_generated_item_count` | Number of generated items actually reviewed |
| `review_scope.reviewed_unsupported_generation_item_count` | Number of unsupported items actually reviewed |
| `review_confirmations.*` | All 10 confirmation fields must be `true` or `false` (not null) |
| `decision_result` | One of the 5 allowed values (not null) |
| `issues` | Array of issues found (can be empty `[]` if none) |

## Allowed Decision Results

1. `approve_for_quality_review` — outputs acceptable, proceed to quality review
2. `require_minor_revision_plan` — minor issues found, revision plan needed
3. `require_major_revision_plan` — major issues found, revision plan needed
4. `reject_generation_batch` — outputs rejected, regeneration required
5. `request_source_recheck` — source material needs re-verification

## Issue Severity Levels

- `blocker` — must be resolved before any further progression
- `major` — significant quality or correctness problem
- `minor` — small quality issue, does not block progression
- `advisory` — suggestion for improvement, not blocking

## Review Confirmations Checklist

The reviewer must check (`true` or `false`) each of the following:

1. `source_fidelity_checked` — outputs faithful to source material
2. `exam_relevance_checked` — outputs relevant to exam requirements
3. `conceptual_correctness_checked` — concepts are correct
4. `explanation_clarity_checked` — explanations are clear
5. `question_validity_checked` — practice questions are valid
6. `answer_rationale_consistency_checked` — answer rationales are consistent
7. `unsupported_item_correctness_checked` — unsupported items handled correctly
8. `traceability_sufficiency_checked` — traceability is sufficient
9. `hallucination_or_overreach_checked` — no hallucination or overreach detected
10. `duplicate_or_low_value_content_checked` — no duplicate or low-value content

## How to Submit

1. Copy `phase7_4_ai_learning_generation_human_review_input.template.json`
2. Fill all required fields listed above
3. Save the completed file as a new artifact in the appropriate location
4. The recording gate (Phase 7.6) will then detect the human review input and update its result

## Status

- Template created: 2026-06-05
- Phase 7.6 recording gate: `blocked` / `no_human_review_input`
- Phase 7.7: **blocked** (requires valid human review input)
