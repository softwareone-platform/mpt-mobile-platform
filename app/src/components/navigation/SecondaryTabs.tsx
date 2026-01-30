import { OutlinedIcons } from '@assets/icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { useNavigationData } from '@/context/NavigationContext';
import { Color, navigationStyle } from '@/styles';
import { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const SecondaryTabs = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
              testID={`${TestIDs.NAV_MENU_ITEM_PREFIX}-${item.name}`}
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
                <Text style={styles.label}>{t(`navigation.tabs.${item.name}`)}</Text>
                <MaterialIcons name="chevron-right" size={22} color={Color.gray.gray3} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: navigationStyle.secondary.container,
  navigationItem: navigationStyle.secondary.navigationItem,
  label: navigationStyle.secondary.label,
  labelContainer: navigationStyle.secondary.labelContainer,
  lastItem: navigationStyle.secondary.lastItem,
});

export default SecondaryTabs;
