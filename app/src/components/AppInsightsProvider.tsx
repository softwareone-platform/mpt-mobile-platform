import React, { ReactNode } from 'react';

import { useAppInsights } from '@/hooks/useAppInsights';

interface AppInsightsProviderProps {
  children: ReactNode;
}

export const AppInsightsProvider: React.FC<AppInsightsProviderProps> = ({ children }) => {
  useAppInsights();
  return <>{children}</>;
};
