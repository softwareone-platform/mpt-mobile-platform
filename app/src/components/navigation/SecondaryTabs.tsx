import { OutlinedIcons } from '@assets/icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { secondaryTabsData, secondaryTabItems } from '@/constants/navigation';
import { useAccount } from '@/context/AccountContext';
import { useFilteredNavigation } from '@/hooks/useFilteredNavigation';
import { Color, navigationStyle, screenStyle } from '@/styles';
import { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const SecondaryTabs = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { isSwitchingAccount } = useAccount();

  const filteredItems = useFilteredNavigation(secondaryTabItems);

  const filteredSections = useMemo(() => {
    const filteredItemNames = new Set(filteredItems.map((item) => item.name));

    return secondaryTabsData
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => filteredItemNames.has(item.name)),
      }))
      .filter((section) => section.items.length > 0);
  }, [filteredItems]);

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      {filteredSections.map((section) => (
        <View key={section.title} style={styles.container}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{t(`navigation.tabGroups.${section.title}`)}</Text>
          </View>

          {section.items.map((item, index) => {
            const isLast = index === section.items.length - 1;

            return (
              <TouchableOpacity
                key={item.name}
                testID={`${TestIDs.NAV_MENU_ITEM_PREFIX}-${item.name}`}
                style={[styles.navigationItem, isLast && styles.lastItem]}
                activeOpacity={0.7}
                disabled={isSwitchingAccount}
                onPress={() => item.component && navigation.navigate(item.name)}
              >
                <OutlinedIcon
                  name={item.icon as keyof typeof OutlinedIcons}
                  color={isSwitchingAccount ? Color.gray.gray3 : Color.brand.primary}
                  size={24}
                />

                <View style={styles.labelContainer}>
                  <Text style={[styles.label, isSwitchingAccount && styles.labelDisabled]}>
                    {t(`navigation.tabs.${item.name}`)}
                  </Text>
                  {isSwitchingAccount ? (
                    <ActivityIndicator size="small" color={Color.brand.primary} />
                  ) : (
                    <MaterialIcons name="chevron-right" size={22} color={Color.gray.gray4} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: screenStyle.containerMain,
  container: navigationStyle.secondary.container,
  cardHeader: navigationStyle.secondary.header,
  cardHeaderText: navigationStyle.secondary.headerText,
  navigationItem: navigationStyle.secondary.navigationItem,
  label: navigationStyle.secondary.label,
  labelDisabled: navigationStyle.secondary.labelDisabled,
  labelContainer: navigationStyle.secondary.labelContainer,
  lastItem: navigationStyle.secondary.lastItem,
});

export default SecondaryTabs;
