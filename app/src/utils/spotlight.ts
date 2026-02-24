import type {
  SpotlightCategory,
  SpotlightCategoryName,
  SpotlightTemplateName,
} from '../types/spotlight';

import type { SpotlightItem, SpotlightItemWithDetails } from '@/types/api';

/**
 * Build a lookup object, that maps spotlight template names to category names
 * @param categories - array of category objects
 * @returns lookup object
 */
export const buildCategoryLookup = (
  categories: Array<SpotlightCategory>,
): Record<SpotlightTemplateName, SpotlightCategoryName> => {
  const lookup: Record<SpotlightTemplateName, SpotlightCategoryName> = {} as Record<
    SpotlightTemplateName,
    SpotlightCategoryName
  >;

  categories.forEach((category) => {
    category.templates.forEach((template) => {
      lookup[template] = category.name;
    });
  });

  return lookup;
};

/**
 * Group spotlight items by category
 * @param spotlightData - array of Spotlight Items in order returned by API
 * @param templateLookup - lookup object mapping spotlight template names to category names
 * @returns grouped spotlight data by category
 */
export const groupSpotlightData = (
  spotlightData: SpotlightItem[],
  templateLookup: Record<SpotlightTemplateName, SpotlightCategoryName>,
): Record<SpotlightCategoryName, SpotlightItem[]> => {
  const groupedData: Record<SpotlightCategoryName, SpotlightItem[]> = {} as Record<
    SpotlightCategoryName,
    SpotlightItem[]
  >;

  spotlightData.forEach((item) => {
    if (!item || item.total === 0) {
      return;
    }

    const template: string | undefined | null = item?.query?.template;

    if (template === undefined || template === null) {
      return;
    }

    const categoryName: SpotlightCategoryName | undefined =
      templateLookup[template as SpotlightTemplateName];

    if (categoryName === undefined || categoryName === null) {
      return;
    }

    if (groupedData[categoryName] === undefined) {
      groupedData[categoryName] = [];
    }

    groupedData[categoryName].push(item);
  });

  return groupedData;
};

/**
 * Order spotlight items according to category order
 * @param groupedData - grouped spotlight data by category
 * @param categories - array of category objects
 * @returns spotlight data ordered same as categories object order
 */
export const orderSpotlightData = (
  groupedData: Record<SpotlightCategoryName, SpotlightItem[]>,
  categories: Array<SpotlightCategory>,
): Record<string, SpotlightItemWithDetails[]> => {
  const orderedData: Record<string, SpotlightItemWithDetails[]> = {};

  categories.forEach((category) => {
    const items = groupedData[category.name];

    if (items && items.length > 0) {
      orderedData[category.name] = items.map((item) => ({
        ...item,
        detailsScreenName: category.detailsScreenName,
      }));
    }
  });

  return orderedData;
};

/**
 * Wrapper function to arrange spotlight data
 * @param spotlightData - array of Spotlight Items in order returned by API
 * @param categories - array of category objects
 * @returns arranged spotlight data
 */
export const arrangeSpotlightData = (
  spotlightData: SpotlightItem[],
  categories: Array<SpotlightCategory>,
): Record<string, SpotlightItemWithDetails[]> => {
  const templateLookup = buildCategoryLookup(categories);
  const groupedData = groupSpotlightData(spotlightData, templateLookup);
  const orderedData = orderSpotlightData(groupedData, categories);

  return orderedData;
};
