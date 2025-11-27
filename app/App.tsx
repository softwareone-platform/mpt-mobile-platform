import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { AccountProvider } from '@/context/AccountContext';
import { Navigation } from '@/components/navigation';
import './src/i18n';

const App = () => {
  return (
    <AuthProvider>
      <AccountProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AccountProvider>
    </AuthProvider>
  );
};

export default App;
