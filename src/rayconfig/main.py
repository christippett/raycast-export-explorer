import typer
from typing_extensions import Annotated

app = typer.Typer()


@app.command()
def main(config: Annotated[typer.FileText, typer.Option()]):
    pass
