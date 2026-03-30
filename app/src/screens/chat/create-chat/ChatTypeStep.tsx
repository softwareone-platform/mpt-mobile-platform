import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList } from 'react-native';

import ContactData from './ContactsData.json';

import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import UserListItemNavigation from '@/components/list-item/UserListItemNavigation';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import SearchInput from '@/components/search/SearchInput';
import { screenStyle, spacingStyle } from '@/styles';
import { ChatType, Contact } from '@/types/chat';
import { TestIDs } from '@/utils/testID';

type ChatSelectionItem = {
  name: string;
  type: ChatType;
  icon: string;
};

type ChatTypeStepProps = {
  onSelectChatType: (type: ChatType) => void;
  onSelectParticipant: () => void;
};

const chatTypes: Array<ChatSelectionItem> = [{ name: 'groupChat', type: 'Group', icon: 'group' }];

const ChatTypeStep = ({ onSelectChatType, onSelectParticipant }: ChatTypeStepProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { t } = useTranslation();

  const contactsData: Contact[] = ContactData as Contact[];

  return (
    <View style={styles.container}>
      <View style={styles.marginBottom}>
        <SearchInput
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          testID={TestIDs.CREATE_CHAT_CONTACT_SEARCH}
        />
      </View>
      {!isSearchFocused && (
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
      )}
      <FlatList
        data={contactsData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.containerList}
        renderItem={({ item, index }) => {
          const isFirst = index === 0;
          const isLast = index === contactsData.length - 1;

          return (
            <UserListItemNavigation
              id={item.identity.id}
              imagePath={item.identity.icon}
              title={item.identity.name}
              subtitle={item.identity.id}
              statusText={item.status}
              isFirst={isFirst}
              isLast={isLast}
              onPress={onSelectParticipant}
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

export default ChatTypeStep;
