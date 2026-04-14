import { useCallback, useMemo } from 'react';

import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse } from '@/types/api';
import type { CaseItem } from '@/types/chat';

/**
 * Provides API methods for interacting with helpdesk cases.
 *
 * @returns {{ getCaseByChatId: (chatId: string) => Promise<CaseItem | null> }}
 *   `getCaseByChatId` — fetches the case associated with the given chat ID,
 *   or `null` if none exists.
 */
export function useCaseApi() {
  const api = useApi();

  const getCaseByChatId = useCallback(
    async (chatId: string): Promise<CaseItem | null> => {
      const endpoint =
        `/v1/helpdesk/cases` +
        `?select=chat` +
        `&eq(chat.id,"${chatId}")` +
        `&offset=0` +
        `&limit=1`;

      const response = await api.get<PaginatedResponse<CaseItem>>(endpoint);
      return response.data[0] ?? null;
    },
    [api],
  );

  return useMemo(() => ({ getCaseByChatId }), [getCaseByChatId]);
}
