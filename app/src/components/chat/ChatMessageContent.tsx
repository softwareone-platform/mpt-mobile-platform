import { marked } from 'marked';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import type { MixedStyleDeclaration } from 'react-native-render-html';

type ChatMessageContentProps = {
  content: string;
  color: string;
  fontSize: number;
  lineHeight: number;
};

const ChatMessageContent = ({ content, color, fontSize, lineHeight }: ChatMessageContentProps) => {
  const { width } = useWindowDimensions();

  const html = useMemo(() => {
    const raw = marked(content) as string;
    return raw.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
      if (!/<input[^>]*type="checkbox"/.test(content)) return match;
      return content
        .replace(/<li>\s*<input[^>]*checked[^>]*>([\s\S]*?)<\/li>/g, '<p>☑ $1</p>')
        .replace(/<li>\s*<input[^>]*type="checkbox"[^>]*>([\s\S]*?)<\/li>/g, '<p>☐ $1</p>');
    });
  }, [content]);

  const baseStyle: MixedStyleDeclaration = {
    color,
    fontSize,
    lineHeight,
  };

  const tagsStyles: Record<string, MixedStyleDeclaration> = {
    p: { marginTop: 0, marginBottom: 0 },
    a: { color },
    strong: { color, fontWeight: '700' },
    em: { color, fontStyle: 'italic' },
    del: { color, textDecorationLine: 'line-through' },
    u: { color, textDecorationLine: 'underline' },
    sub: { color, fontSize: fontSize * 0.75 },
    sup: { color, fontSize: fontSize * 0.75 },
    h1: { color, fontSize: fontSize + 8, fontWeight: '700', marginTop: 0, marginBottom: 4 },
    h2: { color, fontSize: fontSize + 6, fontWeight: '700', marginTop: 0, marginBottom: 4 },
    h3: { color, fontSize: fontSize + 4, fontWeight: '600', marginTop: 0, marginBottom: 4 },
    h4: { color, fontSize: fontSize + 2, fontWeight: '600', marginTop: 0, marginBottom: 4 },
    img: { marginTop: 4, marginBottom: 4 },
  };

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
    />
  );
};

export default ChatMessageContent;
