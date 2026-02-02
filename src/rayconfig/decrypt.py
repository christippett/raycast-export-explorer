import gzip
import hashlib
import json
import os
from pathlib import Path

from Crypto.Cipher import AES


class RaycastConfig:
    def __init__(self):
        pass

    def _get_key(self, passphrase: str) -> tuple[bytes, bytes]:
        passwd = passphrase.encode("utf-8")
        D1 = hashlib.sha256(passwd).digest()
        D2 = hashlib.sha256(D1 + passwd).digest()
        key = D1[:32]
        iv = D2[:16]
        return key, iv

    def _decrypt(self, passphrase: str, data: bytes):
        key, iv = self._get_key(passphrase)

        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded_plaintext = cipher.decrypt(data)

        # remove padding
        padding_len = padded_plaintext[-1]
        plaintext = padded_plaintext[:-padding_len]

        # Remove header
        header = plaintext[:16]
        return plaintext[16:]

    def _encrypt(self, passphrase: str, data: bytes):
        key, iv = self._get_key(passphrase)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        padding_len = AES.block_size - len(data) % AES.block_size
        padded_plaintext = data + (bytes([padding_len]) * padding_len)
        encrypted_data = cipher.encrypt(padded_plaintext)

        return encrypted_data

    def json(self, **kwargs):
        return json.loads(self.raw, **kwargs)

    def notes(self):
        if not self.raw:
            return None
        config = self.json()
        if notes := config.get("builtin_package_raycastNotes"):
            return notes.get("notes", [])
        return None

    def import_file(self, passphrase: str, in_file: Path):
        encrypted_data = in_file.read_bytes()
        compressed_data = self._decrypt(passphrase, encrypted_data)
        try:
            self.raw = gzip.decompress(compressed_data)
        except gzip.BadGzipFile:
            raise ValueError("Invalid decryption password")

    def export_file(self, passphrase: str, out_file: Path):
        compressed_data = gzip.compress(self.raw)
        header = os.urandom(16)
        encrypted_data = self._encrypt(passphrase, header + compressed_data)
        with open(out_file, "wb") as fp:
            fp.write(encrypted_data)
