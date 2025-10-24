import featureFlags from './featureFlags.json';

export type FeatureFlags = typeof featureFlags;
export type FeatureFlagKey = keyof FeatureFlags;

export const flags: Readonly<FeatureFlags> = featureFlags;

export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
  return Boolean(flags[flag]);
};
