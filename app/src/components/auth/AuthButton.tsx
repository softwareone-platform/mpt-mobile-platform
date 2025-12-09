import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Color } from '@/styles/tokens';
import { buttonStyle } from '@/styles/components';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'primary' | 'secondary';
}

const AuthButton: React.FC<AuthButtonProps> = ({
    title,
    onPress,
    loading = false,
    variant = 'primary',
}) => {
    const buttonStyles = variant === 'primary' ? styles.button : styles.secondaryButton;
    const textStyles = variant === 'primary' ? styles.buttonText : styles.secondaryButtonText;
    const activityIndicatorColor = variant === 'primary' ? Color.brand.white : Color.gray.gray5;

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={activityIndicatorColor} />
            ) : (
                <Text style={textStyles}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: buttonStyle.authPrimary,
    buttonText: buttonStyle.authPrimaryText,
    secondaryButton: buttonStyle.authSecondary,
    secondaryButtonText: buttonStyle.authSecondaryText,
});

export default AuthButton;
