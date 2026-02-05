import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import AccountToolbarButton from './AccountToolbarButton';
import SecondaryTabs from './SecondaryTabs';

import { appScreensData } from '@/constants/navigation';
import { Color, navigationStyle } from '@/styles';
import type { RootStackParamList, MainTabItem, MainTabsParamList } from '@/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const TabStack = ({ tab }: { tab: MainTabItem }) => {
  const { t } = useTranslation();

  const tabComponent = tab.name === 'more' ? SecondaryTabs : tab.component!;

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: Color.brand.primary,
        headerBackTitle: t('navigation.headerBackTitle'),
        headerBackTitleStyle: styles.headerBackTitle,
        headerTitleStyle: styles.headerTitle,
        headerRight: () => <AccountToolbarButton />,
        headerShadowVisible: false,
        headerStyle: {
          elevation: 0,
          shadowColor: 'transparent',
        },
      }}
    >
      {/* Root screen of this tab */}
      <Stack.Screen
        name={tab.stackRootName as keyof MainTabsParamList}
        component={tabComponent}
        options={{
          title: t(`navigation.tabs.${tab.name}`),
          // never show back button on tab root
          headerLeft: () => null,
        }}
      />

      {appScreensData.map(
        (item) =>
          item.component && (
            <Stack.Screen
              key={item.name}
              name={item.name}
              component={item.component}
              options={{ title: t(`navigation.tabs.${item.name}`) }}
            />
          ),
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitle: navigationStyle.header.title,
  headerBackTitle: navigationStyle.header.backTitle,
});

export default TabStack;
