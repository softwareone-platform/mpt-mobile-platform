import { RootStackParamList, TabParamList, TabItem, ScreenComponent } from '@/types/navigation';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type { RootStackParamList, TabParamList, TabItem, ScreenComponent };
