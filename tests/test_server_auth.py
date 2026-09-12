import unittest
from unittest.mock import patch

from server import admin_authorized


class AdminAuthorizationTests(unittest.TestCase):
    def test_tokenless_local_preview_remains_available(self):
        with patch("server.ADMIN_TOKEN", ""):
            self.assertTrue(admin_authorized(""))

    def test_configured_token_is_required(self):
        with patch("server.ADMIN_TOKEN", "pilot-secret"):
            self.assertTrue(admin_authorized("pilot-secret"))
            self.assertFalse(admin_authorized(""))
            self.assertFalse(admin_authorized("wrong-token"))


if __name__ == "__main__":
    unittest.main()
