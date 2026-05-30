import unittest

from reviewpilot.diff_parser import build_evidence, build_selected_context, parse_diff, summarize_file_diffs, summarize_files, summarize_priority_files
from reviewpilot.review_service import build_context_coverage, build_messages, build_pr_overview
from reviewpilot.rule_checker import run_rule_checks


class DiffParserTest(unittest.TestCase):
    def test_parse_added_lines(self):
        diff = """diff --git a/src/a.py b/src/a.py
--- a/src/a.py
+++ b/src/a.py
@@ -1,2 +1,3 @@
 def run():
+    print("ok")
     return True
"""
        files = parse_diff(diff)
        self.assertEqual(len(files), 1)
        self.assertEqual(files[0].path, "src/a.py")
        self.assertEqual(files[0].additions, 1)
        self.assertEqual(files[0].lines[0].new_line, 2)

    def test_build_evidence_skips_empty_lines(self):
        diff = """diff --git a/src/a.js b/src/a.js
--- a/src/a.js
+++ b/src/a.js
@@ -1,1 +1,2 @@
+
+console.log("x")
"""
        evidence, truncated = build_evidence(parse_diff(diff))
        self.assertEqual(len(evidence), 1)
        self.assertFalse(truncated)
        self.assertIn("debug-log", evidence[0]["signals"])

    def test_review_prompt_requires_chinese_output(self):
        messages = build_messages(
            {"title": "demo", "changed_files": 0, "additions": 0, "deletions": 0},
            [],
            [],
            {"context_truncated": False},
            [],
        )
        self.assertIn("Chinese", messages[1]["content"])
        self.assertIn("changed_modules", messages[1]["content"])
        self.assertIn("needs_human_check", messages[1]["content"])

    def test_lock_file_is_deprioritized_without_signals(self):
        diff = """diff --git a/package-lock.json b/package-lock.json
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,1 +1,2 @@
+{"version":"1.0.1"}
"""
        evidence, truncated = build_evidence(parse_diff(diff))
        self.assertEqual(evidence, [])
        self.assertFalse(truncated)

    def test_priority_files_prefer_source_and_keywords(self):
        diff = """diff --git a/src/api/auth.ts b/src/api/auth.ts
--- a/src/api/auth.ts
+++ b/src/api/auth.ts
@@ -1,1 +1,2 @@
+export const token = "x"
diff --git a/docs/logo.png b/docs/logo.png
new file mode 100644
--- /dev/null
+++ b/docs/logo.png
"""
        priority = summarize_priority_files(parse_diff(diff))
        self.assertEqual(priority[0]["filename"], "src/api/auth.ts")
        self.assertGreater(priority[0]["risk_score"], 0)
        self.assertIn("risk_reasons", priority[0])

    def test_risk_score_deprioritizes_test_file(self):
        diff = """diff --git a/src/service/payment.ts b/src/service/payment.ts
--- a/src/service/payment.ts
+++ b/src/service/payment.ts
@@ -1,1 +1,2 @@
+await charge(order)
diff --git a/src/service/payment.test.ts b/src/service/payment.test.ts
--- a/src/service/payment.test.ts
+++ b/src/service/payment.test.ts
@@ -1,1 +1,2 @@
+expect(total).toBe(1)
"""
        files = summarize_files(parse_diff(diff))
        scores = {file["filename"]: file["risk_score"] for file in files}
        self.assertGreater(scores["src/service/payment.ts"], scores["src/service/payment.test.ts"])

    def test_selected_context_uses_deep_mode_for_risky_source(self):
        diff = """diff --git a/src/api/auth.ts b/src/api/auth.ts
--- a/src/api/auth.ts
+++ b/src/api/auth.ts
@@ -1,1 +1,3 @@
+export async function login() {
+  await request("/login")
+}
diff --git a/package-lock.json b/package-lock.json
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,1 +1,2 @@
+{"version":"1.0.1"}
"""
        context, truncated = build_selected_context(parse_diff(diff))
        auth_context = next(item for item in context if item["file"] == "src/api/auth.ts")
        lock_context = next(item for item in context if item["file"] == "package-lock.json")
        self.assertEqual(auth_context["mode"], "deep")
        self.assertIn("patch", auth_context)
        self.assertEqual(lock_context["mode"], "summary")
        self.assertFalse(truncated)

    def test_rule_checker_detects_async_without_error_handling(self):
        diff = """diff --git a/src/api/auth.ts b/src/api/auth.ts
--- a/src/api/auth.ts
+++ b/src/api/auth.ts
@@ -1,1 +1,2 @@
+await login()
"""
        findings = run_rule_checks(parse_diff(diff))
        self.assertEqual(findings[0]["type"], "needs_human_check")
        self.assertIn("异步", findings[0]["issue"])

    def test_context_coverage_reports_skipped_files(self):
        files = [
            {"filename": "src/api/auth.ts", "additions": 1, "deletions": 0},
            {"filename": "package-lock.json", "additions": 1, "deletions": 0},
        ]
        evidence = [{"file": "src/api/auth.ts"}]
        coverage = build_context_coverage(files, evidence, True)
        self.assertEqual(coverage["total_files"], 2)
        self.assertEqual(coverage["analyzed_files"], 1)
        self.assertTrue(coverage["context_truncated"])
        self.assertIn("package-lock.json", coverage["skipped_files"])

    def test_pr_overview_counts_changes(self):
        overview = build_pr_overview({}, [
            {"additions": 2, "deletions": 1},
            {"additions": 3, "deletions": 4},
        ])
        self.assertEqual(overview["changed_files"], 2)
        self.assertEqual(overview["additions"], 5)
        self.assertEqual(overview["deletions"], 5)

    def test_file_diffs_include_context_and_line_numbers(self):
        diff = """diff --git a/src/a.py b/src/a.py
--- a/src/a.py
+++ b/src/a.py
@@ -1,2 +1,3 @@
 def run():
+    print("ok")
     return True
"""
        file_diff = summarize_file_diffs(parse_diff(diff))[0]
        self.assertEqual(file_diff["parsed_lines"][0]["type"], "context")
        self.assertEqual(file_diff["parsed_lines"][1]["type"], "add")
        self.assertEqual(file_diff["parsed_lines"][1]["new_line_no"], 2)


if __name__ == "__main__":
    unittest.main()
