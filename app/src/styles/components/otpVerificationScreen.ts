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
        alignItems: 'flex-start' as const,
    },
    resendText: {
        fontSize: Typography.fontSize.font2,
        fontWeight: Typography.fontWeight.regular,
        color: Color.brand.type,
    },
    resendTextActive: {
        color: Color.brand.primary,
    },
    footer: {
        marginTop: 'auto' as const,
        paddingBottom: Spacing.spacing10,
    },
    footerText: {
        fontSize: Typography.fontSize.font2,
        color: Color.brand.primary,
        fontWeight: Typography.fontWeight.regular,
    },
    footerSeparator: {
        color: Color.brand.primary,
    },
    contentWrapper: {
        flex: 1,
    },
    footerLinksContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
};

