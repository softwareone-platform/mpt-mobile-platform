import { Color, BorderRadius, Spacing, Shadow, Typography } from '../tokens';

export const buttonStyle = {
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
} as const;
