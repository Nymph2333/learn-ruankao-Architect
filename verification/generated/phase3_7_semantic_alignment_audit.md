# Phase 3.7 Semantic Alignment Audit

Generated at: 2026-05-28T05:27:01.469Z

## Summary

| Metric | Value |
|---|---:|
| Total samples | 15 |
| matched | 11 |
| likely_matched | 3 |
| mismatched | 4 |
| quarantined | 13 |
| duplicate_actual_content | 10 |
| duplicate_same_title | 4 |
| renderer_eligible | 2 |

## Samples

| Timestamp | Title | Requested target | Target node | Alignment | Body alignment | Duplicate | Quarantined | Reason | Renderer eligible |
|---|---|---|---|---|---|---|---|---|---|
| 2026-05-26T09-40-21-903Z | 1.3 指令系统CISC和RISC |  | 1.3 指令系统CISC和RISC | matched | matched | dup-1 | no |  | yes |
| 2026-05-27T01-32-02-914Z | 第3章 数据库系统 | 数据库 | 第3章 数据库系统 | likely_matched | unknown | dup-2 | yes | duplicate_actual_content | no |
| 2026-05-27T01-32-47-268Z | 第5章 计算机网络 | 网络 | 第5章 计算机网络 | likely_matched | unknown | dup-2 | yes | duplicate_actual_content | no |
| 2026-05-27T02-17-40-989Z | 3.1 数据库系统常识 | 数据库 | 3.1 数据库系统常识 | likely_matched | matched |  | yes | low_text | no |
| 2026-05-27T02-34-55-788Z | 1.3 指令系统CISC和RISC | 3.6 关系数据库的规范化 | 1.3 指令系统CISC和RISC | mismatched | matched | dup-1 | yes | target_body_mismatch | no |
| 2026-05-27T02-35-30-393Z | 1.5 存储系统 | 1.5 存储系统 | 1.5 存储系统 | matched | mismatched | dup-2 | yes | target_body_mismatch | no |
| 2026-05-27T02-36-04-460Z | 1.4 指令的流水处理 | 1.4 指令的流水处理 | 1.4 指令的流水处理 | matched | mismatched | dup-2 | yes | target_body_mismatch | no |
| 2026-05-27T14-34-52-493Z | 3.3 数据库的设计 | 3.3 数据库的设计 | 3.3 数据库的设计 | matched | insufficient_text |  | yes | low_text | no |
| 2026-05-27T14-36-07-171Z | 5.1 网络概述和模型 | 5.1 网络概述和模型 | 5.1 网络概述和模型 | matched | matched |  | yes | low_text | no |
| 2026-05-27T14-37-21-375Z | 8.8 典型信息系统架构模型 | 8.8 典型信息系统架构模型 | 8.8 典型信息系统架构模型 | matched | mismatched |  | yes | target_body_mismatch | no |
| 2026-05-28T02-54-15-543Z | 13.3 软件架构风格 | 13.3 软件架构风格 | 13.3 软件架构风格 | matched | insufficient_text | dup-3 | yes | low_text | no |
| 2026-05-28T02-59-11-656Z | 13.3 软件架构风格 | 13.3 软件架构风格 | 13.3 软件架构风格 | matched | insufficient_text | dup-3 | yes | duplicate_same_title | no |
| 2026-05-28T03-03-37-856Z | 13.3 软件架构风格 | 13.3 软件架构风格 | 13.3 软件架构风格 | matched | insufficient_text | dup-3 | yes | duplicate_same_title | no |
| 2026-05-28T03-10-01-532Z | 13.3 软件架构风格 | 13.3 软件架构风格 | 13.3 软件架构风格 | matched | insufficient_text | dup-3 | yes | duplicate_same_title | no |
| 2026-05-28T05-25-27-891Z | 9.1 信息安全基础知识 | 9.1 信息安全基础知识 | 9.1 信息安全基础知识 | matched | matched |  | no |  | yes |

## Failure Evidence

### 2026-05-27T01-32-02-914Z / 第3章 数据库系统

