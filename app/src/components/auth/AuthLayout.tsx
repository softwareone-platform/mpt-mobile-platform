import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Color, Spacing, Typography } from '@/styles/tokens';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { t } = useTranslation();
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.logoSection}>
                        <Image
                            source={require('@assets/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

                    {children}
                </View>
                <View style={styles.footer}>
                    {/* TODO: Add links to Terms of Use and Privacy Policy */}
                    <Text style={styles.footerText}>{t('common.footer.termsOfUse')}</Text>
                    <Text style={styles.footerDivider}> | </Text>
                    <Text style={styles.footerText}>{t('common.footer.privacyPolicy')}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Color.brand.white,
    },
    container: {
        flex: 1,
        paddingHorizontal: Spacing.spacing3,
    },
    logoSection: {
        alignItems: 'center',
        paddingBottom: Spacing.spacing2,
    },
    logo: {
        width: 120,
        height: 120,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.fontSize.font7,
        fontWeight: Typography.fontWeight.bold,
        color: Color.brand.type,
        textAlign: 'center',
        marginBottom: Spacing.spacing2,
    },
    subtitle: {
        fontSize: Typography.fontSize.font3,
        color: Color.gray.gray5,
        textAlign: 'center',
        lineHeight: Typography.fontSize.font3 * Typography.lineHeight.relaxed,
        marginBottom: Spacing.spacing10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: Spacing.spacing4,
    },
    footerText: {
        fontSize: Typography.fontSize.font1,
        color: Color.gray.gray4,
        fontWeight: Typography.fontWeight.regular,
    },
    footerDivider: {
        fontSize: Typography.fontSize.font1,
        color: Color.gray.gray4,
        fontWeight: Typography.fontWeight.regular,
    },
});

export default AuthLayout;