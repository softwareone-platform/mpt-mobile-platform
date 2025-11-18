import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthButton } from '@/components/auth';
import OTPInput from '@/components/auth/OTPInput';
import { AuthStackParamList } from '@/types/navigation';
import { otpVerificationScreenStyle } from '@/styles/components';
import { AUTH_CONSTANTS } from '@/constants';

interface OTPVerificationScreenProps {
    route: RouteProp<AuthStackParamList, 'OTPVerification'>;
    navigation: StackNavigationProp<AuthStackParamList, 'OTPVerification'>;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
    route
}) => {
    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

    const { login, sendPasswordlessEmail } = useAuth();
    const { t } = useTranslation();

    const validateOTP = useCallback((code: string): boolean => {
        const expectedLength = AUTH_CONSTANTS.OTP_LENGTH;
        const digitRegex = new RegExp(`^\\d{${expectedLength}}$`);
        return code.length === expectedLength && digitRegex.test(code);
    }, []);

    const parseAuth0Error = useCallback((error: Error): string => {
        const errorMessage = error.message.toLowerCase();


        if (errorMessage.includes('inking account')) {
            return t('auth.errors.emailNotAuthorized');
        }
        if (errorMessage.includes('verification code') || errorMessage.includes('inking account')) {
            return t('auth.errors.otpVerificationFailed');
        }
        if (errorMessage.includes('expired') || errorMessage.includes('code expired')) {
            return t('auth.errors.otpExpired');
        }
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            return t('auth.errors.networkError');
        }

        return t('auth.errors.verifyCodeFailed');
    }, [t]);

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
                setOtpError(parseAuth0Error(error));
            } else {
                setOtpError(t('auth.errors.unknownError'));
            }
        } finally {
            setLoading(false);
        }
    }, [otp, t, login, email, validateOTP, parseAuth0Error]);

    useEffect(() => {
        if (otp.length === AUTH_CONSTANTS.OTP_LENGTH && validateOTP(otp) && !loading && !hasAutoSubmitted) {
            setHasAutoSubmitted(true);
            handleVerify();
        }
    }, [otp, handleVerify, validateOTP, loading, hasAutoSubmitted]);

    const handleResendCode = async () => {
        setOtpError('');

        try {
            await sendPasswordlessEmail(email);
            //TODO: Inform user that email has been resent
            Alert.alert(
                t('auth.otpVerification.resendCode'),
                t('auth.otpVerification.subtitle', { email })
            );
        } catch (error) {
            console.error('Resend OTP error:', error instanceof Error ? error.message : 'Unknown error');

            if (error instanceof Error) {
                setOtpError(parseAuth0Error(error));
            } else {
                setOtpError(t('auth.errors.resendOtpFailed'));
            }
        }
    };



    return (
        <AuthLayout
            title={t('auth.otpVerification.title')}
            subtitle={t('auth.otpVerification.subtitle', { email })}
        >
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
                    <Text style={otpVerificationScreenStyle.didntGetCodeText}>
                        {t('auth.otpVerification.didntGetCode')}{' '}
                    </Text>
                    <TouchableOpacity onPress={handleResendCode}>
                        <Text style={otpVerificationScreenStyle.resendText}>
                            {t('auth.otpVerification.resendCode')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AuthLayout>
    );
};

export default OTPVerificationScreen;