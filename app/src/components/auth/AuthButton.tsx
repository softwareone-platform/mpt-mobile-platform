import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Color } from '@/styles/tokens';
import { buttonStyle } from '@/styles/components';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
    title,
    onPress,
    loading = false,
}) => {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={Color.brand.white} />
            ) : (
                <Text style={styles.buttonText}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: buttonStyle.authPrimary,
    buttonText: buttonStyle.authPrimaryText,
});

export default AuthButton;