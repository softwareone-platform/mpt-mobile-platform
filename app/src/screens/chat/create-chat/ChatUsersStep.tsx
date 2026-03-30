import ContactsListBase from './ContactsListBase';

import UserListItemSelection from '@/components/list-item/UserListItemSelection';

type ChatUserStepProps = {
  selectedIds: string[];
  onToggleParticipant: (id: string) => void;
};

const ChatUsersStep = ({ selectedIds, onToggleParticipant }: ChatUserStepProps) => (
  <ContactsListBase
    renderItem={(item, isFirst, isLast) => {
      const id = item.identity.id;
      return (
        <UserListItemSelection
          id={id}
          imagePath={item.identity.icon}
          title={item.identity.name}
          subtitle={id}
          statusText={item.status}
          isFirst={isFirst}
          isLast={isLast}
          selected={selectedIds.includes(id)}
          onToggle={() => onToggleParticipant(id)}
        />
      );
    }}
  />
);

export default ChatUsersStep;
