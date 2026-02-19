import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import Avatar, { clearAvatarCache } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_SIZE } from '@/constants/icons';
import { useAccount } from '@/context/AccountContext';
import { avatarStyle } from '@/styles';
import { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileRoot'>;

const AccountToolbarButton: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userData, userAccountsData, pendingAccountId } = useAccount();

  const cachedAccountRef = useRef<{ id?: string; icon?: string } | null>(null);

  const currentAccount = userData?.currentAccount;
  const pendingAccount = pendingAccountId
    ? userAccountsData.all.find((a) => a.id === pendingAccountId)
    : null;

  const accountToCache = pendingAccount ?? currentAccount;

  useEffect(() => {
    if (accountToCache && accountToCache.id !== cachedAccountRef.current?.id) {
      clearAvatarCache();
      cachedAccountRef.current = accountToCache;
    }
  }, [accountToCache]);

  const displayAccount = pendingAccount ?? currentAccount ?? cachedAccountRef.current;

  return (
    <TouchableOpacity
      testID={TestIDs.NAV_ACCOUNT_BUTTON}
      style={styles.container}
      onPress={() => navigation.navigate('ProfileRoot')}
      activeOpacity={0.7}
    >
      <View style={styles.topBarIconWrapper}>
        {displayAccount && (
          <Avatar
            id={displayAccount.id || ''}
            imagePath={displayAccount.icon}
            size={DEFAULT_AVATAR_SIZE}
            variant="small"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: avatarStyle.container,
  topBarIconWrapper: avatarStyle.topBarIconWrapper,
});

export default AccountToolbarButton;
