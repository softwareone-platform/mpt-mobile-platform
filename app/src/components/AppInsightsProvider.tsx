import { ReactNode } from 'react';

import { useAppInsights } from '@/hooks/useAppInsights';

export const AppInsightsProvider = ({ children }: { children: ReactNode }) => {
  useAppInsights();
  return <>{children}</>;
};
