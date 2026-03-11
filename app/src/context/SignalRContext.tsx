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
} from '@/constants/api';
import { useAuth } from '@/context/AuthContext';
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

export const SignalRProvider = ({ children }: PropsWithChildren) => {
  const { status: authStatus } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>('Disconnected');
  const listenersRef = useRef<Set<MessageListener>>(new Set());
  const subscriptionsRef = useRef<EntitySubscription[]>([]);

  const getHubUrl = useCallback((): string => {
    return configService.get('SIGNALR_HUB_URL');
  }, []);

  const updateConnectionState = useCallback((state: SignalRConnectionState) => {
    setConnectionState(state);
    setIsConnected(state === 'Connected');
    logger.info(`SignalR connection state: ${state}`);
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return;
    }

    const hubUrl = getHubUrl();

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
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

    newConnection.onreconnected(async () => {
      updateConnectionState('Connected');

      if (subscriptionsRef.current.length > 0) {
        try {
          await newConnection.invoke('JoinGroups', {
            connectionId: newConnection.connectionId || '',
            moduleEntityPairs: subscriptionsRef.current,
          });
          logger.info('Re-subscribed to groups after reconnection', {
            subscriptionCount: subscriptionsRef.current.length,
          });
        } catch (error) {
          logger.error('Failed to re-subscribe after reconnection', error, {
            operation: 'signalr.resubscribe',
          });
        }
      }
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

    return () => {
      if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
        void newConnection.stop();
      }
    };
  }, [authStatus, getHubUrl, updateConnectionState]);

  useEffect(() => {
    if (!connection || authStatus !== 'authenticated') {
      return;
    }

    const startConnection = async () => {
      try {
        updateConnectionState('Connecting');
        await connection.start();
        updateConnectionState('Connected');
        logger.info('SignalR connected successfully');
      } catch (error) {
        logger.error('SignalR connection error', error, {
          operation: 'signalr.start',
        });
        updateConnectionState('Disconnected');

        setTimeout(() => {
          void startConnection();
        }, SIGNALR_RECONNECT_DELAY_MS);
      }
    };

    void startConnection();
  }, [connection, authStatus, updateConnectionState]);

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
    async (subscriptions: EntitySubscription[]) => {
      if (!connection || !isConnected) {
        logger.warn('Cannot join groups: SignalR not connected');
        return;
      }

      try {
        await connection.invoke('JoinGroups', {
          connectionId: connection.connectionId || '',
          moduleEntityPairs: subscriptions,
        });
        subscriptionsRef.current = subscriptions;
        logger.info('Joined SignalR groups', { groupCount: subscriptions.length });
      } catch (error) {
        logger.error('Failed to join SignalR groups', error, {
          operation: 'signalr.joinGroups',
          groupCount: subscriptions.length,
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

  const value = useMemo<SignalRContextType>(
    () => ({
      subscribe,
      addMessageListener,
      isConnected,
      connectionState,
    }),
    [subscribe, addMessageListener, isConnected, connectionState],
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
