import { useQuery } from '@tanstack/react-query';

import { useCaseApi } from '@/services/caseService';

export const useCaseData = (chatId: string | undefined, enabled: boolean) => {
  const { getCaseByChatId } = useCaseApi();

  return useQuery({
    queryKey: ['case', chatId],
    queryFn: () => {
      if (!chatId) {
        throw new Error('chatId is required for fetching case');
      }
      return getCaseByChatId(chatId);
    },
    enabled: !!chatId && enabled,
  });
};
