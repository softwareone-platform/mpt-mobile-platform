import { Color, Spacing, Typography } from '../tokens';

export const otpVerificationScreenStyle = {
    form: {
        width: '100%' as const,
    },
    otpContainer: {
        marginBottom: Spacing.spacing4,
        alignItems: 'center' as const,
    },
    errorText: {
        color: Color.brand.danger,
        fontSize: Typography.fontSize.font2,
        fontWeight: Typography.fontWeight.regular,
        marginTop: Spacing.spacing1,
        textAlign: 'center' as const,
    },
    changeEmailButton: {
        marginTop: Spacing.spacing2,
    },
    resendSection: {
        marginTop: Spacing.spacing3,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flexWrap: 'wrap' as const,
    },
    resendText: {
        fontSize: Typography.fontSize.font2,
        color: Color.brand.primary,
        fontWeight: Typography.fontWeight.medium,
    },
    resendTextDisabled: {
        opacity: 0.5,
    },
};