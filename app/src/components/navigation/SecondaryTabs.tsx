import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigationData } from '@/context/NavigationContext';
import { TabParamList } from '@/types/navigation';

const Stack = createStackNavigator<TabParamList>();

function SecondaryMenu() {
  const navigation = useNavigation<StackNavigationProp<TabParamList>>();
  const { secondaryTabsData } = useNavigationData();

  return (
    <View style={styles.container}>
      <FlatList
        data={secondaryTabsData}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={() => item.component && navigation.navigate(item.name)}
          >
            <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={22} style={styles.icon} />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const SecondaryTabs = () => {
  const { secondaryTabsData } = useNavigationData();

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="MoreMenu" component={SecondaryMenu} options={{ title: 'More' }} />
      {secondaryTabsData.map((item) => 
        item.component ? (
          <Stack.Screen key={item.name} name={item.name} component={item.component} />
        ) : null
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  icon: { marginRight: 12 },
  label: { fontSize: 16 },
});

export default SecondaryTabs;
