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
        raise GitHubError("Invalid GitHub PR URL.")
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
        raise GitHubError("Only github.com public PR URLs are supported.")
    req = Request(url, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "ReviewPilot/0.1",
    })
    try:
        with urlopen(req, timeout=20) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except HTTPError as exc:
        if exc.code == 403:
            raise GitHubError("GitHub rate limit reached. Paste the diff manually.") from exc
        if exc.code == 404:
            raise GitHubError("Public PR not found or repository is private.") from exc
        raise GitHubError(f"GitHub request failed: HTTP {exc.code}") from exc
    except URLError as exc:
        raise GitHubError(f"GitHub network error: {exc.reason}") from exc
