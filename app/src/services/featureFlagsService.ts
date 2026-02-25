import semver from 'semver';

import { PortalVersionInfo } from './portalVersionService';

import featureFlags from '@/config/feature-flags/featureFlags.json';
import { logger } from '@/services/loggerService';

export type FeatureFlags = typeof featureFlags;
export type FeatureFlagKey = keyof FeatureFlags;

export type FeatureFlagConfig = {
  enabled: boolean;
  minVersion?: string;
  maxVersion?: string;
};

const compareVersions = (version1: string, version2: string): number | null => {
  const v1 = semver.coerce(version1);
  const v2 = semver.coerce(version2);

  if (!v1 || !v2) {
    logger.warn('Invalid version format in feature flag comparison', {
      category: 'config',
      component: 'FeatureFlagsService',
      operation: 'compareVersions',
      version1,
      version2,
    });
    return null;
  }

  return semver.compare(v1, v2);
};

export class FeatureFlagsService {
  private static instance: FeatureFlagsService;
  private flags: Readonly<FeatureFlags>;

  private constructor() {
    this.flags = featureFlags;
  }

  public static getInstance(): FeatureFlagsService {
    if (!FeatureFlagsService.instance) {
      FeatureFlagsService.instance = new FeatureFlagsService();
    }
    return FeatureFlagsService.instance;
  }

  public isFeatureEnabled(
    flag: FeatureFlagKey,
    portalVersion: PortalVersionInfo | null = null,
  ): boolean {
    const config = this.flags[flag];

    if (typeof config === 'boolean') {
      return config;
    }

    if (!config.enabled) {
      return false;
    }

    if (!portalVersion) {
      return config.enabled;
    }

    const currentVersion = `${portalVersion.major}.${portalVersion.minor}.${portalVersion.patch}`;

    const featureConfig = config as FeatureFlagConfig;

    if (featureConfig.minVersion) {
      const comparison = compareVersions(currentVersion, featureConfig.minVersion);
      if (comparison === null || comparison < 0) {
        return false;
      }
    }

    if (featureConfig.maxVersion) {
      const comparison = compareVersions(currentVersion, featureConfig.maxVersion);
      if (comparison === null || comparison > 0) {
        return false;
      }
    }

    return true;
  }
}

export const featureFlagsService = FeatureFlagsService.getInstance();

export { compareVersions };
