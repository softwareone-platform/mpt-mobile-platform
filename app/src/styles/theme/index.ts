import { Color, Spacing, Typography, BorderRadius, Shadow } from '../tokens';

export const Theme = {
  color: Color,
  spacing: Spacing,
  typography: Typography,
  borderRadius: BorderRadius,
  shadow: Shadow,
} as const;

export default Theme;
