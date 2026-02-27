import type {
  SpotlightCategory,
  SpotlightCategoryName,
  SpotlightTemplateName,
} from '../types/spotlight';

import { PAST, FUTURE, calculateRelativeDate } from './formatting';

import type { SpotlightItem, SpotlightItemWithDetails } from '@/types/api';

/**
 * Map of categories that should be merged into another category for display.
 * Items retain their individual navigation properties (detailsScreenName, listScreenName).
 */
const CATEGORY_MERGE_MAP: Partial<Record<SpotlightCategoryName, string>> = {
  allUsers: 'users',
};

const DAYS_AGO_REGEX = /\{(\d+) days ago\}/i;
const DAYS_FROM_NOW_REGEX = /\{(\d+) days from now\}/i;
const LIMIT_IN_QUERY_REGEX = /&limit=\d+$/;

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
        listScreenName: category.listScreenName,
        // stackRootName: category.stackRootName,
      }));
    }
  });

  return orderedData;
};

/**
 * Merge categories that should be displayed together under a single filter chip.
 * Items retain their individual navigation properties (detailsScreenName, listScreenName).
 * @param orderedData - ordered spotlight data by category
 * @returns merged spotlight data
 */
export const mergeCategories = (
  orderedData: Record<string, SpotlightItemWithDetails[]>,
): Record<string, SpotlightItemWithDetails[]> => {
  const mergedData: Record<string, SpotlightItemWithDetails[]> = {};

  Object.entries(orderedData).forEach(([key, items]) => {
    const targetKey = CATEGORY_MERGE_MAP[key as SpotlightCategoryName] ?? key;

    if (mergedData[targetKey]) {
      mergedData[targetKey] = [...mergedData[targetKey], ...items];
    } else {
      mergedData[targetKey] = [...items];
    }
  });

  return mergedData;
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
  const mergedData = mergeCategories(orderedData);

  return mergedData;
};

/**
 * function to get part of endpoint string containing query
 * @param endpoint - endpoint string to view all items in Spotlight
 * @returns query part of endpoint containing filter, order etc.
 */
export function getQueryFromEndpoint(endpoint: string): string {
  if (!endpoint?.trim()) {
    return '';
  }

  const firstAmpersandIndex = endpoint.indexOf('&');

  if (firstAmpersandIndex < 0) {
    return '';
  }

  return endpoint.slice(firstAmpersandIndex);
}

/**
 * function to remove limit from query string
 * @param query - query string to view all items in Spotlight
 * @returns query with limit removed and all other parts of string unchanged
 */
export function removeLimitFromQuery(query: string): string {
  if (!query?.trim()) {
    return '';
  }

  return query.replace(LIMIT_IN_QUERY_REGEX, '');
}

/**
 * function to replace rql date string with formatted date
 * @param query - query string to view all items in Spotlight
 * @returns query with formatted date that can be used in API call
 */
export const replaceSpotlightQueryDate = (query: string): string => {
  if (!query?.trim()) {
    return '';
  }

  const now = new Date();

  const daysAgoMatch = DAYS_AGO_REGEX.exec(query);
  const daysFromNowMatch = DAYS_FROM_NOW_REGEX.exec(query);

  if (daysAgoMatch) {
    const relativeDate = calculateRelativeDate(daysAgoMatch[1], now, PAST);

    return query.replace(daysAgoMatch[0], relativeDate);
  }

  if (daysFromNowMatch) {
    const relativeDate = calculateRelativeDate(daysFromNowMatch[1], now, FUTURE);

    return query.replace(daysFromNowMatch[0], relativeDate);
  }

  return query;
};

/**
 * Wrapper function to format endpoint, so it is suitable to use in API call
 * @param query - endpoint string to view all items in Spotlight
 * @returns query part of endpoint with limit removed and date formatted if applicable
 */
export const formatSpotlightQuery = (endpoint: string): string => {
  const query = getQueryFromEndpoint(endpoint);
  const queryNoLimit = removeLimitFromQuery(query);
  const formattedQuery = replaceSpotlightQueryDate(queryNoLimit);

  return formattedQuery;
};
