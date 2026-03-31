import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import SearchInput from '@/components/search/SearchInput';
import { FLATLIST_END_REACHED_THRESHOLD } from '@/constants/api';
import { useAccount } from '@/context/AccountContext';
import { useContactsData } from '@/hooks/queries/useContactsData';
import { useDebounce } from '@/hooks/useDebounce';
import { screenStyle, spacingStyle } from '@/styles';
import type { Contact } from '@/types/chat';
import { TestIDs } from '@/utils/testID';

type ContactsListBaseProps = {
  renderItem: (contact: Contact, isFirst: boolean, isLast: boolean) => React.ReactElement | null;
  header?: ReactNode;
};

const ContactsListBase = ({ renderItem, header }: ContactsListBaseProps) => {
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
      {header && !isSearchFocused && !searchQuery && header}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.containerList}
        renderItem={({ item, index }) =>
          renderItem(item, index === 0, index === contacts.length - 1)
        }
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

export default ContactsListBase;
