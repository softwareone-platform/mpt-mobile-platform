export type EntityEventType = 'created' | 'updated' | 'deleted';

export type EntityName = 'Chat' | 'ChatMessage' | 'ChatParticipant' | 'SupportCase' | 'Queue';

export interface EntitySubscription {
  moduleName: string;
  entityName: string;
}

export interface ServerNotification<T = unknown> {
  entity: string;
  event: EntityEventType;
  data: T;
}

export type MessageListener = (message: ServerNotification) => void;

export interface SignalRContextType {
  subscribe: (subscriptions: EntitySubscription[]) => Promise<void>;
  addMessageListener: (listener: MessageListener) => () => void;
  isConnected: boolean;
  connectionState: SignalRConnectionState;
}

export type SignalRConnectionState =
  | 'Disconnected'
  | 'Connecting'
  | 'Connected'
  | 'Reconnecting'
  | 'Disconnecting';
