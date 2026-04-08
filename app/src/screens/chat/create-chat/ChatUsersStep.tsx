import ContactsListBase from './ContactsListBase';

import UserListItemSelection from '@/components/list-item/UserListItemSelection';

type ChatUserStepProps = {
  selectedIds: string[];
  onToggleParticipant: (id: string) => void;
};

const ChatUsersStep = ({ selectedIds, onToggleParticipant }: ChatUserStepProps) => (
  <ContactsListBase
    renderItem={(item, isFirst, isLast) => (
      <UserListItemSelection
        id={item.identity.id}
        imagePath={item.identity.icon}
        title={item.identity.name}
        subtitle={item.identity.id}
        statusText={item.status}
        isFirst={isFirst}
        isLast={isLast}
        selected={selectedIds.includes(item.id)}
        onToggle={() => onToggleParticipant(item.id)}
      />
    )}
    showCancel={false}
  />
);

export default ChatUsersStep;
