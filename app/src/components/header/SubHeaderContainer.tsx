import { View, StyleSheet } from 'react-native';

import { screenStyle, separatorStyle } from '@/styles';

const SubHeaderContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    ...screenStyle.subHeaderContainer,
    ...separatorStyle.bottomBorder1,
  },
});

export default SubHeaderContainer;
