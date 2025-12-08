import { Color, Spacing, Typography } from '../tokens';

export const screenStyle = {
  container: {
    flex: 1,
    backgroundColor: Color.brand.white,
  },
  padding: {
    paddingHorizontal: Spacing.spacing2,
  },
  containerMain: {
    padding: Spacing.spacing2,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.font2,
    textTransform: 'uppercase',
    color: Color.labels.secondary,
    marginBottom: Spacing.spacing1,
    marginLeft: Spacing.spacing2,
  },
} as const;
