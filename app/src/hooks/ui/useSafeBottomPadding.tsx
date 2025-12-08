import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Spacing } from '@/styles';

const useSafeBottomPadding = () => {
  const insets = useSafeAreaInsets();

  const bottomPadding = Platform.select({
    ios: insets.bottom + Spacing.spacing5,
    android: insets.bottom + Spacing.spacing8,
  });

  return bottomPadding;
};

export default useSafeBottomPadding;
