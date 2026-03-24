import { Color, BorderRadius, Spacing, Typography } from '../tokens';

const ICON_OFFSET_HORIZONTAL = 36;

export const inputStyle = {
  container: {
    borderWidth: 1,
    borderColor: Color.gray.gray4,
    borderRadius: BorderRadius.xl,
    backgroundColor: Color.brand.white,
    paddingHorizontal: Spacing.spacing2,
    paddingVertical: Spacing.spacing1,
  },
  transparent: {
    borderWidth: 1,
    borderColor: Color.gray.gray4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.spacing2,
    paddingVertical: Spacing.spacing2,
  },
  search: {
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Color.fills.tertiary,
    paddingLeft: ICON_OFFSET_HORIZONTAL,
    paddingRight: ICON_OFFSET_HORIZONTAL,
    fontSize: Typography.fontSize.font3,
  },
  searchIconColor: Color.gray.gray4,
  searchTextPlaceholderColor: Color.gray.gray3,
  leftIcon: {
    position: 'absolute',
    left: 8,
    top: 8,
  },
  rightIcon: {
    position: 'absolute',
    right: 8,
    top: 10,
  },
  text: {
    fontSize: Typography.fontSize.font3,
    color: Color.brand.type,
    fontWeight: Typography.fontWeight.regular,
  },
  placeholder: {
    color: Color.gray.gray3,
  },
  authContainer: {
    marginBottom: Spacing.spacing2,
  },
  authInput: {
    height: 52,
    borderColor: Color.gray.gray3,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.spacing2,
    fontSize: Typography.fontSize.font3,
    color: Color.brand.type,
    backgroundColor: Color.gray.gray2,
  },
  authInputError: {
    borderColor: Color.brand.danger,
  },
  authErrorText: {
    fontSize: Typography.fontSize.font1,
    color: Color.brand.danger,
    marginTop: Spacing.spacing1,
  },
  inputFullWidth: {
    flexGrow: 1,
  },
  inputChat: {
    maxHeight: 100,
  },
} as const;
