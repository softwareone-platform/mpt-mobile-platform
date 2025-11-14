import { Color, BorderRadius, Spacing, Typography } from '../tokens';

export const inputStyle = {
	container: {
		borderWidth: 1,
		borderColor: Color.gray.gray4,
		borderRadius: BorderRadius.sm,
		backgroundColor: Color.brand.white,
		paddingHorizontal: Spacing.spacing2,
		paddingVertical: Spacing.spacing2,
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
		borderWidth: 1,
		borderColor: Color.brand.white,
		borderRadius: BorderRadius.sm,
		backgroundColor: Color.brand.white,
		paddingHorizontal: Spacing.spacing2,
		paddingVertical: Spacing.spacing2,
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
} as const;
