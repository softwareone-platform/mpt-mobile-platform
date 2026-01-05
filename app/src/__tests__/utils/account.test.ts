import {
  accounts,
  accountsNoFavouritesNoTimestamps,
  accountsSomeMissingFields,
  accountsSomeInvalidTimestamps,
  accountsAllFavouritesFalse,
} from '../__mocks__/utils/account';

import { getFavouriteAccounts, getRecentAccounts, formatUserAccountsData } from '@/utils/account';

describe('account utils', () => {
  describe('getFavouriteAccounts', () => {
    it('returns only accounts that have favourite set to true', () => {
      const result = getFavouriteAccounts(accounts);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('4');
    });

    it('returns empty array when all accounts have favourites set to false', () => {
      const result = getFavouriteAccounts(accountsAllFavouritesFalse);

      expect(result).toEqual([]);
    });

    it('returns empty array when all accounts have no favourite field', () => {
      const result = getFavouriteAccounts(accountsNoFavouritesNoTimestamps);

      expect(result).toEqual([]);
    });

    it('handles missing favourite fields safely', () => {
      const result = getFavouriteAccounts(accountsSomeMissingFields);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });

    it('returns empty array for empty input', () => {
      const result = getFavouriteAccounts([]);

      expect(result).toEqual([]);
    });
  });

  describe('getRecentAccounts', () => {
    it('returns most recent accounts sorted by access date', () => {
      const result = getRecentAccounts(accounts, 10);

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('4');
      expect(result[2].id).toBe('2');
      expect(result[3].id).toBe('1');
    });

    it('handles missing audit.access.at field safely', () => {
      const result = getRecentAccounts(accountsSomeMissingFields, 10);

      expect(result).toHaveLength(4);
      expect(result[3].id).toBe('2');
    });

    it('handles mixed valid and invalid timestamps', () => {
      const result = getRecentAccounts(accountsSomeInvalidTimestamps, 10);

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('4');
      expect(result[2].id).toBe('1');
      expect(result[3].id).toBe('2');
    });

    it('limits results to maxRecentAccounts', () => {
      const result = getRecentAccounts(accounts, 1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('returns empty array for empty input', () => {
      expect(getRecentAccounts([], 5)).toEqual([]);
    });
  });

  describe('formatUserAccountsData', () => {
    it('returns all, favourites, and recent arrays', () => {
      const result = formatUserAccountsData(accounts, 2);

      expect(result.all).toHaveLength(4);
      expect(result.favourites).toHaveLength(2);
      expect(result.recent).toHaveLength(2);
    });

    it('returns empty arrays when input is empty', () => {
      const result = formatUserAccountsData([], 5);
      const expectedResult = {
        all: [],
        favourites: [],
        recent: [],
      };

      expect(result).toEqual(expectedResult);
    });

    it('does not mutate original input array', () => {
      const original = [...accounts];
      formatUserAccountsData(accounts, 2);

      expect(accounts).toEqual(original);
    });

    it('handles missing favourite and audit.access.at fields gracefully', () => {
      const result = formatUserAccountsData(accountsNoFavouritesNoTimestamps, 2);

      expect(result.all).toHaveLength(3);
      expect(result.favourites).toEqual([]);
      expect(result.recent).toHaveLength(2);
    });
  });
});
