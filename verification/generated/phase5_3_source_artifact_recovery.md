# Phase 5.3 Source Artifact Recovery

Generated at: 2026-06-02T03:35:19.454Z

## Summary

- attempted_titles: 1.3 指令系统CISC和RISC, 13.3 软件架构风格, 9.1 信息安全基础知识
- recovered_intermediate_count: 3
- recovered_asset_manifest_count: 1
- recovered_asset_file_count: 1
- asset_files_after_total: 1
- failed_count: 0
- phase5_2_ai_generation_allowed: false

## Items

### 1.3 指令系统CISC和RISC

- render_as: asset_card
- intermediate_before: false
- intermediate_after: true
- effective_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-31-42-677Z.json`
- asset_manifest_before: false
- asset_manifest_after: true
- effective_asset_manifest_path: `sources/ruankaodaren/raw/assets/manifests/2026-06-02T03-31-42-677Z.json`
- asset_files_after: 1
- detail_entry_test_pass: true
- parser_contract_ready: true
- parser_contract_failure_reason: (none)
- metadata_path: `sources/ruankaodaren/raw/metadata/2026-06-02T03-31-42-677Z.json`
- outer_html_path: `sources/ruankaodaren/raw/outer-html/2026-06-02T03-31-42-677Z-knowInfo_ql-editor.html`
- parsed_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-31-42-677Z.json`
- recovery_status: recovered
- taxonomy_suspect: false
- notes:
  - official Markdown present and read for status only: docs/ruankaodaren/baseline/1.3_指令系统CISC和RISC.md
  - selected exact-title metadata timestamp: 2026-06-02T03-31-42-677Z
  - one or more controlled recovery commands exited non-zero; see commands[].output_tail
- commands:
  - detail_entry_test: ok=true, exit_code=0
  - crawl_require_leaf: ok=true, exit_code=0
  - parse: ok=true, exit_code=0
  - validate_intermediate: ok=false, exit_code=1
  - preflight: ok=true, exit_code=0
  - capture_assets: ok=true, exit_code=0
  - validate_assets: ok=true, exit_code=0

### 13.3 软件架构风格

- render_as: short_card
- intermediate_before: false
- intermediate_after: true
- effective_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-33-07-412Z.json`
- asset_manifest_before: false
- asset_manifest_after: false
- effective_asset_manifest_path: `(none)`
- asset_files_after: 0
- detail_entry_test_pass: true
- parser_contract_ready: true
- parser_contract_failure_reason: (none)
- metadata_path: `sources/ruankaodaren/raw/metadata/2026-06-02T03-33-07-412Z.json`
- outer_html_path: `sources/ruankaodaren/raw/outer-html/2026-06-02T03-33-07-412Z-knowInfo_ql-editor.html`
- parsed_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-33-07-412Z.json`
- recovery_status: partially_recovered
- taxonomy_suspect: true
- notes:
  - official Markdown present and read for status only: docs/ruankaodaren/baseline/13.3_软件架构风格.md
  - selected exact-title metadata timestamp: 2026-06-02T03-33-07-412Z
  - taxonomy_suspect=true for 13.3 pending live parent/leaf/multi-card diagnosis
  - 13.3 low extracted text signal: 61
  - one or more controlled recovery commands exited non-zero; see commands[].output_tail
- commands:
  - detail_entry_test: ok=true, exit_code=0
  - crawl_require_leaf: ok=true, exit_code=0
  - parse: ok=true, exit_code=0
  - validate_intermediate: ok=false, exit_code=1
  - preflight: ok=true, exit_code=0

### 9.1 信息安全基础知识

- render_as: concept_card
- intermediate_before: false
- intermediate_after: true
- effective_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-34-31-932Z.json`
- asset_manifest_before: false
- asset_manifest_after: false
- effective_asset_manifest_path: `(none)`
- asset_files_after: 0
- detail_entry_test_pass: true
- parser_contract_ready: true
- parser_contract_failure_reason: (none)
- metadata_path: `sources/ruankaodaren/raw/metadata/2026-06-02T03-34-31-932Z.json`
- outer_html_path: `sources/ruankaodaren/raw/outer-html/2026-06-02T03-34-31-932Z-knowInfo_ql-editor.html`
- parsed_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-34-31-932Z.json`
- recovery_status: recovered
- taxonomy_suspect: false
- notes:
  - official Markdown present and read for status only: docs/ruankaodaren/baseline/9.1_信息安全基础知识.md
  - selected exact-title metadata timestamp: 2026-06-02T03-34-31-932Z
  - one or more controlled recovery commands exited non-zero; see commands[].output_tail
- commands:
  - detail_entry_test: ok=true, exit_code=0
  - crawl_require_leaf: ok=true, exit_code=0
  - parse: ok=true, exit_code=0
  - validate_intermediate: ok=false, exit_code=1
  - preflight: ok=true, exit_code=0

## Constraints

- No AI learning content was generated.
- No official Markdown was rewritten.
- No human-review status was signed off.
- No OCR was used.
- No encrypt=1 data was decrypted.
- No image table was reconstructed.
- No raw XHR was read directly by this script.
- No full-site batch crawl was run.
- Phase 4.6 was not entered.
