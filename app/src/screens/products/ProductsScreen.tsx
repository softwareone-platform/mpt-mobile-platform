import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { useProducts, ProductProvider } from '@/context/ProductContext';
import type { ListProps } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type ProductsScreenRouteProp = RouteProp<RootStackParamList, 'products'>;

const ProductsListContent = ({ contentContainerStyle }: ListProps) => {
  const {
    products,
    isProductsLoading,
    isProductsError,
    isProductsFetchingNext,
    hasMoreProducts,
    isUnauthorised,
    fetchProductsNextPage,
    refetchProducts,
    isProductsRefetching,
  } = useProducts();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isProductsLoading}
      isError={!!isProductsError}
      isEmpty={products.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.PRODUCTS_LOADING_INDICATOR}
      errorTestId={TestIDs.PRODUCTS_ERROR_STATE}
      emptyTestId={TestIDs.PRODUCTS_EMPTY_STATE}
      emptyTitle={t('productsScreen.emptyStateTitle')}
      emptyDescription={t('productsScreen.emptyStateDescription')}
    >
      <ListView
        data={products}
        isFetchingNext={isProductsFetchingNext}
        hasMore={hasMoreProducts}
        fetchNext={fetchProductsNextPage}
        config={listItemConfigFull}
        onRefresh={refetchProducts}
        isRefreshing={isProductsRefetching}
        contentContainerStyle={contentContainerStyle}
        onItemPress={(id) => {
          navigation.navigate('productDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

export const ProductsList = ({ query, contentContainerStyle }: ListProps) => (
  <ProductProvider query={query}>
    <ProductsListContent contentContainerStyle={contentContainerStyle} />
  </ProductProvider>
);

const ProductsScreen = () => {
  const route = useRoute<ProductsScreenRouteProp>();
  return <ProductsList query={route.params?.query} />;
};

export default ProductsScreen;
