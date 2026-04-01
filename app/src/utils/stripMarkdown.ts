import { marked } from 'marked';

/**
 * Converts markdown/HTML content to a plain text string by running it
 * through the markdown parser and then stripping all HTML tags.
 * Intended for single-line preview contexts (e.g. chat list subtitles).
 */
export const stripMarkdown = (text: string): string => {
  const html = marked(text) as string;
  return html
    .replace(/<\/?(?:sub|sup)>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};
