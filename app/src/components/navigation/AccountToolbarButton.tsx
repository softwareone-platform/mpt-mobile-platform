import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import Avatar from '@/components/avatar/Avatar';
import { avatarStyle } from '@/styles';
import { DEFAULT_AVATAR_SIZE } from '@/constants/icons';
import { useAccount } from '@/context/AccountContext';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileRoot'>;

const AccountToolbarButton: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userData } = useAccount();

  const handlePress = () => {
    navigation.navigate('ProfileRoot');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, styles.topBarIconContainer]}>
        <Avatar
          id={userData?.id || ''}
          imagePath={userData?.currentAccount?.icon}
          size={DEFAULT_AVATAR_SIZE}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: avatarStyle.container,
  iconContainer: avatarStyle.iconContainer,
  topBarIconContainer: avatarStyle.topBarIconContainer,
});

export default AccountToolbarButton; 
