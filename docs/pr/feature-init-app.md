# PR: feat: initialize qwen pr review app

## 标题

feat: initialize qwen pr review app

## 功能描述

本 PR 初始化 ReviewPilot 项目，实现基于千问的 AI PR Review MVP。用户可以输入公开 GitHub PR 链接，或粘贴 unified diff。系统会解析代码变更、构建证据链，并调用千问生成结构化 Review 报告。

## 实现思路

- 使用 Python 标准库实现本地后端，减少早期依赖复杂度。
- 通过 GitHub 公开 PR 接口获取 PR 元信息和 diff，不要求 GitHub Token。
- 使用 `diff_parser` 解析变更文件、hunk、新增行和删除行。
- 使用证据链约束千问输出，要求 finding 必须包含文件、证据、风险等级、置信度和建议。
- 前端使用原生 HTML/CSS/JS 实现，避免第一版引入构建工具。

## 测试方式

```text
python -m unittest discover -s tests
python -m py_compile server.py reviewpilot\diff_parser.py reviewpilot\github_client.py reviewpilot\qwen_client.py reviewpilot\review_service.py
```

## 已知限制

- 当前版本只支持公开 GitHub PR。
- 当前版本需要配置 `DASHSCOPE_API_KEY` 才能调用千问。
- 大型 PR 的分块分析和代码图谱会在后续 PR 中实现。
