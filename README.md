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

## 规则预检

ReviewPilot 在调用 AI 前会先执行已启用的 Review 规则。规则预检只扫描新增代码行，命中结果是候选关注点，不代表最终结论。AI 会结合 diff 证据进一步判断是否采纳、降级为待确认或忽略。

规则支持在页面中管理：

- 启用或禁用规则。
- 新增、编辑、删除规则。
- 从模板复制规则。
- 配置适用文件、触发关键词、排除关键词、风险等级、命中提示和建议动作。

内置模板包括 React Router 兜底路由、异步错误处理、Context Provider、删除或重命名文件引用、package.json 与 lock 文件同步、表单校验、后端接口权限和环境变量泄露检查。

## 双模型审计机制

单模型 AI Review 容易出现两类问题：一是误报，把没有足够证据的问题说得过于确定；二是漏报，忽略规则预检或高风险文件中的候选风险。因此 ReviewPilot 增加了 Reviewer-Auditor Review Pipeline。

- Reviewer Model 负责初步发现风险、总结变更和生成 Review Comments。
- Auditor Model 不重新写完整 Review，只审计 Reviewer 输出，检查证据是否充分、是否过度推断、是否遗漏规则预检命中项、风险等级和置信度是否合理。
- Auditor 不能完全消除误报和漏报，它只是第二层辅助校验，用来降低单模型输出的不确定性。
- 融合逻辑会保留证据充分的风险；将证据不足或置信度低的风险降级为 `needs_human_check`；将明显误检移入 `dismissed_risks`；Auditor 补充的漏检候选默认作为 `potential_risk` 或 `needs_human_check`，不直接认定为确定 bug。

这个机制让用户看到“初审结果、审计结果、最终融合结果”，更接近真实代码评审中的二次复核流程。

## Ask PR 交互追问

完成一次 Review 后，用户可以在报告页或历史详情页继续追问当前 PR。Ask PR 不会重新抓取 GitHub PR，也不会修改原始 Review 报告，只会读取该历史记录中已经保存的上下文：

- PR 概览、文件变更、重点分析文件和上下文覆盖范围。
- 规则预检结果、初审模型结果、审计模型结果。
- 最终总结、主要变更模块、最终风险和 Review Comments。

Ask PR 的回答必须基于已有报告。如果上下文不足，系统会明确提示“当前上下文无法确认”，并给出需要人工复核的说明。每次追问会保存到对应历史记录的 `ask_threads` 中，方便后续复盘。

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
