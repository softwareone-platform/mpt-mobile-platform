import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useContactsApi } from '@/services/contactsService';
import type { Contact } from '@/types/chat';

export const useContactsData = (userId: string | undefined, search?: string) => {
  const { getContacts } = useContactsApi();

  return usePaginatedQuery<Contact>({
    queryKey: ['contacts', userId, search],
    queryFn: (offset, limit) => getContacts(userId!, offset, limit, search),
    enabled: !!userId,
  });
};
