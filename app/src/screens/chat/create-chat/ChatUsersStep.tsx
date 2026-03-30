import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

import UserListItemSelection from '@/components/list-item/UserListItemSelection';
import SearchInput from '@/components/search/SearchInput';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';
import { useAccount } from '@/context/AccountContext';
import { useContactsData } from '@/hooks/queries/useContactsData';
import { useDebounce } from '@/hooks/useDebounce';
import { screenStyle, spacingStyle } from '@/styles';
import { TestIDs } from '@/utils/testID';

type ChatUserStepProps = {
  selectedIds: string[];
  onToggleParticipant: (id: string) => void;
};

const ChatUsersStep = ({ selectedIds, onToggleParticipant }: ChatUserStepProps) => {
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
          testID={TestIDs.CREATE_CHAT_CONTACT_SEARCH}
        />
      </View>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.containerList}
        renderItem={({ item, index }) => {
          const isFirst = index === 0;
          const isLast = index === contacts.length - 1;
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

export default ChatUsersStep;
