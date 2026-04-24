jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    trackEvent: jest.fn(),
  },
}));

import { renderHook } from '@testing-library/react-native';

import { AnalyticsEvents } from '@/constants/analytics';
import { trackEvent, useTrackEvent } from '@/hooks/useTrackEvent';
import { appInsightsService } from '@/services/appInsightsService';

const mockTrackEvent = appInsightsService.trackEvent as jest.Mock;

describe('trackEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends event with name and timestamp', () => {
    trackEvent(AnalyticsEvents.AUTH_LOGIN_SUCCESS);

    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'Auth_LoginSuccess',
      properties: {
        timestamp: '2026-01-15T12:00:00.000Z',
      },
    });
  });

  it('merges custom properties with timestamp', () => {
    trackEvent(AnalyticsEvents.ACCOUNT_SWITCHED, { accountId: 'ACC-1' });

    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'Account_Switched',
      properties: {
        accountId: 'ACC-1',
        timestamp: '2026-01-15T12:00:00.000Z',
      },
    });
  });

  it('works without properties', () => {
    trackEvent(AnalyticsEvents.AUTH_LOGOUT);

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith(expect.objectContaining({ name: 'Auth_Logout' }));
  });
});

describe('useTrackEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a stable function reference', () => {
    const { result, rerender } = renderHook(() => useTrackEvent());
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);
  });

  it('delegates to trackEvent', () => {
    const { result } = renderHook(() => useTrackEvent());

    result.current(AnalyticsEvents.CHAT_MESSAGE_SENT, { chatId: 'CHT-1', messageLength: 42 });

    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Chat_MessageSent',
        properties: expect.objectContaining({
          chatId: 'CHT-1',
          messageLength: 42,
        }),
      }),
    );
  });
});
