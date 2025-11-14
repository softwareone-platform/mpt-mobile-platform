import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authLayoutStyle } from '@/styles/components';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
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
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: authLayoutStyle.safeArea,
    container: authLayoutStyle.container,
    logoSection: authLayoutStyle.logoSection,
    logo: authLayoutStyle.logo,
    content: authLayoutStyle.content,
    title: authLayoutStyle.title,
    subtitle: authLayoutStyle.subtitle,
});

export default AuthLayout;