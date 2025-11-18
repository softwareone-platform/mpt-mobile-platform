import { Color, Spacing, Typography } from '../tokens';

export const otpVerificationScreenStyle = {
    form: {
        width: '100%',
    },
    otpContainer: {
        marginBottom: Spacing.spacing4,
        alignItems: 'center',
    },
    errorText: {
        color: Color.brand.danger,
        fontSize: Typography.fontSize.font2,
        fontWeight: Typography.fontWeight.regular,
        marginTop: Spacing.spacing1,
        textAlign: 'center',
    },
    resendSection: {
        marginTop: Spacing.spacing3,
        alignItems: 'center',
    },
    didntGetCodeText: {
        fontSize: Typography.fontSize.font2,
        color: Color.gray.gray4,
        fontWeight: Typography.fontWeight.regular,
        marginBottom: Spacing.spacing1,
    },
    resendLink: {
        paddingVertical: Spacing.spacing1,
    },
    resendLinkDisabled: {
        opacity: 0.5,
    },
    resendText: {
        fontSize: Typography.fontSize.font2,
        color: Color.brand.primary,
        fontWeight: Typography.fontWeight.medium,
    },
    resendTextDisabled: {
        color: Color.gray.gray4,
    },
} as const;