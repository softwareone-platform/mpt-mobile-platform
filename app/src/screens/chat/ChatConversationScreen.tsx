import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import messageData from './messageData.json';

import ChatConversationFooter from '@/components/chat/ChatConversationFooter';
import ChatMessage from '@/components/chat/ChatMessage';
import DetailsHeader from '@/components/details/DetailsHeader';
import { screenStyle } from '@/styles';
import type { Message } from '@/types/chat';

const ChatConversationScreen = () => {
  const [inputText, setInputText] = useState('');

  // TODO: replace when API is ready
  const currentUserId = 'USR-2267-7838';
  const { i18n } = useTranslation();
  const messages: Message[] = messageData as Message[];

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
      {/* TODO: replace with real data when API is ready */}
      <DetailsHeader
        id="USR-123-455"
        title="Tania Roche"
        subtitle="CHT-0907-6973-2140"
        statusText=""
        imagePath="/images/test.png"
        variant="chat"
      />
      <FlatList
        style={styles.flatList}
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ChatMessage message={item} currentUserId={currentUserId} locale={i18n.language} />
        )}
      />
      <ChatConversationFooter value={inputText} onChangeText={setInputText} onSend={sendMessage} />
    </KeyboardAvoidingView>
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
