import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';

import ChatDetailsStep from './ChatDetailsStep';
import ChatTypeStep from './ChatTypeStep';
import ChatUsersStep from './ChatUsersStep';

import BottomSheet from '@/components/modal/BottomSheet';
import {
  KEYBOARD_VERTICAL_OFFSET_IOS,
  KEYBOARD_VERTICAL_OFFSET_NONE,
  WIZARD_INITIAL_STEP,
  EMPTY_STRING,
} from '@/constants';
import { useCreateChatMutation } from '@/hooks/queries/useCreateChatMutation';
import { logger } from '@/services/loggerService';
import { createChatWizardStyle, screenStyle, spacingStyle } from '@/styles';
import type { Contact } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type CreateChatWizardProps = {
  visible: boolean;
  onClose: () => void;
};

const CreateChatWizard = ({ visible, onClose }: CreateChatWizardProps) => {
  const [step, setStep] = useState(WIZARD_INITIAL_STEP);
  const chatNameRef = useRef(EMPTY_STRING);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { mutateAsync: createChat, isPending } = useCreateChatMutation();

  const handleClose = useCallback(() => {
    setStep(WIZARD_INITIAL_STEP);
    chatNameRef.current = EMPTY_STRING;
    setSelectedIds([]);
    onClose();
  }, [onClose]);

  const handleCreateDirectChat = useCallback(
    async (contact: Contact) => {
      try {
        const chat = await createChat({
          type: 'Direct',
          participants: [{ contact: { id: contact.id } }],
        });
        navigation.navigate('chatConversation', { id: chat.id });
        handleClose();
      } catch (error) {
        logger.error('Failed to create direct chat', error, { operation: 'createDirectChat' });
      }
    },
    [createChat, navigation, handleClose],
  );

  const handleCreateGroupChat = useCallback(async () => {
    try {
      const chat = await createChat({
        type: 'Group',
        participants: selectedIds.map((id) => ({ contact: { id } })),
        ...(chatNameRef.current.trim() && { name: chatNameRef.current.trim() }),
      });
      navigation.navigate('chatConversation', { id: chat.id });
      handleClose();
    } catch (error) {
      logger.error('Failed to create group chat', error, { operation: 'createGroupChat' });
    }
  }, [createChat, selectedIds, navigation, handleClose]);

  const handleNext = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      void handleCreateGroupChat();
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} testID={TestIDs.CREATE_CHAT_MODAL}>
      <View style={styles.headerRow}>
        <View style={styles.headerSide}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.headerTextCancel}>{t('createChatWizard.cancel')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('createChatWizard.title')}</Text>
        </View>
        <View style={styles.headerSide}>
          {step > 1 && (
            <TouchableOpacity
              onPress={handleNext}
              disabled={isPending || (step === 3 && selectedIds.length === 0)}
            >
              <Text
                style={[
                  styles.headerTextNext,
                  (isPending || (step === 3 && selectedIds.length === 0)) &&
                    styles.headerButtonDisabled,
                ]}
              >
                {step === 3 ? t('createChatWizard.create') : t('createChatWizard.next')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.keyboardWrapper}>
        <KeyboardAvoidingView
          behavior="height"
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? KEYBOARD_VERTICAL_OFFSET_IOS : KEYBOARD_VERTICAL_OFFSET_NONE
          }
          style={styles.container}
        >
          {step === 1 && (
            <ChatTypeStep
              onSelectChatType={() => {
                setStep(2);
              }}
              onSelectParticipant={(contact: Contact) => {
                void handleCreateDirectChat(contact);
              }}
              isLoading={isPending}
            />
          )}

          {step === 2 && (
            <ChatDetailsStep
              onChangeName={(value) => {
                chatNameRef.current = value;
              }}
            />
          )}

          {step === 3 && (
            <ChatUsersStep selectedIds={selectedIds} onToggleParticipant={toggleParticipant} />
          )}
        </KeyboardAvoidingView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  headerRow: createChatWizardStyle.headerRow,
  headerSide: createChatWizardStyle.headerSide,
  headerCenter: createChatWizardStyle.headerCenter,
  headerTitle: createChatWizardStyle.headerTitle,
  headerTextCancel: createChatWizardStyle.headerTextCancel,
  headerTextNext: createChatWizardStyle.headerTextNext,
  headerButtonDisabled: createChatWizardStyle.headerButtonDisabled,
  container: screenStyle.containerFlex,
  keyboardWrapper: {
    ...screenStyle.containerFlex,
    ...spacingStyle.paddingBottom6,
  },
});

export default CreateChatWizard;
