import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthInput, AuthButton, LegalFooter } from '@/components/auth';
import { AuthStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';
import { HELP_SIGN_UP_URL } from '@/constants';
import { screenStyle, linkStyle } from '@/styles';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface WelcomeScreenProps { }

const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { sendPasswordlessEmail } = useAuth();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t } = useTranslation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleContinue = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError(t('auth.validation.emailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t('auth.validation.emailInvalid'));
      return;
    }

    setLoading(true);

    try {
      await sendPasswordlessEmail(email);
      navigation.navigate('OTPVerification', { email });
    } catch (error) {
      console.error('Send email error:', error instanceof Error ? error.message : 'Unknown error');
      setEmailError(t('auth.errors.sendEmailFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.welcome.title')}
      subtitle={t('auth.welcome.subtitle')}
      titleTestID={TestIDs.WELCOME_TITLE}
      subtitleTestID={TestIDs.WELCOME_SUBTITLE}
      logoTestID={TestIDs.WELCOME_LOGO}
    >
      <View style={styles.container}>
        <View>
          <AuthInput
            testID={TestIDs.WELCOME_EMAIL_INPUT}
            errorTestID={TestIDs.WELCOME_EMAIL_ERROR}
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t('auth.welcome.emailPlaceholder')}
            error={emailError}
          />
          <AuthButton
            testID={TestIDs.WELCOME_CONTINUE_BUTTON}
            title={t('auth.welcome.continueButton')}
            onPress={handleContinue}
            loading={loading}
          />
          <TouchableOpacity
            testID={TestIDs.WELCOME_TROUBLE_LINK} 
            onPress={() => Linking.openURL(WELCOME_TROUBLE_URL)}
          >
            <Text style={styles.linkSmall}>{t('auth.welcome.troubleSigningIn')}</Text>
          </TouchableOpacity>
        </View>
        <LegalFooter />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: screenStyle.containerSpaceBetween,
  linkSmall: linkStyle.linkSmall,
});

export default WelcomeScreen;
