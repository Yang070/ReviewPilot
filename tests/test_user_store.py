from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from reviewpilot.user_store import UserError, UserStore


class UserStoreTest(unittest.TestCase):
    def test_register_and_authenticate(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = UserStore(root / "users.json", root / "secret.key")
            store.register("yang070", "secret123", "sk-test", "qwen-long")
            user = store.authenticate("yang070", "secret123")
            self.assertEqual(user["apiKey"], "sk-test")
            self.assertEqual(user["defaultModel"], "qwen-long")

    def test_reject_duplicate_user(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = UserStore(root / "users.json", root / "secret.key")
            store.register("yang070", "secret123", "sk-test", "qwen-plus")
            with self.assertRaises(UserError):
                store.register("yang070", "secret123", "sk-test", "qwen-plus")

    def test_update_api_key_and_model(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = UserStore(root / "users.json", root / "secret.key")
            store.register("yang070", "secret123", "sk-old", "qwen-plus")
            settings = store.update_settings("yang070", "sk-new", "qwen-plus-2025-07-28")
            self.assertEqual(settings["apiKey"], "sk-new")
            self.assertEqual(settings["defaultModel"], "qwen-plus-2025-07-28")


if __name__ == "__main__":
    unittest.main()
