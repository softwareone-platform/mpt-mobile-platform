import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { cardStyle, screenStyle, Spacing } from '@/styles';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import ListItemWithImage from '@/components/list-item/ListItemWithImage';
import { StackNavigationProp } from '@react-navigation/stack';
import type { ProfileStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { useAccount } from '@/context/AccountContext';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const ProfileScreen = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const { userData, userAccountsData, switchAccount } = useAccount();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t } = useTranslation();

  useEffect(() => {
    if (userData?.currentAccount?.id) {
      setSelectedAccountId(userData.currentAccount.id);
    }
  }, [userData]);

  const handleSwitchAccount = async (accountId: string) => {
    if(accountId === selectedAccountId) return;

    setIsSwitching(true);
    setSelectedAccountId(accountId);
    try {
      await switchAccount(accountId);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <ScrollView style={styles.containerMain}>
      <View>
        <Text style={styles.sectionHeader}>{t('profileScreen.yourProfile')}</Text>
        <View style={styles.containerCard}>
          {userData && (
            <NavigationItemWithImage
              id={userData?.id}
              imagePath={userData?.icon}
              title={userData?.name}
              subtitle={userData?.id}
              isLast={true}
              onPress={() => navigation.navigate("userSettings")}
            />
          )}
        </View>
      </View>
      <View>
        <Text style={styles.sectionHeader}>{t('profileScreen.switchAccount')}</Text>
        <View style={styles.containerCard}>
          {userAccountsData.map((account, index) => (
            <ListItemWithImage
              key={account.id}
              id={account.id}
              imagePath={account.icon}
              title={account.name}
              subtitle={account.id}
              isLast={index === userAccountsData.length - 1}
              isSelected={account.id === userData?.currentAccount?.id}
              isUpdatingSelection={isSwitching && account.id === selectedAccountId} 
              onPress={() => handleSwitchAccount(account.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
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
