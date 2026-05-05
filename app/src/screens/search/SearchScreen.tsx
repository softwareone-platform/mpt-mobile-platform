import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';

import EmptyState from '@/components/common/EmptyState';
import KeyboardWrapper from '@/components/common/KeyboardWrapper';
import FiltersHorizontal from '@/components/filters/FiltersHorizontal';
import SubHeaderContainer from '@/components/header/SubHeaderContainer';
import SearchInput from '@/components/search/SearchInput';
import { searchQuery } from '@/config/searchQuery';
import type { SearchCategory } from '@/config/searchQuery';
import { KEYBOARD_VERTICAL_OFFSET_FULL_SCREEN } from '@/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { AgreementsList } from '@/screens/agreements/AgreementsScreen';
import { InvoicesList } from '@/screens/invoices/InvoicesScreen';
import { OrdersList } from '@/screens/orders/OrdersScreen';
import { screenStyle, spacingStyle } from '@/styles';
import { TestIDs } from '@/utils/testID';

const SearchScreen = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('agreements');

  const categories = Object.keys(searchQuery) as SearchCategory[];

  const debouncedSearchTerm = useDebounce(searchTerm).trim();
  const hasSearchTerm = debouncedSearchTerm.length > 0;
  const query = hasSearchTerm ? searchQuery[activeCategory](debouncedSearchTerm) : undefined;

  return (
    <KeyboardWrapper keyboardOffset={KEYBOARD_VERTICAL_OFFSET_FULL_SCREEN}>
      <View style={styles.container}>
        <SubHeaderContainer>
          <SearchInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={`${t('search.placeholder')} ${t(`searchScreen.filter.${activeCategory}`).toLocaleLowerCase()}`}
          />
        </SubHeaderContainer>
        <View>
          <FiltersHorizontal
            filterKeys={categories}
            selectedFilter={activeCategory}
            onFilterPress={(key) => setActiveCategory(key as SearchCategory)}
            translationPrefix="searchScreen.filter"
            testIDPrefix={TestIDs.SEARCH_FILTER}
          />
        </View>

        {hasSearchTerm ? (
          <View style={styles.container}>
            {activeCategory === 'agreements' && (
              <AgreementsList query={query} contentContainerStyle={styles.noPaddingTop} />
            )}
            {activeCategory === 'invoices' && (
              <InvoicesList query={query} contentContainerStyle={styles.noPaddingTop} />
            )}
            {activeCategory === 'orders' && (
              <OrdersList query={query} contentContainerStyle={styles.noPaddingTop} />
            )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon={{
                name: 'search',
              }}
              title={t('searchScreen.emptyStateTitle')}
              description={t('searchScreen.emptyStateDescription')}
              testID={TestIDs.SEARCH_EMPTY_STATE}
            />
          </View>
        )}
      </View>
    </KeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: screenStyle.containerFlex,
  emptyStateContainer: {
    ...screenStyle.containerFlex,
    ...spacingStyle.paddingHorizontal8,
  },
  noPaddingTop: screenStyle.noPaddingTop,
});

export default SearchScreen;
