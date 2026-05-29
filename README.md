# ReviewPilot

ReviewPilot is an AI Pull Request review assistant. It accepts a public GitHub PR URL or a pasted unified diff, builds code-change evidence, and asks Qwen to generate an evidence-based review report.

## Features

- Fetch public GitHub PR diff without login.
- Parse changed files, hunks, additions, and deletions.
- Build compact evidence for changed code.
- Call Qwen through Alibaba Cloud Model Studio OpenAI-compatible Chat Completions.
- Require review findings to include file, evidence, severity, confidence, and suggestion.
- Keep API keys on the local backend, never in browser code.

## Run Locally

Set your Qwen API key first:

```powershell
$env:DASHSCOPE_API_KEY="your_api_key"
```

Start the local server:

```powershell
python server.py
```

Open:

```text
http://127.0.0.1:8770
```

Optional environment variables:

```text
QWEN_MODEL=qwen-plus
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
REVIEWPILOT_PORT=8770
```

## Usage

Use one of these inputs:

- Public GitHub PR URL, for example `https://github.com/owner/repo/pull/1`.
- Pasted unified diff.

The current project scope only supports public repositories. If GitHub rate limiting or network access fails, paste the diff manually.

## Why Qwen

ReviewPilot uses Qwen as the default model provider. Alibaba Cloud Model Studio documents an OpenAI-compatible Chat API with the Beijing base URL `https://dashscope.aliyuncs.com/compatible-mode/v1` and model examples such as `qwen-plus`.

## Design Notes

The project follows an evidence-first design:

```text
PR URL or diff
-> diff parser
-> evidence builder
-> Qwen review provider
-> evidence validator
-> review report
```

This reduces hallucination by asking the model to reason only from the provided diff and evidence list. Findings that do not cite changed files or concrete evidence are filtered before display.

## Development Rules

Each PR should contain one small feature. PR descriptions should include:

- What changed.
- Why it was implemented this way.
- How it was tested.
- Screenshots or sample output when UI changes.
