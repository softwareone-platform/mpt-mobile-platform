import { getValueByPath } from '@/utils/list';

/**
 * @param markup - Markup percentage
 * @returns calculated margin percentage rounded to 2 decimal places
 */
export const calculateMarginWithMarkup = (markup: number) => {
  return markup ? Math.round((markup / 100 / (markup / 100 + 1)) * 10000) / 100 : 0;
};

/**
 * Calculates and returns sum of values in nested properties of the object
 * @param items - an array of objects, whose properties will be used in calculation
 * @param path - path to a property used in calculation - e.g. parent.child1.child2
 * @returns - sum of all values in items array for each given property
 */

export function calculateSumByPath<T>(items: T[], path: string): number {
  let total = 0;

  items.forEach((item) => {
    const value = getValueByPath(item as Record<string, unknown>, path);

    if (typeof value === 'number') {
      total += value;
    }
  });

  return total;
}
