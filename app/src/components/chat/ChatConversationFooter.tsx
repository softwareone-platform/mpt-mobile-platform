import { OutlinedIcons } from '@assets/icons';
import { useTranslation } from 'react-i18next';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { BUTTON_ICON_ONLY_HIT_SLOP } from '@/constants';
import { buttonStyle, Color, inputStyle, chatStyle } from '@/styles';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
};

const ChatConversationFooter = ({ value, onChangeText, onSend }: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={Platform.OS === 'android' ? { paddingBottom: insets.bottom } : undefined}>
      <View style={styles.inputContainer}>
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
          hitSlop={BUTTON_ICON_ONLY_HIT_SLOP}
        >
          <OutlinedIcon
            name={'arrow-upward' as keyof typeof OutlinedIcons}
            color={Color.brand.white}
            size={24}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textInputWrapper: chatStyle.textInputWrapper,
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
