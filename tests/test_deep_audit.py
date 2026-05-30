import unittest

from reviewpilot.review_service import bind_items_to_lines, merge_review_and_audit


class DeepAuditMergeTest(unittest.TestCase):
    def test_downgrades_low_confidence_confirmed_issue(self):
        final = merge_review_and_audit({
            "summary": "更新登录逻辑",
            "changed_modules": [],
            "review_comments": [],
            "risks": [{
                "id": "risk_1",
                "file": "src/auth.ts",
                "risk_level": "high",
                "type": "confirmed_issue",
                "evidence": "+ const userId = req.body.userId",
                "issue": "信任客户端 userId",
                "reason": "可能越权",
                "suggestion": "从 session 中读取用户身份",
                "confidence": 82,
            }],
        }, {
            "false_positive_candidates": [{
                "risk_id": "risk_1",
                "file": "src/auth.ts",
                "reason": "证据不足以证明一定存在越权",
                "audit_action": "downgrade",
                "suggested_type": "needs_human_check",
                "suggested_confidence": 58,
            }],
            "missed_risk_candidates": [],
            "confidence_adjustments": [],
        }, {"file_changes": [{"filename": "src/auth.ts"}]})
        self.assertEqual(final["final_risks"][0]["type"], "needs_human_check")
        self.assertEqual(final["final_risks"][0]["audit_status"], "downgraded")

    def test_auditor_missed_risk_never_becomes_confirmed_issue(self):
        final = merge_review_and_audit({
            "summary": "更新接口",
            "changed_modules": [],
            "review_comments": [],
            "risks": [],
        }, {
            "missed_risk_candidates": [{
                "file": "src/api.ts",
                "evidence": "+ await fetch('/admin')",
                "issue": "接口权限可能缺失",
                "reason": "新增管理接口但未看到权限检查",
                "suggestion": "人工确认权限中间件",
                "risk_level": "high",
                "confidence": 75,
            }],
        }, {"file_changes": [{"filename": "src/api.ts"}]})
        self.assertEqual(final["final_risks"][0]["type"], "potential_risk")
        self.assertEqual(final["final_risks"][0]["audit_status"], "added_by_auditor")

    def test_lock_only_risk_is_downgraded(self):
        final = merge_review_and_audit({
            "summary": "更新依赖",
            "changed_modules": [],
            "review_comments": [],
            "risks": [{
                "id": "risk_1",
                "file": "package-lock.json",
                "risk_level": "medium",
                "type": "confirmed_issue",
                "evidence": "+ version 1.0.0",
                "issue": "依赖版本可能不稳定",
                "reason": "只看到 lock 文件变化",
                "suggestion": "人工确认 package.json",
                "confidence": 90,
            }],
        }, {
            "false_positive_candidates": [{
                "risk_id": "risk_1",
                "audit_action": "keep",
                "suggested_type": "confirmed_issue",
                "suggested_confidence": 90,
            }],
        }, {"file_changes": [{"filename": "package-lock.json"}]})
        self.assertEqual(final["final_risks"][0]["type"], "needs_human_check")
        self.assertEqual(final["final_risks"][0]["audit_status"], "downgraded")

    def test_binds_risk_to_diff_line_by_evidence(self):
        risks = [{
            "file": "src/auth.ts",
            "evidence": "const userId = req.body.userId",
        }]
        bind_items_to_lines(risks, [{
            "filename": "src/auth.ts",
            "parsed_lines": [
                {"type": "context", "new_line_no": 9, "content": "export function login() {"},
                {"type": "add", "new_line_no": 10, "content": "const userId = req.body.userId"},
            ],
        }])
        self.assertEqual(risks[0]["line_start"], 10)


if __name__ == "__main__":
    unittest.main()
