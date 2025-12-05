import { 
  buildCategoryLookup,
  groupSpotlightData,
  orderSpotlightData,
  arrangeSpotlightData
} from '@/utils/spotlight';
import { 
  categories, 
  spotlightData,
  spotlightItem1,
  spotlightItem2,
  spotlightItem4,
  categoryLookup
} from '../__mocks__/utils/spotlight';

describe('spotlightUtils', () => {

  describe('buildKeyLookup', () => {
    it('should build template for category lookup', () => {
      const lookup = buildCategoryLookup(categories);
      expect(lookup).toEqual(categoryLookup);
    });
  });

  describe('groupSpotlightData', () => {
    it('should group spotlight items by category and omit items with total 0', () => {
      const lookup = buildCategoryLookup(categories);
      const grouped = groupSpotlightData(spotlightData, lookup);

      expect(grouped).toEqual({
        orders: [spotlightItem1],
        subscriptions: [spotlightItem2, spotlightItem4],
      });
    });
  });

  describe('orderSpotlightData', () => {
    it('should order grouped items according to categories order', () => {
      const lookup = buildCategoryLookup(categories);
      const grouped = groupSpotlightData(spotlightData, lookup);
      const ordered = orderSpotlightData(grouped, categories);

      expect(Object.keys(ordered)).toEqual(['orders', 'subscriptions']);
      expect(ordered.orders[0].id).toBe('1');
      expect(ordered.subscriptions.map(item => item.id)).toEqual(['2', '4']);
    });
  });

  describe('arrangeSpotlightData', () => {
    it('should group and order spotlight data correctly', () => {
      const arranged = arrangeSpotlightData(spotlightData, categories);

      expect(Object.keys(arranged)).toEqual(['orders', 'subscriptions']);
      expect(arranged.orders).toHaveLength(1);
      expect(arranged.orders[0].id).toBe('1');
      expect(arranged.subscriptions).toHaveLength(2);
      expect(arranged.subscriptions.map(item => item.id)).toEqual(['2', '4']);
    });
  });
});
