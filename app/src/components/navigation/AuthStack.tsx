import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '@/types/navigation';
import { WelcomeScreen, OTPVerificationScreen } from '@/screens/auth';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen 
                name="Welcome" 
                component={WelcomeScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen 
                name="OTPVerification" 
                component={OTPVerificationScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
        </Stack.Navigator>
    );
};

export default AuthStack;