import { useTranslation } from 'react-i18next';
import { TextInput, StyleSheet, View } from 'react-native';

import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import OutlinedIcon from '@/components/common/OutlinedIcon';
import { iconStyle, inputWithIconStyle } from '@/styles';

type ChatDetailsStepProps = {
  onChangeName: (value: string) => void;
};

export const ChatDetailsStep = ({ onChangeName }: ChatDetailsStepProps) => {
  const { t } = useTranslation();

  return (
    <NavigationGroupCard title={t('createChatWizard.chatDetails')}>
      <View style={styles.container}>
        <View style={styles.iconBackground}>
          <OutlinedIcon name="photo-camera" color={iconStyle.iconColorPrimary} />
        </View>
        <TextInput
          placeholder={t('createChatWizard.enterGroupName')}
          defaultValue=""
          onChangeText={onChangeName}
          style={styles.input}
          autoFocus
        />
      </View>
    </NavigationGroupCard>
  );
};

const styles = StyleSheet.create({
  input: inputWithIconStyle.input,
  container: inputWithIconStyle.container,
  iconBackground: iconStyle.backgroundContainer,
});

export default ChatDetailsStep;
