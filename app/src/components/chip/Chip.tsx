import { useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { chipStyle } from '@/styles/components';
import type { Status } from '@/types/lists';

type Props = {
  text: string;
  status: Status;
  testId?: string;
};

const Chip = ({ text, status, testId }: Props) => {
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
    <View style={styles.container} testID={testId}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Chip;
