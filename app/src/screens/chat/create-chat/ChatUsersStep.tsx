import { View, StyleSheet, FlatList } from 'react-native';

import ContactData from './ContactsData.json';

import UserListItemSelection from '@/components/list-item/UserListItemSelection';
import SearchInput from '@/components/search/SearchInput';
import { screenStyle, spacingStyle } from '@/styles';
import { Contact } from '@/types/chat';
import { TestIDs } from '@/utils/testID';

type ChatUserStepProps = {
  selectedIds: string[];
  onToggleParticipant: (id: string) => void;
};

const ChatUsersStep = ({ selectedIds, onToggleParticipant }: ChatUserStepProps) => {
  const contactsData: Contact[] = ContactData as Contact[];

  return (
    <View style={styles.container}>
      <View style={styles.marginBottom}>
        <SearchInput testID={TestIDs.CREATE_CHAT_CONTACT_SEARCH} />
      </View>
      <FlatList
        data={contactsData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.containerList}
        renderItem={({ item, index }) => {
          const isFirst = index === 0;
          const isLast = index === contactsData.length - 1;
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
        // TODO: Add the below lines back when have API and hook working to fetch data
        // onEndReached={() => {
        //   if (hasMore && !isFetchingNext) {
        //     fetchNext?.();
        //   }
        // }}
        // onEndReachedThreshold={FLATLIST_END_REACHED_THRESHOLD}
        // ListFooterComponent={isFetchingNext ? <ActivityIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: screenStyle.containerFlex,
  marginBottom: spacingStyle.marginBottom2,
  containerList: spacingStyle.paddingBottom4,
});

export default ChatUsersStep;