- expected_tokens: 第3章数据库系统, 第3章数据库, 章数据库系统, 数据库
- matched_expected_tokens: (none)
- missing_expected_tokens: 第3章数据库系统, 第3章数据库, 章数据库系统, 数据库
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: no_decisive_body_evidence
- detected_body_signals: 码距, 纠错, 检错
- text_preview_used: 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。 1 改变的位数 2 纠错和检错 码距： 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 码距： 就单个编码A:00而言，其码距为 1 ，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要 改变的位数 称为码距，如A:00要转换为B:11，码距为 2 。一般来说，码距越大，越利于 纠错和检错 。

### 2026-05-27T01-32-47-268Z / 第5章 计算机网络

- expected_tokens: 第5章计算机网络, 章计算机网络, 网络
- matched_expected_tokens: (none)
- missing_expected_tokens: 第5章计算机网络, 章计算机网络, 网络
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: no_decisive_body_evidence
- detected_body_signals: 码距, 纠错, 检错
- text_preview_used: 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。 1 改变的位数 2 纠错和检错 码距： 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 码距： 就单个编码A:00而言，其码距为 1 ，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要 改变的位数 称为码距，如A:00要转换为B:11，码距为 2 。一般来说，码距越大，越利于 纠错和检错 。

### 2026-05-27T02-17-40-989Z / 3.1 数据库系统常识

- expected_tokens: 3.1, 数据库系统常识, 数据库系统, 数据库
- matched_expected_tokens: 数据库系统, 数据库
- missing_expected_tokens: 3.1, 数据库系统常识
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: body_contains_expected_token
- detected_body_signals: 数据库
- text_preview_used: 数据库系统DBS的组成： 数据库 硬件 软件 人员 数据库系统DBS的组成： 数据库系统DBS的组成：数据库、硬件、软件、人员。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 数据库系统DBS的组成： 数据库 、 硬件 、 软件 、 人员 。

### 2026-05-27T02-34-55-788Z / 1.3 指令系统CISC和RISC

- expected_tokens: 1.3, 指令系统cisc和risc, 指令系统cisc, risc, cisc, 指令系统, 3.6, 关系数据库的规范化, 关系数据库, 规范化, 数据库
- matched_expected_tokens: risc, cisc, 指令系统
- missing_expected_tokens: 1.3, 指令系统cisc和risc, 指令系统cisc, 3.6, 关系数据库的规范化, 关系数据库, 规范化, 数据库
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, image_refs.surrounding_text, html_fragments, metadata.detail_content_text_preview
- decision_reason: body_contains_expected_token
- detected_body_signals: CISC, RISC
- text_preview_used: CISC是复杂指令系统：兼容性强，指令繁多、长度可变，由微程序实现。 RISC是精简指令系统：指令少，使用频率接近，主要依靠硬件实现(通用寄存器、硬布线逻辑控制)。 二者各方面区分如下图： 兼容性强 指令繁多 长度可变 微程序 指令少 硬件实现 CISC是复杂指令系统： CISC是复杂指令系统：兼容性强，指令繁多、长度可变，由微程序实现。 RISC是精简指令系统：指令少，使用频率接近，主要依靠硬件实现(通用寄存器、硬布线逻辑控制)。 二者各方面区分如下图：
- image_refs_surrounding_text_used: 二者各方面区分如下图：
- html_fragment_text_used: CISC是复杂指令系统： 兼容性强 ， 指令繁多 、 长度可变 ，由 微程序 实现。 RISC是精简指令系统： 指令少 ，使用频率接近，主要依靠 硬件实现 (通用寄存器、硬布线逻辑控制)。 二者各方面区分如下图：

### 2026-05-27T02-35-30-393Z / 1.5 存储系统

- expected_tokens: 1.5, 存储系统, 存储
- matched_expected_tokens: (none)
- missing_expected_tokens: 1.5, 存储系统, 存储
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: leaf_title_without_body_token_evidence
- detected_body_signals: 码距, 纠错, 检错
- text_preview_used: 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。 1 改变的位数 2 纠错和检错 码距： 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 码距： 就单个编码A:00而言，其码距为 1 ，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要 改变的位数 称为码距，如A:00要转换为B:11，码距为 2 。一般来说，码距越大，越利于 纠错和检错 。

