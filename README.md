# 软考高级系统架构设计师知识库工程

## 1. 项目定位

本仓库用于构建一个 Markdown-first 的软考高级系统架构设计师知识库工程。它面向长期整理、复核和再加工，目标是把公开资料、考试大纲、真题考点和人工笔记逐步重构为可检索、可验证、可复用的 Markdown 知识资产。

知识库的核心输出链路是：

知识点 -> 架构解释 -> 约束模型 -> 案例答法 -> 论文素材。

## 2. 为什么不是简单网页备份

本项目不追求网页镜像，也不复制网页笔记。网页备份只能保留原始内容形态，无法保证考点覆盖、架构解释质量、案例答题结构或论文复用价值。

本项目更关注：

- 把概念转化为架构不变量和设计约束。
- 把零散资料转化为可审查的 Markdown 文档。
- 把案例题经验沉淀为问题背景、约束、失效原因和改造方案。
- 把论文素材组织为项目背景、技术选型、质量属性和效果评估。
- 保留来源元数据，支持后续追溯、校验和覆盖率检查。

## 3. 目录结构说明

```text
.
├── AGENTS.md                         # 项目协作规范和不可变输出结构
├── README.md                         # 项目说明
├── config/
│   ├── sources.yaml                   # 后续来源登记和元数据策略
│   └── taxonomy.yaml                  # 知识库分类和文档结构约束
├── data/                              # 后续派生数据或验证数据
├── docs/
│   └── roadmap/
│       └── project-roadmap.md         # 阶段路线说明
├── scripts/
│   └── verify-structure.ts            # Phase 0/1 结构验证脚本
├── sources/                           # 后续来源原始数据和解析数据
├── templates/
│   ├── case-analysis-card.md          # 案例分析模板
│   ├── concept-card.md                # 知识点模板
│   └── paper-template.md              # 论文素材模板
└── verification/
    └── phase0-structure-check.md      # 本阶段验收标准
```

未来来源数据应按如下结构保存：

```text
sources/<source-name>/raw/
sources/<source-name>/parsed/
docs/
```

每个来源数据必须保留 source URL、capture time、content hash 和 parser version。

## 4. 后续阶段路线

- Phase 1: project scaffold and templates
- Phase 2: Playwright crawler
- Phase 3: parser and schema validation
- Phase 4: Markdown renderer
- Phase 5: exam coverage verification

当前仓库只完成 Phase 0/1：项目骨架、文档规范、模板和最小验证脚本。

## 5. 本阶段如何验证

安装依赖：

```bash
pnpm install
```

类型检查：

```bash
pnpm typecheck
```

结构验证：

```bash
pnpm verify
```

`pnpm verify` 会检查关键目录、关键文件、模板标题，以及 `AGENTS.md` 中的 `Non-Negotiable Output Structure`。
