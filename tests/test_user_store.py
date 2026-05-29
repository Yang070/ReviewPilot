from pathlib import Path
from tempfile import TemporaryDirectory
import os
import unittest

from reviewpilot.user_store import b64, encrypt_text, hash_password, UserError, UserStore


class UserStoreTest(unittest.TestCase):
    def test_register_and_authenticate(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = UserStore(root / "users.json", root / "secret.key")
            store.register("yang070", "yang@example.com", "secret123", "secret123")
            user = store.authenticate("yang070", "secret123")
            self.assertEqual(user["username"], "yang070")
            self.assertFalse(user["hasModelConfigs"])

    def test_reject_duplicate_user(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = UserStore(root / "users.json", root / "secret.key")
            store.register("yang070", "", "secret123", "secret123")
            with self.assertRaises(UserError):
                store.register("yang070", "", "secret123", "secret123")

    def test_model_config_crud(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = UserStore(root / "users.json", root / "secret.key")
            store.register("yang070", "", "secret123", "secret123")
            config = store.add_model_config("yang070", {
                "provider": "Qwen",
                "base_url": "",
                "api_key": "sk-test",
                "model_name": "qwen-long",
                "is_default": True,
            })
            self.assertEqual(config["model_name"], "qwen-long")
            self.assertNotIn("sk-test", config["api_key_mask"])
            secret = store.get_model_config_secret("yang070", config["id"])
            self.assertEqual(secret["apiKey"], "sk-test")
            updated = store.update_model_config("yang070", config["id"], {"model_name": "qwen-plus"})
            self.assertEqual(updated["model_name"], "qwen-plus")

    def test_legacy_user_migrates_to_model_config(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            store = UserStore(root / "users.json", root / "secret.key")
            salt = os.urandom(16)
            users = {
                "yang070": {
                    "username": "yang070",
                    "passwordSalt": b64(salt),
                    "passwordHash": b64(hash_password("secret123", salt)),
                    "apiKey": encrypt_text("sk-old", store.secret),
                    "defaultModel": "qwen-plus",
                }
            }
            store.save(users)
            user = store.authenticate("yang070", "secret123")
            self.assertTrue(user["hasModelConfigs"])
            configs = store.list_model_configs("yang070")
            self.assertEqual(configs[0]["provider"], "Qwen")


if __name__ == "__main__":
    unittest.main()
