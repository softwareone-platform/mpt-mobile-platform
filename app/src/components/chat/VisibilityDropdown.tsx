import { OutlinedIcons } from '@assets/icons';
import { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { visibilityDropdownStyle } from '@/styles/components';
import type { MessageVisibility } from '@/types/chat';

type VisibilityDropdownProps = {
  visibility: MessageVisibility;
  onVisibilityChange: (visibility: MessageVisibility) => void;
};

const ICON_SIZE = 24;

const VisibilityDropdown = ({ visibility, onVisibilityChange }: VisibilityDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const anchorRef = useRef<View>(null);

  const handleOpen = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({
        top: y - 80,
        right: 16,
      });
      setOpen(true);
    });
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
    <View ref={anchorRef}>
      <TouchableOpacity onPress={handleOpen}>
        <OutlinedIcon
          name={iconName as keyof typeof OutlinedIcons}
          size={ICON_SIZE}
          color={visibilityDropdownStyle.optionIcon.color}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.dropdown,
                { top: dropdownPosition.top, right: dropdownPosition.right },
              ]}
            >
              <TouchableOpacity
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
              </TouchableOpacity>
              <TouchableOpacity
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
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: visibilityDropdownStyle.overlay,
  dropdown: visibilityDropdownStyle.dropdown,
  option: visibilityDropdownStyle.option,
  optionSelected: visibilityDropdownStyle.optionSelected,
  optionText: visibilityDropdownStyle.optionText,
});

export default VisibilityDropdown;
