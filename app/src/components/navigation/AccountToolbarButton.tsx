import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import Avatar from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_SIZE } from '@/constants/icons';
import { useAccount } from '@/context/AccountContext';
import { avatarStyle } from '@/styles';
import { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileRoot'>;

const AccountToolbarButton: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userData } = useAccount();

  const handlePress = () => {
    navigation.navigate('ProfileRoot');
  };

  return (
    <TouchableOpacity
      testID={TestIDs.NAV_ACCOUNT_BUTTON}
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.topBarIconWrapper}>
        <Avatar
          id={userData?.currentAccount?.id || ''}
          imagePath={userData?.currentAccount?.icon}
          size={DEFAULT_AVATAR_SIZE}
          variant="small"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: avatarStyle.container,
  topBarIconWrapper: avatarStyle.topBarIconWrapper,
});

export default AccountToolbarButton;
