import { Color, BorderRadius, Spacing, Shadow } from '../tokens';

export const buttonStyle = {
	primary: {
		backgroundColor: Color.brand.primary, // swoPurple matching CommonButton
		borderRadius: BorderRadius.xs, // 5 as in Swift CommonButton
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
} as const;
