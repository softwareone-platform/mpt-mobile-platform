import { RootStackParamList } from '@/types/navigation';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type { RootStackParamList };
