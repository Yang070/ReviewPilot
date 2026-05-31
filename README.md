# ReviewPilot

ReviewPilot 是一个 AI Pull Request 代码评审助手。用户可以输入公开 GitHub PR 链接，或直接粘贴 unified diff。系统会解析代码变更、构建证据链，并调用千问生成中文 Review 报告。

## 功能

- 支持注册和登录。
- 注册时保存用户账号、密码和千问 API Key。
- 登录后自动使用该账号保存的 API Key，不需要每次在命令行输入。
- 支持在设置中修改千问 API Key 和默认模型。
- 每次评审可以选择模型：`qwen-plus`、`qwen-plus-2025-07-28`、`qwen-long`、`qwen-max` 或自定义模型名。
- 支持无需登录 GitHub 获取公开 PR 的 diff。
- 支持直接粘贴 unified diff 进行分析。
- 解析变更文件、hunk、新增行和删除行。
- 为每个变更文件计算 `risk_score`，展示 Risk-Aware File Ranking。
- 根据风险分选择上下文，高风险文件保留更多 patch，低风险文件只保留摘要。
- 内置规则检测：路由兜底、异步错误处理、Provider 包裹、删除/重命名引用同步、依赖 lock 同步。
- 从代码变更和规则检测中抽取证据链。
- 要求每条 Review 建议包含文件、证据、风险等级、置信度和修改建议。

## 项目文档

- [需求文档](docs/需求文档.md)
- [接口文档](docs/接口文档.md)
- [Demo 样例文档](docs/Demo样例文档.md)
- [赛题对齐说明](docs/赛题对齐说明.md)
- [提交与 PR 规范](docs/提交与PR规范.md)
- [架构设计](docs/architecture.md)

## 本地运行

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
REVIEWPILOT_PORT=8770
```

## 使用方式

首次使用需要注册：

1. 输入账号。
2. 输入密码。
3. 填写千问 API Key。
4. 设置默认模型，例如 `qwen-plus`。

之后直接登录即可，不需要再输入 API Key。如果 API Key 变化，可以在右上角“设置”中修改。

评审时任选一种输入方式：

- 输入公开 GitHub PR 链接，例如 `https://github.com/owner/repo/pull/1`。
- 粘贴 unified diff。

然后选择本次使用的大语言模型并点击“开始评审”。

## 设计思路

项目采用“证据优先”的流程：

```text
PR 链接或 diff
-> diff 解析器
-> 文件风险评分
-> 规则检测
-> 风险感知上下文选择
-> 千问 Review Provider
-> 证据校验
-> Review 报告
```

模型只能基于提供的 diff、风险排序、规则检测和证据列表分析，不能凭空编造文件、函数、接口或数据库表。后端会过滤没有引用变更文件或具体证据的 Review 建议。

## 数据与安全说明

- 用户数据保存在本地 `data/users.json`。
- 密码不会明文保存，只保存加盐哈希。
- 千问 API Key 使用本地服务密钥加密保存。
- `data/users.json` 和 `data/app_secret.key` 已加入 `.gitignore`，不会提交到 GitHub。

## 验证命令

```powershell
python -m unittest discover -s tests
python -m py_compile server.py reviewpilot\diff_parser.py reviewpilot\github_client.py reviewpilot\qwen_client.py reviewpilot\review_service.py reviewpilot\user_store.py
```

## 开发规范

每个 PR 只做一个小功能，PR 描述需要包含：

- 本次改了什么。
- 为什么这样实现。
- 如何测试。
- 如果涉及界面变化，补充截图或示例输出。

主分支应始终保持可运行状态，避免最后一天一次性提交所有代码。
