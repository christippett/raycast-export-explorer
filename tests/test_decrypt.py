import json
from pathlib import Path

from typer.testing import CliRunner

from rayconfig.main import app

runner = CliRunner()


def test_decrypt_command():
    """
    Tests the decrypt command with a sample encrypted file.
    """
    input_file = Path("data/Raycast 2025-08-06 00.22.39.rayconfig")
    password = "pass0010"

    result = runner.invoke(
        app, ["decrypt", str(input_file), f"--password={password}"]
    )

    # Uncomment to debug output
    # print(result.stdout)
    assert result.exit_code == 0

    # Check if the output is valid JSON
    try:
        print(result.stdout)
        json.loads(result.stdout)
    except json.JSONDecodeError:
        assert False, "Decrypted output is not valid JSON"
