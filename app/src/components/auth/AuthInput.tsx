import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Color, Spacing } from '@/styles/tokens';

interface AuthInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: any;
}

const AuthInput: React.FC<AuthInputProps> = ({
    label,
    error,
    containerStyle,
    style,
    ...textInputProps
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style
                ]}
                placeholderTextColor={Color.gray.gray4}
                {...textInputProps}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.spacing2,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Color.brand.type,
        marginBottom: Spacing.spacing1,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: Color.gray.gray3,
        borderRadius: 12,
        paddingHorizontal: Spacing.spacing2,
        fontSize: 16,
        color: Color.brand.type,
        backgroundColor: Color.brand.white,
    },
    inputError: {
        borderColor: Color.brand.danger,
    },
    errorText: {
        fontSize: 12,
        color: Color.brand.danger,
        marginTop: Spacing.spacing1,
    },
});

export default AuthInput;