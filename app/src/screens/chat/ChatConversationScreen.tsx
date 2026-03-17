import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

import ChatConversationFooter from '@/components/chat/ChatConversationFooter';
import ChatMessage from '@/components/chat/ChatMessage';
import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsHeader from '@/components/details/DetailsHeader';
import { useAccount } from '@/context/AccountContext';
import { useMessages, MessagesProvider } from '@/context/MessagesContext';
import { screenStyle } from '@/styles';
import type { Message } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const ChatConversationScreenContent = () => {
  const [inputText, setInputText] = useState('');
  const { i18n, t } = useTranslation();
  const flatListRef = useRef<FlatList<Message>>(null);
  const { userData } = useAccount();
  const currentUserId = userData?.id ?? '';

  const {
    messages,
    messagesLoading,
    messagesFetchingNext,
    hasMoreMessages,
    messagesError,
    isUnauthorised,
    fetchMessages,
    chatId,
  } = useMessages();

  const handleLoadMore = () => {
    if (hasMoreMessages && !messagesFetchingNext) {
      fetchMessages();
    }
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <DetailsHeader
        id={chatId ?? ''}
        title="Chat"
        subtitle={chatId ?? ''}
        statusText=""
        imagePath=""
        variant="chat"
      />
      <StatusMessage
        isLoading={messagesLoading}
        isError={messagesError}
        isEmpty={messages.length === 0}
        isUnauthorised={isUnauthorised}
        loadingTestId={TestIDs.CHAT_CONVERSATION_LOADING_INDICATOR}
        errorTestId={TestIDs.CHAT_CONVERSATION_ERROR_STATE}
        emptyTestId={TestIDs.CHAT_CONVERSATION_EMPTY_STATE}
        emptyTitle={t('messagesScreen.emptyStateTitle')}
        emptyDescription={t('messagesScreen.emptyStateDescription')}
      >
        <FlatList
          ref={flatListRef}
          style={styles.flatList}
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ChatMessage message={item} currentUserId={currentUserId} locale={i18n.language} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={messagesFetchingNext ? <ActivityIndicator /> : null}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
      </StatusMessage>
      <ChatConversationFooter value={inputText} onChangeText={setInputText} onSend={sendMessage} />
    </KeyboardAvoidingView>
  );
};

const ChatConversationScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'chatConversation'>>();
  const chatId = route.params?.id;

  return (
    <MessagesProvider chatId={chatId}>
      <ChatConversationScreenContent />
    </MessagesProvider>
  );
};

const styles = StyleSheet.create({
  container: screenStyle.containerFlex,
  flatList: {
    ...screenStyle.containerFlex,
    ...screenStyle.padding,
  },
});

export default ChatConversationScreen;
