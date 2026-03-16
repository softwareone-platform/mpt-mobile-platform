import type { ListItemCommonProps } from '@/types/lists';

export type ChatType = 'Direct' | 'Group' | 'Channel' | 'Case';

export type Identity = {
  id: string;
  name: string;
  icon?: string;
  revision: number;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  revision: number;
  identity?: Identity;
};

export type Account = {
  id: string;
  name: string;
  icon?: string;
  type: string;
  status: string;
};

export type ChatParticipant = {
  id: string;
  identity: Identity;
  contact?: Contact;
  account?: Account;
  unreadMessageCount: number;
};

export type LastMessage = {
  id: string;
  content: string;
  audit?: {
    created?: {
      at: string;
    };
  };
};

export type ChatItem = {
  id: string;
  name?: string;
  type: ChatType;
  participants?: ChatParticipant[];
  lastMessage?: LastMessage;
};

export type AvatarItem = {
  id: string;
  imagePath?: string;
};

export type ListItemChatProps = ListItemCommonProps & {
  id: string;
  title: string;
  companyName: string;
  messageLatest: string;
  newMessageCounter: number;
  dateOfLastMessage: string;
  avatars: AvatarItem[];
  isVerified: boolean;
};

export type ChatsListResponse = {
  $meta: {
    pagination: {
      offset: number;
      limit: number;
      total: number;
    };
  };
  data: ChatItem[];
};
