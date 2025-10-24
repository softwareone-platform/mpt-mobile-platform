import { isLiquidGlassSupported } from '../utils/platformUtils';
import { Platform } from 'react-native';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '26',
  },
}));

describe('isLiquidGlassSupported', () => {
  it('should return true for iOS if version is >= 26', () => {
    Platform.OS = 'ios';
    Platform.Version = '26';
    expect(isLiquidGlassSupported()).toBe(true);
  });

  it('should return false for iOS if version is < 26', () => {
    Platform.OS = 'ios';
    Platform.Version = '25';
    expect(isLiquidGlassSupported()).toBe(false);
  });

  it('should return false for Android even if version is >= 26', () => {
    Platform.OS = 'android';
    Platform.Version = 34;
    expect(isLiquidGlassSupported()).toBe(false);
  });
});
