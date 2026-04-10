import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { useAccountType } from '@/hooks/useAccountType';
import type { RootStackParamList } from '@/types/navigation';
import type { EnrollmentDetails } from '@/types/program';
import { canNavigateTo } from '@/utils/navigationPermissions';

const EnrollmentDetailsContent = ({ data }: { data: EnrollmentDetails }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { accountType } = useAccountType();

  const eligibility = data.eligibility.partner
    ? t('details.eligibilityValue.partner')
    : t('details.eligibilityValue.client');

  return (
    <CardWithHeader title={t(`details.title`)}>
      <DetailsListItem
        label={t(`details.program`)}
        data={data.program}
        onPress={() => {
          navigation.navigate('programDetails', {
            id: data.program?.id,
          });
        }}
      />
      <DetailsListItem
        label={t(`details.certificate`)}
        data={data.certificate}
        onPress={() => {
          navigation.navigate('certificateDetails', {
            id: data.certificate?.id,
          });
        }}
      />
      {data.applicableTo === 'Licensee' ? (
        <DetailsListItem
          label={t(`details.certificant`)}
          data={data.licensee}
          onPress={
            canNavigateTo('licensee', accountType)
              ? () => {
                  navigation.navigate('licenseeDetails', {
                    id: data.licensee?.id,
                  });
                }
              : undefined
          }
        />
      ) : (
        <DetailsListItem
          label={t(`details.certificant`)}
          data={data.buyer}
          onPress={() => {
            navigation.navigate('buyerDetails', {
              id: data.buyer?.id,
            });
          }}
        />
      )}
      <ListItemWithLabelAndText title={t('details.eligibility')} subtitle={eligibility} />
      <ListItemWithLabelAndText
        title={t('details.applicableTo')}
        subtitle={t(`details.applicableToValue.${data.applicableTo.toLowerCase()}`)}
      />
      <DetailsListItem
        label={t(`details.assignee`)}
        data={data.assignee}
        onPress={() => {
          navigation.navigate('userDetails', {
            id: data.assignee?.id,
          });
        }}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default EnrollmentDetailsContent;
