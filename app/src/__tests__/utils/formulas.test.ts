import { calculateMarginWithMarkup } from '@/utils/formulas';

describe('calculateMarginWithMarkup', () => {
  it('should return 0 if markup is 0', () => {
    expect(calculateMarginWithMarkup(0)).toBe(0);
  });

  it('should return 0 if markup is negative', () => {
    expect(calculateMarginWithMarkup(-10)).toBeLessThan(0);
  });

  it('should return correct margin for 25% markup', () => {
    const expectedMargin = 20;

    expect(calculateMarginWithMarkup(25)).toBe(expectedMargin);
  });

  it('should return correct margin for 100% markup', () => {
    const expectedMargin = 50;

    expect(calculateMarginWithMarkup(100)).toBe(expectedMargin);
  });

  it('should return correct margin for decimal value of markup - 33.33%', () => {
    const expectedMargin = 25;

    expect(calculateMarginWithMarkup(33.33)).toBe(expectedMargin);
  });

  it('should handle very small markup - 0.01%', () => {
    const expectedMargin = 0.01;

    expect(calculateMarginWithMarkup(0.01)).toBe(expectedMargin);
  });

  it('should handle large markup - 1000%', () => {
    const expectedMargin = 90.91;

    expect(calculateMarginWithMarkup(1000)).toBe(expectedMargin);
  });
});
