import { parseMarkdownToHtml } from '@/utils/chat';

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
