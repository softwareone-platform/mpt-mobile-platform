import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';

import { logger } from '@/services/loggerService';
import { chatLinkPreviewStyle } from '@/styles/components';
import type { MessageLink } from '@/types/chat';
import { isSafeUri } from '@/utils/chat';

interface ChatMessageLinkPreviewProps {
  link: MessageLink;
}

const ChatMessageLinkPreview: React.FC<ChatMessageLinkPreviewProps> = ({ link }) => {
  const handlePress = () => {
    if (!isSafeUri(link.uri ?? '')) return;
    void Linking.openURL(link.uri ?? '').catch(() => {
      logger.warn('Failed to open link', { operation: 'ChatMessageLinkPreview' });
    });
  };

  return (
    <TouchableOpacity
      style={chatLinkPreviewStyle.container}
      onPress={handlePress}
      disabled={!isSafeUri(link.uri ?? '')}
    >
      {!!link.icon && <Image source={{ uri: link.icon }} style={chatLinkPreviewStyle.icon} />}
      <View style={chatLinkPreviewStyle.textColumn}>
        <Text style={chatLinkPreviewStyle.name} numberOfLines={1}>
          {link.name}
        </Text>
        {link.name !== link.uri && (
          <Text style={chatLinkPreviewStyle.url} numberOfLines={1}>
            {link.uri}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ChatMessageLinkPreview;
