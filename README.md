# ReviewPilot

ReviewPilot 是一个 AI Pull Request 代码评审助手。用户可以输入公开 GitHub PR 链接，或直接粘贴 unified diff。系统会解析代码变更、构建证据链，并调用千问生成基于证据的 Review 报告。

## 功能

- 支持无需登录获取公开 GitHub PR 的 diff。
- 支持直接粘贴 unified diff 进行分析。
- 解析变更文件、hunk、新增行和删除行。
- 从代码变更中抽取紧凑的证据链。
- 通过阿里云百炼 OpenAI 兼容接口调用千问。
- 要求每条 Review 建议包含文件、证据、风险等级、置信度和修改建议。
- API Key 只保存在本地后端环境变量中，不暴露给浏览器。

## 本地运行

先设置千问 API Key：

```powershell
$env:DASHSCOPE_API_KEY="你的_api_key"
```

启动本地服务：

```powershell
python server.py
```

打开浏览器访问：

```text
http://127.0.0.1:8770
```

可选环境变量：

```text
QWEN_MODEL=qwen-plus
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
REVIEWPILOT_PORT=8770
```

## 使用方式

任选一种输入方式：

- 输入公开 GitHub PR 链接，例如 `https://github.com/owner/repo/pull/1`。
- 粘贴 unified diff。

当前版本只支持公开仓库，不需要 GitHub Token。如果遇到 GitHub 访问频率限制或网络失败，可以手动粘贴 diff 作为兜底方案。

## 为什么使用千问

ReviewPilot 默认使用千问作为大语言模型。阿里云百炼提供 OpenAI 兼容的 Chat Completions 接口，默认地址为 `https://dashscope.aliyuncs.com/compatible-mode/v1`，模型默认使用 `qwen-plus`。

## 设计思路

项目采用“证据优先”的设计：

```text
PR 链接或 diff
-> diff 解析器
-> 证据链构建
-> 千问 Review Provider
-> 证据校验
-> Review 报告
```

这样做的目的是减少大模型幻觉。模型只能基于提供的 diff 和证据列表分析，不能凭空编造文件、函数、接口或数据库表。后端也会过滤没有引用变更文件或具体证据的 Review 建议。

## 幻觉与模板化控制

- 每条建议必须绑定变更文件。
- 每条建议必须包含具体证据。
- 风险等级和置信度分开展示。
- 低证据建议不会作为确定问题展示。
- Prompt 要求模型只输出结构化 JSON，方便后端校验。

## 开发规范

每个 PR 只做一个小功能，PR 描述需要包含：

- 本次改了什么。
- 为什么这样实现。
- 如何测试。
- 如果涉及界面变化，补充截图或示例输出。

主分支应始终保持可运行状态，避免最后一天一次性提交所有代码。
