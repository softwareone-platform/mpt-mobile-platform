import {
  categories,
  duplicateCategories,
  categoryLookup,
  spotlightData,
  spotlightDataNullItem,
  spotlightDataUndefinedItem,
  spotlightDataEmpty,
  spotlightDataZeroTotal,
  spotlightDataMissingQuery,
  spotlightDataMissingTemplate,
  spotlightDataUnknownTemplate,
  spotlightDataUndefinedTemplate,
  groupedSpotlightData,
  groupedSpotlightDataSingleItemPerCategory,
  largeSpotlightData,
} from '../__mocks__/utils/spotlight';

import { calculateRelativeDate, FUTURE, PAST } from '@/utils/formatting';
import {
  buildCategoryLookup,
  groupSpotlightData,
  orderSpotlightData,
  arrangeSpotlightData,
  mergeCategories,
  getQueryFromEndpoint,
  removeLimitFromQuery,
  replaceSpotlightQueryDate,
  formatSpotlightQuery,
} from '@/utils/spotlight';

describe('spotlightUtils', () => {
  describe('buildCategoryLookup', () => {
    it('should build template for category lookup', () => {
      const lookup = buildCategoryLookup(categories);

      expect(lookup).toEqual(categoryLookup);
    });

    it('should allow duplicate templates, using the last category definition', () => {
      const lookup = buildCategoryLookup(duplicateCategories);

      expect(lookup.savedOrdersClient).toBe('subscriptions');
    });
  });

  describe('groupSpotlightData', () => {
    it('should group spotlight items by category and omit items with total 0', () => {
      const groupedData = groupSpotlightData(spotlightData, categoryLookup);

      expect(groupedData).toEqual(groupedSpotlightData);
    });

    it('should ignore items with templates not found in lookup', () => {
      const groupedData = groupSpotlightData(spotlightDataUnknownTemplate, categoryLookup);

      expect(groupedData).toEqual(groupedSpotlightData);
    });

    it('should ignore items missing the query property', () => {
      const groupedData = groupSpotlightData(spotlightDataMissingQuery, categoryLookup);

      expect(groupedData).toEqual(groupedSpotlightData);
    });

    it('should ignore items with missing query.template property', () => {
      const groupedData = groupSpotlightData(spotlightDataMissingTemplate, categoryLookup);

      expect(groupedData).toEqual(groupedSpotlightData);
    });

    it('should ignore items with undefined query.template property', () => {
      const groupedData = groupSpotlightData(spotlightDataUndefinedTemplate, categoryLookup);

      expect(groupedData).toEqual(groupedSpotlightData);
    });

    it('should ignore items that are null', () => {
      const groupedData = groupSpotlightData(spotlightDataNullItem, categoryLookup);

      expect(groupedData).toEqual(groupedSpotlightData);
    });

    it('should ignore items that are undefined', () => {
      const groupedData = groupSpotlightData(spotlightDataUndefinedItem, categoryLookup);

      expect(groupedData).toEqual(groupedSpotlightData);
    });
    it('should return empty object when all items have total = 0', () => {
      const groupedData = groupSpotlightData(spotlightDataZeroTotal, categoryLookup);

      expect(groupedData).toEqual({});
    });

    it('should return empty object when spotlightData is empty', () => {
      const groupedData = groupSpotlightData(spotlightDataEmpty, categoryLookup);

      expect(groupedData).toEqual({});
    });
  });

  describe('orderSpotlightData', () => {
    it('should order grouped items according to categories order', () => {
      const ordered = orderSpotlightData(groupedSpotlightData, categories);

      expect(Object.keys(ordered)).toEqual(['orders', 'subscriptions']);
      expect(ordered.orders![0].id).toBe('1');
      expect(ordered.subscriptions!.map((item) => item.id)).toEqual(['2']);

      ordered.orders!.forEach((item) => {
        expect(item.detailsScreenName).toBe('orderDetails');
      });
      ordered.subscriptions!.forEach((item) => {
        expect(item.detailsScreenName).toBe('subscriptionDetails');
      });
    });

    it('should correctly handle single item per category', () => {
      const ordered = orderSpotlightData(groupedSpotlightDataSingleItemPerCategory, categories);
      expect(Object.keys(ordered)).toEqual(['orders', 'subscriptions']);
      expect(ordered.orders![0].id).toBe('1');
      expect(ordered.subscriptions[0].id).toBe('2');
      expect(ordered.orders![0].detailsScreenName).toBe('orderDetails');
      expect(ordered.subscriptions![0].detailsScreenName).toBe('subscriptionDetails');
      expect(ordered.orders![0].listScreenName).toBe('orders');
      expect(ordered.subscriptions![0].listScreenName).toBe('subscriptions');
    });
  });

  describe('arrangeSpotlightData', () => {
    it('should group and order spotlight data correctly', () => {
      const arrangedData = arrangeSpotlightData(spotlightData, categories);

      expect(Object.keys(arrangedData)).toEqual(['orders', 'subscriptions']);
      expect(arrangedData.orders).toHaveLength(2);
      expect(arrangedData.orders[0].id).toBe('1');
      expect(arrangedData.subscriptions).toHaveLength(1);
      expect(arrangedData.subscriptions.map((item) => item.id)).toEqual(['2']);

      arrangedData.orders.forEach((item) => {
        expect(item.detailsScreenName).toBe('orderDetails');
        expect(item.listScreenName).toBe('orders');
      });
      arrangedData.subscriptions.forEach((item) => {
        expect(item.detailsScreenName).toBe('subscriptionDetails');
        expect(item.listScreenName).toBe('subscriptions');
      });
    });

    it('should return empty object when spotlightData is empty', () => {
      const arrangedData = arrangeSpotlightData([], categories);

      expect(arrangedData).toEqual({});
    });

    it('should return empty object when all items have total = 0', () => {
      const arrangedData = arrangeSpotlightData(spotlightDataZeroTotal, categories);

      expect(arrangedData).toEqual({});
    });

    it('should return empty object when categories array is empty', () => {
      const arrangedData = arrangeSpotlightData(spotlightData, []);
      expect(arrangedData).toEqual({});
    });

    it('should handle a large dataset', () => {
      const arrangedData = arrangeSpotlightData(largeSpotlightData, categories);

      expect(arrangedData.orders.length).toBe(50);
      expect(arrangedData.subscriptions.length).toBe(50);
      expect(arrangedData.orders[0].id).toBe('1');
      expect(arrangedData.subscriptions[0].id).toBe('2');
    });
  });

  describe('mergeCategories', () => {
    it('should merge allUsers items into users group', () => {
      const input = {
        users: [
          { id: '1', detailsScreenName: 'userDetails', listScreenName: 'users' },
        ],
        allUsers: [
          { id: '2', detailsScreenName: 'userDetails', listScreenName: 'allUsers' },
        ],
      };

      const result = mergeCategories(input as Record<string, any>);

      expect(Object.keys(result)).toEqual(['users']);
      expect(result.users).toHaveLength(2);
      expect(result.users[0].listScreenName).toBe('users');
      expect(result.users[1].listScreenName).toBe('allUsers');
    });

    it('should keep allUsers items under users when users group does not exist', () => {
      const input = {
        allUsers: [
          { id: '1', detailsScreenName: 'userDetails', listScreenName: 'allUsers' },
        ],
      };

      const result = mergeCategories(input as Record<string, any>);

      expect(Object.keys(result)).toEqual(['users']);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].listScreenName).toBe('allUsers');
    });

    it('should not modify data when no mergeable categories exist', () => {
      const input = {
        orders: [{ id: '1' }],
        subscriptions: [{ id: '2' }],
      };

      const result = mergeCategories(input as Record<string, any>);

      expect(Object.keys(result)).toEqual(['orders', 'subscriptions']);
      expect(result.orders).toHaveLength(1);
      expect(result.subscriptions).toHaveLength(1);
    });

    it('should return empty object for empty input', () => {
      const result = mergeCategories({});

      expect(result).toEqual({});
    });
  });
});

