# <Case Topic English> / <案例主题中文>

## 1. Problem Background / 问题背景

> 描述业务目标、系统规模、用户场景、外部约束和题干给出的质量属性压力。

- Business Goal / 业务目标: `<目标>`
- Stakeholders / 相关方: `<用户、运维、管理、监管等>`
- Quality Attribute Pressure / 质量属性压力: `<性能、可用性、安全性、可维护性等>`

## 2. Current Architecture / 架构现状

- System Boundary / 系统边界: `<系统包含与不包含的范围>`
- Key Components / 关键构件: `<构件列表>`
- Data Flow / 数据流: `<数据如何进入、处理、输出>`
- Deployment Context / 部署环境: `<部署、网络、存储或集成环境>`

## 3. Key Constraints / 关键约束

| Constraint / 约束 | Evidence In Prompt / 题干证据 | Architectural Impact / 架构影响 |
| --- | --- | --- |
| `<约束>` | `<题干线索>` | `<影响>` |

## 4. Failure Cause / 失效原因

用因果链表达失效，而不是只列现象：

```text
<约束变化> -> <架构假设失效> -> <局部瓶颈或风险暴露> -> <业务或质量属性受损>
```

- Direct Cause / 直接原因: `<直接触发点>`
- Root Cause / 根因: `<架构层面的根因>`
- Missing Control / 缺失控制: `<缺少的治理、隔离、冗余、监控或安全机制>`

## 5. Improvement Plan / 改造方案

| Layer / 层面 | Action / 改造动作 | Expected Effect / 预期效果 | Risk / 风险 |
| --- | --- | --- | --- |
| Application / 应用 | `<动作>` | `<效果>` | `<风险>` |
| Data / 数据 | `<动作>` | `<效果>` | `<风险>` |
| Infrastructure / 基础设施 | `<动作>` | `<效果>` | `<风险>` |
| Governance / 治理 | `<动作>` | `<效果>` | `<风险>` |

## 6. Exam Answer Structure / 考试答题结构

1. 先指出题干中的关键约束和质量属性目标。
2. 再解释现有架构为什么无法满足这些约束。
3. 按层次给出改造方案，避免只给孤立技术名词。
4. 说明每项方案对应解决的问题和可能代价。
5. 最后补充验证、监控、治理或迁移步骤。

## 7. Source Reference / 来源引用

| Field / 字段 | Value / 值 |
| --- | --- |
| Source URL / 来源 URL | `<url>` |
| Capture Time / 采集时间 | `<ISO-8601 time>` |
| Content Hash / 内容哈希 | `<hash>` |
| Parser Version / 解析器版本 | `<version>` |
| Review Status / 复核状态 | `<unreviewed / reviewed>` |
