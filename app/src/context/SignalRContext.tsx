import * as signalR from '@microsoft/signalr';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  PropsWithChildren,
  useRef,
} from 'react';

import { configService } from '@/config/env.config';
import {
  SIGNALR_RECONNECT_DELAY_MS,
  SIGNALR_SERVER_TIMEOUT_MS,
  SIGNALR_KEEP_ALIVE_INTERVAL_MS,
  SIGNALR_HUB_PATH,
} from '@/constants/api';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { getAccessTokenAsync } from '@/lib/tokenProvider';
import { logger } from '@/services/loggerService';
import type {
  SignalRContextType,
  EntitySubscription,
  MessageListener,
  ServerNotification,
  SignalRConnectionState,
} from '@/types/signalr';

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

const MAX_RETRY_ATTEMPTS = 10;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

export const SignalRProvider = ({ children }: PropsWithChildren) => {
  const { status: authStatus } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>('Disconnected');

  const listenersRef = useRef<Set<MessageListener>>(new Set());
  const subscriptionsRef = useRef<Set<string>>(new Set()); // Store as Set for deduplication
  const isConnectedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const getSignalRUrl = useCallback((): string | null => {
    const baseUrl = configService.get('AUTH0_API_URL');

    if (!baseUrl) {
      logger.warn('SignalR configuration incomplete: AUTH0_API_URL not set');
      return null;
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    return `${cleanBaseUrl}${SIGNALR_HUB_PATH}`;
  }, []);

  const updateConnectionState = useCallback((state: SignalRConnectionState) => {
    setConnectionState(state);
    const connected = state === 'Connected';
    setIsConnected(connected);
    isConnectedRef.current = connected;
    logger.info(`SignalR connection state: ${state}`);
  }, []);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const getRetryDelay = useCallback((attempt: number): number => {
    const delay = Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt), MAX_RETRY_DELAY_MS);
    return delay;
  }, []);

  const toGroupString = useCallback(
    (sub: EntitySubscription): string =>
      sub.entityName ? `${sub.moduleName}:${sub.entityName}` : sub.moduleName,
    [],
  );

  const toEntitySubscription = useCallback((group: string): EntitySubscription => {
    const [moduleName, entityName] = group.split(':');
    return entityName ? { moduleName, entityName } : { moduleName };
  }, []);

  const handleReconnecting = useCallback(() => {
    updateConnectionState('Reconnecting');
  }, [updateConnectionState]);

  const handleReconnected = useCallback(
    async (conn: signalR.HubConnection) => {
      updateConnectionState('Connected');
      retryCountRef.current = 0;

      if (subscriptionsRef.current.size > 0) {
        try {
          const groups = Array.from(subscriptionsRef.current);
          await conn.invoke('JoinGroups', {
            connectionId: conn.connectionId || '',
            moduleEntityPairs: groups.map(toEntitySubscription),
          });
          logger.info('Re-subscribed to groups after reconnection', {
            groupCount: groups.length,
          });
        } catch (error) {
          logger.error('Failed to re-subscribe after reconnection', error, {
            operation: 'signalr.resubscribe',
          });
        }
      }
    },
    [updateConnectionState, toEntitySubscription],
  );

  const handleClose = useCallback(
    (error?: Error) => {
      updateConnectionState('Disconnected');
      if (error) {
        logger.error('SignalR connection closed with error', error, {
          operation: 'signalr.onclose',
        });
      }
    },
    [updateConnectionState],
  );

  useEffect(() => {
    if (!isEnabled('FEATURE_SIGNALR') || authStatus !== 'authenticated') {
      return;
    }

    const signalRUrl = getSignalRUrl();
    if (!signalRUrl) {
      logger.error('Cannot initialize SignalR: URL configuration missing');
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(signalRUrl, {
        accessTokenFactory: async () => {
          const token = await getAccessTokenAsync();
          return token || '';
        },
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => SIGNALR_RECONNECT_DELAY_MS,
      })
      .configureLogging(signalR.LogLevel.Information)
      .withServerTimeout(SIGNALR_SERVER_TIMEOUT_MS)
      .withKeepAliveInterval(SIGNALR_KEEP_ALIVE_INTERVAL_MS)
      .build();

    newConnection.onreconnecting(handleReconnecting);
    newConnection.onreconnected(() => void handleReconnected(newConnection));
    newConnection.onclose(handleClose);

    setConnection(newConnection);

    return () => {
      clearRetryTimeout();
      if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
        void newConnection.stop();
      }
    };
  }, [
    authStatus,
    getSignalRUrl,
    clearRetryTimeout,
    handleReconnecting,
    handleReconnected,
    handleClose,
    isEnabled,
  ]);

  useEffect(() => {
    if (!connection || authStatus !== 'authenticated' || !isEnabled('FEATURE_SIGNALR')) {
      return;
    }

    const startConnection = async () => {
      try {
        updateConnectionState('Connecting');
        await connection.start();
        updateConnectionState('Connected');
        retryCountRef.current = 0;
        logger.info('SignalR connected successfully');
      } catch (error) {
        logger.error('SignalR connection error', error, {
          operation: 'signalr.start',
          retryAttempt: retryCountRef.current,
        });
        updateConnectionState('Disconnected');

        if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          const delay = getRetryDelay(retryCountRef.current);
          retryCountRef.current += 1;

          logger.info('Scheduling SignalR reconnection', {
            attempt: retryCountRef.current,
            delayMs: delay,
          });

          retryTimeoutRef.current = setTimeout(() => {
            void startConnection();
          }, delay);
        } else {
          logger.error('Max SignalR retry attempts reached', {
            maxAttempts: MAX_RETRY_ATTEMPTS,
          });
        }
      }
    };

    void startConnection();

    return () => {
      clearRetryTimeout();
    };
  }, [connection, authStatus, updateConnectionState, clearRetryTimeout, getRetryDelay, isEnabled]);

  useEffect(() => {
    if (!connection || !isConnected) {
      return;
    }

    const handler = (message: ServerNotification) => {
      logger.trace('SignalR message received', {
        entity: message.entity,
        event: message.event,
      });

      listenersRef.current.forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          logger.error('Error in SignalR message listener', error, {
            operation: 'signalr.messageHandler',
            entity: message.entity,
            event: message.event,
          });
        }
      });
    };

    connection.on('receiveSignalrNotification', handler);

    return () => {
      connection.off('receiveSignalrNotification', handler);
    };
  }, [connection, isConnected]);

  const manageGroups = useCallback(
    async (subscriptions: EntitySubscription[], action: 'join' | 'leave'): Promise<void> => {
      if (!connection || !isConnectedRef.current) {
        logger.warn(`Cannot ${action} groups: SignalR not connected`);
        return;
      }

      const groupStrings = subscriptions.map(toGroupString);
      const relevantGroups =
        action === 'join'
          ? groupStrings.filter((g) => !subscriptionsRef.current.has(g))
          : groupStrings.filter((g) => subscriptionsRef.current.has(g));

      if (relevantGroups.length === 0) {
        logger.info(
          action === 'join'
            ? 'All requested groups already subscribed'
            : 'No subscribed groups to leave',
        );
        return;
      }

      const method = action === 'join' ? 'JoinGroups' : 'LeaveGroups';
      const updateSet = action === 'join' ? 'add' : 'delete';

      try {
        await connection.invoke(method, {
          connectionId: connection.connectionId || '',
          moduleEntityPairs: relevantGroups.map(toEntitySubscription),
        });

        relevantGroups.forEach((group) => subscriptionsRef.current[updateSet](group));

        logger.info(`${action === 'join' ? 'Joined' : 'Left'} SignalR groups`, {
          groupCount: relevantGroups.length,
          totalGroupCount: subscriptionsRef.current.size,
        });
      } catch (error) {
        logger.error(`Failed to ${action} SignalR groups`, error, {
          operation: `signalr.${action}Groups`,
          groupCount: relevantGroups.length,
        });
      }
    },
    [connection, toGroupString, toEntitySubscription],
  );

  const subscribe = useCallback(
    (subscriptions: EntitySubscription[]) => manageGroups(subscriptions, 'join'),
    [manageGroups],
  );

  const unsubscribe = useCallback(
    (subscriptions: EntitySubscription[]) => manageGroups(subscriptions, 'leave'),
    [manageGroups],
  );

  const addMessageListener = useCallback((listener: MessageListener): (() => void) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo<SignalRContextType>(
    () => ({
      subscribe,
      unsubscribe,
      addMessageListener,
      isConnected,
      connectionState,
    }),
    [subscribe, unsubscribe, addMessageListener, isConnected, connectionState],
  );

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within SignalRProvider');
  }
  return context;
};