describe('getQueryFromEndpoint', () => {
  it('should return empty string for empty or whitespace endpoint', () => {
    expect(getQueryFromEndpoint('')).toBe('');
    expect(getQueryFromEndpoint('   ')).toBe('');
  });

  it('should return empty string if no "&" present', () => {
    expect(getQueryFromEndpoint('/v1/items')).toBe('');
  });

  it('should return everything after first "&"', () => {
    const endpoint = '/v1/items?select=id,name&filter(status=Active)&limit=50';
    expect(getQueryFromEndpoint(endpoint)).toBe('&filter(status=Active)&limit=50');
  });
});

describe('removeLimitFromQuery', () => {
  it('should return empty string for empty or whitespace input', () => {
    expect(removeLimitFromQuery('')).toBe('');
    expect(removeLimitFromQuery('   ')).toBe('');
  });

  it('should remove "&limit=..." at the end', () => {
    const query = '&filter(status=Active)&order=name&limit=50';
    expect(removeLimitFromQuery(query)).toBe('&filter(status=Active)&order=name');
  });

  it('should leave query unchanged if no limit present', () => {
    const query = '&filter(status=Active)&order=name';
    expect(removeLimitFromQuery(query)).toBe(query);
  });
});

describe('replaceSpotlightQueryDate', () => {
  const now = new Date('2026-02-26T12:00:00Z'); // fixed date

  beforeAll(() => {
    jest.useFakeTimers({ now: now.getTime() });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return empty string for empty or whitespace query', () => {
    expect(replaceSpotlightQueryDate('')).toBe('');
    expect(replaceSpotlightQueryDate('   ')).toBe('');
  });

  it('should replace {N days ago} with correct past date', () => {
    const query = 'filter(created_at>{5 days ago})';
    const result = replaceSpotlightQueryDate(query);
    const expectedDate = calculateRelativeDate('5', now, PAST);
    expect(result).toBe(`filter(created_at>${expectedDate})`);
  });

  it('should replace {N days from now} with correct future date', () => {
    const query = 'filter(due_date<{10 days from now})';
    const result = replaceSpotlightQueryDate(query);
    const expectedDate = calculateRelativeDate('10', now, FUTURE);
    expect(result).toBe(`filter(due_date<${expectedDate})`);
  });

  it('should return original query if no match found', () => {
    const query = 'filter(status=Active)&order=name';
    expect(replaceSpotlightQueryDate(query)).toBe(query);
  });

  it('should handle malformed day string gracefully', () => {
    const query = 'filter(created_at>{abc days ago})';
    const result = replaceSpotlightQueryDate(query);
    expect(result).toBe('filter(created_at>{abc days ago})'); // calculateRelativeDate returns '' for invalid string
  });
});

