import { BorderRadius, Color, Typography } from '../tokens';

//TODO: Restyle after Figma design of OTP input is ready
export const otpInputStyle = {
    container: {
        alignItems: 'center',
        position: 'relative',
    },
    digitsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 300,
    },
    digitContainer: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: Color.gray.gray3,
        borderRadius: BorderRadius.md,
        backgroundColor: Color.brand.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    digitContainerFilled: {
        borderColor: Color.brand.primary,
        backgroundColor: Color.alerts.info1,
    },
    digitContainerActive: {
        borderColor: Color.brand.primary,
        borderWidth: 2,
    },
    digitText: {
        fontSize: Typography.fontSize.font6,
        fontWeight: Typography.fontWeight.bold,
        color: Color.brand.type,
        textAlign: 'center',
    },
    digitTextPlaceholder: {
        color: Color.gray.gray3,
        fontWeight: Typography.fontWeight.regular,
    },
    hiddenInput: {
        position: 'absolute',
        width: 0,
        height: 0,
        opacity: 0,
    },
} as const;
