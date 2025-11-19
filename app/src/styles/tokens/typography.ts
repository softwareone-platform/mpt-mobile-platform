/**
 * Design system theme configuration
 * Provides consistent typography values
 */

export const Typography = {
  fontSize: {
    font1: 12,
    font2: 14,
    font3: 16,
    font4: 18,
    font5: 20,
    font6: 24,
    font7: 32,
    font8: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    height2: 18,
  },
} as const;
