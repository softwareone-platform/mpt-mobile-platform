import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { cardStyle, screenStyle, Spacing } from '@/styles';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import ListItemWithImage from '@/components/list-item/ListItemWithImage';
import { StackNavigationProp } from '@react-navigation/stack';
import type { ProfileStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';

{/* TODO: Replace hardcoded data with actual accounts when auth is implemented */}
const accountsData = [
  {
    id: '234',
    name: 'Microsoft',
    role: 'Vendor',
  },
  {
    id: '345',
    name: 'Salesforce',
    role: 'Vendor',
  },
  {
    id: '456',
    name: 'Stark Industries',
    role: 'Client',
  },
  {
    id: '567',
    name: 'SoftwareOne',
    role: 'Operations',
  },
  {
    id: '678',
    name: 'Roxxon Industries',
    role: 'Client',
  },
  {
    id: '789',
    name: 'Tableau Inc',
    role: 'Vendor',
  },
];

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const ProfileScreen = () => {
  const [selectedId, setSelectedId] = useState<string | null>('234');

  const { t } = useTranslation();

  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <View style={styles.containerMain}>
      <View>
        <Text style={styles.sectionHeader}>{t('profileScreen.yourProfile')}</Text>
        <View style={styles.containerCard}>
          {/* TODO: Replace hardcoded id with actual user id when auth is implemented */}
          <NavigationItemWithImage 
            id="123"
            title="Sarah Sanderson"
            subtitle="USR-1234-1234"
            isLast={true}
            onPress={() => navigation.navigate("userSettings")}
          />
        </View>
      </View>
      <View>
        <Text style={styles.sectionHeader}>{t('profileScreen.switchAccount')}</Text>
        <View style={styles.containerCard}>
          {accountsData.map((account, index) => (
            <ListItemWithImage
              key={account.id}
              id={account.id}
              title={account.name}
              subtitle={account.role}
              isLast={index === accountsData.length - 1}
              isSelected={selectedId === account.id}
              onPress={() => setSelectedId(account.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
  sectionHeader: screenStyle.sectionHeader,
});

export default ProfileScreen;
