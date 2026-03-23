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

const toGroupString = (sub: EntitySubscription): string =>
  sub.entityName ? `${sub.moduleName}:${sub.entityName}` : sub.moduleName;

const toEntitySubscription = (group: string): EntitySubscription => {
  const [moduleName, entityName] = group.split(':');
  return entityName ? { moduleName, entityName } : { moduleName };
};

const calculateRetryDelay = (attempt: number): number =>
  Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt), MAX_RETRY_DELAY_MS);

export const SignalRProvider = ({ children }: PropsWithChildren) => {
  const { status: authStatus } = useAuth();
  const { isEnabled } = useFeatureFlags();

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>('Disconnected');

  const listenersRef = useRef<Set<MessageListener>>(new Set());
  const reconnectionListenersRef = useRef<Set<() => void>>(new Set());
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const isConnected = connectionState === 'Connected';

  const updateConnectionState = useCallback((state: SignalRConnectionState) => {
    setConnectionState(state);
    logger.info(`SignalR connection state: ${state}`);
  }, []);

  const resubscribeToGroups = useCallback(async (conn: signalR.HubConnection) => {
    if (subscriptionsRef.current.size === 0) {
      return;
    }

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
  }, []);

  const notifyReconnectionListeners = useCallback(() => {
    reconnectionListenersRef.current.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        logger.error('Error in reconnection listener', error, {
          operation: 'signalr.reconnectionListener',
        });
      }
    });
  }, []);

  const startConnection = useCallback(
    async (conn: signalR.HubConnection) => {
      if (conn.state !== signalR.HubConnectionState.Disconnected) {
        return;
      }

      const wasRetrying = retryCountRef.current > 0;

      try {
        updateConnectionState('Connecting');
        await conn.start();
        updateConnectionState('Connected');

        if (wasRetrying) {
          await resubscribeToGroups(conn);
          notifyReconnectionListeners();
        }

        retryCountRef.current = 0;
        logger.debug('SignalR connected successfully', { wasRetrying });
      } catch (error) {
        logger.error('SignalR connection error', error, {
          operation: 'signalr.start',
          retryAttempt: retryCountRef.current,
        });
        updateConnectionState('Disconnected');

        if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          const delay = calculateRetryDelay(retryCountRef.current);
          retryCountRef.current += 1;

          logger.debug('Scheduling SignalR reconnection', {
            attempt: retryCountRef.current,
            delayMs: delay,
          });

          retryTimeoutRef.current = setTimeout(() => {
            void startConnection(conn);
          }, delay);
        } else {
          logger.error('Max SignalR retry attempts reached', {
            maxAttempts: MAX_RETRY_ATTEMPTS,
          });
        }
      }
    },
    [updateConnectionState, resubscribeToGroups, notifyReconnectionListeners],
  );

  useEffect(() => {
    if (!isEnabled('FEATURE_SIGNALR') || authStatus !== 'authenticated') {
      return;
    }

    const baseUrl = configService.get('AUTH0_API_URL');
    if (!baseUrl) {
      logger.error('Cannot initialize SignalR: AUTH0_API_URL not set');
      return;
    }

    const signalRUrl = `${baseUrl.replace(/\/$/, '')}${SIGNALR_HUB_PATH}`;

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

    newConnection.onreconnecting(() => {
      updateConnectionState('Reconnecting');
    });

    newConnection.onreconnected(() => {
      updateConnectionState('Connected');
      retryCountRef.current = 0;
      void resubscribeToGroups(newConnection);
      notifyReconnectionListeners();
    });

    newConnection.onclose((error) => {
      updateConnectionState('Disconnected');
      if (error) {
        logger.error('SignalR connection closed with error', error, {
          operation: 'signalr.onclose',
        });
      }
    });

    setConnection(newConnection);
    void startConnection(newConnection);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
        void newConnection.stop();
      }
    };
  }, [
    authStatus,
    isEnabled,
    updateConnectionState,
    resubscribeToGroups,
    notifyReconnectionListeners,
    startConnection,
  ]);

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

  const subscribe = useCallback(
    async (subscriptions: EntitySubscription[]): Promise<void> => {
      const groupStrings = subscriptions.map(toGroupString);
      const newGroups = groupStrings.filter((g) => !subscriptionsRef.current.has(g));

      if (newGroups.length === 0) {
        logger.info('All requested groups already subscribed');
        return;
      }

      newGroups.forEach((group) => subscriptionsRef.current.add(group));

      if (!connection || !isConnected) {
        logger.info('Registered subscriptions for later connection', {
          groupCount: newGroups.length,
          totalGroupCount: subscriptionsRef.current.size,
        });
        return;
      }

      try {
        await connection.invoke('JoinGroups', {
          connectionId: connection.connectionId || '',
          moduleEntityPairs: newGroups.map(toEntitySubscription),
        });

        logger.info('Joined SignalR groups', {
          groupCount: newGroups.length,
          totalGroupCount: subscriptionsRef.current.size,
        });
      } catch (error) {
        logger.error('Failed to join SignalR groups', error, {
          operation: 'signalr.joinGroups',
          groupCount: newGroups.length,
        });
      }
    },
    [connection, isConnected],
  );

  const addMessageListener = useCallback((listener: MessageListener): (() => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const addReconnectionListener = useCallback((listener: () => void): (() => void) => {
    reconnectionListenersRef.current.add(listener);
    return () => {
      reconnectionListenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo<SignalRContextType>(
    () => ({
      subscribe,
      addMessageListener,
      addReconnectionListener,
      isConnected,
      connectionState,
    }),
    [subscribe, addMessageListener, addReconnectionListener, isConnected, connectionState],
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
