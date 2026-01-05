import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { AuthLayout, AuthButton, LegalFooter } from '@/components/auth';
import OTPInput from '@/components/auth/OTPInput';
import { AUTH_CONSTANTS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { auth0ErrorParsingService } from '@/services/auth0ErrorParsingService';
import { screenStyle, linkStyle, textStyle, spacingStyle } from '@/styles';
import { AuthStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';
import { formatTimer } from '@/utils/timer';
import { validateOTP } from '@/utils/validation';

interface OTPVerificationScreenProps {
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
  navigation: StackNavigationProp<AuthStackParamList, 'OTPVerification'>;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const { login, sendPasswordlessEmail } = useAuth();
  const { t } = useTranslation();

  const RESEND_COOLDOWN_SECONDS = 90;
  const TIMER_INTERVAL_MS = 1000;

  const handleOTPChange = (text: string) => {
    setOtp(text);
    setHasAutoSubmitted(false);
    if (otpError) {
      setOtpError('');
    }
  };

  const handleVerify = useCallback(async () => {
    setOtpError('');

    if (!otp.trim()) {
      setOtpError(t('auth.validation.otpRequired'));
      return;
    }

    if (!validateOTP(otp)) {
      setOtpError(t('auth.validation.otpInvalid', { length: AUTH_CONSTANTS.OTP_LENGTH }));
      return;
    }

    setLoading(true);

    try {
      await login(email, otp);
    } catch (error) {
      console.error(
        'OTP verification error:',
        error instanceof Error ? error.message : 'Unknown error',
      );

      if (error instanceof Error) {
        const translationKey = auth0ErrorParsingService.getTranslationKeyForError(error);
        setOtpError(t(translationKey));
      } else {
        setOtpError(t('auth.errors.unknownError'));
      }
    } finally {
      setLoading(false);
    }
  }, [otp, login, email, t]);

  const resetOtpState = () => {
    setOtp('');
    setOtpError('');
    setHasAutoSubmitted(false);
  };

  useEffect(() => {
    if (
      otp.length === AUTH_CONSTANTS.OTP_LENGTH &&
      validateOTP(otp) &&
      !loading &&
      !hasAutoSubmitted
    ) {
      setHasAutoSubmitted(true);
      void handleVerify();
    }
  }, [otp, loading, hasAutoSubmitted, handleVerify]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', resetOtpState);

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, TIMER_INTERVAL_MS);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  const handleResendCode = async () => {
    if (!canResend) return;

    setOtp('');
    setOtpError('');
    setCanResend(false);
    setResendTimer(RESEND_COOLDOWN_SECONDS);

    try {
      await sendPasswordlessEmail(email);
    } catch (error) {
      console.error('Resend OTP error:', error instanceof Error ? error.message : 'Unknown error');

      if (error instanceof Error) {
        const translationKey = auth0ErrorParsingService.getTranslationKeyForError(error);
        setOtpError(t(translationKey));
      } else {
        setOtpError(t('auth.errors.unknownError'));
      }
    }
  };

  return (
    <AuthLayout
      title={t('auth.otpVerification.title')}
      subtitle={t('auth.otpVerification.subtitle', { email })}
      titleTestID={TestIDs.OTP_TITLE}
      subtitleTestID={TestIDs.OTP_MESSAGE}
      hasHeader
    >
      <View style={styles.container}>
        <View>
          <View style={styles.marginBottom4}>
            <OTPInput
              testIDPrefix={TestIDs.OTP_INPUT_PREFIX}
              value={otp}
              onChangeText={handleOTPChange}
              error={!!otpError}
              autoFocus
            />
            {otpError && (
              <Text testID={TestIDs.OTP_ERROR} style={styles.textErrorSmall}>
                {otpError}
              </Text>
            )}
          </View>
          <AuthButton
            testID={TestIDs.OTP_VERIFY_BUTTON}
            title={t('auth.otpVerification.verifyButton')}
            onPress={handleVerify}
            loading={loading}
          />
          <View style={styles.containerFlexStart}>
            {canResend ? (
              <TouchableOpacity testID={TestIDs.OTP_RESEND_BUTTON} onPress={handleResendCode}>
                <Text style={styles.linkSmall}>{t('auth.otpVerification.resendCode')}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.textSmall}>
                {t('auth.otpVerification.resendCodeIn', { time: formatTimer(resendTimer) })}
              </Text>
            )}
          </View>
        </View>
        <LegalFooter />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: screenStyle.containerSpaceBetween,
  containerFlexStart: screenStyle.containerFlexStart,
  linkSmall: linkStyle.linkSmall,
  textSmall: textStyle.textSmall,
  textErrorSmall: { ...textStyle.textErrorSmall, ...spacingStyle.marginTop1 },
  marginBottom4: spacingStyle.marginBottom4,
});

export default OTPVerificationScreen;
