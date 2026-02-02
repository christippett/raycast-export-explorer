import base64
import json
import os
from datetime import datetime
from pathlib import Path

import typer

from .decrypt import RaycastConfig
from .utils import ast_to_markdown

app = typer.Typer()


@app.command()
def decrypt(
    input_file: Path = typer.Argument(
        ..., exists=True, help="Path to the encrypted Raycast config file."
    ),
    password: str = typer.Option(
        ..., prompt=True, hide_input=True, help="Decryption password."
    ),
):
    """
    Decrypts a Raycast configuration file.
    """
    raycfg = RaycastConfig()
    try:
        raycfg.import_file(password, input_file)
    except ValueError as exc:
        typer.echo(exc)
        raise typer.Exit(1)

    output_file = input_file.with_suffix(".json")
    output_file.write_bytes(raycfg.raw)
    typer.echo(raycfg.raw)


@app.command()
def parse_notes(
    config_file: Path = typer.Argument(
        ..., exists=True, help="Path to the decrypted Raycast config JSON file."
    ),
    password: str = typer.Option(
        ..., prompt=True, hide_input=True, help="Decryption password."
    ),
):
    """
    Parses Raycast notes from the config file and saves them as Markdown files.
    """
    output_dir = Path("./notes")
    output_dir.mkdir(parents=True, exist_ok=True)

    raycfg = RaycastConfig()
    try:
        raycfg.import_file(password, config_file)
    except ValueError as exc:
        typer.echo(exc)
        raise typer.Exit(1)

    if not (notes_data := raycfg.notes()):
        typer.echo("No notes found in the config file.")
        raise typer.Exit(1)

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

        except Exception as e:
            typer.echo(f"Error processing note {note_id}-{title}: {e}")


if __name__ == "__main__":
    app()
