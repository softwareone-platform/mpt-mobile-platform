import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import { isFeatureEnabled } from '@featureFlags';
import { Colors } from './src/constants/colors';
import Navigation from './src/components/navigation/Navigation';

const App = () => {
  const featureTestEnabled = isFeatureEnabled('FEATURE_TEST');
  
  return (
    <AuthProvider>
      <View style={styles.container}>
        <Navigation />
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
