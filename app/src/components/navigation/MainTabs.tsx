import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigationData } from '@/context/NavigationContext';
import { TabParamList } from './types';
import SecondaryTabs from './SecondaryTabs';
import { Color } from '@/styles';

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const { mainTabsData } = useNavigationData();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const item = mainTabsData.find((t) => t.name === route.name);
          if (!item) return null;
          return <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={size} color={color} />;
        },
        tabBarActiveTintColor: Color.brand.primary,
        tabBarInactiveTintColor: Color.gray.gray4,
        headerShown: true,
      })}
    >
      {mainTabsData.map((tab) =>
        tab.name === 'More' ? (
          <Tab.Screen
            key={tab.name}
            name="More"
            component={SecondaryTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <Tab.Screen
            key={tab.name}
            name={tab.name as keyof TabParamList}
            component={tab.component!}
          />
        )
      )}
    </Tab.Navigator>
  );
};

export default MainTabs;
