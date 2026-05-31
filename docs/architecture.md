# ReviewPilot 架构设计

ReviewPilot 使用“证据优先”的分析流程，目标是减少大语言模型在代码评审中的幻觉问题和模板化输出。

```text
公开 PR 链接或粘贴 diff
-> GitHub 公开 PR 获取器
-> unified diff 解析器
-> 代码证据构建器
-> 千问 Review Provider
-> 证据校验器
-> Review 报告界面
```

## 为什么这样设计

模型不能凭记忆或常识自由发挥。后端会先从 diff 中抽取变更文件和紧凑证据，再把这些证据交给模型。每条 Review 建议都必须指向具体变更文件，并引用对应证据。

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
- Prompt 明确禁止编造文件、接口、数据库表和行号。
- 后端会过滤没有引用变更文件的 finding。
- 没有证据的 finding 不会展示。
- 风险等级和置信度分开展示，避免把不确定判断伪装成确定问题。

## 未来扩展

- 为大型 PR 增加文件分块分析。
- 增加轻量代码图谱，记录 import、函数和测试关系。
- 增加模拟 GitHub Review 评论功能。
- 增加仓库级规则配置。
- 补充证据校验和 GitHub PR 获取逻辑的单元测试。
