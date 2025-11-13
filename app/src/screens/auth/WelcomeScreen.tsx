import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthInput, AuthButton } from '@/components/auth';
import { Spacing } from '@/styles/tokens';

interface WelcomeScreenProps {}

const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const { sendPasswordlessEmail } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    setEmailError('');
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      await sendPasswordlessEmail(email);

      // TODO: MPT-14544 - Navigate to OTP verification screen - remove alert below
      Alert.alert(
        'Email Sent!',
        'We have sent a verification code to your email address. Please check your email and enter the code when ready.',
        [{ text: 'OK' }]
      );

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
      title="Welcome"
      subtitle="Existing Marketplace users can now enjoy our mobile experience. Enter your corporate email address below to continue."
    >
      <View style={styles.form}>
        <AuthInput
          label="Corporate email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter your email address"
          error={emailError}
          containerStyle={styles.inputContainer}
        />
        
        <AuthButton
          title="Continue"
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