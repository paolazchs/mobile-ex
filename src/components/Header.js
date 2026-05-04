import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export default function Header({ title, navigation, showBack = false }) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.iconBtn} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: { width: 36, alignItems: 'center' },
});
