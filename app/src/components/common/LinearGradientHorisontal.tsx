import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Color } from '@/styles';

type Props = {
  style?: ViewStyle;
  height?: number;
};

const LinearGradientHorizontal: React.FC<Props> = ({ style, height = 3 }) => {
  return (
    <LinearGradient
      colors={Color.brand.gradient.colors}
      start={Color.brand.gradient.start}
      end={Color.brand.gradient.end}
      style={[styles.gradient, { height }, style]}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
  },
});

export default LinearGradientHorizontal;
