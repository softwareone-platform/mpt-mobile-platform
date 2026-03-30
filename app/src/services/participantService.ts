import { useCallback, useMemo } from 'react';

import { useApi } from '@/hooks/useApi';
import { logger } from '@/services/loggerService';
import type { ChatParticipant } from '@/types/chat';

export function useParticipantApi(chatId: string) {
  const api = useApi();

  const saveParticipant = useCallback(
    async (participant: Partial<ChatParticipant>): Promise<ChatParticipant> => {
      if (!participant.id) {
        throw new Error('Participant ID is required');
      }

      const endpoint = `/v1/helpdesk/chats/${chatId}/participants/${participant.id}`;

      logger.debug('[ParticipantService] Updating participant', {
        operation: 'saveParticipant',
        participantId: participant.id,
        lastReadMessageId: participant.lastReadMessage?.id,
        revision: participant.revision,
      });

      try {
        return await api.put<ChatParticipant>(endpoint, participant);
      } catch (error) {
        logger.error('[ParticipantService] Failed to update participant', error, {
          operation: 'saveParticipant',
          participantId: participant.id,
          endpoint,
        });
        throw error;
      }
    },
    [api, chatId],
  );

  return useMemo(
    () => ({
      saveParticipant,
    }),
    [saveParticipant],
  );
}
