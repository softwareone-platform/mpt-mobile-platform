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
  containerCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerFillScreen: {
    flexShrink: 1,
  },
  containerSpaceBetween: {
    flex: 1,
    justifyContent: 'space-between',
  },
  containerFlexStart: {
    justifyContent: 'flex-start',
  },
  contentFillContainer: {
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.font2,
    textTransform: 'uppercase',
    color: Color.labels.secondary,
    marginBottom: Spacing.spacing1,
    marginLeft: Spacing.spacing2,
  },
  footerContainer: {
    flexDirection: 'row',
    paddingVertical: Spacing.spacing2,
  },
  noPaddingTop: {
    paddingTop: 0,
  },
} as const;

export const spacingStyle = {
  marginLeft3: {
    marginLeft: Spacing.spacing3,
  },
  marginBottom4: {
    marginBottom: Spacing.spacing4,
  },
  marginTop1: {
    marginTop: Spacing.spacing1,
  },
  paddingVertical4: {
    paddingVertical: Spacing.spacing4,
  },
} as const;
