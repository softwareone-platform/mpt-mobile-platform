import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';

import OutlinedIcon from '@/components/common/OutlinedIcon';
import { inputStyle } from '@/styles';

type SearchInputProps = {
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
  testID?: string;
};

const SearchInput = ({ placeholder, onChangeText, onFocus, onBlur, testID }: SearchInputProps) => {
  const [value, setValue] = useState('');

  const handleChange = (text: string) => {
    setValue(text);
    onChangeText?.(text);
  };

  const clearInput = () => {
    setValue('');
    onChangeText?.('');
  };

  return (
    <View>
      <View style={styles.leftIcon}>
        <OutlinedIcon name="search" size={22} color={inputStyle.searchIconColor} />
      </View>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor={inputStyle.searchTextPlaceholderColor}
        onFocus={onFocus}
        onBlur={onBlur}
        testID={testID}
      />
      {value.length > 0 && (
        <Pressable onPress={clearInput} style={styles.rightIcon} testID={`${testID}-clear`}>
          <MaterialIcons name="cancel" size={16} color={inputStyle.searchIconColor} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: inputStyle.search,
  leftIcon: inputStyle.leftIcon,
  rightIcon: inputStyle.rightIcon,
});

export default SearchInput;
