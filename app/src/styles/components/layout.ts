import { Color, Spacing, Typography } from '../tokens';

export const layoutStyle = {
	authSafeArea: {
		flex: 1,
		backgroundColor: Color.brand.white,
	},
	authContainer: {
		flex: 1,
		paddingHorizontal: Spacing.spacing3,
	},
	authLogoSection: {
		alignItems: 'center' as const,
		paddingBottom: Spacing.spacing2,
	},
	authLogo: {
		width: 120,
		height: 120,
	},
	authContent: {
		flex: 1,
		justifyContent: 'center' as const,
	},
	authTitle: {
		fontSize: Typography.fontSize.font7,
		fontWeight: Typography.fontWeight.bold,
		color: Color.brand.type,
		textAlign: 'center' as const,
		marginBottom: Spacing.spacing2,
	},
	authSubtitle: {
		fontSize: Typography.fontSize.font3,
		color: Color.gray.gray5,
		textAlign: 'center' as const,
		lineHeight: Typography.fontSize.font3 * Typography.lineHeight.relaxed,
		marginBottom: Spacing.spacing10,
	},
	authFooter: {
		flexDirection: 'row' as const,
		justifyContent: 'center' as const,
		alignItems: 'center' as const,
		paddingBottom: Spacing.spacing4,
	},
	authFooterText: {
		fontSize: Typography.fontSize.font1,
		color: Color.gray.gray4,
		fontWeight: Typography.fontWeight.regular,
	},
	authFooterDivider: {
		fontSize: Typography.fontSize.font1,
		color: Color.gray.gray4,
		fontWeight: Typography.fontWeight.regular,
	},
} as const;