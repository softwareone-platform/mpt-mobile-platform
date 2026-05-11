import { calculateMarginWithMarkup, calculateSumByPath } from '@/utils/formulas';

describe('calculateMarginWithMarkup', () => {
  it('should return 0 if markup is 0', () => {
    expect(calculateMarginWithMarkup(0)).toBe(0);
  });

  it('should return number less than 0 if markup is negative', () => {
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

describe('calculateSumByPath', () => {
  const items = [
    {
      attributes: {
        navision: {
          amountIncludingVat: 100,
        },
      },
    },
    {
      attributes: {
        navision: {
          amountIncludingVat: 200,
        },
      },
    },
    {
      attributes: {
        navision: {
          amountIncludingVat: 300,
        },
      },
    },
  ];

  it('should return correct sum for nested numeric values', () => {
    const expectedSum = 600;

    expect(calculateSumByPath(items, 'attributes.navision.amountIncludingVat')).toBe(expectedSum);
  });

  it('should return 0 for empty array', () => {
    expect(calculateSumByPath([], 'attributes.navision.amountIncludingVat')).toBe(0);
  });

  it('should return 0 if path does not exist', () => {
    expect(calculateSumByPath(items, 'attributes.invalid.amount')).toBe(0);
  });

  it('should ignore non-numeric values', () => {
    const itemsWithInvalidValues = [
      {
        attributes: {
          navision: {
            amountIncludingVat: 100,
          },
        },
      },
      {
        attributes: {
          navision: {
            amountIncludingVat: '200',
          },
        },
      },
      {
        attributes: {
          navision: {
            amountIncludingVat: null,
          },
        },
      },
    ];

    const expectedSum = 100;

    expect(
      calculateSumByPath(itemsWithInvalidValues, 'attributes.navision.amountIncludingVat'),
    ).toBe(expectedSum);
  });

  it('should handle negative values correctly', () => {
    const itemsWithNegativeValues = [
      {
        attributes: {
          navision: {
            amountIncludingVat: 100,
          },
        },
      },
      {
        attributes: {
          navision: {
            amountIncludingVat: -50,
          },
        },
      },
    ];

    const expectedSum = 50;

    expect(
      calculateSumByPath(itemsWithNegativeValues, 'attributes.navision.amountIncludingVat'),
    ).toBe(expectedSum);
  });

  it('should handle decimal values correctly', () => {
    const itemsWithDecimals = [
      {
        attributes: {
          navision: {
            amountIncludingVat: 10.5,
          },
        },
      },
      {
        attributes: {
          navision: {
            amountIncludingVat: 20.25,
          },
        },
      },
    ];

    const expectedSum = 30.75;

    expect(calculateSumByPath(itemsWithDecimals, 'attributes.navision.amountIncludingVat')).toBe(
      expectedSum,
    );
  });
});
