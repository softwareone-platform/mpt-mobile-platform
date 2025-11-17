import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigationData } from '@/context/NavigationContext';
import { TabParamList } from '@/types/navigation';
import { OutlinedIcons } from '@assets/icons';
import OutlinedIcon from '@/components/common/OutlinedIcon';
import { Color, navigationStyle } from '@/styles';
import AccountToolbarButton from './AccontToolbarButton';

const Stack = createStackNavigator<TabParamList>();

const SecondaryMenu = () => {
  const navigation = useNavigation<StackNavigationProp<TabParamList>>();
  const { secondaryTabsData } = useNavigationData();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <FlatList
        data={secondaryTabsData}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => {
          const isLast = index === secondaryTabsData.length - 1;
          return (
            <TouchableOpacity
              style={styles.navigationItem}
              activeOpacity={0.7}
              onPress={() => item.component && navigation.navigate(item.name)}
            >
              <OutlinedIcon 
                name={item.icon as keyof typeof OutlinedIcons}
                color={Color.brand.type}
                size={24}
              />
              <View style={[styles.labelContainer, isLast && styles.lastItem]}>
                <Text style={styles.label}>{ t(`navigation.tabs.${item.name}`) }</Text>
                <MaterialIcons 
                  name="chevron-right"
                  size={22}
                  color={Color.gray.gray3}
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const SecondaryTabs = () => {
  const { secondaryTabsData } = useNavigationData();
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: true,
      headerRight: () => <AccountToolbarButton />
    }}>
      <Stack.Screen 
        name="moreMenu" 
        component={SecondaryMenu} 
        options={{ title: t('navigation.moreMenuTitle') }}
      />
      {secondaryTabsData.map((item) => 
        item.component ? (
          <Stack.Screen 
            key={item.name}
            name={item.name}
            component={item.component}
            options={{ 
              title: t(`navigation.tabs.${item.name}`),
              headerTintColor: Color.brand.primary,
              headerBackTitle: t('navigation.headerBackTitle'),
              headerBackTitleStyle: styles.headerBackTitle,
              headerTitleStyle: styles.headerTitle,
            }} 
          />
        ) : null
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: navigationStyle.secondary.container,
  navigationItem: navigationStyle.secondary.navigationItem,
  label: navigationStyle.secondary.label,
  labelContainer: navigationStyle.secondary.labelContainer,
  lastItem: navigationStyle.secondary.lastItem,
  headerTitle: navigationStyle.header.title,
  headerBackTitle: navigationStyle.header.backTitle,
});

export default SecondaryTabs;
