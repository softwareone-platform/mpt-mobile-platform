import { processRqlQuery } from '@/utils/rqlQuery';

const ACCOUNT_ID = 'ACC-001';
const FIXED_NOW = new Date('2024-06-15T10:30:00.000Z');

describe('processRqlQuery', () => {
  describe('invalid inputs', () => {
    it('returns valid false for empty string', () => {
      const result = processRqlQuery('');

      expect(result).toEqual({ valid: false, query: '' });
    });

    it('returns valid false for whitespace-only string', () => {
      const result = processRqlQuery('   ');

      expect(result).toEqual({ valid: false, query: '   ' });
    });

    it('returns valid false when query contains {my account} but no accountId is provided', () => {
      const result = processRqlQuery('eq(account,{my account})', undefined, FIXED_NOW);

      expect(result).toEqual({ valid: false, query: 'eq(account,{my account})' });
    });
  });

  describe('plain queries without placeholders', () => {
    it('returns the query unchanged when no placeholders are present', () => {
      const result = processRqlQuery('eq(status,active)', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'eq(status,active)' });
    });
  });

  describe('{my account} placeholder', () => {
    it('replaces {my account} with the provided accountId', () => {
      const result = processRqlQuery('eq(account,{my account})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: `eq(account,${ACCOUNT_ID})` });
    });

    it('replaces {my account} case-insensitively', () => {
      const result = processRqlQuery('eq(account,{MY ACCOUNT})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: `eq(account,${ACCOUNT_ID})` });
    });
  });

  describe('{N days ago} placeholder', () => {
    it('replaces {N days ago} with midnight UTC date N days before now', () => {
      const result = processRqlQuery('ge(created,{7 days ago})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'ge(created,2024-06-08T00:00:00.000Z)' });
    });

    it('replaces {1 days ago} with midnight UTC of yesterday', () => {
      const result = processRqlQuery('ge(created,{1 days ago})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'ge(created,2024-06-14T00:00:00.000Z)' });
    });

    it('replaces {0 days ago} with midnight UTC of today', () => {
      const result = processRqlQuery('ge(created,{0 days ago})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'ge(created,2024-06-15T00:00:00.000Z)' });
    });

    it('replaces {N days ago} case-insensitively', () => {
      const result = processRqlQuery('ge(created,{7 DAYS AGO})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'ge(created,2024-06-08T00:00:00.000Z)' });
    });
  });

  describe('{N days from now} placeholder', () => {
    it('replaces {N days from now} with midnight UTC of day after N days from now', () => {
      const result = processRqlQuery('le(expires,{7 days from now})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'le(expires,2024-06-23T00:00:00.000Z)' });
    });

    it('replaces {1 days from now} with midnight UTC 2 days from now', () => {
      const result = processRqlQuery('le(expires,{1 days from now})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'le(expires,2024-06-17T00:00:00.000Z)' });
    });

    it('replaces {0 days from now} with midnight UTC of tomorrow', () => {
      const result = processRqlQuery('le(expires,{0 days from now})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'le(expires,2024-06-16T00:00:00.000Z)' });
    });

    it('replaces {N days from now} case-insensitively', () => {
      const result = processRqlQuery('le(expires,{7 DAYS FROM NOW})', ACCOUNT_ID, FIXED_NOW);

      expect(result).toEqual({ valid: true, query: 'le(expires,2024-06-23T00:00:00.000Z)' });
    });
  });

  describe('combined placeholders', () => {
    it('replaces both {my account} and {N days ago} in the same query', () => {
      const result = processRqlQuery(
        'and(eq(account,{my account}),ge(created,{30 days ago}))',
        ACCOUNT_ID,
        FIXED_NOW,
      );

      expect(result).toEqual({
        valid: true,
        query: `and(eq(account,${ACCOUNT_ID}),ge(created,2024-05-16T00:00:00.000Z))`,
      });
    });

    it('replaces both {N days ago} and {N days from now} in the same query', () => {
      const result = processRqlQuery(
        'and(ge(created,{7 days ago}),le(expires,{14 days from now}))',
        ACCOUNT_ID,
        FIXED_NOW,
      );

      expect(result).toEqual({
        valid: true,
        query: 'and(ge(created,2024-06-08T00:00:00.000Z),le(expires,2024-06-30T00:00:00.000Z))',
      });
    });
  });

  describe('default now parameter', () => {
    it('uses current date when now is not provided', () => {
      const before = new Date();
      const result = processRqlQuery('ge(created,{0 days ago})');
      const after = new Date();

      expect(result.valid).toBe(true);
      const dateStr = result.query.replace('ge(created,', '').replace(')', '');
      const resultDate = new Date(dateStr);
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(
        new Date(
          Date.UTC(before.getUTCFullYear(), before.getUTCMonth(), before.getUTCDate()),
        ).getTime(),
      );
      expect(resultDate.getTime()).toBeLessThanOrEqual(
        new Date(
          Date.UTC(after.getUTCFullYear(), after.getUTCMonth(), after.getUTCDate()),
        ).getTime(),
      );
    });
  });
});
