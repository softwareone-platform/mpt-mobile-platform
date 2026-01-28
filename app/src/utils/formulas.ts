/**
 * @param markup - Markup percentage
 * @returns calculated margin percentage rounded to 2 decimal places
 */
export const calculateMarginWithMarkup = (markup: number) => {
  return markup ? Math.round((markup / 100 / (markup / 100 + 1)) * 10000) / 100 : 0;
};
