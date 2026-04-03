import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Text,
  Keyboard,
} from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { inputSearchStyle } from '@/styles';

type SearchInputProps = {
  placeholder?: string;
  isSearchMode: boolean;
  showCancel?: boolean;
  onSearchModeChange: (value: boolean) => void;
  onChangeText?: (text: string) => void;
  testID?: string;
};

const SearchInput = ({
  placeholder,
  isSearchMode,
  showCancel,
  onChangeText,
  onSearchModeChange,
  testID,
}: SearchInputProps) => {
  const [value, setValue] = useState('');

  const { t } = useTranslation();

  const handleChange = (text: string) => {
    setValue(text);
    onChangeText?.(text);
  };

  const clearInput = () => {
    setValue('');
    onChangeText?.('');
  };

  const handleFocus = () => {
    onSearchModeChange(true);
  };

  const handleCancel = () => {
    clearInput();
    Keyboard.dismiss();
    onSearchModeChange(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <View style={styles.leftIcon}>
          <OutlinedIcon name="search" size={24} color={inputSearchStyle.searchIconColor} />
        </View>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor={inputSearchStyle.placeholderTextColor}
          onFocus={handleFocus}
          testID={testID}
        />
        {value.length > 0 && (
          <Pressable onPress={clearInput} style={styles.rightIcon} testID={`${testID}-clear`}>
            <OutlinedIcon name="close" size={24} color={inputSearchStyle.searchIconColor} />
          </Pressable>
        )}
      </View>
      {showCancel && (
        <TouchableOpacity
          style={styles.cancel}
          onPress={handleCancel}
          disabled={!isSearchMode}
          activeOpacity={1}
        >
          <Text style={[styles.cancelText, !isSearchMode && styles.cancelTextDisabled]}>
            {t('common.action.cancel')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: inputSearchStyle.containerMain,
  searchWrapper: inputSearchStyle.searchWrapper,
  input: inputSearchStyle.search,
  leftIcon: inputSearchStyle.leftIcon,
  rightIcon: inputSearchStyle.rightIcon,
  cancel: inputSearchStyle.cancel,
  cancelText: inputSearchStyle.cancelText,
  cancelTextDisabled: inputSearchStyle.cancelTextDisabled,
});

export default SearchInput;
