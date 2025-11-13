import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Color, Spacing } from '@/styles/tokens';

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
    button: {
        height: 56,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.spacing3,
        backgroundColor: Color.brand.primary,
    },
    disabledButton: {
        backgroundColor: Color.gray.gray2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: Color.brand.white,
    },
    disabledButtonText: {
        color: Color.gray.gray4,
    },
});

export default AuthButton;