from rayconfig.main import ast_to_markdown


def test_empty_doc():
    ast = {"type": "doc", "content": []}
    expected_md = "\n"
    assert ast_to_markdown(ast) == expected_md


def test_text_heading():
    title = [{"type": "text", "text": "Heading"}]
    ast = {
        "type": "doc",
        "content": [
            {"type": "heading", "attrs": {"level": 1}, "content": title},
            {"type": "heading", "attrs": {"level": 2}, "content": title},
            {"type": "heading", "attrs": {"level": 3}, "content": title},
            {"type": "heading", "attrs": {"level": 4}, "content": title},
        ],
    }
    expected_md = "# Heading\n## Heading\n### Heading\n#### Heading\n"
    assert ast_to_markdown(ast) == expected_md


def test_paragraph():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": "This is a paragraph."}],
            },
            {"type": "paragraph"},
            {
                "type": "paragraph",
                "content": [
                    {"type": "text", "text": "This is another paragraph."}
                ],
            },
        ],
    }
    expected_md = "This is a paragraph.\n\nThis is another paragraph.\n"
    assert ast_to_markdown(ast) == expected_md


def test_text_formatting():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {"type": "text", "text": "This text is... "},
                    {
                        "type": "text",
                        "marks": [{"type": "bold"}],
                        "text": "bold",
                    },
                    {"type": "text", "text": ", "},
                    {
                        "type": "text",
                        "marks": [{"type": "italic"}],
                        "text": "italic",
                    },
                    {"type": "text", "text": ", "},
                    {
                        "type": "text",
                        "marks": [{"type": "underline"}],
                        "text": "underlined",
                    },
                    {"type": "text", "text": ", "},
                    {
                        "type": "text",
                        "marks": [{"type": "strike"}],
                        "text": "striked",
                    },
                    {"type": "text", "text": ", "},
                    {
                        "type": "text",
                        "marks": [{"type": "code"}],
                        "text": "is code",
                    },
                ],
            },
            {
                "type": "paragraph",
                "content": [
                    {"type": "text", "text": "This text "},
                    {
                        "type": "text",
                        "marks": [
                            {"type": "bold"},
                            {"type": "italic"},
                            {"type": "underline"},
                            {"type": "strike"},
                        ],
                        "text": "has everything!",
                    },
                ],
            },
        ],
    }
    expected_md = (
        "This text is... **bold**, *italic*, ~underlined~, ~~striked~~, `is code`\n"
        "This text ***~~~has everything!~~~***\n"
    )
    assert ast_to_markdown(ast) == expected_md


def test_text_link():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "marks": [
                            {
                                "type": "link",
                                "attrs": {
                                    "href": "https://example.com",
                                    "class": None,
                                    "title": None,
                                    "target": "_blank",
                                    "rel": "noopener noreferrer nofollow",
                                },
                            }
                        ],
                        "text": "Link text here.",
                    }
                ],
            }
        ],
    }
    expected_md = "[Link text here.](https://example.com)\n"
    assert ast_to_markdown(ast) == expected_md


def test_code_block():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "codeBlock",
                "attrs": {"language": "python"},
                "content": [
                    {"type": "text", "text": 'def main():\n  print("hello")'}
                ],
            }
        ],
    }
    expected_md = """
```python
def main():
  print("hello")
```
    """.strip()
    assert ast_to_markdown(ast) == expected_md + "\n"


def test_blockquote():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "blockquote",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": "First line of blockquote.",
                            }
                        ],
                    },
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "Second line…"}],
                    },
                    {"type": "paragraph"},
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "Fourth line…"}],
                    },
                    {
                        "type": "list",
                        "attrs": {
                            "kind": "bullet",
                            "order": None,
                            "checked": False,
                        },
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "Fifth line (as list item)",
                                    }
                                ],
                            }
                        ],
                    },
                ],
            }
        ],
    }
    expected_md = """
> First line of blockquote.
> Second line…
>
> Fourth line…
> - Fifth line (as list item)
    """.strip()
    assert ast_to_markdown(ast) == expected_md + "\n"


