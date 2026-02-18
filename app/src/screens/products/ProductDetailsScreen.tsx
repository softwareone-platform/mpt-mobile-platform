import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useProductDetailsData } from '@/hooks/queries/useProductDetailsData';
import ProductDetailsContent from '@/screens/products/ProductDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'productDetails'>;

const ProductDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<ProductDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data: productDetails,
    isLoading,
    isError,
    isUnauthorised,
  } = useProductDetailsData(id, userId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!productDetails || Object.keys(productDetails).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.PRODUCT_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.PRODUCT_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.PRODUCT_DETAILS_EMPTY_STATE}
      emptyTitle={t('productDetailsScreen.emptyStateTitle')}
      emptyDescription={t('productDetailsScreen.emptyStateDescription')}
    >
      {productDetails && (
        <DetailsView data={productDetails} config={listItemConfigFull}>
          <ProductDetailsContent data={productDetails} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default ProductDetailsScreen;
