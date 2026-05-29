# ReviewPilot Demo 样例文档

## 1. Demo 目标

本 Demo 展示 ReviewPilot 如何帮助开发者从一个 GitHub PR 或 diff 出发，快速获得中文代码评审报告。

演示重点：

- 不是简单总结代码，而是基于具体 diff 证据生成 Review。
- 支持公开 GitHub PR 自动获取变更。
- 支持粘贴 diff，保证网络或频率限制时仍可演示。
- 输出包含 PR 摘要、风险代码、Review 建议和测试建议。

## 2. Demo 前准备

设置千问 API Key：

```powershell
$env:DASHSCOPE_API_KEY="你的_api_key"
```

启动服务：

```powershell
python server.py
```

打开页面：

```text
http://127.0.0.1:8770
```

## 3. Demo 路线一：粘贴 diff

使用项目内置样例：

```text
data/sample.diff
```

操作步骤：

1. 打开 ReviewPilot 页面。
2. 点击“加载样例”。
3. 点击“开始评审”。
4. 查看变更文件、风险建议和测试建议。

预期观察点：

- `src/auth.ts` 被识别为认证相关文件。
- `req.body.userId` 相关代码会成为身份来源风险证据。
- `innerHTML` 会被识别为前端安全风险证据。
- `src/payment.ts` 会触发支付流程关注点。
- 报告输出为中文。

## 4. Demo 路线二：公开 GitHub PR

输入示例格式：

```text
https://github.com/owner/repo/pull/1
```

操作步骤：

1. 在“公开 GitHub PR 链接”输入框中粘贴 PR 地址。
2. 保持 diff 输入框为空。
3. 点击“开始评审”。
4. 系统自动获取 PR diff 并调用千问分析。

演示时建议选择：

- 文件数量不要太多的公开 PR。
- 最好包含业务逻辑变更，而不只是 README 修改。
- PR 描述清楚，方便展示上下文理解。

## 5. 样例评审输出

示例摘要：

```text
本次 PR 修改了登录和支付相关代码。登录流程新增了从请求体读取 userId 的逻辑，支付流程新增了金额转换和网关调用。整体风险为中等，需要重点确认用户身份来源、HTML 写入安全性、支付幂等和失败处理。
```

示例风险：

```text
文件：src/auth.ts
证据：const userId = req.body.userId;
风险：直接信任客户端传入的 userId，可能导致越权访问。
建议：从服务端 session 或 token 中读取用户身份。
置信度：82%
```

示例测试建议：

```text
补充伪造 userId、未登录访问、支付重复回调、支付失败回滚等场景测试。
```

## 6. Demo 视频脚本

建议时长：3 到 5 分钟。

### 6.1 开场

讲解词：

```text
大家好，这是 ReviewPilot，一个面向 Pull Request 的 AI 代码评审助手。它解决的问题是：开发者在合并 PR 前，经常需要快速理解代码变更、判断风险和补充测试，但人工 Review 成本较高，普通大模型又容易生成没有证据的建议。
```

展示内容：

- 打开 ReviewPilot 页面。
- 简要展示 PR 链接输入框和 diff 输入框。

### 6.2 粘贴 diff 分析

讲解词：

```text
为了保证演示稳定，ReviewPilot 支持直接粘贴 diff。我这里加载一个示例 diff，它包含认证和支付相关变更。
```

展示内容：

- 点击“加载样例”。
- 点击“开始评审”。

### 6.3 展示报告

讲解词：

```text
系统会先解析变更文件，再抽取新增代码作为证据链，最后调用千问生成中文 Review。每条建议都必须绑定文件和证据，否则后端不会作为正式 finding 展示。
```

展示内容：

- 展示文件数、证据数、问题数。
- 展示风险等级。
- 展示具体 finding。

### 6.4 说明设计亮点

讲解词：

```text
ReviewPilot 的重点不是让 AI 自由发挥，而是把 AI 放进一个受约束的工程流程中。系统只把 PR diff、变更文件和证据交给模型，并在返回后校验文件和证据，减少幻觉和模板化建议。
```

展示内容：

- 打开 `docs/architecture.md`。
- 简要说明证据优先流程。

### 6.5 结尾

讲解词：

```text
当前版本已经支持公开 GitHub PR 和 diff 分析。后续可以扩展大型 PR 分块、轻量代码图谱、团队规则配置和模拟 GitHub Review 评论。
```

## 7. 演示验收清单

- 本地服务可以启动。
- 千问 API Key 已配置。
- 样例 diff 可以生成报告。
- 页面上所有核心展示文字为中文。
- README 写明依赖、运行方式和设计思路。
- GitHub 仓库有持续 commit 和 PR 记录。
