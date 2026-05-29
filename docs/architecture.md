# ReviewPilot Architecture

ReviewPilot uses an evidence-first pipeline to reduce hallucination and template-style output.

```text
Public PR URL or pasted diff
-> GitHub public PR fetcher
-> unified diff parser
-> evidence builder
-> Qwen review provider
-> evidence validator
-> report UI
```

## Why This Design

The model is not allowed to review from memory. It receives changed files and compact evidence extracted from the diff. Every finding must point to a changed file and cite evidence.

## Qwen Provider

The default provider is Qwen through Alibaba Cloud Model Studio OpenAI-compatible Chat Completions.

Environment variables:

```text
DASHSCOPE_API_KEY=your_api_key
QWEN_MODEL=qwen-plus
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

## Public GitHub PR Support

ReviewPilot calls the public GitHub REST PR endpoint, then downloads the PR diff URL. It does not require GitHub login or a GitHub token in the current scope.

## Hallucination Controls

- The model receives only PR metadata, changed files, and evidence extracted from added lines.
- The prompt forbids invented files, APIs, tables, and line numbers.
- The backend filters findings that do not reference changed files.
- Findings without evidence are not displayed.
- Confidence and severity are separated.

## Future Work

- Add file chunking for very large PRs.
- Add a lightweight code graph for imports, functions, and test relations.
- Add simulated GitHub review comments.
- Add repository rule configuration.
- Add unit tests for evidence validation.
