import { BorderRadius, Color, Typography } from '../tokens';

export const otpInputStyle = {
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  digitsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitContainer: {
    width: 39,
    height: 36,
    borderWidth: 1,
    borderColor: Color.gray.gray3,
    borderRadius: BorderRadius.md,
    backgroundColor: Color.brand.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  digitContainerFilled: {
    borderColor: Color.brand.primary,
    backgroundColor: Color.alerts.info1,
  },
  digitContainerActive: {
    borderColor: Color.brand.primary,
    borderWidth: 2,
  },
  digitText: {
    fontSize: Typography.fontSize.font6,
    fontWeight: Typography.fontWeight.bold,
    color: Color.brand.type,
    textAlign: 'center',
  },
  digitTextPlaceholder: {
    color: Color.gray.gray3,
    fontWeight: Typography.fontWeight.regular,
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  digitContainerGroupGap: {
    marginRight: 24,
  },
} as const;
