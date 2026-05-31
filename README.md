# ReviewPilot

## 1. 项目简介

ReviewPilot 是一个面向 Pull Request 的 AI 代码评审助手，帮助开发者在提交代码后快速理解变更内容、定位高风险文件，并生成可复核的 Review 建议。

项目支持 **GitHub PR 链接评审**、**粘贴 unified diff**、**上传 .diff / .patch 文件**，并结合风险感知分析、规则预检、Reviewer / Auditor 双模型审计、Ask PR 交互式追问和可视化审查界面，形成从输入、分析、复核到报告导出的完整 PR Review 流程。

## 2. Demo 链接

## Demo

- 演示视频：待补充

## 3. 项目亮点 / 原创功能

ReviewPilot 不只是把 diff 直接交给大模型生成评论，而是在模型调用前增加了一层可解释的 Review 策略。

- **风险感知文件排序**：根据文件类型、路径关键词、变更规模、文件状态等因素计算风险分，优先分析更可能影响业务逻辑的文件。
- **可配置规则预检**：在调用 AI 前先执行规则扫描，把异步错误处理、路由兜底、权限检查、依赖同步等候选问题结构化输出。
- **Reviewer-Auditor 双模型审计**：Reviewer 负责初步评审，Auditor 负责复核证据、误报、漏报和置信度，降低单模型输出的不确定性。
- **Ask PR 交互式追问**：完成评审后，用户可以围绕当前报告继续追问风险原因、测试覆盖和人工复核重点。
- **历史记录与报告导出**：每次分析会保存历史记录，并支持导出 Markdown 报告。
- **多模型 / API Key 配置中心**：支持 OpenAI-Compatible 接口，可配置 Qwen、DeepSeek、OpenAI 等不同模型。

项目的算法亮点是 **基于知识图谱式提示链的风险感知 PR Review 策略层**。

它借鉴 KnowGPT 中“先构建知识结构，再引导大模型推理”的思想：系统不会直接把完整 diff 丢给大模型，而是先把 PR 信息结构化成一张 **Review Knowledge Graph / Review 关系图**。图中的节点包括 PR 概览、文件变更、文件风险分、规则预检结果、重点文件、上下文覆盖、Reviewer 风险和 Auditor 审计结论。随后，Reviewer 和 Auditor 会基于这张结构化关系图进行两阶段推理，从而减少普通 LLM 直接读 diff 时容易出现的误报、漏报和幻觉问题。

## 4. 依赖说明

- **前端**：HTML / CSS / JavaScript，实现暗色 AI PR Review 工作台、Diff 视图、报告展示、Ask PR 聊天界面。
- **后端**：Python 本地服务，负责用户数据、模型配置、PR 获取、diff 解析和 Review 流程调度。
- **模型调用**：支持 OpenAI 兼容接口，可接入 Qwen、DeepSeek、OpenAI 等模型服务。
- **其他能力**：GitHub PR 获取、unified diff 解析、本地 JSON 存储、Markdown 报告导出。

其中，风险评分逻辑、规则预检、双模型审计流程、Ask PR 报告内追问和前端可视化评审工作台均为项目自主实现，不是单纯的大模型接口套壳。

## 5. 核心功能

- 支持 GitHub PR URL、粘贴 diff、上传 .diff / .patch 三种输入方式。
- 自动生成 PR 概览、核心指标和重点变更摘要。
- 根据风险分选择重点上下文，并生成文件风险排序。
- 在 AI 分析前执行规则预检，输出候选风险提示。
- 支持 Reviewer 初审与 Auditor 复核，区分高可信风险、潜在风险和需要人工复核的问题。
- 提供 Diff 级代码审查界面，并生成可复制的 Review Comment。
- 支持 Ask PR 交互式问答，围绕当前报告继续追问。
- 保存历史记录，并支持 Markdown 报告导出。

## 6. 项目架构

![ReviewPilot 项目架构图](docs/reviewpilot_项目架构图解析.png)

系统整体由 **输入层**、**风险感知 / 策略层**、**双模型推理层** 和 **交互展示层** 组成。输入层接收 PR URL、diff 或 patch 文件；策略层完成 PR / diff 解析、文件风险评分、规则预检和上下文选择；双模型推理层通过 Reviewer 与 Auditor 进行初审和复核；交互展示层负责可视化评估结果、代码评审、历史记录、Ask PR 和报告导出。

## 7. 使用方式

本项目为本地运行版本，主要依赖 Python 运行环境和浏览器。若后续仓库提供 `requirements.txt`，可先执行依赖安装；当前版本可直接启动本地服务：

```powershell
python server.py
```

启动后打开：

```text
http://127.0.0.1:8770
```

基本流程：

1. 注册或登录账号。
2. 在模型设置中配置 API Key 和模型名称。
3. 选择输入方式：GitHub PR URL、粘贴 unified diff 或上传 .diff / .patch 文件。
4. 选择模型与分析模式：快速分析或深度审计。
5. 点击开始评审，查看评估结果、代码审查、审计结论和 Review Comments。

## 8. 当前限制和未来优化

当前限制：

- 目前主要适配公开 PR / 标准 diff 输入。
- 大模型分析结果仍需人工 Reviewer 复核。
- 某些复杂仓库的上下文获取仍有限。
- UI 和交互细节仍在持续优化中。

未来优化：

- 更完整的 GitHub / GitLab 集成。
- 更细粒度的规则体系。
- 更稳定的多模型协同策略。
- 更完善的报告导出与团队协作能力。
- 更强的上下文检索与代码库级理解能力。
