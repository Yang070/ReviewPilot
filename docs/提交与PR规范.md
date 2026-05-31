# ReviewPilot 提交与 PR 规范

## 1. 目标

ReviewPilot 需要保持持续开发记录，避免最后一次性提交全部代码。每次提交都应围绕一个清晰目标展开，PR 描述要能说明功能、实现思路和测试方式。

核心原则：

- 每个 PR 只做一个明确功能或一次明确文档更新。
- commit message 使用中文，方便 GitHub 文件列表展示。
- PR 描述不能为空，不能与实际代码严重不符。
- 引用第三方库、框架或外部思路时，在 README 或 PR 中说明。
- 主分支合并后应保持可运行。

## 2. 仓库地址

GitHub 仓库：

```text
https://github.com/Yang070/ReviewPilot
```

## 3. 分支策略

主分支：

```text
main
```

功能分支建议：

```text
feature/init-app
feature/github-pr-fetch
feature/qwen-review-provider
feature/evidence-validation
feature/review-report-ui
feature/codegraph-prompting
docs/project-specs
```

规则：

- 不在 `main` 上直接开发大功能。
- 每个功能分支完成后创建 PR。
- 文档类更新也可以单独 PR，体现持续交付。

## 4. PR 拆分计划

### PR 1：项目初始化与基础 Review 流程

内容：

- 初始化本地后端和前端页面。
- 支持粘贴 diff。
- 接入千问 Review Provider。
- 补充 README 和架构说明。

验收：

- 本地可以启动。
- 配置千问 API Key 后可以生成 Review 报告。

### PR 2：项目文档与赛题对齐

内容：

- 需求文档。
- 接口文档。
- Demo 样例文档。
- 赛题对齐说明。
- 提交与 PR 规范。

验收：

- 文档能解释项目如何满足题目三要求。
- 评委能从文档理解功能边界和设计取舍。

### PR 3：公开 GitHub PR 获取增强

内容：

- 完善 PR URL 校验。
- 增加 GitHub 错误提示。
- 对大 PR 给出降级提示。

验收：

- 公开 PR 可自动分析。
- 私有仓库、404、频率限制有清晰提示。

### PR 4：证据链与风险分类增强

内容：

- 增加文件类别规则。
- 增加更多风险信号。
- 完善 evidence 展示。

验收：

- finding 能绑定证据。
- 认证、支付、配置等文件有更明确关注点。

### PR 5：Review 报告体验优化

内容：

- 优化报告布局。
- 增加风险筛选和折叠。
- 增加模拟 GitHub 评论预览。

验收：

- 用户能快速定位高风险建议。
- 报告适合截图和 Demo 展示。

### PR 6：轻量代码图谱

内容：

- 抽取 import、函数名和测试文件关系。
- 构建轻量 CodeGraph。
- 将相关证据路径传给模型。

验收：

- 报告能说明“为什么这条建议值得看”。
- 文档解释 KnowGPT 思想如何被工程化迁移。

## 5. Commit 规范

建议使用中文提交信息：

```text
文档：补充赛题对齐和 Demo 说明
功能：实现公开 PR diff 获取
功能：接入千问评审服务
修复：固定评审报告输出为中文
测试：补充 diff 解析用例
优化：调整报告页面中文文案
工程：忽略本地编辑器配置
```

常用类型：

| 类型 | 说明 |
| --- | --- |
| 文档 | README、需求、接口、Demo、规范 |
| 功能 | 新增用户可见能力 |
| 修复 | 修复 bug 或异常处理 |
| 测试 | 测试用例和验证脚本 |
| 优化 | UI、交互、性能或结构改进 |
| 工程 | 配置、忽略文件、开发辅助 |

## 6. PR 描述模板

```markdown
## 本次改动

说明这个 PR 新增或修改了什么。

## 功能描述

说明用户如何使用，以及能看到什么结果。

## 实现思路

说明核心模块、关键技术选择和为什么这样设计。

## 测试方式

- [ ] python -m unittest discover -s tests
- [ ] python -m py_compile server.py reviewpilot/*.py
- [ ] 本地打开页面完成一次手动验证

## 依赖与原创说明

- 新增第三方依赖：
- 复用代码来源：
- 原创实现部分：
```

## 7. 每次提交前检查

- 当前改动是否只属于一个明确主题。
- 是否更新相关文档。
- 是否运行测试或说明无法测试的原因。
- 是否有 API Key、密钥或本地路径被提交。
- commit message 是否为中文。
- PR 描述是否包含功能描述、实现思路和测试方式。
