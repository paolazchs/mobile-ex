import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export default function EmptyState({ icon = 'cube-outline', title, subtitle }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={COLORS.lightGray} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.mediumGray, marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 6, textAlign: 'center' },
});
