import base64
import json
import os
from datetime import datetime
from pathlib import Path

import typer

app = typer.Typer()


def ast_to_markdown(node, i=1):
    markdown = ""
    node_type = node.get("type")
    node_content = node.get("content", [])
    node_attrs = node.get("attrs", {})
    print(f"{i * ' '} {node_type} ({i})")

    child_content = []
    for index, child in enumerate(node_content):
        if node_type == "list" and child.get("type") == "list":
            child_content.append("  ")
        if (prev_child := node_content[index - 1]) and index > 0:
            if (
                child.get("type") == "list"
                and prev_child.get("type") == "list"
                and prev_child["attrs"]["kind"] == "ordered"
            ):
                i += 1
        child_content.append(ast_to_markdown(child, i))
    text_content = "".join(child_content).rstrip()
    if node_type == "text":
        text = node.get("text", "")
        marks = node.get("marks", [])
        for mark in reversed(marks):
            if mark.get("type") == "code":
                text = f"`{text}`"
                break
            if mark.get("type") == "bold":
                text = f"**{text}**"
            elif mark.get("type") == "italic":
                text = f"*{text}*"
            elif mark.get("type") == "underline":
                text = f"~{text}~"
            elif mark.get("type") == "strike":
                text = f"~~{text}~~"
            elif mark.get("type") == "link":
                href = mark.get("attrs", {}).get("href", "")
                text = f"[{text}]({href})"
        return markdown + text
    elif node_type == "doc":
        markdown += text_content
    elif node_type == "horizontalRule":
        markdown += "---"
    elif node_type == "heading":
        level = node_attrs.get("level", 1)
        markdown += "#" * level + f" {text_content}"
    elif node_type == "paragraph":
        markdown += text_content
    elif node_type == "codeBlock":
        language = node_attrs.get("language") or ""
        markdown += f"```{language}\n{text_content}\n```"
    elif node_type == "blockquote":
        block_content = []
        # for child in node_content:
        #     child_md = ast_to_markdown(child)
        for line in text_content.splitlines():
            block_content.append(f"> {line}".rstrip())
        markdown += "\n".join(block_content)
    elif node_type == "list":
        kind = node_attrs.get("kind", "bullet")
        checked = node_attrs.get("checked", False)
        list_template = {
            "bullet": "- {item}",
            "ordered": "{index}. {item}",
            "task": "- [{check}] {item}",
        }
        tmpl = list_template[kind]
        # for item in node_content:
        #     content = ast_to_markdown(item)

        markdown += tmpl.format(
            index=i, item=text_content, check="x" if checked else " "
        )
    return markdown + "\n"


@app.command()
def parse_notes(
    config_file: Path = typer.Argument(
        ..., help="Path to the decrypted Raycast config JSON file."
    ),
    output_dir: Path = typer.Argument(
        ..., help="Directory to save the Markdown notes."
    ),
):
    """
    Parses Raycast notes from the config file and saves them as Markdown files.
    """
    if not config_file.is_file():
        typer.echo(f"Error: Config file not found at {config_file}")
        raise typer.Exit(code=1)

    output_dir.mkdir(parents=True, exist_ok=True)

    with open(config_file, "r") as f:
        config = json.load(f)

    if not (
        notes_data := config.get("builtin_package_raycastNotes", {}).get(
            "notes", []
        )
    ):
        typer.echo("No notes found in the config file.")
        raise typer.Exit()

    typer.echo(f"Found {len(notes_data)} notes.")

    for note_index, note in enumerate(notes_data):
        note_id = note.get("id")
        title = note.get("title", "untitled").replace(
            "/", "-"
        )  # Sanitize title for filename
        document_b64 = note.get("document")
        modified_at_iso = note.get("modifiedAt")

        if not all([note_id, document_b64, modified_at_iso]):
            typer.echo(
                f"Skipping note due to missing data: {note.get('title', 'N/A')}"
            )
            continue

        try:
            document_json = json.loads(base64.b64decode(document_b64))

            markdown_content = ast_to_markdown(document_json)

            # Truncate title for filename if too long
            max_filename_length = 150  # A common limit for filenames
            if len(title) > max_filename_length:
                title = title[:max_filename_length] + "..."

            filename = f"{note_id}-{title}.md"
            filepath = output_dir / filename

            with open(filepath, "w", encoding="utf-8") as md_file:
                md_file.write(markdown_content)

            # Set the file modification time
            mod_time_dt = datetime.fromisoformat(
                modified_at_iso.replace("Z", "+00:00")
            )
            mod_time = mod_time_dt.timestamp()
            os.utime(filepath, (mod_time, mod_time))

            typer.echo(f"Saved note: {filename}")

        except json.JSONDecodeError as e:
            typer.echo(
                f"Error: JSON decoding failed for note {note_id}-{title}: {e}"
            )
        except Exception as e:
            typer.echo(f"Error processing note {note_id}-{title}: {e}")


if __name__ == "__main__":
    app()
