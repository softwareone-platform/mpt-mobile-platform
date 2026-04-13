import { useTranslation } from 'react-i18next';
import { TextInput, StyleSheet, View } from 'react-native';

import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import { inputWithIconStyle } from '@/styles';

type ChatDetailsStepProps = {
  onChangeName: (value: string) => void;
};

export const ChatDetailsStep = ({ onChangeName }: ChatDetailsStepProps) => {
  const { t } = useTranslation();

  return (
    <NavigationGroupCard title={t('createChatWizard.chatDetails')}>
      <View style={styles.container}>
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
});

export default ChatDetailsStep;
