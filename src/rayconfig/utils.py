def ast_to_markdown(node, i=1):
    markdown = ""
    node_type = node.get("type")
    node_content = node.get("content", [])
    node_attrs = node.get("attrs", {})

    child_content = []
    for index, child in enumerate(node_content):
        if node_type == "list" and child.get("type") == "list":
            # nested list
            child_content.append("  ")
            i = 1
        child_content.append(ast_to_markdown(child, i))
        if child.get("type") == "list" and child["attrs"]["kind"] == "ordered":
            i += 1

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
        markdown += "\n---\n"
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
        markdown += tmpl.format(
            index=i, item=text_content, check="x" if checked else " "
        )
    return markdown + "\n"
