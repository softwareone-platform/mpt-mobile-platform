import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react-native';
import React from 'react';

import { useCreateChatMutation } from '@/hooks/queries/useCreateChatMutation';
import { useChatApi } from '@/services/chatService';
import type { ChatItem, CreateChatPayload } from '@/types/chat';

jest.mock('@/services/chatService', () => ({
  useChatApi: jest.fn(),
}));

const mockCreateChat = jest.fn();
const mockUseChatApi = useChatApi as jest.Mock;

const mockPayload: CreateChatPayload = {
  type: 'Direct',
  participants: [{ contact: { id: 'CON-0001' } }],
};

const mockChat: ChatItem = {
  id: 'CHT-0001',
  type: 'Direct',
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateChatMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatApi.mockReturnValue({ createChat: mockCreateChat });
  });

  it('calls createChat with the payload', async () => {
    mockCreateChat.mockResolvedValue(mockChat);

    const { result } = renderHook(() => useCreateChatMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync(mockPayload);
    });

    expect(mockCreateChat).toHaveBeenCalledWith(mockPayload);
  });

  it('returns the created chat', async () => {
    mockCreateChat.mockResolvedValue(mockChat);

    const { result } = renderHook(() => useCreateChatMutation(), { wrapper: createWrapper() });

    let chat: ChatItem | undefined;
    await act(async () => {
      chat = await result.current.mutateAsync(mockPayload);
    });

    expect(chat).toBe(mockChat);
  });
});
