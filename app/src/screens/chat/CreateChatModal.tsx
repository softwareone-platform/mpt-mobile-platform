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
  Button,
} from 'react-native';

import BottomSheet from '@/components/modal/BottomSheet';
import { createChatWizardStyle, inputStyle } from '@/styles';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CreateChatModal = ({ visible, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const [chatType, setChatType] = useState<'group' | 'direct' | null>(null);
  const [chatName, setChatName] = useState('');

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleClose = useCallback(() => {
    setStep(0);
    setChatType(null);
    setChatName('');
    onClose();
  }, [onClose]);

  const handleNext = () => {
    if (step === 0) {
      if (!chatType) return;
      setStep(1);
    } else if (step === 1) {
      if (!chatName.trim()) return;
      setStep(2);
    } else if (step === 2) {
      navigation.navigate('chatConversation', { id: 'CHT-123-4565' });
      handleClose();
    }
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} testID={TestIDs.CHAT_CREATE_MODAL}>
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
      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 200 : 0}
      >
        {step === 0 && (
          <View>
            <Button
              title="Group Chat"
              onPress={() => {
                setChatType('group');
                setStep(1);
              }}
            />
            <Button
              title="Direct Chat: John Doe"
              onPress={() => {
                handleClose();
                navigation.navigate('chatConversation', { id: 'CHT-234-2345' });
              }}
            />
          </View>
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
});

export default CreateChatModal;
