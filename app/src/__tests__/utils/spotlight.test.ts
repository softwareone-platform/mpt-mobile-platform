import { 
  buildCategoryLookup,
  groupSpotlightData,
  orderSpotlightData,
  arrangeSpotlightData
} from '@/utils/spotlight';
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
  largeSpotlightData
} from '../__mocks__/utils/spotlight';

describe('spotlightUtils', () => {
  describe('buildCategoryLookup', () => {
    it('should build template for category lookup', () => {
      const lookup = buildCategoryLookup(categories);

      expect(lookup).toEqual(categoryLookup);
    });

    it('should allow duplicate templates, using the last category definition', () => {
      const lookup = buildCategoryLookup(duplicateCategories);
      
      expect(lookup.savedOrdersClient).toBe('cat2');
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
      expect(ordered.orders[0].id).toBe('1');
      expect(ordered.subscriptions.map(item => item.id)).toEqual(['2']);
    });

    it('should correctly handle single item per category', () => {
      const ordered = orderSpotlightData(groupedSpotlightDataSingleItemPerCategory, categories);
      expect(Object.keys(ordered)).toEqual(['orders', 'subscriptions']);
      expect(ordered.orders[0].id).toBe('1');
      expect(ordered.subscriptions[0].id).toBe('2');
    });
  });

  describe('arrangeSpotlightData', () => {
    it('should group and order spotlight data correctly', () => {
      const arrangedData = arrangeSpotlightData(spotlightData, categories);

      expect(Object.keys(arrangedData)).toEqual(['orders', 'subscriptions']);
      expect(arrangedData.orders).toHaveLength(2);
      expect(arrangedData.orders[0].id).toBe('1');
      expect(arrangedData.subscriptions).toHaveLength(1);
      expect(arrangedData.subscriptions.map(item => item.id)).toEqual(['2']);
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
});
