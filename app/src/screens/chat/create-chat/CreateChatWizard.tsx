import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from 'react-native';

import ChatTypeStep from './ChatTypeStep';

import BottomSheet from '@/components/modal/BottomSheet';
import { createChatWizardStyle, inputStyle, screenStyle, spacingStyle } from '@/styles';
import type { ChatType } from '@/types/chat';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const KEYBOARD_VERTICAL_OFFSET_IOS = 200;
const KEYBOARD_VERTICAL_OFFSET_NONE = 0;

const CreateChatWizard = ({ visible, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const [chatType, setChatType] = useState<ChatType>(null);
  const [chatName, setChatName] = useState('');

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleClose = useCallback(() => {
    setStep(0);
    setChatType(null);
    setChatName('');
    onClose();
  }, [onClose]);

  const handleNavigateToChat = () => {
    // TODO: call create chat API and pass ID of newly created chat
    navigation.navigate('chatConversation', { id: 'CHT-9231-8917-3633' });
    handleClose();
  };

  const handleNext = () => {
    if (step === 0) {
      if (!chatType) return;
      setStep(1);
    } else if (step === 1) {
      if (!chatName.trim()) return;
      setStep(2);
    } else if (step === 2) {
      handleNavigateToChat();
    }
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
          {step > 0 && (
            <TouchableOpacity onPress={handleNext}>
              <Text style={styles.headerTextNext}>{t('createChatWizard.next')}</Text>
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
          {step === 0 && (
            <ChatTypeStep
              onSelectChatType={(type) => {
                setChatType(type);
                setStep(1);
              }}
              onSelectParticipant={() => {
                handleNavigateToChat();
              }}
            />
          )}

          {step === 1 && (
            <View>
              <TextInput
                placeholder="Enter chat name"
                value={chatName}
                onChangeText={setChatName}
                style={styles.input}
                autoFocus
              />
            </View>
          )}

          {step === 2 && (
            <View>
              <ScrollView>
                <Text>User list placeholder</Text>
              </ScrollView>
            </View>
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
  input: inputStyle.container,
  container: screenStyle.containerFlex,
  keyboardWrapper: {
    ...screenStyle.containerFlex,
    ...spacingStyle.paddingBottom6,
  },
});

export default CreateChatWizard;
