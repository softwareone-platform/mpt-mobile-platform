import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Avatar from '@/components/avatar/Avatar';
import { avatarStyle } from '@/styles';
import { DEFAULT_AVATAR_SIZE } from '@/constants/icons';

const AccountToolbarButton: React.FC = () => {
  const navigation = useNavigation();

  // TODO: replace with actual user data fetching logic
  const user = {
    id: '123',
    icon: undefined,
    avatar: undefined,
    currentAccount: {
      icon: undefined,
    },
  };

  const handlePress = () => {
    const rootNavigation = navigation.getParent() ?? navigation;
    rootNavigation.navigate('Profile');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, styles.topBarIconContainer]}>
        <Avatar
          id={user?.id || ''}
          imagePath={user?.icon || user?.avatar || user?.currentAccount?.icon}
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
