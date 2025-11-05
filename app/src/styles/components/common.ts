import { Color, Spacing } from '../tokens';

export const screenStyle = {
  container: {
    flex: 1,
    backgroundColor: Color.brand.white,
  },
  padding: {
    paddingHorizontal: Spacing.spacing2,
  },
} as const;
