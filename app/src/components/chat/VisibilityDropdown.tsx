import { OutlinedIcons } from '@assets/icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { visibilityDropdownStyle } from '@/styles/components';
import type { MessageVisibility } from '@/types/chat';

type VisibilityDropdownProps = {
  visibility: MessageVisibility;
  onVisibilityChange: (visibility: MessageVisibility) => void;
};

const VisibilityDropdown = ({ visibility, onVisibilityChange }: VisibilityDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (value: MessageVisibility) => {
      onVisibilityChange(value);
      setOpen(false);
    },
    [onVisibilityChange],
  );

  const iconName = visibility === 'Public' ? 'public' : 'lock';

  return (
    <View>
      <Pressable onPress={handleToggle}>
        <OutlinedIcon
          name={iconName as keyof typeof OutlinedIcons}
          size={visibilityDropdownStyle.optionIcon.size}
          color={visibilityDropdownStyle.optionIcon.color}
        />
      </Pressable>

      {open && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={styles.dropdown}>
            <Pressable
              style={[styles.option, visibility === 'Public' && styles.optionSelected]}
              onPress={() => handleSelect('Public')}
            >
              <Text style={styles.optionText}>{t('chat.visibilityPublic')}</Text>
              {visibility === 'Public' && (
                <OutlinedIcon
                  name={'done' as keyof typeof OutlinedIcons}
                  size={visibilityDropdownStyle.tickIcon.size}
                  color={visibilityDropdownStyle.tickIcon.color}
                />
              )}
            </Pressable>
            <Pressable
              style={[styles.option, visibility === 'Private' && styles.optionSelected]}
              onPress={() => handleSelect('Private')}
            >
              <Text style={styles.optionText}>{t('chat.visibilityPrivate')}</Text>
              {visibility === 'Private' && (
                <OutlinedIcon
                  name={'done' as keyof typeof OutlinedIcons}
                  size={visibilityDropdownStyle.tickIcon.size}
                  color={visibilityDropdownStyle.tickIcon.color}
                />
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: visibilityDropdownStyle.backdrop,
  dropdown: visibilityDropdownStyle.dropdownInline,
  option: visibilityDropdownStyle.option,
  optionSelected: visibilityDropdownStyle.optionSelected,
  optionText: visibilityDropdownStyle.optionText,
});

export default VisibilityDropdown;
