import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { KEYBOARD_VERTICAL_OFFSET_IOS, KEYBOARD_VERTICAL_OFFSET_NONE } from '@/constants';
import { screenStyle } from '@/styles';

type KeyboardWrapperProps = {
  children: React.ReactNode;
  keyboardOffset?: number;
};

const KeyboardWrapper = ({
  children,
  keyboardOffset = KEYBOARD_VERTICAL_OFFSET_IOS,
}: KeyboardWrapperProps) => {
  return (
    <View style={styles.keyboardWrapper}>
      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? keyboardOffset : KEYBOARD_VERTICAL_OFFSET_NONE
        }
        style={styles.container}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: screenStyle.containerFlex,
  keyboardWrapper: screenStyle.containerFlex,
});

export default KeyboardWrapper;
