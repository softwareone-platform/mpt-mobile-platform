import { canNavigateTo } from '@/utils/navigationPermissions';

describe('navigationPermissions', () => {
  describe('canNavigateTo', () => {
    it('should allow Operations to navigate to vendorAccount', () => {
      expect(canNavigateTo('vendorAccount', 'Operations')).toBe(true);
    });

    it('should deny Vendor to navigate to vendorAccount', () => {
      expect(canNavigateTo('vendorAccount', 'Vendor')).toBe(false);
    });

    it('should allow Client to navigate to buyer', () => {
      expect(canNavigateTo('buyer', 'Client')).toBe(true);
    });

    it('should deny Vendor to navigate to clientAccount', () => {
      expect(canNavigateTo('clientAccount', 'Vendor')).toBe(false);
    });

    it('should deny undefined accountType', () => {
      expect(canNavigateTo('buyer', undefined)).toBe(false);
      expect(canNavigateTo('clientAccount', undefined)).toBe(false);
    });
  });
});
