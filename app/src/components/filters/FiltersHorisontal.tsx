import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { filterStyle } from '@/styles/components';
import { useTranslation } from 'react-i18next';

type Props = {
  filterKeys: string[];
  selectedFilter: string;
  onFilterPress: (key: string) => void;
};

const FiltersHorizontal = ({ filterKeys, selectedFilter, onFilterPress }: Props) => {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {filterKeys.map((key) => {
        const isActive = selectedFilter === key;

        return (
          <TouchableOpacity
            key={key}
            onPress={() => onFilterPress(key)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {t(`spotlightScreen.group.${key}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: filterStyle.containerHorisontal,
  content: filterStyle.pillBarContent,
  chip: filterStyle.chip,
  chipActive: filterStyle.chipActive,
  chipText: filterStyle.chipText,
  chipTextActive: filterStyle.chipTextActive,
});

export default FiltersHorizontal;
