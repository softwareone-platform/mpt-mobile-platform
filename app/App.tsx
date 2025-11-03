import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { isFeatureEnabled } from '@featureFlags';

const App = () => {
  const featureTestEnabled = isFeatureEnabled('FEATURE_TEST');
  
  return (
    <AuthProvider>
      <View style={styles.container}>
        <Text>
          {featureTestEnabled ? 'Test Feature Enabled' : 'Test Feature Disabled'}
        </Text>
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
