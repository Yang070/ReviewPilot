from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import json
import re


class GitHubError(Exception):
    pass


def parse_pr_url(url: str) -> tuple[str, str, int]:
    match = re.match(r"^https://github\.com/([^/]+)/([^/]+)/pull/(\d+)", url.strip())
    if not match:
        raise GitHubError("GitHub PR 链接格式不正确。")
    return match.group(1), match.group(2), int(match.group(3))


def fetch_public_pr(pr_url: str) -> dict:
    owner, repo, number = parse_pr_url(pr_url)
    api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}"
    pr = request_json(api_url)
    diff = request_text(pr["diff_url"])
    return {
        "owner": owner,
        "repo": repo,
        "number": number,
        "title": pr.get("title", ""),
        "body": pr.get("body", ""),
        "html_url": pr.get("html_url", pr_url),
        "diff": diff,
    }


def request_json(url: str) -> dict:
    data = request_text(url)
    return json.loads(data)


def request_text(url: str) -> str:
    host = urlparse(url).netloc
    if host not in {"api.github.com", "github.com"}:
        raise GitHubError("当前仅支持 github.com 的公开 PR 链接。")
    req = Request(url, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "ReviewPilot/0.1",
    })
    try:
        with urlopen(req, timeout=20) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except HTTPError as exc:
        if exc.code == 403:
            raise GitHubError("GitHub 访问频率受限，请稍后重试或手动粘贴 diff。") from exc
        if exc.code == 404:
            raise GitHubError("未找到公开 PR，或该仓库不是公开仓库。") from exc
        raise GitHubError(f"GitHub 请求失败：HTTP {exc.code}") from exc
    except URLError as exc:
        raise GitHubError(f"GitHub 网络错误：{exc.reason}") from exc
