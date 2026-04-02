import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Linking, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import RenderHtml from 'react-native-render-html';
import type { CustomBlockRenderer } from 'react-native-render-html';

import { logger } from '@/services/loggerService';
import { chatMarkdownStyle, chatMarkdownTagStyles } from '@/styles/components';
import { isSafeUri, parseMarkdownToHtml } from '@/utils/chat';

const DEFAULT_ASPECT_RATIO = 16 / 9;

const ImageRenderer: CustomBlockRenderer = function ImageRenderer({ tnode }) {
  const src = tnode.attributes.src || '';
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);

  useEffect(() => {
    if (!isSafeUri(src)) return;
    Image.getSize(
      src,
      (width, height) => {
        if (width > 0 && height > 0) setAspectRatio(width / height);
      },
      () => {
        logger.warn('Failed to get image size', { operation: 'ImageRenderer' });
      },
    );
  }, [src]);

  if (!isSafeUri(src)) return null;

  return (
    <Image
      source={{ uri: src }}
      style={[chatMarkdownStyle.image, { aspectRatio }]}
      resizeMode="contain"
    />
  );
};

const renderers = { img: ImageRenderer };

const handleLinkPress = (_event: unknown, href: string) => {
  if (!isSafeUri(href)) return;
  void Linking.openURL(href).catch(() => {
    logger.warn('Failed to open link', { operation: 'handleLinkPress' });
  });
};

const renderersProps = { a: { onPress: handleLinkPress } };

interface ChatMessageContentProps {
  content: string;
  color: string;
  linkColor: string;
}

const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content, color, linkColor }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(windowWidth);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const measured = event.nativeEvent.layout.width;
    if (measured > 0) {
      setContentWidth(measured);
    }
  }, []);

  const html = useMemo(() => parseMarkdownToHtml(content), [content]);

  const baseStyle = useMemo(() => ({ ...chatMarkdownStyle.baseText, color }), [color]);

  const tagsStyles = useMemo(
    () => ({
      ...chatMarkdownTagStyles,
      a: { color: linkColor },
      strong: { ...chatMarkdownTagStyles.strong, color },
      em: { ...chatMarkdownTagStyles.em, color },
      del: { ...chatMarkdownTagStyles.del, color },
      u: { ...chatMarkdownTagStyles.u, color },
      sub: { ...chatMarkdownTagStyles.sub, color },
      sup: { ...chatMarkdownTagStyles.sup, color },
      h1: { ...chatMarkdownTagStyles.h1, color },
      h2: { ...chatMarkdownTagStyles.h2, color },
      h3: { ...chatMarkdownTagStyles.h3, color },
      h4: { ...chatMarkdownTagStyles.h4, color },
    }),
    [color, linkColor],
  );

  return (
    <View onLayout={onLayout} style={styles.container}>
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html }}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles}
        renderers={renderers}
        renderersProps={renderersProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
});

export default ChatMessageContent;
