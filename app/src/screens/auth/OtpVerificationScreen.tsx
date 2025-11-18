import React, { useState, useEffect } from 'react';
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
    const [resendLoading, setResendLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const { login, sendPasswordlessEmail } = useAuth();
    const { t } = useTranslation();

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer]);

    useEffect(() => {
        if (otp.length === AUTH_CONSTANTS.OTP_LENGTH) {
            handleVerify();
        }
    }, [otp]);

    const validateOTP = (code: string): boolean => {
        const expectedLength = AUTH_CONSTANTS.OTP_LENGTH;
        const digitRegex = new RegExp(`^\\d{${expectedLength}}$`);
        return code.length === expectedLength && digitRegex.test(code);
    };

    const parseAuth0Error = (error: Error): string => {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('invalid_code') || errorMessage.includes('invalid code')) {
            return t('auth.errors.otpVerificationFailed');
        }
        if (errorMessage.includes('expired') || errorMessage.includes('code expired')) {
            return t('auth.errors.otpExpired');
        }
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            return t('auth.errors.networkError');
        }

        return t('auth.errors.verifyCodeFailed');
    };

    const handleOTPChange = (text: string) => {
        setOtp(text);
        if (otpError) {
            setOtpError('');
        }
    };

    const handleVerify = async () => {
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
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        setResendLoading(true);
        setOtpError('');

        try {
            await sendPasswordlessEmail(email);
            setResendTimer(AUTH_CONSTANTS.OTP_RESEND_COOLDOWN);
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
        } finally {
            setResendLoading(false);
        }
    };

    const getResendText = () => {
        if (resendTimer > 0) {
            return `${t('auth.otpVerification.resendCode')} (${resendTimer}s)`;
        }
        return t('auth.otpVerification.resendCode');
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
                        {t('auth.otpVerification.didntGetCode')}
                    </Text>
                    <TouchableOpacity 
                        style={[
                            otpVerificationScreenStyle.resendLink,
                            (resendTimer > 0 || resendLoading) && otpVerificationScreenStyle.resendLinkDisabled
                        ]} 
                        onPress={handleResendCode}
                        disabled={resendTimer > 0 || resendLoading}
                    >
                        <Text style={[
                            otpVerificationScreenStyle.resendText,
                            (resendTimer > 0 || resendLoading) && otpVerificationScreenStyle.resendTextDisabled
                        ]}>
                            {getResendText()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AuthLayout>
    );
};

export default OTPVerificationScreen;