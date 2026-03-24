import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ViewToken } from 'react-native';
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
import { useMyParticipant } from '@/hooks/useMyParticipant';
import { logger } from '@/services/loggerService';
import { useParticipantApi } from '@/services/participantService';
import { screenStyle } from '@/styles';
import type { Message } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';
import { mapToChatListItemProps } from '@/utils/chat';
import { TestIDs } from '@/utils/testID';

const SCROLL_TO_NEWEST_DELAY_MS = 200;
const KEYBOARD_VERTICAL_OFFSET = 100;
const LOAD_MORE_THRESHOLD = 0.5;
const VIEWABILITY_ITEM_PERCENT_THRESHOLD = 50;
const VIEWABILITY_MIN_VIEW_TIME_MS = 500;
const MARK_AS_READ_DEBOUNCE_MS = 500;

const ChatConversationScreenContent = () => {
  const [inputText, setInputText] = useState('');
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const { i18n, t } = useTranslation();
  const flatListRef = useRef<FlatList<Message>>(null);
  const previousFirstMessageIdRef = useRef<string | null>(null);
  const lastReadMessageIdRef = useRef<string | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessageIdRef = useRef<string | null>(null);
  const pendingMessageCreatedAtRef = useRef<string | null>(null);
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
  const myParticipant = useMyParticipant(chatData, currentUserId);
  const { saveParticipant } = useParticipantApi(chatId ?? '');

  const chatProps = useMemo(
    () => (chatData ? mapToChatListItemProps(chatData, i18n.language, currentUserId) : null),
    [chatData, i18n.language, currentUserId],
  );

  const otherParticipant =
    chatData?.type === 'Direct'
      ? chatData.participants?.find((p) => p.identity.id !== currentUserId)
      : null;

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
    }, SCROLL_TO_NEWEST_DELAY_MS);
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

  const markAsRead = useCallback(
    async (messageId: string, messageCreatedAt: string) => {
      const currentParticipant = myParticipant;

      if (!currentParticipant?.id) {
        return;
      }

      if (messageId === lastReadMessageIdRef.current) {
        return;
      }

      const currentLastReadMessage = currentParticipant.lastReadMessage;
      if (currentLastReadMessage?.id) {
        const currentLastReadTimestamp = messages.find((m) => m.id === currentLastReadMessage.id)
          ?.audit.created?.at;

        if (currentLastReadTimestamp) {
          const currentDate = new Date(currentLastReadTimestamp);
          const messageDate = new Date(messageCreatedAt);
          if (messageDate <= currentDate) {
            return;
          }
        }
      }

      lastReadMessageIdRef.current = messageId;

      try {
        logger.debug('[ChatConversation] Marking message as read', {
          operation: 'markAsRead',
          messageId,
          participantId: currentParticipant.id,
          participantRevision: currentParticipant.revision,
          chatId,
        });

        await saveParticipant({
          id: currentParticipant.id,
          lastReadMessage: { id: messageId },
        });
      } catch (error) {
        lastReadMessageIdRef.current = null;
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null
              ? JSON.stringify(error)
              : 'Unknown error';
        logger.warn('[ChatConversation] Failed to mark message as read (non-critical)', {
          operation: 'markAsRead',
          messageId,
          error: errorMessage,
        });
      }
    },
    [myParticipant, chatId, saveParticipant, messages],
  );

  useEffect(() => {
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
        const pendingId = pendingMessageIdRef.current;
        const pendingCreatedAt = pendingMessageCreatedAtRef.current;
        if (pendingId && pendingCreatedAt) {
          void markAsRead(pendingId, pendingCreatedAt);
        }
      }
    };
  }, [markAsRead, messages]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) {
        return;
      }

      const newestVisibleMessage = contentFillsScreenRef.current
        ? viewableItems[0]
        : viewableItems[viewableItems.length - 1];
      const messageItem = newestVisibleMessage?.item as Message | undefined;
      const messageId = messageItem?.id;
      const messageCreatedAt = messageItem?.audit?.created?.at;

      if (!messageId || !messageCreatedAt || messageId === lastReadMessageIdRef.current) {
        return;
      }

      pendingMessageIdRef.current = messageId;
      pendingMessageCreatedAtRef.current = messageCreatedAt;

      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }

      markAsReadTimeoutRef.current = setTimeout(() => {
        const pendingId = pendingMessageIdRef.current;
        const pendingCreatedAt = pendingMessageCreatedAtRef.current;
        if (pendingId && pendingCreatedAt && pendingId !== lastReadMessageIdRef.current) {
          void markAsRead(pendingId, pendingCreatedAt);
        }
        markAsReadTimeoutRef.current = null;
      }, MARK_AS_READ_DEBOUNCE_MS);
    },
    [markAsRead],
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: VIEWABILITY_ITEM_PERCENT_THRESHOLD,
      minimumViewTime: VIEWABILITY_MIN_VIEW_TIME_MS,
    }),
    [],
  );

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setInputText('');
  };

  const handleContentSizeChange = useCallback((_width: number, height: number) => {
    setContentHeight(height);
  }, []);

  const handleLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  const contentFillsScreen = contentHeight > layoutHeight;
  const contentFillsScreenRef = useRef(contentFillsScreen);

  useEffect(() => {
    contentFillsScreenRef.current = contentFillsScreen;
  }, [contentFillsScreen]);

  const displayMessages = useMemo(
    () => (contentFillsScreen ? messages : [...messages].reverse()),
    [messages, contentFillsScreen],
  );

  const contentContainerStyle = useMemo(
    () => (contentFillsScreen ? undefined : screenStyle.contentContainerTop),
    [contentFillsScreen],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
    >
      <DetailsHeader
        id={otherParticipant?.identity.id ?? chatId ?? ''}
        title={chatProps?.title ?? EMPTY_VALUE}
        subtitle={chatId ?? ''}
        statusText=""
        imagePath={otherParticipant?.identity.icon ?? ''}
        avatars={chatProps?.avatars}
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
          contentContainerStyle={contentContainerStyle}
          data={displayMessages}
          extraData={displayMessages}
          inverted={contentFillsScreen}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ChatMessage message={item} currentUserId={currentUserId} locale={i18n.language} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={LOAD_MORE_THRESHOLD}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListHeaderComponent={messagesFetchingNext ? <ActivityIndicator /> : null}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={
            contentFillsScreen
              ? {
                  minIndexForVisible: 0,
                }
              : undefined
          }
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
