/**
 * Color constants for the application
 * Define all colors here to avoid color literals in components
 */

export const Colors = {
  // Base colors
  white: '#fff',
  black: '#000',

  // Background colors
  background: '#fff',

  // Add more colors as needed
} as const;

export type ColorKey = keyof typeof Colors;
