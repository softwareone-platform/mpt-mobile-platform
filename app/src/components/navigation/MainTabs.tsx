import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import TabStack from './TabStack';

import DynamicIcon from '@/components/common/DynamicIcon';
import LinearGradientHorisontal from '@/components/common/LinearGradientHorisontal';
import { mainTabsData } from '@/constants/navigation';
import { Color, navigationStyle } from '@/styles';
import { TestIDs } from '@/utils/testID';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const item = mainTabsData.find((tab) => tab.name === route.name);
          if (!item) return null;

          return (
            <DynamicIcon
              name={item.icon}
              size={size}
              color={color}
              variant={focused ? 'filled' : 'outlined'}
            />
          );
        },
        tabBarActiveTintColor: Color.brand.primary,
        tabBarInactiveTintColor: Color.gray.gray4,
        tabBarStyle: styles.container,
        tabBarLabelStyle: styles.label,
        tabBarBackground: () => <LinearGradientHorisontal height={3} />,
        headerShown: false,
      })}
    >
      {mainTabsData.map((tab) => {
        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarLabel: t(`navigation.tabs.${tab.name}`),
              tabBarAccessibilityLabel: `${TestIDs.NAV_TAB_PREFIX}-${tab.name}`,
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                // Reset stack instantly to tab root to prevent flicker
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: tab.name, params: { screen: tab.stackRootName } }],
                  }),
                );
              },
            })}
          >
            {() => <TabStack tab={tab} />}
          </Tab.Screen>
        );
      })}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: navigationStyle.primary.container,
  label: navigationStyle.primary.label,
});

export default MainTabs;
