import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Color } from '@/styles/tokens';
import { inputStyle } from '@/styles/components';

interface AuthInputProps extends TextInputProps {
    error?: string;
    containerStyle?: any;
    testID?: string;
    errorTestID?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({
    error,
    containerStyle,
    style,
    testID,
    errorTestID,
    ...textInputProps
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <TextInput
                testID={testID}
                style={[
                    styles.input,
                    error && styles.inputError,
                    style
                ]}
                placeholderTextColor={Color.gray.gray4}
                clearButtonMode="while-editing"
                {...textInputProps}
            />
            {error && <Text testID={errorTestID} style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: inputStyle.authContainer,
    input: inputStyle.authInput,
    inputError: inputStyle.authInputError,
    errorText: inputStyle.authErrorText,
});

export default AuthInput;
