import { View, StyleSheet } from 'react-native';
import { avatarStyle } from '@/styles';
import Jdenticon from '@/components/common/JdenticonIcon';


interface AvatarIconProps {
  id: string;
  imagePath?: string;
  size?: number;
  style?: any;
  borderRadius?: number;
}

const AvatarIcon: React.FC<AvatarIconProps> = ({
  id,
  size = 32,
}) => {
  // TODO: Implement image loading logic when login in done

  const renderFallback = () => (
    <View style={styles.container}>
      <Jdenticon
        value={id}
        size={size}
      />
    </View>
  );

  return renderFallback();
};

const styles = StyleSheet.create({
  container: avatarStyle.container,
});

export default AvatarIcon;
