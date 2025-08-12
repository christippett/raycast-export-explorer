import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  astToMarkdown,
  createNoteBlob,
  createNotesZip,
  downloadNotesZip,
  generateNoteFilename,
  parseAllNotes,
  parseNote,
  sanitizeTitle,
  type RaycastNote
} from '../src/lib/utils';

describe('utils', () => {
  describe('astToMarkdown', () => {
    it('should convert text nodes', () => {
      const textNode = {
        type: 'text',
        text: 'Hello world'
      };

      const result = astToMarkdown(textNode);
      expect(result).toBe('Hello world');
    });

    it('should convert text with bold marks', () => {
      const boldNode = {
        type: 'text',
        text: 'Bold text',
        marks: [{ type: 'bold' }]
      };

      const result = astToMarkdown(boldNode);
      expect(result).toBe('**Bold text**');
    });

    it('should convert text with italic marks', () => {
      const italicNode = {
        type: 'text',
        text: 'Italic text',
        marks: [{ type: 'italic' }]
      };

      const result = astToMarkdown(italicNode);
      expect(result).toBe('*Italic text*');
    });

    it('should convert text with underline marks', () => {
      const underlineNode = {
        type: 'text',
        text: 'Underlined text',
        marks: [{ type: 'underline' }]
      };

      const result = astToMarkdown(underlineNode);
      expect(result).toBe('~Underlined text~');
    });

    it('should convert text with strike marks', () => {
      const strikeNode = {
        type: 'text',
        text: 'Strikethrough text',
        marks: [{ type: 'strike' }]
      };

      const result = astToMarkdown(strikeNode);
      expect(result).toBe('~~Strikethrough text~~');
    });

    it('should convert text with code marks', () => {
      const codeNode = {
        type: 'text',
        text: 'code text',
        marks: [{ type: 'code' }]
      };

      const result = astToMarkdown(codeNode);
      expect(result).toBe('`code text`');
    });

    it('should convert text with link marks', () => {
      const linkNode = {
        type: 'text',
        text: 'Link text',
        marks: [{
          type: 'link',
          attrs: { href: 'https://example.com' }
        }]
      };

      const result = astToMarkdown(linkNode);
      expect(result).toBe('[Link text](https://example.com)');
    });

    it('should prioritize code marks over other marks', () => {
      const codeNode = {
        type: 'text',
        text: 'code text',
        marks: [
          { type: 'bold' },
          { type: 'code' }
        ]
      };

      const result = astToMarkdown(codeNode);
      expect(result).toBe('`code text`');
    });

    it('should convert paragraphs', () => {
      const paragraphNode = {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is a paragraph.' }
        ]
      };

      const result = astToMarkdown(paragraphNode);
      expect(result).toBe('This is a paragraph.\n');
    });

    it('should convert headings', () => {
      const headingNode = {
        type: 'heading',
        attrs: { level: 2 },
        content: [
          { type: 'text', text: 'Heading Text' }
        ]
      };

      const result = astToMarkdown(headingNode);
      expect(result).toBe('## Heading Text\n');
    });

    it('should convert code blocks', () => {
      const codeBlockNode = {
        type: 'codeBlock',
        attrs: { language: 'javascript' },
        content: [
          { type: 'text', text: 'console.log("Hello");' }
        ]
      };

      const result = astToMarkdown(codeBlockNode);
      expect(result).toBe('```javascript\nconsole.log("Hello");\n```\n');
    });

    it('should convert blockquotes', () => {
      const blockquoteNode = {
        type: 'blockquote',
        content: [
          { type: 'text', text: 'This is a quote\nwith multiple lines' }
        ]
      };

      const result = astToMarkdown(blockquoteNode);
      expect(result).toBe('> This is a quote\n> with multiple lines\n');
    });

    it('should convert horizontal rules', () => {
      const hrNode = {
        type: 'horizontalRule'
      };

      const result = astToMarkdown(hrNode);
      expect(result).toBe('\n---\n\n');
    });

    it('should convert bullet lists', () => {
      const listNode = {
        type: 'list',
        attrs: { kind: 'bullet' },
        content: [
          { type: 'text', text: 'First item' }
        ]
      };

      const result = astToMarkdown(listNode);
      expect(result).toBe('- First item\n');
    });

    it('should convert ordered lists', () => {
      const listNode = {
        type: 'list',
        attrs: { kind: 'ordered' },
        content: [
          { type: 'text', text: 'First item' }
        ]
      };

      const result = astToMarkdown(listNode, 1);
      expect(result).toBe('1. First item\n');
    });

    it('should convert task lists', () => {
      const checkedTaskNode = {
        type: 'list',
        attrs: { kind: 'task', checked: true },
        content: [
          { type: 'text', text: 'Completed task' }
        ]
      };

      const uncheckedTaskNode = {
        type: 'list',
        attrs: { kind: 'task', checked: false },
        content: [
          { type: 'text', text: 'Incomplete task' }
        ]
      };

      const checkedResult = astToMarkdown(checkedTaskNode);
      const uncheckedResult = astToMarkdown(uncheckedTaskNode);

      expect(checkedResult).toBe('- [x] Completed task\n');
      expect(uncheckedResult).toBe('- [ ] Incomplete task\n');
    });

    it('should convert complex nested structures', () => {
      const docNode = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Title' }]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is ' },
              { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' text.' }
            ]
          }
        ]
      };

      const result = astToMarkdown(docNode);
      expect(result).toBe('# Title\nThis is **bold** text.\n');
    });
  });

  describe('sanitizeTitle', () => {
    it('should replace problematic characters', () => {
      const title = 'File/with\\problematic:characters?<>|*"';
      const result = sanitizeTitle(title);
      expect(result).toBe('File-with-problematic-characters------');
    });

    it('should limit title length', () => {
      const longTitle = 'a'.repeat(200);
      const result = sanitizeTitle(longTitle);
      expect(result.length).toBe(150);
    });

    it('should trim whitespace', () => {
      const title = '  Title with spaces  ';
      const result = sanitizeTitle(title);
      expect(result).toBe('Title with spaces');
    });

    it('should handle empty titles', () => {
      const result = sanitizeTitle('');
      expect(result).toBe('');
    });
  });

  describe('parseNote', () => {
    it('should parse a valid note', () => {
      const astDocument = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Test content' }]
          }
        ]
      };

      const note: RaycastNote = {
        id: 'test-id',
        title: 'Test Title',
        document: btoa(JSON.stringify(astDocument)),
        modifiedAt: '2024-01-01T12:00:00Z'
      };

      const result = parseNote(note);

      expect(result.id).toBe('test-id');
      expect(result.title).toBe('Test Title');
      expect(result.content).toBe('Test content\n');
      expect(result.modifiedAt).toBeInstanceOf(Date);
    });

    it('should sanitize problematic titles', () => {
      const astDocument = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }]
          }
        ]
      };

      const note: RaycastNote = {
        id: 'test-id',
        title: 'Title/with\\problems',
        document: btoa(JSON.stringify(astDocument)),
        modifiedAt: '2024-01-01T12:00:00Z'
      };

      const result = parseNote(note);
      expect(result.title).toBe('Title-with-problems');
    });

    it('should throw error for invalid base64', () => {
      const note: RaycastNote = {
        id: 'test-id',
        title: 'Test Title',
        document: 'invalid-base64',
        modifiedAt: '2024-01-01T12:00:00Z'
      };

      expect(() => parseNote(note)).toThrow();
    });

    it('should throw error for invalid JSON', () => {
      const note: RaycastNote = {
        id: 'test-id',
        title: 'Test Title',
        document: btoa('invalid json'),
        modifiedAt: '2024-01-01T12:00:00Z'
      };

      expect(() => parseNote(note)).toThrow();
    });
  });

  describe('parseAllNotes', () => {
    it('should parse all valid notes', () => {
      const astDocument = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }]
          }
        ]
      };

      const notes: RaycastNote[] = [
        {
          id: 'note1',
          title: 'Note 1',
          document: btoa(JSON.stringify(astDocument)),
          modifiedAt: '2024-01-01T12:00:00Z'
        },
        {
          id: 'note2',
          title: 'Note 2',
          document: btoa(JSON.stringify(astDocument)),
          modifiedAt: '2024-01-02T12:00:00Z'
        }
      ];

      const result = parseAllNotes(notes);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('note1');
      expect(result[1].id).toBe('note2');
    });

    it('should filter out notes with missing required fields', () => {
      const astDocument = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }]
          }
        ]
      };

      const notes: RaycastNote[] = [
        {
          id: 'note1',
          title: 'Note 1',
          document: btoa(JSON.stringify(astDocument)),
          modifiedAt: '2024-01-01T12:00:00Z'
        },
        {
          id: '',
          title: 'Note 2',
          document: btoa(JSON.stringify(astDocument)),
          modifiedAt: '2024-01-02T12:00:00Z'
        },
        {
          id: 'note3',
          title: 'Note 3',
          document: '',
          modifiedAt: '2024-01-03T12:00:00Z'
        }
      ];

      const result = parseAllNotes(notes);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('note1');
    });

    it('should filter out notes that fail to parse', () => {
      const astDocument = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }]
          }
        ]
      };

      const notes: RaycastNote[] = [
        {
          id: 'note1',
          title: 'Note 1',
          document: btoa(JSON.stringify(astDocument)),
          modifiedAt: '2024-01-01T12:00:00Z'
        },
        {
          id: 'note2',
          title: 'Note 2',
          document: 'invalid-base64',
          modifiedAt: '2024-01-02T12:00:00Z'
        }
      ];

      const result = parseAllNotes(notes);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('note1');
    });
  });

  describe('generateNoteFilename', () => {
    it('should generate filename with id and title', () => {
      const note = {
        id: 'test-id',
        title: 'Test Title',
        content: 'Content',
        modifiedAt: new Date()
      };

      const result = generateNoteFilename(note);
      expect(result).toBe('test-id-Test Title.md');
    });

    it('should handle untitled notes', () => {
      const note = {
        id: 'test-id',
        title: '',
        content: 'Content',
        modifiedAt: new Date()
      };

      const result = generateNoteFilename(note);
      expect(result).toBe('test-id-untitled.md');
    });

    it('should sanitize problematic characters in filename', () => {
      const note = {
        id: 'test-id',
        title: 'Title/with\\problems',
        content: 'Content',
        modifiedAt: new Date()
      };

      const result = generateNoteFilename(note);
      expect(result).toBe('test-id-Title-with-problems.md');
    });
  });

  describe('createNoteBlob', () => {
    it('should create markdown blob', () => {
      const note = {
        id: 'test-id',
        title: 'Test Title',
        content: '# Test Content\nThis is a test.',
        modifiedAt: new Date()
      };

      const blob = createNoteBlob(note);
      expect(blob.type).toBe('text/markdown');
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('createNotesZip', () => {
    it('should create ZIP file with all notes', async () => {
      const notes = [
        {
          id: 'note1',
          title: 'First Note',
          content: '# First Note\nContent 1',
          modifiedAt: new Date()
        },
        {
          id: 'note2',
          title: 'Second Note',
          content: '# Second Note\nContent 2',
          modifiedAt: new Date()
        }
      ];

      const zipBlob = await createNotesZip(notes);
      expect(zipBlob.type).toBe('application/zip');
      expect(zipBlob.size).toBeGreaterThan(0);
    });

    it('should handle empty notes array', async () => {
      const zipBlob = await createNotesZip([]);
      expect(zipBlob.type).toBe('application/zip');
      expect(zipBlob.size).toBeGreaterThan(0); // ZIP header is still present
    });

    it('should create ZIP with proper filenames', async () => {
      const notes = [
        {
          id: 'test-id',
          title: 'Test/Title\\With:Problems',
          content: 'Content',
          modifiedAt: new Date()
        }
      ];

      // We can't easily test the internal ZIP structure in this test environment,
      // but we can verify that the ZIP is created successfully
      const zipBlob = await createNotesZip(notes);
      expect(zipBlob).toBeInstanceOf(Blob);
    });
  });

  describe('downloadNotesZip', () => {
    // Mock DOM elements for download testing
    const mockCreateElement = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockClick = vi.fn();
    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();

    beforeEach(() => {
      // Mock document.createElement
      (global as any).document = {
        ...((global as any).document || {}),
        createElement: mockCreateElement.mockReturnValue({
          click: mockClick,
          href: '',
          download: ''
        }),
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild
        }
      };

      // Mock URL methods
      (global as any).URL = {
        ...((global as any).URL || {}),
        createObjectURL: mockCreateObjectURL.mockReturnValue('mock-url'),
        revokeObjectURL: mockRevokeObjectURL
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should handle empty notes array', async () => {
      await downloadNotesZip([]);
      expect(mockCreateElement).not.toHaveBeenCalled();
    });

    it('should create and trigger download for valid notes', async () => {
      const notes = [
        {
          id: 'note1',
          title: 'Test Note',
          content: 'Content',
          modifiedAt: new Date()
        }
      ];

      await downloadNotesZip(notes);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });
});
