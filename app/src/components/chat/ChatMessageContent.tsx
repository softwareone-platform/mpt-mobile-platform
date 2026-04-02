import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Linking, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { ImageStyle, LayoutChangeEvent } from 'react-native';
import RenderHtml from 'react-native-render-html';
import type { CustomBlockRenderer, MixedStyleDeclaration } from 'react-native-render-html';

import { logger } from '@/services/loggerService';
import { chatMarkdownSpacing, chatMarkdownTypography } from '@/styles/components';
import { parseMarkdownToHtml } from '@/utils/chat';

const DEFAULT_ASPECT_RATIO = 16 / 9;
const SUBTEXT_FONT_RATIO = 0.6;
const H1_FONT_INCREMENT = 8;
const H2_FONT_INCREMENT = 6;
const H3_FONT_INCREMENT = 4;
const H4_FONT_INCREMENT = 2;

const ImageRenderer: CustomBlockRenderer = function ImageRenderer({ tnode }) {
  const src = tnode.attributes.src || '';
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);

  useEffect(() => {
    if (!src) return;
    Image.getSize(
      src,
      (width, height) => {
        if (width > 0 && height > 0) setAspectRatio(width / height);
      },
      (error) => {
        logger.warn('Failed to get image size', { operation: 'ImageRenderer' });
      },
    );
  }, [src]);

  const imageStyle = useMemo(
    (): ImageStyle => ({
      width: '100%',
      aspectRatio,
      marginTop: chatMarkdownSpacing.imageMarginVertical,
      marginBottom: chatMarkdownSpacing.imageMarginVertical,
    }),
    [aspectRatio],
  );

  if (!src) return null;

  return <Image source={{ uri: src }} style={imageStyle} resizeMode="contain" />;
};

const renderers = { img: ImageRenderer };

const handleLinkPress = (_event: unknown, href: string) => {
  if (!href) return;
  void Linking.openURL(href);
};

const renderersProps = { a: { onPress: handleLinkPress } };

interface ChatMessageContentProps {
  content: string;
  color: string;
  linkColor: string;
  fontSize: number;
  lineHeight: number;
}

const ChatMessageContent: React.FC<ChatMessageContentProps> = ({
  content,
  color,
  linkColor,
  fontSize,
  lineHeight,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(windowWidth);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const measured = event.nativeEvent.layout.width;
    if (measured > 0) {
      setContentWidth(measured);
    }
  }, []);

  const html = useMemo(() => parseMarkdownToHtml(content), [content]);

  const baseStyle: MixedStyleDeclaration = useMemo(
    () => ({ color, fontSize, lineHeight }),
    [color, fontSize, lineHeight],
  );

  const tagsStyles: Record<string, MixedStyleDeclaration> = useMemo(
    () => ({
      p: { marginTop: 0, marginBottom: 0 },
      a: { color: linkColor },
      strong: { color, fontWeight: chatMarkdownTypography.headingBoldWeight },
      em: { color, fontStyle: 'italic' },
      del: { color, textDecorationLine: 'line-through' },
      u: { color, textDecorationLine: 'underline' },
      // True vertical offset for sup/sub is not achievable in React Native inline
      // text (broken under New Architecture on iOS per RN #53092).
      // Rendering as smaller text is the best consistent option.
      sub: { color, fontSize: fontSize * SUBTEXT_FONT_RATIO },
      sup: { color, fontSize: fontSize * SUBTEXT_FONT_RATIO },
      h1: {
        color,
        fontSize: fontSize + H1_FONT_INCREMENT,
        fontWeight: chatMarkdownTypography.headingBoldWeight,
        marginTop: 0,
        marginBottom: chatMarkdownSpacing.headingMarginBottom,
      },
      h2: {
        color,
        fontSize: fontSize + H2_FONT_INCREMENT,
        fontWeight: chatMarkdownTypography.headingBoldWeight,
        marginTop: 0,
        marginBottom: chatMarkdownSpacing.headingMarginBottom,
      },
      h3: {
        color,
        fontSize: fontSize + H3_FONT_INCREMENT,
        fontWeight: chatMarkdownTypography.headingSemiboldWeight,
        marginTop: 0,
        marginBottom: chatMarkdownSpacing.headingMarginBottom,
      },
      h4: {
        color,
        fontSize: fontSize + H4_FONT_INCREMENT,
        fontWeight: chatMarkdownTypography.headingSemiboldWeight,
        marginTop: 0,
        marginBottom: chatMarkdownSpacing.headingMarginBottom,
      },
    }),
    [color, linkColor, fontSize],
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
