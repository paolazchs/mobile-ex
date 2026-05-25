import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const STATUS_CONFIG = {
  PENDENTE:       { label: 'Pendente',        bg: '#FFC107', text: '#1A1A1A' },
  CONFIRMADO:     { label: 'Confirmado',       bg: '#17A2B8', text: '#FFFFFF' },
  EM_PRODUCAO:    { label: 'Em Produção',      bg: '#6F42C1', text: '#FFFFFF' },
  PRONTO:         { label: 'Pronto',           bg: '#28A745', text: '#FFFFFF' },
  ENTREGUE:       { label: 'Entregue',         bg: '#1A1A1A', text: '#FFFFFF' },
  CANCELADO:      { label: 'Cancelado',        bg: '#CC0000', text: '#FFFFFF' },
  AGUARDANDO:     { label: 'Aguardando',       bg: '#FFC107', text: '#1A1A1A' },
  FABRICANDO:     { label: 'Fabricando',       bg: '#6F42C1', text: '#FFFFFF' },
  CONTROLE_QUALIDADE: { label: 'Controle de Qualidade', bg: '#17A2B8', text: '#FFFFFF' },
  APROVADO:       { label: 'Aprovado',         bg: '#28A745', text: '#FFFFFF' },
  REPROVADO:      { label: 'Reprovado',        bg: '#CC0000', text: '#FFFFFF' },
  DESPACHADO:     { label: 'Despachado',       bg: '#1A1A1A', text: '#FFFFFF' },
};

export default function StatusBadge({ status, style }) {
  const config = STATUS_CONFIG[status] || { label: status || '—', bg: COLORS.lightGray, text: COLORS.dark };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
