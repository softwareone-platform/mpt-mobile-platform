import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { layoutStyle } from '@/styles/components';

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
    safeArea: layoutStyle.authSafeArea,
    container: layoutStyle.authContainer,
    logoSection: layoutStyle.authLogoSection,
    logo: layoutStyle.authLogo,
    content: layoutStyle.authContent,
    title: layoutStyle.authTitle,
    subtitle: layoutStyle.authSubtitle,
    footer: layoutStyle.authFooter,
    footerText: layoutStyle.authFooterText,
    footerDivider: layoutStyle.authFooterDivider,
});

export default AuthLayout;