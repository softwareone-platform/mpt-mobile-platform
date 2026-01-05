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
};

const Tabs = ({ tabs, value, onChange }: Props) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.value}
          label={tab.label}
          selected={value === tab.value}
          onPress={() => onChange(tab.value)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: tabStyle.container,
});

export default Tabs;