def test_bullet_list():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "list",
                "attrs": {"kind": "bullet", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "Item 1"}],
                    }
                ],
            },
            {
                "type": "list",
                "attrs": {"kind": "bullet", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "Item 2"}],
                    }
                ],
            },
        ],
    }

    expected_md = "- Item 1\n- Item 2\n"
    assert ast_to_markdown(ast) == expected_md


def test_ordered_list():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "list",
                "attrs": {"kind": "ordered", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "First item"}],
                    }
                ],
            },
            {
                "type": "list",
                "attrs": {"kind": "ordered", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "Second item"}],
                    }
                ],
            },
        ],
    }
    expected_md = "1. First item\n2. Second item\n"
    assert ast_to_markdown(ast) == expected_md


def test_combined_elements():
    ast = {
        "type": "doc",
        "content": [
            {
                "type": "heading",
                "attrs": {"level": 1},
                "content": [{"type": "text", "text": "Combined Test"}],
            },
            {
                "type": "paragraph",
                "content": [
                    {"type": "text", "text": "This is a "},
                    {
                        "type": "text",
                        "marks": [{"type": "bold"}],
                        "text": "bold",
                    },
                    {"type": "text", "text": " and "},
                    {
                        "type": "text",
                        "marks": [{"type": "italic"}],
                        "text": "italic",
                    },
                    {"type": "text", "text": " paragraph with a "},
                    {
                        "type": "text",
                        "marks": [
                            {
                                "type": "link",
                                "attrs": {"href": "https://google.com"},
                            }
                        ],
                        "text": "link",
                    },
                    {"type": "text", "text": "."},
                ],
            },
            {
                "type": "codeBlock",
                "attrs": {"language": "javascript"},
                "content": [
                    {
                        "type": "text",
                        "text": "function test() {\n  return true;\n}",
                    }
                ],
            },
            {
                "type": "blockquote",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {"type": "text", "text": "A quoted statement."}
                        ],
                    }
                ],
            },
            {"type": "horizontalRule"},
            {
                "type": "list",
                "attrs": {"kind": "task", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "Task item 1"}],
                    }
                ],
            },
            {
                "type": "list",
                "attrs": {"kind": "task", "order": None, "checked": True},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": "Task item 2 (checked)",
                            }
                        ],
                    },
                    {
                        "type": "list",
                        "attrs": {
                            "kind": "task",
                            "order": None,
                            "checked": False,
                        },
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {"type": "text", "text": "Nested task item"}
                                ],
                            }
                        ],
                    },
                ],
            },
            {
                "type": "list",
                "attrs": {"kind": "bullet", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "List item 1"}],
                    }
                ],
            },
            {
                "type": "list",
                "attrs": {"kind": "bullet", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {"type": "text", "text": "List item 2"},
                        ],
                    },
                    {
                        "type": "list",
                        "attrs": {
                            "kind": "bullet",
                            "order": None,
                            "checked": False,
                        },
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "Nested list item",
                                    }
                                ],
                            }
                        ],
                    },
                ],
            },
            {
                "type": "list",
                "attrs": {"kind": "ordered", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": "Ordered item 1"}],
                    }
                ],
            },
            {
                "type": "list",
                "attrs": {"kind": "ordered", "order": None, "checked": False},
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {"type": "text", "text": "Ordered item 2"},
                        ],
                    },
                    {
                        "type": "list",
                        "attrs": {
                            "kind": "bullet",
                            "order": None,
                            "checked": False,
                        },
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "Nested ordered item",
                                    }
                                ],
                            }
                        ],
                    },
                ],
            },
        ],
    }
    expected_md = (
        "# Combined Test\n"
        "This is a **bold** and *italic* paragraph with a [link](https://google.com).\n"
        "```javascript\nfunction test() {\n  return true;\n}\n```\n"
        "> A quoted statement.\n"
        "\n---\n\n"
        "- [ ] Task item 1\n- [x] Task item 2 (checked)\n  - [ ] Nested task item\n"
        "- List item 1\n- List item 2\n  - Nested list item\n"
        "1. Ordered item 1\n2. Ordered item 2\n  - Nested ordered item\n"
    )
    assert ast_to_markdown(ast) == expected_md
