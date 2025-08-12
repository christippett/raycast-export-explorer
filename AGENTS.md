# AGENTS.md

This document outlines the key commands, conventions, and context for working with the `rayconfig` project.

## Commands

### Python

- **Install dependencies:** `uv add [package]`
- **Run project:** `uv run rayconfig`
- **Run a Python file:** `uv run python src/rayconfig/main.py`
- **Run all tests:** `uv run pytest`
- **Run a single test:** `uv run pytest tests/test_main.py -k "test_function_name"`
- **Lint:** No specific linter is configured.

### Typescript

- **Install dependencies:** `pnpm add [package]`

## Code Style & Conventions

### Python

- **Formatting:** Follow PEP 8 guidelines with 4-space indentation.
- **Imports:** Group imports: standard library, then third-party, then local. Sort alphabetically within each group.
- **Types:** Use type hints for all function signatures and arguments.
- **Naming:** Use `snake_case` for variables/functions and `PascalCase` for class names.
- **Error Handling:** Use `typer.Exit` for CLI exits and specific exceptions. Log context with `typer.echo`.
- **Comments:** Avoid comments unless necessary for public APIs or complex logic.
- **Testing:** All new features must be accompanied by tests. The preferred workflow is to first write a brief spec, then stub out tests, and finally implement the feature.
- **Security:** Do not log secrets. Sanitize user input used for filenames.

## Project Objectives

The project aims to decrypt user's settings exported from the application Raycast. The file exported from Raycast has the extension `.rayconfig` and is a JSON file compressed using gzip and encrypted using a passphrase of the user's choosing.

- `src/rayconfig/decrypt.py` contains the logic for decrypting and reading an exported Raycast configuration file.
- `src/rayconfig/utils.py` contains logic for parsing the user's Markdown notes stored in the exported config. These notes are stored in an AST-like structure and parsing is required to render them as formatted Markdown.
- `src/rayconfig/main.py` contains the main entrypoint to the program and implements a CLI using the `Typer` framework.
