import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthInput, AuthButton } from '@/components/auth';
import { Spacing } from '@/styles/tokens';

interface WelcomeScreenProps {}

const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const { sendPasswordlessEmail } = useAuth();
  const { t } = useTranslation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      // TODO: MPT-14544 - Navigate to OTP verification screen
      console.log('Email sent successfully');

    } catch (error) {
      console.error('Send email error:', error instanceof Error ? error.message : 'Unknown error');
      // TODO: How we are going to inform user about error?
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() && validateEmail(email) && !loading;

  return (
    <AuthLayout
      title={t('auth.welcome.title')}
      subtitle={t('auth.welcome.subtitle')}
    >
      <View style={styles.form}>
        <AuthInput
          label={t('auth.welcome.emailLabel')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('auth.welcome.emailPlaceholder')}
          error={emailError}
          containerStyle={styles.inputContainer}
        />
        
        <AuthButton
          title={t('auth.welcome.continueButton')}
          onPress={handleContinue}
          disabled={!isFormValid}
          loading={loading}
        />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Spacing.spacing4,
  },
});

export default WelcomeScreen;