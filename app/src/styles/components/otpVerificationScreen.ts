import { Color, Spacing, Typography } from '../tokens';

//TODO: Restyle after Figma design of OTP input is ready
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
    changeEmailButton: {
        marginTop: Spacing.spacing2,
    },
    resendSection: {
        marginTop: Spacing.spacing3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    didntGetCodeText: {
        fontSize: Typography.fontSize.font2,
        color: Color.gray.gray4,
        fontWeight: Typography.fontWeight.regular,
    },
    resendText: {
        fontSize: Typography.fontSize.font2,
        color: Color.brand.primary,
        fontWeight: Typography.fontWeight.medium,
    },
} as const;
