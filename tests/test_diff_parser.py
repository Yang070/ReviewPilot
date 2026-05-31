import unittest

from reviewpilot.diff_parser import build_evidence, parse_diff
from reviewpilot.review_service import build_messages


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

    def test_review_prompt_requires_chinese_output(self):
        messages = build_messages({}, [], [])
        self.assertIn("Chinese", messages[1]["content"])


if __name__ == "__main__":
    unittest.main()
