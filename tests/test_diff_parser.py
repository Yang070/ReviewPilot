import unittest

from reviewpilot.diff_parser import build_evidence, parse_diff
from reviewpilot.review_service import detect_language


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
        evidence = build_evidence(parse_diff(diff))
        self.assertEqual(len(evidence), 1)
        self.assertIn("debug-log", evidence[0]["signals"])

    def test_detect_language_prefers_chinese_when_present(self):
        language = detect_language({"title": "修复登录问题", "body": ""}, "")
        self.assertEqual(language, "Chinese")

    def test_detect_language_uses_english_without_cjk(self):
        language = detect_language({"title": "fix login bug", "body": ""}, "console.log('x')")
        self.assertEqual(language, "English")


if __name__ == "__main__":
    unittest.main()
