import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Color } from '@/styles/tokens';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Color.brand.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.brand.white,
  },
});

export default LoadingScreen;
