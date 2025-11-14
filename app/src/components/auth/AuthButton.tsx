import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Color } from '@/styles/tokens';
import { buttonStyle } from '@/styles/components';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
    title,
    onPress,
    disabled = false,
    loading = false,
}) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isDisabled && styles.disabledButton
            ]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {loading ? (
                <ActivityIndicator color={Color.brand.white} />
            ) : (
                <Text style={[
                    styles.buttonText,
                    isDisabled && styles.disabledButtonText
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: buttonStyle.authPrimary,
    disabledButton: buttonStyle.authPrimaryDisabled,
    buttonText: buttonStyle.authPrimaryText,
    disabledButtonText: buttonStyle.authPrimaryTextDisabled,
});

export default AuthButton;