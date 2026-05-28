# Phase 3.16 Detail-body Binding Audit

Generated at: 2026-05-27T16:04:29.462Z

## Summary

| Metric | Value |
|---|---:|
| Target count | 3 |
| weak_text_unknown | 1 |
| semantic_audit_false_positive | 1 |
| unknown | 1 |

## Target Traces

| Target | Binding status | Timestamp integrity | Raw text length | Intermediate text length | Semantic body alignment | Recommended fix |
|---|---|---|---:|---:|---|---|
| 3.3 数据库的设计 | weak_text_unknown | matched | 77 | 64 | insufficient_text | Do not count this sample as renderer baseline; either choose a richer leaf or add a detail-body completeness gate before parse. |
| 5.1 网络概述和模型 | semantic_audit_false_positive | matched | 51 | 44 | matched | Improve semantic token evidence to recognize decisive target terms without weakening quarantine for unrelated content. |
| 8.8 典型信息系统架构模型 | unknown | matched | 148 | 128 | mismatched | Collect missing trace evidence before acquisition continues. |

## Evidence

### 3.3 数据库的设计

- **crawl_timestamp**: 2026-05-27T14-34-52-493Z
- **metadata_path**: sources/ruankaodaren/raw/metadata/2026-05-27T14-34-52-493Z.json
- **intermediate_path**: data/intermediate/ruankaodaren/samples/2026-05-27T14-34-52-493Z.json
- **outerHTML**: sources/ruankaodaren/raw/outer-html/2026-05-27T14-34-52-493Z-knowInfo_ql-editor.html
- **metadata target**: 3.3 数据库的设计
- **intermediate title**: 3.3 数据库的设计
- **raw text preview**: 需求分析： 即分析数据存储的要求，产出物有 数据流图 、 数据字典 、 需求说明书 。获得用户对系统的三个要求： 信息要求 、 处理要求 、 系统要求 。
- **intermediate text preview**: 需求分析：即分析数据存储的要求，产出物有数据流图、数据字典、需求说明书。获得用户对系统的三个要求：信息要求、处理要求、系统要求。
- **semantic expected tokens**: 3.3, 数据库的设计, 数据库的, 数据库
- **semantic matched tokens**: (none)
- **semantic detected signals**: 存储
- **screenshot exists**: true
- **before/after debug screenshots exist**: true / true
- **evidence**:
  - detail body is short (77 chars) and has no image_refs
- **recommended_fix**: Do not count this sample as renderer baseline; either choose a richer leaf or add a detail-body completeness gate before parse.

### 5.1 网络概述和模型

- **crawl_timestamp**: 2026-05-27T14-36-07-171Z
- **metadata_path**: sources/ruankaodaren/raw/metadata/2026-05-27T14-36-07-171Z.json
- **intermediate_path**: data/intermediate/ruankaodaren/samples/2026-05-27T14-36-07-171Z.json
- **outerHTML**: sources/ruankaodaren/raw/outer-html/2026-05-27T14-36-07-171Z-knowInfo_ql-editor.html
- **metadata target**: 5.1 网络概述和模型
- **intermediate title**: 5.1 网络概述和模型
- **raw text preview**: 计算机网络是计算机技术与通信技术相结合的产物，它实现了 远程通信 、 远程信息处理 和 资源共 享 。
- **intermediate text preview**: 计算机网络是计算机技术与通信技术相结合的产物，它实现了远程通信、远程信息处理和资源共享。
- **semantic expected tokens**: 5.1, 网络概述和模型, 网络概述和, 网络概述, 网络
- **semantic matched tokens**: 网络
- **semantic detected signals**: 网络
- **screenshot exists**: true
- **before/after debug screenshots exist**: true / true
- **evidence**:
  - raw outerHTML contains target keyword evidence but semantic audit still rejects renderer eligibility
- **recommended_fix**: Improve semantic token evidence to recognize decisive target terms without weakening quarantine for unrelated content.

### 8.8 典型信息系统架构模型

- **crawl_timestamp**: 2026-05-27T14-37-21-375Z
- **metadata_path**: sources/ruankaodaren/raw/metadata/2026-05-27T14-37-21-375Z.json
- **intermediate_path**: data/intermediate/ruankaodaren/samples/2026-05-27T14-37-21-375Z.json
- **outerHTML**: sources/ruankaodaren/raw/outer-html/2026-05-27T14-37-21-375Z-knowInfo_ql-editor.html
- **metadata target**: 8.8 典型信息系统架构模型
- **intermediate title**: 8.8 典型信息系统架构模型
- **raw text preview**: 政府信息化和电子政府： 电子政务实质上是对现有的、工业时代形成的政府形态的一种改造，即 利用信息技术 和 其他相关技术 ，将其 管理 和 服务职能 进行集成，在网络上实现政府组织结构和工作流程优化重组，超越时间、空间与部门分隔的制约，实现 公务 、 政务 、 商务 、 事务 的一体化管理与运行。
- **intermediate text preview**: 政府信息化和电子政府： 电子政务实质上是对现有的、工业时代形成的政府形态的一种改造，即 利用信息技术 和 其他相关技术 ，将其 管理 服务职能 进行集成，在网络上实现政府组织结构和工作流程优化重组，超越时间、空间与部门分隔的制约，实现 公务 、 政务 商务 事务 的一体化管理与运行。
- **semantic expected tokens**: 8.8, 典型信息系统架构模型, 典型信息系统架构, 架构, 信息系统
- **semantic matched tokens**: (none)
- **semantic detected signals**: 网络
- **screenshot exists**: true
- **before/after debug screenshots exist**: true / true
- **evidence**:
  - no decisive binding evidence found
- **recommended_fix**: Collect missing trace evidence before acquisition continues.

## Constraints

- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 was not entered.
