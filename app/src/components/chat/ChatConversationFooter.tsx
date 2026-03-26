import { OutlinedIcons } from '@assets/icons';
import { useTranslation } from 'react-i18next';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { buttonStyle, Color, inputStyle, chatStyle } from '@/styles';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
};

const ChatConversationFooter = ({ value, onChangeText, onSend }: Props) => {
  const { t } = useTranslation();

  return (
    <View style={styles.inputContainer}>
      <View style={styles.iconContainer}>
        <OutlinedIcon
          name={'attach-file' as keyof typeof OutlinedIcons}
          color={Color.brand.primary}
          size={24}
        />
      </View>

      <View style={styles.textInputWrapper}>
        <TextInput
          placeholder={t('chat.messageInputPlaceholder')}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSend}
          returnKeyType="send"
          multiline
          scrollEnabled
        />
      </View>

      {/* TODO: add visual disabled state when !value.trim() */}
      <TouchableOpacity
        style={styles.buttonPrimaryIconOnly}
        onPress={onSend}
        disabled={!value.trim()}
      >
        <OutlinedIcon
          name={'arrow-upward' as keyof typeof OutlinedIcons}
          color={Color.brand.white}
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textInputWrapper: chatStyle.textInputWrapper,
  iconContainer: chatStyle.iconContainer,
  inputContainer: chatStyle.inputContainer,
  input: {
    ...inputStyle.container,
    ...inputStyle.inputChat,
  },
  buttonPrimaryIconOnly: {
    ...buttonStyle.primary,
    ...buttonStyle.primaryIconOnly,
  },
});

export default ChatConversationFooter;
