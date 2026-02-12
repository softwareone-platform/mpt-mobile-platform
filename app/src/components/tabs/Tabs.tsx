import { View, StyleSheet } from 'react-native';

import TabItem from '@/components/tab-item/TabItem';
import { tabStyle } from '@/styles/components/tab';

export type TabData = {
  label: string;
  value: string;
};

type Props = {
  tabs: TabData[];
  value: string;
  onChange: (value: string) => void;
  testID?: string;
  tabTestIDPrefix?: string;
};

const Tabs = ({ tabs, value, onChange, testID, tabTestIDPrefix }: Props) => {
  return (
    <View style={styles.container} testID={testID}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.value}
          label={tab.label}
          selected={value === tab.value}
          onPress={() => onChange(tab.value)}
          testID={tabTestIDPrefix ? `${tabTestIDPrefix}-${tab.value}` : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: tabStyle.container,
});

export default Tabs;
