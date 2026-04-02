import { parseMarkdownToHtml, stripLinkMarkdown, stripMarkdown, isSafeUri } from '@/utils/chat';

describe('parseMarkdownToHtml', () => {
  describe('plain markdown', () => {
    it('converts bold text to strong tags', () => {
      const result = parseMarkdownToHtml('**bold**');

      expect(result).toContain('<strong>bold</strong>');
    });

    it('converts italic text to em tags', () => {
      const result = parseMarkdownToHtml('_italic_');

      expect(result).toContain('<em>italic</em>');
    });

    it('converts a markdown link to an anchor tag', () => {
      const result = parseMarkdownToHtml('[label](https://example.com)');

      expect(result).toContain('<a href="https://example.com">label</a>');
    });

    it('converts a markdown image to an img tag', () => {
      const result = parseMarkdownToHtml('![alt text](https://example.com/image.png)');

      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/image.png"');
    });
  });

  describe('regular unordered lists', () => {
    it('passes through a regular unordered list unchanged', () => {
      const result = parseMarkdownToHtml('- item one\n- item two');

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>item one</li>');
      expect(result).toContain('<li>item two</li>');
    });
  });

  describe('checkbox lists', () => {
    it('converts a checked checkbox item to a checked paragraph', () => {
      const result = parseMarkdownToHtml('- [x] done');

      expect(result).toContain('☑');
      expect(result).toContain('done');
      expect(result).not.toContain('<input');
    });

    it('converts an unchecked checkbox item to an unchecked paragraph', () => {
      const result = parseMarkdownToHtml('- [ ] todo');

      expect(result).toContain('☐');
      expect(result).toContain('todo');
      expect(result).not.toContain('<input');
    });

    it('handles a mixed list of checked and unchecked items', () => {
      const result = parseMarkdownToHtml('- [x] done\n- [ ] pending');

      expect(result).toContain('☑');
      expect(result).toContain('☐');
      expect(result).not.toContain('<input');
    });
  });
});

describe('stripLinkMarkdown', () => {
  it('replaces link markdown with the label text for a matching uri', () => {
    const result = stripLinkMarkdown('See [docs](https://example.com) for details', [
      'https://example.com',
    ]);

    expect(result).toBe('See docs for details');
  });

  it('does not remove image markdown even when the uri matches', () => {
    const result = stripLinkMarkdown('![alt](https://example.com/image.png)', [
      'https://example.com/image.png',
    ]);

    expect(result).toBe('![alt](https://example.com/image.png)');
  });

  it('removes only the uri syntax and preserves both label and adjacent image markdown', () => {
    const content = '[docs](https://example.com) ![photo](https://example.com/image.png)';

    const result = stripLinkMarkdown(content, ['https://example.com']);

    expect(result).toContain('![photo](https://example.com/image.png)');
    expect(result).toContain('docs');
    expect(result).not.toContain('(https://example.com)');
  });

  it('returns trimmed label text when all link syntax is stripped', () => {
    const result = stripLinkMarkdown('  [docs](https://example.com)  ', ['https://example.com']);

    expect(result).toBe('docs');
  });
});

describe('stripMarkdown', () => {
  it('strips bold markdown to plain text', () => {
    expect(stripMarkdown('**bold**')).toBe('bold');
  });

  it('strips italic markdown to plain text', () => {
    expect(stripMarkdown('_italic_')).toBe('italic');
  });

  it('strips a heading to its text', () => {
    expect(stripMarkdown('# Title')).toBe('Title');
  });

  it('strips a link to its label', () => {
    expect(stripMarkdown('[click here](https://example.com)')).toBe('click here');
  });

  it('collapses multiple spaces into one', () => {
    const result = stripMarkdown('foo   bar');
    expect(result).toBe('foo bar');
  });

  it('trims surrounding whitespace', () => {
    expect(stripMarkdown('  hello  ')).toBe('hello');
  });

  it('returns empty string for empty input', () => {
    expect(stripMarkdown('')).toBe('');
  });

  it('returns plain text unchanged', () => {
    expect(stripMarkdown('just plain text')).toBe('just plain text');
  });
});

describe('isSafeUri', () => {
  it('allows https URIs', () => {
    expect(isSafeUri('https://example.com')).toBe(true);
  });

  it('allows http URIs', () => {
    expect(isSafeUri('http://example.com')).toBe(true);
  });

  it('blocks javascript: URIs', () => {
    expect(isSafeUri('javascript:void(0)')).toBe(false);
  });

  it('blocks data: URIs', () => {
    expect(isSafeUri('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('blocks custom scheme URIs', () => {
    expect(isSafeUri('myapp://open')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isSafeUri('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isSafeUri('   ')).toBe(false);
  });

  it('returns false for invalid URIs', () => {
    expect(isSafeUri('not a uri')).toBe(false);
  });
});
