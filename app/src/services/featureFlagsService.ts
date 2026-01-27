import { PortalVersionInfo } from './portalVersionService';

import featureFlags from '@/config/feature-flags/featureFlags.json';

export type FeatureFlags = typeof featureFlags;
export type FeatureFlagKey = keyof FeatureFlags;

export type FeatureFlagConfig = {
  enabled: boolean;
  minVersion?: number;
  maxVersion?: number;
};

export class FeatureFlagsService {
  private static instance: FeatureFlagsService;
  private flags: Readonly<FeatureFlags>;
  private portalVersion: PortalVersionInfo | null = null;

  private constructor() {
    this.flags = featureFlags;
  }

  public static getInstance(): FeatureFlagsService {
    if (!FeatureFlagsService.instance) {
      FeatureFlagsService.instance = new FeatureFlagsService();
    }
    return FeatureFlagsService.instance;
  }

  public setPortalVersion(version: PortalVersionInfo | null): void {
    this.portalVersion = version;
  }

  public isFeatureEnabled(flag: FeatureFlagKey): boolean {
    const config = this.flags[flag];

    if (typeof config === 'boolean') {
      return config;
    }

    if (!config.enabled) {
      return false;
    }

    if (!this.portalVersion) {
      return config.enabled;
    }

    const currentVersion = this.portalVersion.majorVersion;

    if (config.minVersion !== undefined && currentVersion < config.minVersion) {
      return false;
    }

    if (
      'maxVersion' in config &&
      typeof config.maxVersion === 'number' &&
      currentVersion > config.maxVersion
    ) {
      return false;
    }

    return true;
  }
}

export const featureFlagsService = FeatureFlagsService.getInstance();
