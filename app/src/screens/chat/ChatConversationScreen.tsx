import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useState, useRef, useEffect, useCallback } from 'react';
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
import { EMPTY_VALUE } from '@/constants/common';
import { useAccount } from '@/context/AccountContext';
import { useMessages, MessagesProvider } from '@/context/MessagesContext';
import { useChatData } from '@/hooks/queries/useChatData';
import { screenStyle } from '@/styles';
import type { Message } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';
import { getChatTitle, getAvatarList } from '@/utils/chat';
import { TestIDs } from '@/utils/testID';

const SCROLL_DELAY_MS = 200;

const ChatConversationScreenContent = () => {
  const [inputText, setInputText] = useState('');
  const { i18n, t } = useTranslation();
  const flatListRef = useRef<FlatList<Message>>(null);
  const previousFirstMessageIdRef = useRef<string | null>(null);
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

  const { data: chatData } = useChatData(chatId);

  const otherParticipant =
    chatData?.type === 'Direct'
      ? chatData.participants?.find((p) => p.identity.id !== currentUserId)
      : null;

  const chatTitle = chatData ? getChatTitle(chatData, currentUserId) || EMPTY_VALUE : EMPTY_VALUE;
  const chatAvatar = chatData?.type === 'Direct' ? otherParticipant?.identity.icon : undefined;

  const avatars =
    chatData && chatData.type !== 'Direct'
      ? getAvatarList(chatData.participants ?? [], chatData.type, currentUserId)
      : undefined;

  const handleScrollToIndexFailed = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const scrollToNewestMessage = useCallback(() => {
    if (messages.length === 0) return;

    setTimeout(() => {
      try {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      } catch (error) {
        handleScrollToIndexFailed();
      }
    }, SCROLL_DELAY_MS);
  }, [messages.length, handleScrollToIndexFailed]);

  useEffect(() => {
    const currentFirstMessageId = messages[0]?.id ?? null;
    const previousFirstMessageId = previousFirstMessageIdRef.current;

    if (
      currentFirstMessageId &&
      currentFirstMessageId !== previousFirstMessageId &&
      previousFirstMessageId !== null
    ) {
      scrollToNewestMessage();
    }

    previousFirstMessageIdRef.current = currentFirstMessageId;
  }, [messages, scrollToNewestMessage]);

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
        id={otherParticipant?.identity.id ?? chatId ?? ''}
        title={chatTitle}
        subtitle={chatId ?? ''}
        statusText=""
        imagePath={chatAvatar ?? ''}
        avatars={avatars}
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
          extraData={messages}
          inverted
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ChatMessage message={item} currentUserId={currentUserId} locale={i18n.language} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onScrollToIndexFailed={handleScrollToIndexFailed}
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
