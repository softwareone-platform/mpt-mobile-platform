// Home Module - Public API
// This module handles the home/spotlight functionality including account management and dashboard

// Context
export { AccountProvider, useAccount } from './context';

// Hooks
export { useUserData } from './hooks';
export { useSpotlightData } from './hooks';
export { useUserAccountsData } from './hooks';
export { useSwitchAccount } from './hooks';

// Services
export { useAccountApi } from './services';

// Types
export type {
  UserData,
  UserAccount,
  FormattedUserAccounts,
  PaginatedUserAccounts,
  SwitchAccountBody,
  SpotlightItem,
  SpotlightTopItem,
  SpotlightData,
  SpotlightTemplateName,
  FullUserData,
  SubscriptionItem,
} from './types';

// Screens
export { SpotlightScreen } from './screens';
