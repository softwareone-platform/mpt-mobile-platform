import type { ListItemCommonProps } from '@/types/lists';

export type ChatType = 'Direct' | 'Group' | 'Channel' | 'Case' | null;

export type MessageType = 'own' | 'other';

export type Audit = {
  created?: {
    at: string;
    by: unknown;
  };
  updated?: unknown;
  deleted?: unknown;
  madePublic?: unknown;
  madePrivate?: unknown;
};

export type Chat = {
  id: string;
  type: ChatType;
  revision: number;
};

export type Identity = {
  id: string;
  name: string;
  icon?: string;
  revision: number;
};

export type Contact = {
  id: string;
  name?: string;
  email: string;
  revision: number;
  identity: Identity;
  status: string;
};

export type Account = {
  id: string;
  name: string;
  icon?: string;
  type: string;
  status: string;
  revision?: number;
};

export type ChatParticipant = {
  id: string;
  identity: Identity;
  contact?: Contact;
  account?: Account;
  unreadMessageCount: number;
  lastReadMessage?: { id: string };
  status?: 'Active' | 'Exited';
  revision?: number;
};

export type Sender = ChatParticipant & {
  chat: Chat;
  account: Account;
  muted: boolean;
  status: string;
  lastReadMessage: LastMessage;
};

export type LastMessage = {
  id: string;
  content: string;
  audit?: Audit;
  revision?: number;
  visibility?: string;
  isDeleted: boolean;
};

export type ChatItem = {
  id: string;
  name?: string;
  type: ChatType;
  participants?: ChatParticipant[];
  lastMessage?: LastMessage;
};

export type CreateChatPayload = {
  type: ChatType;
  name?: string;
  participants: Array<{ contact: { id: string } }>;
};

export type AvatarItem = {
  id: string;
  imagePath?: string;
};

export type ListItemChatProps = ListItemCommonProps & {
  id: string;
  type: ChatType;
  title: string;
  companyName: string;
  avatarWithBadge?: Record<string, AvatarItem>;
  messageLatest: string;
  newMessageCounter: number;
  dateOfLastMessage: string;
  avatars: AvatarItem[];
  isVerified: boolean;
};

export interface MessageLink {
  id: string;
  name: string;
  icon: string;
  uri: string;
  revision: number;
}

export type Message = {
  id: string;
  revision: number;
  chat?: Chat;
  sender: Sender;
  identity: Identity;
  content: string;
  visibility: 'Public' | 'Private';
  isDeleted: boolean;
  links: MessageLink[];
  audit: Audit;
  _optimistic?: true;
  _failed?: true;
  /** Stable key for FlatList — preserved when optimistic message is replaced with real server data */
  _localKey?: string;
};
