import type { SpotlightTemplateName } from '../types/spotlight';
import type { SpotlightItem } from '@/types/api';

/**
 * Build a lookup object, that maps spotlight template names to category names
 * @param categories - array of category objects
 * @returns lookup object
 */
export const buildCategoryLookup = (
  categories: Array<{ name: string; templates: SpotlightTemplateName[] }>
): Record<SpotlightTemplateName, string> => {
  const lookup: Record<SpotlightTemplateName, string> =
    {} as Record<SpotlightTemplateName, string>;

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
  templateLookup: Record<SpotlightTemplateName, string>
): Record<string, SpotlightItem[]> => {
  const groupedData: Record<string, SpotlightItem[]> = {};

  spotlightData.forEach((item) => {
    if (!item || item.total === 0) {
      return;
    }

    const template: string | undefined | null = item?.query?.template;

    if (template === undefined || template === null) {
      return;
    }

    const categoryName: string | undefined = templateLookup[template as SpotlightTemplateName];

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
  groupedData: Record<string, SpotlightItem[]>,
  categories: Array<{ name: string; templates: SpotlightTemplateName[] }>
): Record<string, SpotlightItem[]> => {
  const orderedData: Record<string, SpotlightItem[]> = {};

  categories.forEach((category) => {
    const items = groupedData[category.name];

    if (items !== undefined && items !== null) {
      orderedData[category.name] = items;
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
  categories: Array<{ name: string; templates: SpotlightTemplateName[] }>
): Record<string, SpotlightItem[]> => {
  const templateLookup = buildCategoryLookup(categories);
  const groupedData = groupSpotlightData(spotlightData, templateLookup);
  const orderedData = orderSpotlightData(groupedData, categories);

  return orderedData;
};
