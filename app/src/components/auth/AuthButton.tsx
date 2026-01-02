import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { buttonStyle } from '@/styles/components';
import { Color } from '@/styles/tokens';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  testID,
}) => {
  const buttonStyles = variant === 'primary' ? styles.button : styles.secondaryButton;
  const textStyles = variant === 'primary' ? styles.buttonText : styles.secondaryButtonText;
  const activityIndicatorColor = variant === 'primary' ? Color.brand.white : Color.gray.gray5;

  return (
    <TouchableOpacity testID={testID} style={buttonStyles} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={activityIndicatorColor} />
      ) : (
        <Text style={textStyles}>{title}</Text>
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
