import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import { Navigation } from '@/components/navigation';
import { queryClient } from '@/config/queryClient';
import { AccountProvider } from '@/modules/home';
import { AuthProvider } from '@/context/AuthContext';
import './src/i18n';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccountProvider>
          <Navigation />
          <StatusBar style="auto" />
        </AccountProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
