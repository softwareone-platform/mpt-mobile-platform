import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { chatLinkPreviewStyle } from '@/styles/components';
import type { MessageLink } from '@/types/chat';

interface ChatMessageLinkPreviewProps {
  link: MessageLink;
}

const ChatMessageLinkPreview: React.FC<ChatMessageLinkPreviewProps> = ({ link }) => {
  const handlePress = () => {
    void Linking.openURL(link.uri);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      {!!link.icon && <Image source={{ uri: link.icon }} style={styles.icon} />}
      <View style={styles.textColumn}>
        <Text style={styles.name} numberOfLines={1}>
          {link.name}
        </Text>
        {link.name !== link.uri && (
          <Text style={styles.url} numberOfLines={1}>
            {link.uri}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: chatLinkPreviewStyle.container,
  icon: chatLinkPreviewStyle.icon,
  textColumn: {
    flexShrink: 1,
  },
  name: chatLinkPreviewStyle.name,
  url: chatLinkPreviewStyle.url,
});

export default ChatMessageLinkPreview;
