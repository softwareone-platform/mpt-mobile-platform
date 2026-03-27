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
import { useMarkAsRead } from '@/hooks/useMarkAsRead';
import { useMyParticipant } from '@/hooks/useMyParticipant';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useParticipantApi } from '@/services/participantService';
import { screenStyle } from '@/styles';
import type { Message } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';
import { mapToChatListItemProps } from '@/utils/chat';
import { TestIDs } from '@/utils/testID';

const KEYBOARD_VERTICAL_OFFSET = 100;
const LOAD_MORE_THRESHOLD = 0.5;

const ChatConversationScreenContent = () => {
  const [inputText, setInputText] = useState('');
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const { i18n, t } = useTranslation();
  const flatListRef = useRef<FlatList<Message>>(null);
  const previousFirstMessageKeyRef = useRef<string | null>(null);
  const scrollToBottomOnContentChangeRef = useRef(false);
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

  const contentFillsScreen = contentHeight > layoutHeight;

  useEffect(() => {
    const newest = messages[0];
    const currentKey = newest?._localKey ?? newest?.id ?? null;
    const previousKey = previousFirstMessageKeyRef.current;

    if (
      contentFillsScreen &&
      currentKey &&
      currentKey !== previousKey &&
      previousKey !== null &&
      !newest?._optimistic
    ) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }

    previousFirstMessageKeyRef.current = currentKey;
  }, [messages, contentFillsScreen]);

  const handleLoadMore = () => {
    if (hasMoreMessages && !messagesFetchingNext) {
      fetchMessages();
    }
  };

  const handleContentSizeChange = useCallback((_width: number, height: number) => {
    setContentHeight(height);
    setLayoutReady(true);
    if (scrollToBottomOnContentChangeRef.current) {
      scrollToBottomOnContentChangeRef.current = false;
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  const handleLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  const { onViewableItemsChanged, viewabilityConfig } = useMarkAsRead({
    chatId,
    myParticipant,
    messages,
    contentFillsScreen,
    saveParticipant,
    currentUserId,
  });

  const displayMessages = useMemo(
    () => (contentFillsScreen ? messages : [...messages].reverse()),
    [messages, contentFillsScreen],
  );

  const contentContainerStyle = useMemo(
    () => (contentFillsScreen ? undefined : screenStyle.contentContainerTop),
    [contentFillsScreen],
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <ChatMessage message={item} currentUserId={currentUserId} locale={i18n.language} />
    ),
    [currentUserId, i18n.language],
  );

  const onBeforeSend = useCallback(() => {
    scrollToBottomOnContentChangeRef.current = true;
  }, []);

  const sendMessage = useSendMessage({ chatId, inputText, setInputText, onBeforeSend });

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
          style={[styles.flatList, !layoutReady && styles.invisible]}
          contentContainerStyle={contentContainerStyle}
          data={displayMessages}
          extraData={displayMessages}
          inverted={contentFillsScreen}
          keyExtractor={(item) => item._localKey ?? item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={renderMessage}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={LOAD_MORE_THRESHOLD}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListHeaderComponent={messagesFetchingNext ? <ActivityIndicator /> : null}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={
            contentFillsScreen ? { minIndexForVisible: 0 } : undefined
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
  invisible: {
    opacity: 0,
  },
});

export default ChatConversationScreen;
