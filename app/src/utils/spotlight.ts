import type {
  SpotlightCategory,
  SpotlightCategoryName,
  SpotlightTemplateName,
  SpotlightTemplateConfig,
} from '../types/spotlight';

import { PAST, FUTURE, calculateRelativeDate } from './formatting';

import type { SpotlightItem, SpotlightItemWithDetails } from '@/types/api';

const DAYS_AGO_REGEX = /\{(\d+) days ago\}/i;
const DAYS_FROM_NOW_REGEX = /\{(\d+) days from now\}/i;
const LIMIT_IN_QUERY_REGEX = /&limit=\d+$/;
const CURRENT_USER_REGEX = /\{current user\}/gi;

/**
 * Group spotlight items by category
 * @param spotlightData - array of Spotlight Items in order returned by API
 * @param templateLookup - lookup object mapping spotlight template names to category names
 * @returns grouped spotlight data by category
 */
export const groupSpotlightData = (
  spotlightData: SpotlightItem[],
  templateLookup: Record<SpotlightTemplateName, SpotlightTemplateConfig>,
): Record<SpotlightCategoryName, SpotlightItemWithDetails[]> => {
  const groupedData: Record<SpotlightCategoryName, SpotlightItemWithDetails[]> = {} as Record<
    SpotlightCategoryName,
    SpotlightItemWithDetails[]
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
      templateLookup[template as SpotlightTemplateName]?.category;

    if (categoryName === undefined || categoryName === null) {
      return;
    }

    if (groupedData[categoryName] === undefined) {
      groupedData[categoryName] = [];
    }

    groupedData[categoryName].push({
      ...item,
      listScreenName: templateLookup[template as SpotlightTemplateName].listScreenName,
      detailsScreenName: templateLookup[template as SpotlightTemplateName].detailsScreenName,
    });
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
  groupedData: Record<SpotlightCategoryName, SpotlightItemWithDetails[]>,
  categories: Array<SpotlightCategory>,
): Record<string, SpotlightItemWithDetails[]> => {
  const orderedData: Record<string, SpotlightItemWithDetails[]> = {};

  categories.forEach((category) => {
    const items = groupedData[category.name];
    if (!items || items.length === 0) return;

    const orderedItems: SpotlightItemWithDetails[] = [];

    category.templates.forEach((template) => {
      const matchingItem = items.find((item) => item.query?.template === template);

      if (matchingItem) {
        orderedItems.push(matchingItem);
      }
    });

    if (orderedItems.length > 0) {
      orderedData[category.name] = orderedItems;
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
  templateLookup: Record<SpotlightTemplateName, SpotlightTemplateConfig>,
): Record<string, SpotlightItemWithDetails[]> => {
  const groupedData = groupSpotlightData(spotlightData, templateLookup);
  const orderedData = orderSpotlightData(groupedData, categories);

  return orderedData;
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
 * Replace {current user} token in query with the actual user ID
 * @param query - query string
 * @param userId - current user ID to substitute
 * @returns query with {current user} replaced, or original query if userId is not provided
 */
export const replaceCurrentUser = (query: string, userId: string | undefined): string => {
  if (!query?.trim()) {
    return '';
  }

  if (!userId) {
    return query;
  }

  return query.replace(CURRENT_USER_REGEX, userId);
};

/**
 * Wrapper function to format endpoint, so it is suitable to use in API call
 * @param query - endpoint string to view all items in Spotlight
 * @param userId - current user ID used to resolve {current user} token
 * @returns query part of endpoint with limit removed, date formatted, and user token replaced if applicable
 */
export const formatSpotlightQuery = (endpoint: string, userId?: string): string => {
  const query = getQueryFromEndpoint(endpoint);
  const queryNoLimit = removeLimitFromQuery(query);
  const queryWithUser = replaceCurrentUser(queryNoLimit, userId);
  const formattedQuery = replaceSpotlightQueryDate(queryWithUser);

  return formattedQuery;
};
