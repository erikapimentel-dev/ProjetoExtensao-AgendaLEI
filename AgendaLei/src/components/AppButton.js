// src/components/AppButton.js
import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import colors from '../config/colors';

const AppButton = ({ title, onPress, color = 'primary', disabled = false, style }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors[color] },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    marginVertical: 10,
    elevation: 2,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  disabled: {
    backgroundColor: colors.disabled,
    elevation: 0,
  },
});

export default AppButton;
