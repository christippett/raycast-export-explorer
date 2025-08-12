interface ASTNode {
  type: string;
  content?: ASTNode[];
  attrs?: Record<string, any>;
  text?: string;
  marks?: Mark[];
}

interface Mark {
  type: string;
  attrs?: Record<string, any>;
}

/**
 * Convert Raycast note AST to Markdown string
 * Mirrors the Python ast_to_markdown function
 */
export function astToMarkdown(node: ASTNode, index: number = 1): string {
  let markdown = "";
  const nodeType = node.type;
  const nodeContent = node.content || [];
  const nodeAttrs = node.attrs || {};

  const childContent: string[] = [];
  let currentIndex = index;

  for (let i = 0; i < nodeContent.length; i++) {
    const child = nodeContent[i];

    if (nodeType === "list" && child.type === "list") {
      // nested list
      childContent.push("  ");
      currentIndex = 1;
    }

    childContent.push(astToMarkdown(child, currentIndex));

    if (child.type === "list" && child.attrs?.kind === "ordered") {
      currentIndex++;
    }
  }

  const textContent = childContent.join("").trimEnd();

  if (nodeType === "text") {
    let text = node.text || "";
    const marks = node.marks || [];

    // Process marks in reverse order (like Python implementation)
    for (let i = marks.length - 1; i >= 0; i--) {
      const mark = marks[i];

      if (mark.type === "code") {
        text = `\`${text}\``;
        break; // Code mark takes precedence
      }

      if (mark.type === "bold") {
        text = `**${text}**`;
      } else if (mark.type === "italic") {
        text = `*${text}*`;
      } else if (mark.type === "underline") {
        text = `~${text}~`;
      } else if (mark.type === "strike") {
        text = `~~${text}~~`;
      } else if (mark.type === "link") {
        const href = mark.attrs?.href || "";
        text = `[${text}](${href})`;
      }
    }

    return markdown + text;
  } else if (nodeType === "doc") {
    markdown += textContent;
  } else if (nodeType === "horizontalRule") {
    markdown += "\n---\n";
  } else if (nodeType === "heading") {
    const level = nodeAttrs.level || 1;
    markdown += "#".repeat(level) + ` ${textContent}`;
  } else if (nodeType === "paragraph") {
    markdown += textContent;
  } else if (nodeType === "codeBlock") {
    const language = nodeAttrs.language || "";
    markdown += `\`\`\`${language}\n${textContent}\n\`\`\``;
  } else if (nodeType === "blockquote") {
    const blockContent: string[] = [];
    for (const line of textContent.split("\n")) {
      blockContent.push(`> ${line}`.trimEnd());
    }
    markdown += blockContent.join("\n");
  } else if (nodeType === "list") {
    const kind = nodeAttrs.kind || "bullet";
    const checked = nodeAttrs.checked || false;

    const listTemplates: Record<string, string> = {
      bullet: "- {item}",
      ordered: "{index}. {item}",
      task: "- [{check}] {item}",
    };

    const template = listTemplates[kind];
    const checkMark = checked ? "x" : " ";

    markdown += template
      .replace("{index}", currentIndex.toString())
      .replace("{item}", textContent)
      .replace("{check}", checkMark);
  }

  return markdown + "\n";
}

/**
 * Parse Raycast notes and convert them to Markdown
 */
export interface RaycastNote {
  id: string;
  title: string;
  document: string; // Base64 encoded JSON
  modifiedAt: string;
}

export interface ParsedNote {
  id: string;
  title: string;
  content: string;
  modifiedAt: Date;
}

/**
 * Parse a single note from Raycast format to Markdown
 */
export function parseNote(note: RaycastNote): ParsedNote {
  const { id, title, document, modifiedAt } = note;

  // Decode base64 document
  const documentJson = JSON.parse(atob(document));

  // Convert AST to Markdown
  const content = astToMarkdown(documentJson);

  // Parse ISO date
  const modifiedDate = new Date(modifiedAt);

  return {
    id,
    title: sanitizeTitle(title),
    content,
    modifiedAt: modifiedDate,
  };
}

/**
 * Sanitize title for use as filename
 */
export function sanitizeTitle(title: string): string {
  // Replace forward slashes and other problematic characters
  return title
    .replace(/[/\\:*?"<>|]/g, "-")
    .substring(0, 150) // Limit length
    .trim();
}

/**
 * Parse all notes from a Raycast config
 */
export function parseAllNotes(notes: RaycastNote[]): ParsedNote[] {
  return notes
    .filter(note => note.id && note.document && note.modifiedAt)
    .map(note => {
      try {
        return parseNote(note);
      } catch (error) {
        console.error(`Error parsing note ${note.id}-${note.title}:`, error);
        return null;
      }
    })
    .filter((note): note is ParsedNote => note !== null);
}

/**
 * Generate a downloadable filename for a note
 */
export function generateNoteFilename(note: ParsedNote): string {
  const sanitizedTitle = sanitizeTitle(note.title || "untitled");
  return `${note.id}-${sanitizedTitle}.md`;
}

/**
 * Create a downloadable blob for a note
 */
export function createNoteBlob(note: ParsedNote): Blob {
  return new Blob([note.content], { type: "text/markdown" });
}

/**
 * Download a note as a Markdown file
 */
export function downloadNote(note: ParsedNote): void {
  const blob = createNoteBlob(note);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = generateNoteFilename(note);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download all notes as individual Markdown files
 */
export function downloadAllNotes(notes: ParsedNote[]): void {
  notes.forEach(note => downloadNote(note));
}

/**
 * Create a ZIP file containing all notes
 */
export async function createNotesZip(notes: ParsedNote[]): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  // Add each note to the ZIP file
  notes.forEach(note => {
    const filename = generateNoteFilename(note);
    zip.file(filename, note.content, { date: note.modifiedAt });
  });

  // Generate the ZIP file
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download all notes as a single ZIP file
 */
export async function downloadNotesZip(notes: ParsedNote[]): Promise<void> {
  if (notes.length === 0) {
    return;
  }

  try {
    const zipBlob = await createNotesZip(notes);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raycast-notes-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw new Error('Failed to create ZIP file');
  }
}
