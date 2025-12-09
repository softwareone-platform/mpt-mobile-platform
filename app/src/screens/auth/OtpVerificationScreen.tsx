import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthButton } from '@/components/auth';
import OTPInput from '@/components/auth/OTPInput';
import { AuthStackParamList } from '@/types/navigation';
import { otpVerificationScreenStyle } from '@/styles/components';
import { AUTH_CONSTANTS } from '@/constants';
import { validateOTP } from '@/utils/validation';
import { formatTimer } from '@/utils/timer';
import { auth0ErrorParsingService } from '@/services/auth0ErrorParsingService';

interface OTPVerificationScreenProps {
    route: RouteProp<AuthStackParamList, 'OTPVerification'>;
    navigation: StackNavigationProp<AuthStackParamList, 'OTPVerification'>;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
    route,
    navigation
}) => {
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
            console.error('OTP verification error:', error instanceof Error ? error.message : 'Unknown error');

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
        if (otp.length === AUTH_CONSTANTS.OTP_LENGTH && validateOTP(otp) && !loading && !hasAutoSubmitted) {
            setHasAutoSubmitted(true);
            handleVerify();
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
            hasHeader
        >
            <View style={otpVerificationScreenStyle.contentWrapper}>
                <View style={otpVerificationScreenStyle.form}>
                    <View style={otpVerificationScreenStyle.otpContainer}>
                        <OTPInput
                            value={otp}
                            onChangeText={handleOTPChange}
                            error={!!otpError}
                            autoFocus
                        />
                        {otpError && (
                            <Text style={otpVerificationScreenStyle.errorText}>{otpError}</Text>
                        )}
                    </View>

                    <AuthButton
                        title={t('auth.otpVerification.verifyButton')}
                        onPress={handleVerify}
                        loading={loading}
                    />

                    <View style={otpVerificationScreenStyle.resendSection}>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResendCode}>
                                <Text style={[
                                    otpVerificationScreenStyle.resendText,
                                    otpVerificationScreenStyle.resendTextActive
                                ]}>
                                    {t('auth.otpVerification.resendCode')}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={otpVerificationScreenStyle.resendText}>
                                {t('auth.otpVerification.resendCodeIn', { time: formatTimer(resendTimer) })}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={otpVerificationScreenStyle.footer}>
                    <View style={otpVerificationScreenStyle.footerLinksContainer}>
                        <TouchableOpacity>
                            <Text style={otpVerificationScreenStyle.footerText}>
                                Trouble signing in?
                            </Text>
                        </TouchableOpacity>
                        <Text style={otpVerificationScreenStyle.footerSeparator}> • </Text>
                        <TouchableOpacity>
                            <Text style={otpVerificationScreenStyle.footerText}>
                                T&Cs & Privacy
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </AuthLayout>
    );
};

export default OTPVerificationScreen;
