// Re-export shared types for backward compatibility
export {
  HttpMethod,
  PaginationMeta,
  PaginatedResponse,
  UserAccount,
  User,
} from '@/shared/types/api';

// Re-export home module types for backward compatibility
export type {
  UserData,
  FullUserData,
  FormattedUserAccounts,
  PaginatedUserAccounts,
  SwitchAccountBody,
  SpotlightItem,
  SpotlightTopItem,
  SpotlightData,
  SubscriptionItem,
} from '@/modules/home';
