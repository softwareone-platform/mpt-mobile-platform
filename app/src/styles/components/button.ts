import { Color, BorderRadius, Spacing, Shadow, Typography } from '../tokens';

export const buttonStyle = {
	common: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: BorderRadius.round,
		paddingVertical: Spacing.spacing2,
	},
	primaryLight: {
		backgroundColor: Color.brand.white,
		color: Color.brand.primary,
	},
	primaryLightText: {
		color: Color.brand.primary,
		fontSize: Typography.fontSize.font4,
		fontWeight: Typography.fontWeight.regular,
	},
	primary: {
		backgroundColor: Color.brand.primary,
		borderRadius: BorderRadius.xs,
		paddingVertical: Spacing.spacing2,
		paddingHorizontal: Spacing.spacing3,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		...Shadow.sm,
	},
	secondary: {
		backgroundColor: Color.alerts.info1,
		borderWidth: 1,
		borderColor: Color.alerts.info1,
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.spacing2,
		paddingHorizontal: Spacing.spacing3,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
	},
	authPrimary: {
		height: 48,
		borderRadius: BorderRadius.xl,
		justifyContent: 'center' as const,
		alignItems: 'center' as const,
		paddingHorizontal: Spacing.spacing3,
		backgroundColor: Color.brand.primary,
	},
	authPrimaryText: {
		fontSize: Typography.fontSize.font3,
		fontWeight: Typography.fontWeight.medium,
		textAlign: 'center' as const,
		color: Color.brand.white,
	},
	authSecondary: {
		height: 48,
		borderRadius: BorderRadius.xl,
		justifyContent: 'center' as const,
		alignItems: 'center' as const,
		paddingHorizontal: Spacing.spacing3,
		backgroundColor: Color.gray.gray1,
		borderWidth: 1,
		borderColor: Color.gray.gray3,
	},
	authSecondaryText: {
		fontSize: Typography.fontSize.font3,
		fontWeight: Typography.fontWeight.medium,
		textAlign: 'center' as const,
		color: Color.gray.gray5,
	},
	fullWidth: {
    width: '100%',
  },
} as const;
