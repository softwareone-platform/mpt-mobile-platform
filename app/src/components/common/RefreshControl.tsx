import { useEffect, useState } from 'react';
import {
  RefreshControl as RNRefreshControl,
  RefreshControlProps,
  InteractionManager,
  Platform,
} from 'react-native';

import { Color } from '@/styles';

/**
 * Workaround for a React Native Fabric bug on iOS where tintColor is not applied on initial mount.
 *
 * TODO: Remove this workaround when upgrading to React Native >= 0.82.
 * See: https://github.com/facebook/react-native/issues/53987
 */
const RefreshControl = ({
  tintColor = Color.brand.primary,
  colors = [Color.brand.primary],
  ...props
}: RefreshControlProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setMounted(true);
    });
    return () => handle.cancel();
  }, []);

  return (
    <RNRefreshControl
      {...props}
      tintColor={Platform.OS === 'ios' && !mounted ? undefined : tintColor}
      colors={colors}
    />
  );
};

export default RefreshControl;
