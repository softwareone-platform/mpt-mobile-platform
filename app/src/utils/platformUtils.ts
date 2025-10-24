import { Platform } from 'react-native';

export const isLiquidGlassSupported = (): boolean => {
    return Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 26;
};
