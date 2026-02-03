import { FeatureFlagsService, compareVersions } from '@/services/featureFlagsService';
import { PortalVersionInfo } from '@/services/portalVersionService';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  beforeEach(() => {
    service = FeatureFlagsService.getInstance();
  });

  it('enables feature when version meets minVersion requirement', () => {
    const version: PortalVersionInfo = {
      fullVersion: '5.0.0',
      major: 5,
      minor: 0,
      patch: 0,
    };
    expect(service.isFeatureEnabled('FEATURE_ACCOUNT_TABS', version)).toBe(true);
  });

  it('disables feature when version is below minVersion', () => {
    const version: PortalVersionInfo = {
      fullVersion: '4.0.0',
      major: 4,
      minor: 0,
      patch: 0,
    };
    expect(service.isFeatureEnabled('FEATURE_ACCOUNT_TABS', version)).toBe(false);
  });

  it('enables feature when version exactly matches minVersion', () => {
    const version: PortalVersionInfo = {
      fullVersion: '5.0.0',
      major: 5,
      minor: 0,
      patch: 0,
    };
    expect(service.isFeatureEnabled('FEATURE_ACCOUNT_TABS', version)).toBe(true);
  });

  it('compares patch versions correctly', () => {
    const version: PortalVersionInfo = {
      fullVersion: '5.0.1',
      major: 5,
      minor: 0,
      patch: 1,
    };
    expect(service.isFeatureEnabled('FEATURE_ACCOUNT_TABS', version)).toBe(true);
  });

  it('handles null portal version gracefully', () => {
    const result = service.isFeatureEnabled('FEATURE_ACCOUNT_TABS', null);
    expect(result).toBe(true);
  });

  it('maintains singleton pattern', () => {
    const instance1 = FeatureFlagsService.getInstance();
    const instance2 = FeatureFlagsService.getInstance();
    expect(instance1).toBe(instance2);
  });
});

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });

  it('returns negative when first version is lower', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
    expect(compareVersions('1.0.0', '1.1.0')).toBeLessThan(0);
    expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
  });

  it('returns positive when first version is higher', () => {
    expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.1.0', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
  });

  it('handles versions with different lengths', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0')).toBeGreaterThan(0);
    expect(compareVersions('1', '1.0.0')).toBe(0);
  });

  it('compares large version numbers correctly', () => {
    expect(compareVersions('4.0.1661', '4.0.1660')).toBeGreaterThan(0);
    expect(compareVersions('4.0.1661', '5.0.0')).toBeLessThan(0);
  });
});
