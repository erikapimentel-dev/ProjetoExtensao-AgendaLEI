// src/components/AppTextInput.js
import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../config/colors';

const AppTextInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  touched,
  style,
  ...otherProps
}) => {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          error && touched ? styles.errorInput : null,
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={colors.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor={colors.placeholder}
          {...otherProps}
        />
      </View>
      {error && touched && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: colors.text,
    fontSize: 16,
  },
  errorInput: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
});

export default AppTextInput;
