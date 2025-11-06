import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { isFeatureEnabled } from '@featureFlags';
import { Colors } from './src/constants/colors';
import Navigation from './src/components/navigation/Navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const App = () => {
  const featureTestEnabled = isFeatureEnabled('FEATURE_TEST');

  return (
    <Navigation />
  );
}

export default App;
