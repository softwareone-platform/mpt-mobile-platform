import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

/**
 * Chat list behavior constants
 *
 * The chat uses two display modes:
 * - Non-inverted: Messages start at top, grow downward (for short chats)
 * - Inverted: Messages stick to bottom (standard chat behavior)
 *
 * Hysteresis thresholds prevent flickering during the transition
 */
const SCROLL_TO_NEWEST_DELAY_MS = 200;
const KEYBOARD_VERTICAL_OFFSET = 100;
const LOAD_MORE_THRESHOLD = 0.5;
const MODE_TRANSITION_DURATION_MS = 300;

// Switch to inverted when content is within 30px of filling the screen
const CONTENT_FILLS_SCREEN_THRESHOLD = 30;

// Switch to non-inverted when content is more than 50px below screen height
const CONTENT_BELOW_SCREEN_THRESHOLD = 50;

const ChatConversationScreenContent = () => {
  const [inputText, setInputText] = useState('');
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isModeTransitionInProgress = useRef(false);
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
    }, SCROLL_TO_NEWEST_DELAY_MS);
  }, [messages.length, handleScrollToIndexFailed]);

  useEffect(() => {
    const currentFirstMessageId = messages[0]?.id ?? null;
    const previousFirstMessageId = previousFirstMessageIdRef.current;

    if (
      currentFirstMessageId &&
      currentFirstMessageId !== previousFirstMessageId &&
      previousFirstMessageId !== null &&
      !isModeTransitionInProgress.current
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

  const handleContentSizeChange = useCallback((_width: number, height: number) => {
    setContentHeight(height);
  }, []);

  const handleLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    if (contentHeight === 0 || layoutHeight === 0) return;

    const contentGap = layoutHeight - contentHeight;

    if (!isInitialized) {
      const shouldInvert = contentGap < CONTENT_BELOW_SCREEN_THRESHOLD;
      setTimeout(() => {
        setIsInverted(shouldInvert);
        setIsInitialized(true);
      }, 0);
      return;
    }

    // Prevent mode switching during active transition
    if (isModeTransitionInProgress.current) return;

    // Hysteresis: Different thresholds for switching on/off to prevent flickering
    const shouldSwitchToInverted = !isInverted && contentGap < CONTENT_FILLS_SCREEN_THRESHOLD;
    const shouldSwitchToNonInverted = isInverted && contentGap > CONTENT_BELOW_SCREEN_THRESHOLD;

    if (shouldSwitchToInverted) {
      isModeTransitionInProgress.current = true;
      setIsInverted(true);
      setTimeout(() => {
        isModeTransitionInProgress.current = false;
      }, MODE_TRANSITION_DURATION_MS);
    } else if (shouldSwitchToNonInverted) {
      isModeTransitionInProgress.current = true;
      setIsInverted(false);
      setTimeout(() => {
        isModeTransitionInProgress.current = false;
      }, MODE_TRANSITION_DURATION_MS);
    }
  }, [contentHeight, layoutHeight, isInverted, isInitialized]);

  const displayMessages = useMemo(
    () => (isInverted ? messages : [...messages].reverse()),
    [messages, isInverted],
  );

  const flatListStyle = useMemo(
    () => [styles.flatList, { opacity: isInitialized || messages.length === 0 ? 1 : 0 }],
    [isInitialized, messages.length],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
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
          style={flatListStyle}
          contentContainerStyle={!isInverted && styles.contentContainerTop}
          data={displayMessages}
          extraData={displayMessages}
          inverted={isInverted}
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
          ListHeaderComponent={messagesFetchingNext ? <ActivityIndicator /> : null}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={
            isInverted
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
  contentContainerTop: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
});

export default ChatConversationScreen;
