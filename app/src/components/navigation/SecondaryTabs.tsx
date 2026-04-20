import { OutlinedIcons } from '@assets/icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import NavigationItemWithIcon from '@/components/navigation-item/NavigationItemWithIcon';
import { secondaryTabsData, secondaryTabItems } from '@/constants/navigation';
import { useFilteredNavigation } from '@/hooks/useFilteredNavigation';
import { screenStyle } from '@/styles';
import { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const getItemKey = (item: { name: string; modules?: string[] }) =>
  `${item.name}-${item.modules?.[0] ?? ''}`;

const SecondaryTabs = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  const filteredItems = useFilteredNavigation(secondaryTabItems);

  const filteredSections = useMemo(() => {
    const filteredItemKeys = new Set(filteredItems.map(getItemKey));

    return secondaryTabsData
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => filteredItemKeys.has(getItemKey(item))),
      }))
      .filter((section) => section.items.length > 0);
  }, [filteredItems]);

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      {filteredSections.map((section) => (
        <NavigationGroupCard key={section.title} title={t(`navigation.tabGroups.${section.title}`)}>
          {section.items.map((item, index) => {
            const isLast = index === section.items.length - 1;

            return (
              <NavigationItemWithIcon
                key={getItemKey(item)}
                icon={item.icon as keyof typeof OutlinedIcons}
                title={t(`navigation.tabs.${item.name}`)}
                testID={`${TestIDs.NAV_MENU_ITEM_PREFIX}-${item.name}`}
                onPress={() => item.component && navigation.navigate(item.name)}
                isLast={isLast}
              />
            );
          })}
        </NavigationGroupCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: screenStyle.containerMain,
});

export default SecondaryTabs;
