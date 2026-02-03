import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import { AppInsightsProvider } from '@/components/AppInsightsProvider';
import { Navigation } from '@/components/navigation';
import { queryClient } from '@/config/queryClient';
import { AccountProvider } from '@/context/AccountContext';
import { AuthProvider } from '@/context/AuthContext';
import './src/i18n';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInsightsProvider>
          <AccountProvider>
            <Navigation />
            <StatusBar style="auto" />
          </AccountProvider>
        </AppInsightsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
