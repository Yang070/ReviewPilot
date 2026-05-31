# ReviewPilot 架构设计

ReviewPilot 是一个面向 Pull Request 的 AI 代码评审工作台。系统核心思路不是直接把完整 diff 交给大模型，而是先完成 PR 结构化、风险排序、规则预检和轻量化知识图谱构建，再让 Reviewer 与 Auditor 基于结构化上下文进行审查。

```text
GitHub PR / unified diff / .diff / .patch
-> 输入解析层
-> Diff 与文件结构解析
-> 风险感知策略层
-> 规则预检层
-> 轻量化 Review Knowledge Graph
-> Reviewer 初审
-> Auditor 复核
-> 最终结果融合
-> 代码评审工作台 / Ask PR / 历史记录 / Markdown 导出
```

## 1. 输入层

ReviewPilot 支持三种输入方式：

- GitHub 公开 PR 链接
- 直接粘贴 unified diff
- 上传 `.diff` / `.patch` 文件

输入层负责把不同来源统一转换为 diff 文本和 PR 元信息，供后续分析流程使用。公开 GitHub PR 不要求 GitHub Token，适合本地演示和公开仓库评审。

## 2. Diff 与文件结构解析

解析层会从 diff 中提取：

- 变更文件名、文件状态和文件类型
- 新增 / 删除行数
- hunk 信息
- 行级 parsed_lines
- file_diffs，用于前端代码评审页展示 Unified Diff

这些结构化结果既用于后端分析，也用于前端可视化阅读。当前代码评审页保留 Unified Diff 主视图，减少 Split Diff 布局带来的阅读干扰。

## 3. 风险感知策略层

风险感知策略层在调用模型前先进行确定性判断，主要包括：

- 根据文件类型、路径关键词、变更规模和文件状态计算风险分。
- 对入口、路由、状态管理、认证、支付、配置和依赖文件提高关注度。
- 对测试文件、lock 文件或低影响文件进行适当降权。
- 按风险优先级选择重点上下文，避免大 PR 中平均分配模型注意力。

这层的目标是告诉系统“哪些文件应该先看”，而不是让模型从大量 diff 中自己猜重点。

## 4. 规则预检层

规则预检在模型分析前执行，用于发现候选关注点。规则结果不是最终结论，而是给 Reviewer / Auditor 的结构化线索。

当前规则可覆盖：

- 路由兜底和未知路径处理
- 异步错误处理
- Context / Provider 包裹关系
- 删除或重命名文件后的引用同步
- package 与 lock 文件同步
- 表单校验、权限检查和环境变量暴露等常见风险

用户可以在页面中配置规则，启用、禁用、新增或编辑规则。

## 5. 轻量化 Review Knowledge Graph

轻量化知识图谱是 ReviewPilot 的核心创新点之一。它不是完整 IDE 级静态分析，也不是复杂数据库图谱，而是面向 PR Review 的轻量关系图，用来把模型输入从“散乱 diff 文本”变成“可推理的 Review 上下文”。

图谱中的主要节点包括：

- PR 概览：标题、描述、变更规模和整体风险
- 文件节点：文件路径、文件类型、状态、新增/删除行数
- 风险节点：风险分、风险原因、规则命中和 AI 问题
- 上下文节点：重点文件、上下文覆盖、测试线索和关键路径信号
- 审计节点：Reviewer 初审结果、Auditor 复核结果和最终融合结果

图谱中的关系包括：

- PR 包含哪些变更文件
- 文件属于哪些风险类别
- 哪些规则命中了哪些文件
- 哪些问题来自 Reviewer，哪些被 Auditor 复核或降级
- 哪些文件可能缺少测试覆盖或需要人工复核

这套设计参考了 KnowGPT 中“先构建知识结构，再引导大模型推理”的思想。ReviewPilot 用轻量化 Review Knowledge Graph 组织文件关系、变更类型、风险信号和上下文线索，再把它交给 Reviewer-Auditor 流程，提升 Review 建议的可解释性，降低误报和漏报。

## 6. Reviewer-Auditor 双模型审计

深度审计模式包含两个阶段：

- **Reviewer**：基于 diff、风险排序、规则预检和 Review Knowledge Graph 生成初步 Review 建议。
- **Auditor**：不重新写完整报告，而是复核 Reviewer 的输出，检查证据是否充分、是否过度推断、是否遗漏高风险线索、风险等级和置信度是否合理。

最终融合逻辑会把结果分为：

- 高可信风险
- 潜在风险
- 需要人工复核
- 证据不足或疑似误报的问题

这个机制不能完全替代人工 Reviewer，但可以减少单模型直接输出时常见的误报、漏报和过度自信。

## 7. 前端评审工作台

前端采用深色 AI PR Review 工作台布局，核心路径是：

```text
风险文件列表 -> Unified Diff -> AI 问题卡片 -> Review 操作 / Ask PR 追问
```

主要界面包括：

- 总览页：展示整体风险、关键文件、测试建议和主要变更。
- 代码评审页：左侧风险文件列表，中间 Unified Diff，右侧 AI 问题卡片。
- AI 问题面板：按问题类型、风险等级、文件位置和人工复核状态展示。
- Ask PR：围绕当前报告继续追问，支持即时展示用户消息、AI loading、失败重试和快捷问题。
- 历史记录：查看过往 Review，并导出 Markdown 报告。
- 模型设置：配置 OpenAI-Compatible Provider、Base URL、API Key 和模型名称。

## 8. 模型与配置

ReviewPilot 支持 OpenAI-Compatible 模型接口，可接入 Qwen、DeepSeek、OpenAI 等模型服务。模型配置在前端设置页完成，用户可以保存多个 Provider 和模型名称，并在评审时选择快速分析或深度审计。

本地演示账号可用于快速体验，但免费 API 可能存在响应延迟、限流或超时。遇到不可用情况时，应更换为其他可用模型。

## 9. 幻觉控制与可解释性

系统通过以下方式控制幻觉：

- 模型输入来自 diff、文件结构、规则预检和 Review Knowledge Graph。
- Prompt 限制模型不能编造文件、接口、数据库表和行号。
- 问题必须绑定文件、位置、证据和建议。
- Reviewer 输出需要经过 Auditor 复核。
- 风险等级、置信度和人工复核状态分开展示。
- 前端默认折叠长篇技术细节，让用户先看代码证据和问题卡片。

## 10. 当前限制与未来扩展

- 当前轻量化知识图谱主要用于 Review 上下文组织，后续可增强 import、调用链和测试影响分析。
- 大型 PR 的分块分析、缓存和长上下文压缩仍有优化空间。
- 当前 GitHub PR 获取主要面向公开仓库，私有仓库可后续接入 Token。
- 后续可接入 GitHub Review Comment API，实现从建议到真实 PR 评论的闭环。
