import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Color, Spacing } from '@/styles/tokens';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.logoSection}>
                    <Image
                        source={require('@assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.content}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

                    {children}
                </View>
                <View style={styles.footer}>
                    {/* TODO: Add links to Terms of Use and Privacy Policy */}
                    <Text style={styles.footerText}>Terms of use</Text>
                    <Text style={styles.footerDivider}> | </Text>
                    <Text style={styles.footerText}>Privacy Policy</Text>
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
        paddingTop: Spacing.spacing6,
        paddingBottom: Spacing.spacing8,
    },
    logo: {
        width: 100,
        height: 100,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Color.brand.type,
        textAlign: 'center',
        marginBottom: Spacing.spacing2,
    },
    subtitle: {
        fontSize: 16,
        color: Color.gray.gray5,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.spacing6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: Spacing.spacing4,
    },
    footerText: {
        fontSize: 14,
        color: Color.gray.gray4,
    },
    footerDivider: {
        fontSize: 14,
        color: Color.gray.gray4,
    },
});

export default AuthLayout;