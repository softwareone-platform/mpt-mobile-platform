import { OutlinedIcons } from '@assets/icons';
import { useTranslation } from 'react-i18next';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VisibilityDropdown from '@/components/chat/VisibilityDropdown';
import OutlinedIcon from '@/components/common/OutlinedIcon';
import { BUTTON_ICON_ONLY_HIT_SLOP } from '@/constants';
import { buttonStyle, Color, inputStyle, chatStyle } from '@/styles';
import type { MessageVisibility } from '@/types/chat';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  visibility?: MessageVisibility;
  onVisibilityChange?: (visibility: MessageVisibility) => void;
  showVisibilityToggle?: boolean;
};

const ChatConversationFooter = ({
  value,
  onChangeText,
  onSend,
  visibility = 'Public',
  onVisibilityChange,
  showVisibilityToggle,
}: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={Platform.OS === 'android' ? { paddingBottom: insets.bottom } : undefined}>
      <View style={styles.inputContainer}>
        <View style={styles.textInputWrapper}>
          <TextInput
            placeholder={t('chat.messageInputPlaceholder')}
            style={[styles.input, showVisibilityToggle && styles.inputWithToggle]}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSend}
            returnKeyType="send"
            multiline
            scrollEnabled
          />
          {showVisibilityToggle && onVisibilityChange && (
            <View style={styles.visibilityIconWrapper}>
              <VisibilityDropdown visibility={visibility} onVisibilityChange={onVisibilityChange} />
            </View>
          )}
        </View>
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
  inputWithToggle: {
    paddingRight: 32,
  },
  buttonPrimaryIconOnly: {
    ...buttonStyle.primary,
    ...buttonStyle.primaryIconOnly,
  },
  visibilityIconWrapper: chatStyle.visibilityIconWrapper,
});

export default ChatConversationFooter;
