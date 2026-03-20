import { BorderRadius, Color, Spacing } from '../tokens';

export const bottomSheetStyle = {
  backdrop: {
    position: 'absolute',
    left: Spacing.spacing0,
    right: Spacing.spacing0,
    top: Spacing.spacing0,
    bottom: Spacing.spacing0,
    backgroundColor: Color.fills.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: Spacing.spacing0,
    width: '100%',
    backgroundColor: Color.brand.white,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    paddingHorizontal: Spacing.spacing2,
    paddingBottom: Spacing.spacing2,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: BorderRadius.xxs,
    backgroundColor: Color.gray.gray3,
    alignSelf: 'center',
    marginTop: Spacing.spacingSmall6,
  },
} as const;
