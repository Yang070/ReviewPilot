# ReviewPilot 架构设计

ReviewPilot 使用“证据优先”的分析流程，目标是减少大语言模型在代码评审中的幻觉问题和模板化输出。

```text
公开 PR 链接或粘贴 diff
-> GitHub 公开 PR 获取器
-> unified diff 解析器
-> 文件风险评分器
-> 规则检测器
-> 风险感知上下文选择器
-> 千问 Review Provider
-> 证据校验器
-> Review 报告界面
```

## 为什么这样设计

模型不能凭记忆或常识自由发挥。后端会先从 diff 中抽取变更文件、文件风险分、规则检测结果和紧凑证据，再把这些材料交给模型。每条 Review 建议都必须指向具体变更文件，并引用对应证据。

## 风险感知型 PR Review 策略层

这是 ReviewPilot 区别于普通 API 调用的核心层。系统会在调用大模型之前先完成确定性的工程判断：

- 文件风险评分：根据文件类型、变更规模、路径关键词、修改状态、测试文件降权、lock 文件和构建产物降权计算 `risk_score`。
- 上下文选择：按 `risk_score` 从高到低选择上下文，高风险源代码保留更多 patch，低风险文件只保留摘要。
- 规则检测：在模型分析前先检测路由兜底、异步错误处理、Context/Provider 包裹、删除/重命名引用同步、依赖 lock 同步等问题。
- 可解释展示：前端展示 Risk-Aware File Ranking、Context Coverage 和 Rule Findings，让用户知道模型重点看了什么、为什么看这些文件。

这层策略的作用不是替代 AI，而是约束 AI 的输入范围，给 AI 提供更可靠的证据和优先级，减少模板化建议和没有依据的误报。

## 千问 Provider

默认模型 Provider 是千问，调用方式为阿里云百炼 OpenAI 兼容 Chat Completions 接口。

当前版本不再要求用户在命令行输入 API Key。用户注册时提交千问 API Key，后续登录后由后端读取该账号保存的 Key 调用模型。用户也可以在页面右上角“设置”中修改 API Key 和默认模型。

模型选择：

- `qwen-plus`
- `qwen-plus-2025-07-28`
- `qwen-long`
- `qwen-max`
- 自定义模型名

可选环境变量：

```text
REVIEWPILOT_PORT=8770
```

## 公开 GitHub PR 支持

ReviewPilot 会调用 GitHub 公开 PR 接口，再下载该 PR 对应的 diff。当前版本只支持公开仓库，不要求 GitHub 登录，也不需要 GitHub Token。

## 幻觉控制

- 模型只接收 PR 元信息、变更文件和从新增代码中抽取的证据。
- 模型会接收规则检测结果，但 Prompt 要求不能机械照抄，必须结合 diff 证据判断。
- 风险类型限制为 `confirmed_issue`、`potential_risk`、`needs_human_check`，避免把不确定问题包装成确定缺陷。
- Prompt 明确禁止编造文件、接口、数据库表和行号。
- 后端会过滤没有引用变更文件的 finding。
- 没有证据的 finding 不会展示。
- 风险等级和置信度分开展示，避免把不确定判断伪装成确定问题。

## 未来扩展

- 为大型 PR 增加跨文件调用链和 import 关系分析。
- 增加轻量代码图谱，记录 import、函数和测试关系。
- 增加模拟 GitHub Review 评论功能。
- 增加仓库级规则配置。
- 补充证据校验和 GitHub PR 获取逻辑的单元测试。
