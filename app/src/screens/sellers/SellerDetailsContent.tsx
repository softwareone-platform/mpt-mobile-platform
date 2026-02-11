import { useTranslation } from 'react-i18next';

import AddressCard from '@/components/address/AddressCard';
import type { SellerData } from '@/types/admin';

const SellerDetailsContent = ({ data }: { data: SellerData }) => {
  const { t } = useTranslation();

  return <AddressCard address={data.address} headerTitle={t(`details.address`)} />;
};

export default SellerDetailsContent;
