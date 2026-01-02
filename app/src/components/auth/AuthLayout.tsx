import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authLayoutStyle } from '@/styles/components';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  hasHeader?: boolean;
  titleTestID?: string;
  subtitleTestID?: string;
  logoTestID?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  hasHeader = false,
  titleTestID,
  subtitleTestID,
  logoTestID,
}) => {
  const containerStyle = hasHeader ? [styles.container, { paddingTop: 0 }] : styles.container;

  const logoSectionStyle = hasHeader ? [styles.logoSection, { paddingTop: 0 }] : styles.logoSection;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={containerStyle}>
        <View style={styles.content}>
          <View style={logoSectionStyle}>
            <Image
              testID={logoTestID}
              source={require('@assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          {title && (
            <Text testID={titleTestID} style={styles.title}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text testID={subtitleTestID} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}

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