describe('formatSpotlightQuery', () => {
  const now = new Date('2026-02-26T12:00:00Z'); // fixed date

  beforeAll(() => {
    jest.useFakeTimers({ now: now.getTime() });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return empty string if endpoint has no query', () => {
    expect(formatSpotlightQuery('/v1/items')).toBe('');
  });

  it('should remove limit from query and format date', () => {
    const endpoint = '/v1/items?select=id,name&filter(created_at>{5 days ago})&order=name&limit=50';
    const result = formatSpotlightQuery(endpoint);
    const expectedDate = calculateRelativeDate('5', now, PAST);
    expect(result).toBe(`&filter(created_at>${expectedDate})&order=name`);
  });

  it('should return empty string for empty endpoint', () => {
    expect(formatSpotlightQuery('')).toBe('');
    expect(formatSpotlightQuery('   ')).toBe('');
  });

  it('should leave query unchanged if no limit or date matches', () => {
    const endpoint = '/v1/items?select=id,name&filter(status=Active)&order=name';
    expect(formatSpotlightQuery(endpoint)).toBe('&filter(status=Active)&order=name');
  });

  it('should handle multiple edge cases combined', () => {
    const endpoint =
      '/v1/items?select=id,name&filter(created_at>{abc days ago})&order=name&limit=25';
    const result = formatSpotlightQuery(endpoint);
    expect(result).toBe('&filter(created_at>{abc days ago})&order=name');
  });
});
