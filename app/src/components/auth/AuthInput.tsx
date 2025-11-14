import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Color, Spacing, Typography, BorderRadius } from '@/styles/tokens';

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
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style
                ]}
                placeholderTextColor={Color.gray.gray4}
                clearButtonMode="while-editing"
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
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: Color.gray.gray3,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.spacing2,
        fontSize: Typography.fontSize.font3,
        color: Color.brand.type,
        backgroundColor: Color.brand.white,
    },
    inputError: {
        borderColor: Color.brand.danger,
    },
    errorText: {
        fontSize: Typography.fontSize.font1,
        color: Color.brand.danger,
        marginTop: Spacing.spacing1,
    },
});

export default AuthInput;