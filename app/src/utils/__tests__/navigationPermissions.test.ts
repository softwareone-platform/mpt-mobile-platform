import { canNavigateTo } from '@/utils/navigationPermissions';

describe('canNavigateTo', () => {
  describe('licensee', () => {
    it('returns true for Client', () => {
      expect(canNavigateTo('licensee', 'Client')).toBe(true);
    });

    it('returns true for Operations', () => {
      expect(canNavigateTo('licensee', 'Operations')).toBe(true);
    });

    it('returns false for Vendor', () => {
      expect(canNavigateTo('licensee', 'Vendor')).toBe(false);
    });
  });
});
