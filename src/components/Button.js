import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants';

export default function Button({ title, onPress, loading = false, variant = 'primary', style, disabled }) {
  const variantStyle = {
    primary: { bg: COLORS.red, text: COLORS.white },
    secondary: { bg: COLORS.dark, text: COLORS.white },
    outline: { bg: 'transparent', text: COLORS.dark, border: COLORS.dark },
    danger: { bg: COLORS.redDark, text: COLORS.white },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: variantStyle.bg },
        variantStyle.border && { borderWidth: 1.5, borderColor: variantStyle.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: variantStyle.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.55,
  },
});
