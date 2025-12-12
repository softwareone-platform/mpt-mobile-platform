import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import DynamicIcon from '@/components/common/DynamicIcon';
import { useNavigationData } from '@/context/NavigationContext';
import { TabParamList } from './types';
import SecondaryTabs from './SecondaryTabs';
import { Color, navigationStyle } from '@/styles';
import LinearGradientHorisontal from '@/components/common/LinearGradientHorisontal';
import AccountToolbarButton from './AccountToolbarButton';
import { TestIDs } from '@/utils/testID';

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const { mainTabsData } = useNavigationData();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const item = mainTabsData.find((tab) => tab.name === route.name);
          if (!item) return null;
          return <DynamicIcon name={item.icon} size={size} color={color} variant={focused ? 'filled' : 'outlined'} />;
        },
        tabBarActiveTintColor: Color.brand.primary,
        tabBarInactiveTintColor: Color.gray.gray4,
        tabBarSafeAreaInsets: { bottom: 0 },
        headerShown: true,
        tabBarStyle: styles.container,
        tabBarLabelStyle: styles.label,
        tabBarBackground: () => <LinearGradientHorisontal height={3} />,
        headerRight: () => <AccountToolbarButton />
      })}
    >
      {mainTabsData.map((tab) => {
        const tabComponent = tab.name === 'more' ? SecondaryTabs : tab.component!;
        const isHeaderShown = tab.name === 'more' ? false : true;

        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name as keyof TabParamList}
            component={tabComponent}
            options={{
              tabBarLabel: t(`navigation.tabs.${tab.name}`),
              headerTitle: t(`navigation.tabs.${tab.name}`),
              headerShown: isHeaderShown,
              tabBarAccessibilityLabel: `${TestIDs.NAV_TAB_PREFIX}-${tab.name}`,
            }}
          />
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
