import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import UserListItemNavigation from '@/components/list-item/UserListItemNavigation';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import SearchInput from '@/components/search/SearchInput';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';
import { useAccount } from '@/context/AccountContext';
import { useContactsData } from '@/hooks/queries/useContactsData';
import { useDebounce } from '@/hooks/useDebounce';
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
  onSelectParticipant: (contact: Contact) => void;
};

const chatTypes: Array<ChatSelectionItem> = [{ name: 'groupChat', type: 'Group', icon: 'group' }];

const ChatTypeStep = ({ onSelectChatType, onSelectParticipant }: ChatTypeStepProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { t } = useTranslation();
  const { userData } = useAccount();
  const userId = userData?.id;

  const debouncedSearch = useDebounce(searchQuery);

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useContactsData(
    userId,
    debouncedSearch || undefined,
  );

  const contacts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.marginBottom}>
        <SearchInput
          placeholder={t('createChatWizard.searchPlaceholder')}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          testID={TestIDs.CREATE_CHAT_CONTACT_SEARCH}
        />
      </View>
      {!isSearchFocused && !searchQuery && (
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
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.containerList}
        renderItem={({ item, index }) => {
          const isFirst = index === 0;
          const isLast = index === contacts.length - 1;

          return (
            <UserListItemNavigation
              id={item.identity.id}
              imagePath={item.identity.icon}
              title={item.identity.name}
              subtitle={item.identity.id}
              statusText={item.status}
              isFirst={isFirst}
              isLast={isLast}
              onPress={() => onSelectParticipant(item)}
            />
          );
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={FLATLIST_END_REACHED_THRESHOLD}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
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
