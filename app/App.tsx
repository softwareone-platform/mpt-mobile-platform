import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { isFeatureEnabled } from '@featureFlags';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const App = () => {
  const featureTestEnabled = isFeatureEnabled('FEATURE_TEST');

  return (
    <View style={styles.container}>
      <Text>
        {featureTestEnabled ? 'Test Feature Enabled' : 'Test Feature Disabled'}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default App;
