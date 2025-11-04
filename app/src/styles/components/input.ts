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
} as const;
