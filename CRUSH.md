# CRUSH.md

## Build, Lint, Test Commands

- Install dependencies:
  - `uv add [package]`
- Run project:
  - `uv run rayconfig`
- Run Python file:
  - `uv run python src/rayconfig/main.py`
- Run all tests:
  - `uv run pytest`
- Run a single test (by function name):
  - `uv run pytest tests/test_main.py -k "test_function"`

## Code Style Guidelines

- Imports: Use standard library first, then third-party, then local; group and order alphabetically within each group.
- Formatting: Use 4 spaces for indentation. Follow PEP8 for all formatting.
- Types: Use type hints where possible, especially for function signatures and arguments.
- Naming: Use snake_case for variables/functions, PascalCase for class names. Use descriptive, precise names.
- Error Handling: Prefer `typer.Exit` for CLI exits. Use specific exceptions, log context with `typer.echo`.
- Files: Utility code belongs in `src/rayconfig/`. Tests live in `tests/` and use pytest.
- No comments unless required for public API/docs.
- Avoid unused variables and unnecessary code.
- Do not log secrets or credentials.
- Always sanitize user input when used for filenames.
- Markdown and CLI output should be clear and minimal.

## Raycast SQLite Database Notes

- Databases in this repo are encrypted; see below for findings.
- Raycast uses GRDB.swift and SQLCipher. Key is saved as `database_key` in macOS Keychain.
- Usual direct decryption fails. PRAGMA options may be required.
- Salt string found: `yvkwWXzxPPBAqY2tmaKrB*DvYjjMaeEf`.
- See `references/` for GRDB and SQLCipher docs.

## Raycast `.rayconfig` Export Decryption Steps
1. Decrypt with: `openssl enc -d -aes-256-cbc -nosalt` using the file and password
2. Remove the first 16 bytes (openssl header)
3. Decompress as gzipped JSON
- No PBKDF2 or iteration options are required—openssl command as above is correct
- Notes are stored as base64 JSON under the "document" key
- Markdown structure is encoded in "document"

## Repo Hygiene
- Add `.crush/` and `.crush` directory to `.gitignore`.
