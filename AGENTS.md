# AGENTS.md

This document outlines the key commands, conventions, and context for working with the `rayconfig` project.

## Commands

- **Install dependencies:** `uv add [package]`
- **Run project:** `uv run rayconfig`
- **Run a Python file:** `uv run python src/rayconfig/main.py`
- **Run all tests:** `uv run pytest`
- **Run a single test:** `uv run pytest tests/test_main.py -k "test_function_name"`
- **Lint:** No specific linter is configured.

## Code Style & Conventions

- **Formatting:** Follow PEP 8 guidelines with 4-space indentation.
- **Imports:** Group imports: standard library, then third-party, then local. Sort alphabetically within each group.
- **Types:** Use type hints for all function signatures and arguments.
- **Naming:** Use `snake_case` for variables/functions and `PascalCase` for class names.
- **Error Handling:** Use `typer.Exit` for CLI exits and specific exceptions. Log context with `typer.echo`.
- **Comments:** Avoid comments unless necessary for public APIs or complex logic.
- **Testing:** All new features must be accompanied by tests. The preferred workflow is to first write a brief spec, then stub out tests, and finally implement the feature.
- **Security:** Do not log secrets. Sanitize user input used for filenames.

## Technical Context

### Raycast `.rayconfig` Export Decryption
1.  **Decrypt:** Use `openssl enc -d -aes-256-cbc -nosalt` with the file and password.
2.  **Header:** Remove the first 16 bytes (the `openssl` header).
3.  **Decompress:** The remaining content is a gzipped JSON file.

### Raycast SQLite Database
- The databases are encrypted using **SQLCipher**.
- The key is stored in the macOS Keychain with the identifier `database_key`.
- A potential salt has been identified: `yvkwWXzxPPBAqY2tmaKrB*DvYjjMaeEf`.
- See the `references/` directory for more details on GRDB and SQLCipher.

## Repo Hygiene
- Add `.crush/` and `.crush` to `.gitignore`.
