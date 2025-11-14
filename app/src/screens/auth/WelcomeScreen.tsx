import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthInput, AuthButton } from '@/components/auth';
import { Spacing, Color, Typography } from '@/styles/tokens';

interface WelcomeScreenProps { }

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

  const parseAuth0Error = (error: Error): string => {
    const errorMessage = error.message.toLowerCase();
    
    //TODO: Refine error parsing based on actual Auth0 error messages when Auth0 paswordless will be fixed
    if (errorMessage.includes('user does not exist') || errorMessage.includes('user not found')) {
      return t('auth.errors.invalidEmail');
    } 
    if (errorMessage.includes('unauthorized') || errorMessage.includes('not authorized')) {
      return t('auth.errors.emailNotAuthorized');
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return t('auth.errors.networkError');
    }

    return t('auth.errors.sendEmailFailed');
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
      // TODO: MPT-14544 - Navigate to OTP verification screen

    } catch (error) {
      console.error('Send email error:', error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof Error) {
        setEmailError(parseAuth0Error(error));
      } else {
        setEmailError(t('auth.errors.unknownError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.welcome.title')}
      subtitle={t('auth.welcome.subtitle')}
    >
      <View style={styles.form}>
        <AuthInput
          value={email}
          onChangeText={handleEmailChange}
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
          loading={loading}
        />        
        <TouchableOpacity style={styles.troubleLink} onPress={() => {
          // TODO: Handle trouble signing in action
          console.log('Trouble signing in pressed');
        }}>
          <Text style={styles.troubleText}>{t('auth.welcome.troubleSigningIn')}</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Spacing.spacing2,
  },
  troubleLink: {
    marginTop: Spacing.spacing2,
  },
  troubleText: {
    fontSize: Typography.fontSize.font2,
    color: Color.brand.primary,
    fontWeight: Typography.fontWeight.regular,
  },
});

export default WelcomeScreen;