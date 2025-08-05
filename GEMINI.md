# Raycast SQLite Database

The SQLite databases contained in this folder have been copied across from Raycast's configuration directory (`~/Library/Application Support/com.raycast.macos`). Unfortunately the databases are not accessible by default as they appear to be encrypted.

- `raycast-enc.sqlite`
- `raycast-activities-enc.sqlite`
- `raycast-emoji.sqlite` (not encrypted!)

## Research & Findings to date

1. Raycast uses the GRDB.swift library for connecting and using SQLite. This library includes functionality to encrypt a database using SQLCipher.

Within the macOS Keychain is an entry saved by Raycast with the identifier `database_key`, a promising start to our investigation.

`27f0c69adf175dcdda731177df140502b428f7f44b3ca6deb7399458b9da25e0`

However attempting to use this key as-is to decrypt the files using SQLCipher results in an error that the files aren't recognised as a SQLite database.

```sql
> ATTACH 'racast-enc.sqlite' AS encrypted KEY "x'27f0c69adf175dcdda731177df140502b428f7f44b3ca6deb7399458b9da25e0'";
Runtime error: file is not a database (26)
```

Other configuration options that may or may not be relevant or useful include:
- `PRAGMA kdf_iter = ...`
- `PRAGMA cipher_page_size = ...`
- `PRAGMA cipher_compatibility = ...`

An attempt was made to disassemble the Raycast binary to see if it'd provide any insight into how the decryption is happening. In the same vicinity as a function call that references `database_passphrase` is a random 32-character string. Might be something related to the decryption, salt maybe?

`yvkwWXzxPPBAqY2tmaKrB*DvYjjMaeEf`

## Further Reading

Within the `./references` subdirectory are Markdown files with potentially useful information pertaining to GRDB and SQLCipher. These have been extracted directly from their respective documentation sites or GitHub READMEs.

---

## Raycast Configuration Export (.rayconfig)

Investigation into the `.rayconfig` file format, specifically for exports protected by a password, has yielded the following:

1.  **Encryption Algorithm:** The file is encrypted using **AES-256-CBC**.
2.  **Key Derivation:** The encryption key is derived from the provided password using **PBKDF2** with **256,000 iterations**.
3.  **Initialization Vector (IV) Handling:** The `openssl` decryption process, when successful, prepends a 16-byte header (likely the IV) to the output. This header needs to be removed before further processing.
4.  **Compression:** After decryption and removal of the `openssl` header, the content is a **gzipped JSON** file.

**Decryption Process for `.rayconfig` files:**

To decrypt and decompress a `.rayconfig` file, the following steps are required:

1.  **Decrypt with `openssl`:** Use `openssl enc -d -aes-256-cbc -pbkdf2 -iter 256000` with the input file and password.
2.  **Remove `openssl` header:** The output from `openssl` will have a 16-byte header that needs to be removed (e.g., using `tail -c +17`).
3.  **Decompress with `gunzip`:** The remaining content is gzipped and can be decompressed using `gunzip` to reveal the JSON data.
