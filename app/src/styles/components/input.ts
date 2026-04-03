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

export const inputWithIconStyle = {
  container: {
    flexDirection: 'row',
    marginVertical: Spacing.spacing1,
  },
  input: {
    paddingLeft: Spacing.spacing2,
    flexShrink: 1,
  },
} as const;

export const inputSearchStyle = {
  containerMain: {
    flexDirection: 'row',
    gap: 16,
  },
  searchWrapper: {
    flexGrow: 1,
  },
  search: {
    borderRadius: BorderRadius.md,
    backgroundColor: Color.fills.tertiary,
    paddingLeft: ICON_OFFSET_HORIZONTAL,
    paddingRight: ICON_OFFSET_HORIZONTAL,
    paddingVertical: Spacing.spacing1,
    fontSize: Typography.fontSize.font3,
  },
  searchIconColor: Color.gray.gray4,
  placeholderTextColor: Color.gray.gray3,
  leftIcon: {
    position: 'absolute',
    left: 8,
    top: 6,
  },
  rightIcon: {
    position: 'absolute',
    right: 8,
    top: 6,
  },
  text: {
    fontSize: Typography.fontSize.font3,
    color: Color.brand.type,
    fontWeight: Typography.fontWeight.regular,
  },
  cancel: {
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: Typography.fontSize.font3,
  },
  cancelTextDisabled: {
    color: Color.gray.gray4,
  },
} as const;