### 2026-05-27T02-36-04-460Z / 1.4 指令的流水处理

- expected_tokens: 1.4, 指令的流水处理, 指令的流水, 指令, 流水处理
- matched_expected_tokens: (none)
- missing_expected_tokens: 1.4, 指令的流水处理, 指令的流水, 指令, 流水处理
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: leaf_title_without_body_token_evidence
- detected_body_signals: 码距, 纠错, 检错
- text_preview_used: 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。 1 改变的位数 2 纠错和检错 码距： 码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，码距为2。一般来说，码距越大，越利于纠错和检错。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 码距： 就单个编码A:00而言，其码距为 1 ，因为其只需要改变一位就变成另一个编码。在两个编码中，从A码到B码转换所需要 改变的位数 称为码距，如A:00要转换为B:11，码距为 2 。一般来说，码距越大，越利于 纠错和检错 。

### 2026-05-27T14-34-52-493Z / 3.3 数据库的设计

- expected_tokens: 3.3, 数据库的设计, 数据库的, 数据库
- matched_expected_tokens: (none)
- missing_expected_tokens: 3.3, 数据库的设计, 数据库的, 数据库
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: text_too_short_without_image_refs
- detected_body_signals: 存储
- text_preview_used: 需求分析：即分析数据存储的要求，产出物有数据流图、数据字典、需求说明书。获得用户对系统的三个要求：信息要求、处理要求、系统要求。 数据流图 数据字典 需求说明书 信息要求 处理要求 系统要求 需求分析： 需求分析：即分析数据存储的要求，产出物有数据流图、数据字典、需求说明书。获得用户对系统的三个要求：信息要求、处理要求、系统要求。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 需求分析： 即分析数据存储的要求，产出物有 数据流图 、 数据字典 、 需求说明书 。获得用户对系统的三个要求： 信息要求 、 处理要求 、 系统要求 。

### 2026-05-27T14-36-07-171Z / 5.1 网络概述和模型

- expected_tokens: 5.1, 网络概述和模型, 网络概述和, 网络概述, 网络
- matched_expected_tokens: 网络
- missing_expected_tokens: 5.1, 网络概述和模型, 网络概述和, 网络概述
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: body_contains_expected_token
- detected_body_signals: 网络
- text_preview_used: 计算机网络是计算机技术与通信技术相结合的产物，它实现了远程通信、远程信息处理和资源共享。 远程通信 远程信息处理 资源共 享 计算机网络是计算机技术与通信技术相结合的产物，它实现了 、 和 计算机网络是计算机技术与通信技术相结合的产物，它实现了远程通信、远程信息处理和资源共享。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 计算机网络是计算机技术与通信技术相结合的产物，它实现了 远程通信 、 远程信息处理 和 资源共 享 。

### 2026-05-27T14-37-21-375Z / 8.8 典型信息系统架构模型

- expected_tokens: 8.8, 典型信息系统架构模型, 典型信息系统架构, 架构, 信息系统
- matched_expected_tokens: (none)
- missing_expected_tokens: 8.8, 典型信息系统架构模型, 典型信息系统架构, 架构, 信息系统
- conflicting_tokens: 网络
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: body_contains_conflicting_tokens
- detected_body_signals: 网络
- text_preview_used: 政府信息化和电子政府： 电子政务实质上是对现有的、工业时代形成的政府形态的一种改造，即 利用信息技术 和 其他相关技术 ，将其 管理 服务职能 进行集成，在网络上实现政府组织结构和工作流程优化重组，超越时间、空间与部门分隔的制约，实现 公务 、 政务 商务 事务 的一体化管理与运行。 利用信息技术 其他相关技术 管理 服务职能 公务 政务 商务 事务 政府信息化和电子政府： 政府信息化和电子政府：电子政务实质上是对现有的、工业时代形成的政府形态的一种改造，即利用信息技术和其他相关技术，将其管理和服务职能进行集成，在网络上实现政府组织结构和工作流程优化重组，超越时间、空间与部门分隔的制约，实现公务、政务、商务、事务的一体化管理与运行。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 政府信息化和电子政府： 电子政务实质上是对现有的、工业时代形成的政府形态的一种改造，即 利用信息技术 和 其他相关技术 ，将其 管理 和 服务职能 进行集成，在网络上实现政府组织结构和工作流程优化重组，超越时间、空间与部门分隔的制约，实现 公务 、 政务 、 商务 、 事务 的一体化管理与运行。

