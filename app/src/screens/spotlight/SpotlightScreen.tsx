import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Color } from '@/styles/tokens';

const SpotlightScreen = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View>
      <Text>Spotlight Screen</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        {/* TODO: to be moved to profile once ready */}
        <Text style={styles.buttonText}>Logout- dev purpose only</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Color.brand.danger,
    padding: 12,
    margin: 16,
  },
  buttonText: {
    color: Color.brand.white,
    textAlign: 'center',
  },
});

export default SpotlightScreen;
