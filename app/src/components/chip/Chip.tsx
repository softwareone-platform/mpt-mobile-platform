import { useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { chipStyle } from '@/styles/components';
import type { Status } from '@/types/lists';

type Props = {
  text: string;
  status: Status;
};

const Chip = ({ text, status }: Props) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        /* eslint-disable react-native/no-unused-styles */
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
