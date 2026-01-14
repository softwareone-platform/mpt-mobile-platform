import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';

import { TERMS_OF_USE_URL, PRIVACY_POLICY_URL } from '@/constants';
import { screenStyle, spacingStyle, linkStyle } from '@/styles';

const LegalFooter = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={() => Linking.openURL(TERMS_OF_USE_URL)}>
        <Text style={styles.linkRegular}>{t('common.legal.termsOfUse')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
        <Text style={[styles.linkRegular, styles.marginLeft3]}>
          {t('common.legal.privacyPolicy')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: screenStyle.footerContainer,
  linkRegular: linkStyle.linkRegular,
  marginLeft3: spacingStyle.marginLeft3,
});

export default LegalFooter;
