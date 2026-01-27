import { FeatureFlagsService } from '@/services/featureFlagsService';
import { PortalVersionInfo } from '@/services/portalVersionService';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  beforeEach(() => {
    service = FeatureFlagsService.getInstance();
  });

  it('returns boolean for simple flags', () => {
    const result = service.isFeatureEnabled('FEATURE_TEST');
    expect(typeof result).toBe('boolean');
  });

  it('enables feature when version meets minVersion requirement', () => {
    const version: PortalVersionInfo = { fullVersion: '5.0.0', majorVersion: 5 };
    service.setPortalVersion(version);
    expect(service.isFeatureEnabled('FEATURE_ACCOUNT_TABS')).toBe(true);
  });

  it('disables feature when version is below minVersion', () => {
    const version: PortalVersionInfo = { fullVersion: '4.0.0', majorVersion: 4 };
    service.setPortalVersion(version);
    expect(service.isFeatureEnabled('FEATURE_ACCOUNT_TABS')).toBe(false);
  });

  it('handles null portal version gracefully', () => {
    service.setPortalVersion(null);
    const result = service.isFeatureEnabled('FEATURE_ACCOUNT_TABS');
    expect(result).toBe(true);
  });

  it('maintains singleton pattern', () => {
    const instance1 = FeatureFlagsService.getInstance();
    const instance2 = FeatureFlagsService.getInstance();
    expect(instance1).toBe(instance2);
  });
});
