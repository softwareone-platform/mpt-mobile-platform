import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { otpInputStyle } from '@/styles/components';
import { AUTH_CONSTANTS } from '@/constants';

interface OTPInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    length?: number;
    value: string;
    onChangeText: (text: string) => void;
    error?: boolean;
}

const sanitizeNumericInput = (text: string, maxLength: number): string => {
    return text.replace(/[^0-9]/g, '').slice(0, maxLength);
};

const autoFocusInput = (inputRef: React.RefObject<TextInput | null>) => {
    const timer = setTimeout(() => {
        inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
};

const createDigitStyles = (isFilled: boolean, isActive: boolean) => {
    return [
        otpInputStyle.digitContainer,
        isFilled && otpInputStyle.digitContainerFilled,
        isActive && otpInputStyle.digitContainerActive,
    ];
};

const createDigitTextStyles = (isFilled: boolean) => {
    return [
        otpInputStyle.digitText,
        !isFilled && otpInputStyle.digitTextPlaceholder
    ];
};

const getDigitDisplay = (digit: string, isActive: boolean): string => {
    if (digit) return digit;
    return isActive ? '|' : '';
};

const OTPInput: React.FC<OTPInputProps> = ({
    length = AUTH_CONSTANTS.OTP_LENGTH,
    value,
    onChangeText,
    error = false,
    ...textInputProps
}) => {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (textInputProps.autoFocus) {
            return autoFocusInput(inputRef);
        }
    }, [textInputProps.autoFocus]);

    const focusInput = () => {
        if (error && value.length > 0) {
            onChangeText('');
        }
        inputRef.current?.focus();
    };

    const handleInputFocus = () => {
        setFocused(true);
        if (error && value.length > 0) {
            onChangeText('');
        }
    };

    const handleInputBlur = () => {
        setFocused(false);
    };

    const handleTextChange = (text: string) => {
        const sanitizedText = sanitizeNumericInput(text, length);
        onChangeText(sanitizedText);
    };

    const createDigitBox = (index: number) => {
        const digit = value[index] || '';
        const isFilled = Boolean(digit);
        const isActive = focused && index === value.length;
        
        return (
            <TouchableOpacity
                key={index}
                style={createDigitStyles(isFilled, isActive)}
                onPress={focusInput}
                activeOpacity={0.8}
            >
                <Text style={createDigitTextStyles(isFilled)}>
                    {getDigitDisplay(digit, isActive)}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderAllDigits = () => {
        return Array.from({ length }, (_, index) => createDigitBox(index));
    };

    return (
        <View style={otpInputStyle.container}>
            <View style={otpInputStyle.digitsContainer}>
                {renderAllDigits()}
            </View>
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={handleTextChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={otpInputStyle.hiddenInput}
                keyboardType="numeric"
                maxLength={length}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                {...textInputProps}
            />
        </View>
    );
};

export default OTPInput;
