import { useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { chipStyle } from '@/styles/components';

type Props = {
  text: string;
  status: 'default' | 'info' | 'warning' | 'danger' | 'success';
};

const Chip = ({ text, status }: Props) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: chipStyle[status].container,
        text: chipStyle[status].text,
      }),
    [status],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Chip;
