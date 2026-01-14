import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useBilling, BillingProvider } from '@/context/BillingContext';

const CreditMemosScreenContent = () => {
  const { creditMemos, creditMemosFetchingNext, hasMoreCreditMemos, fetchCreditMemos } =
    useBilling();

  return (
    <ListView
      data={creditMemos}
      isFetchingNext={creditMemosFetchingNext}
      hasMore={hasMoreCreditMemos}
      fetchNext={fetchCreditMemos}
      config={listItemConfigNoImageNoSubtitle}
      onItemPress={(item) => console.info(item.id)}
    />
  );
};

const CreditMemosScreen = () => (
  <BillingProvider>
    <CreditMemosScreenContent />
  </BillingProvider>
);

export default CreditMemosScreen;
