import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET } from '@/constants/api';
import type {
  UserAccount,
  SwitchAccountBody,
  UserData,
  FullUserData,
  SpotlightItem,
  SubscriptionItem,
} from '@/types/api';

export function useAccountApi() {
  const api = useApi();
    const { getAccessToken } = useAuth();

  async function getUserData(userId: string): Promise<UserData> {
    const endpoint = `/v1/accounts/users/${userId}/accounts?select=currentAccount.icon`;

    return api.get<UserData>(endpoint);
  }

  async function getFullUserData(userId: string): Promise<FullUserData> {
    const endpoint = `/v1/accounts/users/${userId}?select=currentAccount.icon`;

    return api.get<FullUserData>(endpoint);
  }

  async function getAccountsData(
    userId: string, 
    offset: number=DEFAULT_OFFSET, 
    limit: number=DEFAULT_PAGE_SIZE
  ): Promise<UserAccount[]> {
    const endpoint = `/v1/accounts/users/${userId}/accounts?select=id,name,type,icon,-*&eq(invitation.status,"Active")&order=name&offset=${offset}&limit=${limit}`;

    return api.get<UserAccount[]>(endpoint);
  }

  async function getSpotlightData(limit: number=DEFAULT_PAGE_SIZE): Promise<SpotlightItem[]> {
    const endpoint = `/v1/spotlight/objects?Select=top&limit=${limit}`;

    return api.get<SpotlightItem[]>(endpoint);
  }

  async function getSubscriptions(
    offset: number = DEFAULT_OFFSET,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<SubscriptionItem[]> {
    const endpoint = `/v1/commerce/subscriptions?filter(group.buyers)&offset=${offset}&limit=${limit}`;

    return api.get<SubscriptionItem[]>(endpoint);
  }

  async function switchAccount(userId: string, accountId: string): Promise<void> {
    if (!userId) {
      throw {
        name: "API Error",
        status: null,
        message: "User ID missing",
      };
    }

    const body: SwitchAccountBody = { currentAccount: { id: accountId } };
    const endpoint = `/v1/accounts/users/${userId}`;

    await api.put<void, SwitchAccountBody>(endpoint, body);

    try {
      await getAccessToken();
    } catch (error) {
      console.warn('Failed to refresh token after account switch', error);
    }
  }

  async function getUserAccounts(userId: string): Promise<UserAccount[]> {
    const endpoint = `/v1/accounts/users/${userId}/accounts`;

    return api.get<UserAccount[]>(endpoint);
  }

  return {
    getUserData,
    getFullUserData,
    getAccountsData,
    getSpotlightData,
    getSubscriptions,
    switchAccount,
    getUserAccounts,
  };
}
