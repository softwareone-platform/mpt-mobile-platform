export const calculateMarginWithMarkup = (markup: number) => {
  return markup ? Math.round((markup / 100 / (markup / 100 + 1)) * 10000) / 100 : 0;
};
