import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { SignalRProvider, useSignalR } from '@/context/SignalRContext';

const mockUseAuth = jest.fn();
const mockIsEnabled = jest.fn();
const mockGetAccessTokenAsync = jest.fn();
const mockConfigServiceGet = jest.fn();

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/useFeatureFlags', () => ({
  useFeatureFlags: () => ({ isEnabled: mockIsEnabled }),
}));

jest.mock('@/lib/tokenProvider', () => ({
  getAccessTokenAsync: () => mockGetAccessTokenAsync(),
}));

jest.mock('@/config/env.config', () => ({
  configService: {
    get: (key: string) => mockConfigServiceGet(key),
  },
}));

jest.mock('@/services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    trace: jest.fn(),
  },
}));

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <SignalRProvider>{children}</SignalRProvider>
  );
};

describe('SignalRContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ status: 'unauthenticated' });
    mockIsEnabled.mockReturnValue(false);
    mockConfigServiceGet.mockReturnValue('https://api.example.com');
    mockGetAccessTokenAsync.mockResolvedValue('mock-token');
  });

  it('throws error when useSignalR is used outside provider', () => {
    expect(() => {
      renderHook(() => useSignalR());
    }).toThrow('useSignalR must be used within SignalRProvider');
  });

  it('provides context value with subscribe and addMessageListener', () => {
    const { result } = renderHook(() => useSignalR(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty('subscribe');
    expect(result.current).toHaveProperty('addMessageListener');
    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('connectionState');
  });

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useSignalR(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionState).toBe('Disconnected');
  });

  it('does not initialize connection when feature flag is disabled', async () => {
    mockIsEnabled.mockReturnValue(false);
    mockUseAuth.mockReturnValue({ status: 'authenticated' });

    const { result } = renderHook(() => useSignalR(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it('does not initialize connection when unauthenticated', async () => {
    mockIsEnabled.mockReturnValue(true);
    mockUseAuth.mockReturnValue({ status: 'unauthenticated' });

    const { result } = renderHook(() => useSignalR(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it('addMessageListener returns cleanup function', () => {
    const { result } = renderHook(() => useSignalR(), {
      wrapper: createWrapper(),
    });

    const mockListener = jest.fn();
    const cleanup = result.current.addMessageListener(mockListener);

    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});