### 2026-05-28T02-54-15-543Z / 13.3 软件架构风格

- expected_tokens: 13.3, 软件架构风格, 架构
- matched_expected_tokens: (none)
- missing_expected_tokens: 13.3, 软件架构风格, 架构
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: text_too_short_without_image_refs
- detected_body_signals: (none)
- text_preview_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。 软件的构件，构件 的外部可见属性以及它们之间的相互关系 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 软件的构件，构件 的外部可见属性以及它们之间的相互关系 。

### 2026-05-28T02-59-11-656Z / 13.3 软件架构风格

- expected_tokens: 13.3, 软件架构风格, 架构
- matched_expected_tokens: (none)
- missing_expected_tokens: 13.3, 软件架构风格, 架构
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: text_too_short_without_image_refs
- detected_body_signals: (none)
- text_preview_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。 软件的构件，构件 的外部可见属性以及它们之间的相互关系 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 软件的构件，构件 的外部可见属性以及它们之间的相互关系 。

### 2026-05-28T03-03-37-856Z / 13.3 软件架构风格

- expected_tokens: 13.3, 软件架构风格, 架构
- matched_expected_tokens: (none)
- missing_expected_tokens: 13.3, 软件架构风格, 架构
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: text_too_short_without_image_refs
- detected_body_signals: (none)
- text_preview_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。 软件的构件，构件 的外部可见属性以及它们之间的相互关系 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 软件的构件，构件 的外部可见属性以及它们之间的相互关系 。

### 2026-05-28T03-10-01-532Z / 13.3 软件架构风格

- expected_tokens: 13.3, 软件架构风格, 架构
- matched_expected_tokens: (none)
- missing_expected_tokens: 13.3, 软件架构风格, 架构
- conflicting_tokens: (none)
- evidence_sources_used: text_blocks, key_terms, html_fragments, metadata.detail_content_text_preview
- decision_reason: text_too_short_without_image_refs
- detected_body_signals: (none)
- text_preview_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。 软件的构件，构件 的外部可见属性以及它们之间的相互关系 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括软件的构件，构件的外部可见属性以及它们之间的相互关系。
- image_refs_surrounding_text_used: (none)
- html_fragment_text_used: 一个程序和计算系统软件体系结构是指系统的一个或者多个结构。结构中包括 软件的构件，构件 的外部可见属性以及它们之间的相互关系 。

## Quarantine Manifest

Path: `data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json`

- 2026-05-27T01-32-02-914Z / 第3章 数据库系统: duplicate_actual_content
- 2026-05-27T01-32-47-268Z / 第5章 计算机网络: duplicate_actual_content
- 2026-05-27T02-17-40-989Z / 3.1 数据库系统常识: low_text
- 2026-05-27T02-34-55-788Z / 1.3 指令系统CISC和RISC: target_body_mismatch
- 2026-05-27T02-35-30-393Z / 1.5 存储系统: target_body_mismatch
- 2026-05-27T02-36-04-460Z / 1.4 指令的流水处理: target_body_mismatch
- 2026-05-27T14-34-52-493Z / 3.3 数据库的设计: low_text
- 2026-05-27T14-36-07-171Z / 5.1 网络概述和模型: low_text
- 2026-05-27T14-37-21-375Z / 8.8 典型信息系统架构模型: target_body_mismatch
- 2026-05-28T02-54-15-543Z / 13.3 软件架构风格: low_text
- 2026-05-28T02-59-11-656Z / 13.3 软件架构风格: duplicate_same_title
- 2026-05-28T03-03-37-856Z / 13.3 软件架构风格: duplicate_same_title
- 2026-05-28T03-10-01-532Z / 13.3 软件架构风格: duplicate_same_title

## Constraints

- No raw artifacts deleted.
- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 was not entered.
