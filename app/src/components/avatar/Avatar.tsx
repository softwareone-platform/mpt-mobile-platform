import { View, StyleSheet } from 'react-native';
import { avatarStyle } from '@/styles';
import Jdenticon from '@/components/common/JdenticonIcon';


interface AvatarIconProps {
  /** The ID used for Jdenticon fallback */
  id: string;
  /** The API path/URL for the image (can be relative or absolute) */
  imagePath?: string;
  /** Size of the avatar */
  size?: number;
  /** Custom style */
  style?: any;
  /** Border radius override */
  borderRadius?: number;
}

const AvatarIcon: React.FC<AvatarIconProps> = ({
  id,
  size = 32,
}) => {
  // TODO: Implement image loading logic when login in done

  // Render Jdenticon fallback
  const renderFallback = () => (
    <View style={styles.container}>
      <Jdenticon
        value={id}
        size={size}
      />
    </View>
  );

  // While loading or if no source, show Jdenticon
  return renderFallback();
};

const styles = StyleSheet.create({
  container: avatarStyle.container,
});

export default AvatarIcon;
