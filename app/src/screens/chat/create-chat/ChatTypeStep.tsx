import { useTranslation } from 'react-i18next';

import ContactsListBase from './ContactsListBase';

import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import UserListItemNavigation from '@/components/list-item/UserListItemNavigation';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import type { ChatType, Contact } from '@/types/chat';
import { TestIDs } from '@/utils/testID';

type ChatSelectionItem = {
  name: string;
  type: ChatType;
  icon: string;
};

type ChatTypeStepProps = {
  onSelectChatType: (type: ChatType) => void;
  onSelectParticipant: (contact: Contact) => void;
  isLoading?: boolean;
};

const chatTypes: Array<ChatSelectionItem> = [{ name: 'groupChat', type: 'Group', icon: 'group' }];

const ChatTypeStep = ({ onSelectChatType, onSelectParticipant, isLoading }: ChatTypeStepProps) => {
  const { t } = useTranslation();

  return (
    <ContactsListBase
      header={
        <NavigationGroupCard title={t('createChatWizard.chatType')}>
          {chatTypes.map((item, index) => (
            <NavigationItemWithIcon
              key={item.name}
              title={t(`createChatWizard.${item.name}`)}
              icon={item.icon}
              isLast={index === chatTypes.length - 1}
              onPress={() => onSelectChatType(item.type)}
              testID={`${TestIDs.CHAT_TYPES}-${item.name}`}
            />
          ))}
        </NavigationGroupCard>
      }
      renderItem={(item, isFirst, isLast) => (
        <UserListItemNavigation
          id={item.identity.id}
          imagePath={item.identity.icon}
          title={item.identity.name}
          subtitle={item.identity.id}
          statusText={item.status}
          isFirst={isFirst}
          isLast={isLast}
          onPress={() => onSelectParticipant(item)}
          disabled={isLoading}
        />
      )}
      showCancel={true}
    />
  );
};

export default ChatTypeStep;
