import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { Navigation } from '@/components/navigation';
import './src/i18n';

const App = () => {
  return (
    <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
    </AuthProvider>
  );
};

export default App;
