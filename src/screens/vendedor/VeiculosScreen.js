import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getVeiculos, getStatusFabricacao } from '../../services/api';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';

const STEPS = ['AGUARDANDO', 'FABRICANDO', 'CONTROLE_QUALIDADE', 'APROVADO', 'DESPACHADO'];

export default function VeiculosScreen({ navigation }) {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVeiculos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getVeiculos();
      const lista = res.data || [];

      const comStatus = await Promise.all(
        lista.map(async (v) => {
          try {
            const fabRes = await getStatusFabricacao(v.id);
            const historico = fabRes.data || [];
            const ultimo = historico[historico.length - 1] || null;
            return { ...v, statusFab: ultimo?.status || null, totalSteps: historico.length };
          } catch {
            return { ...v, statusFab: null, totalSteps: 0 };
          }
        })
      );

      setVeiculos(comStatus);
    } catch {
      setVeiculos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchVeiculos(); }, [fetchVeiculos]));

  function getProgresso(statusFab) {
    const idx = STEPS.indexOf(statusFab);
    if (idx === -1) return 0;
    return (idx + 1) / STEPS.length;
  }

  function renderItem({ item }) {
    const progresso = getProgresso(item.statusFab);
    const stepAtual = STEPS.indexOf(item.statusFab) + 1;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetalheVeiculo', { veiculoId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Ionicons name="car-sport-outline" size={24} color={COLORS.red} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.modelo || item.nome || `Veículo #${item.id}`}
            </Text>
            <Text style={styles.cardSub}>
              {[item.ano, item.cor].filter(Boolean).join(' · ') || '—'}
              {item.placa ? `  ·  ${item.placa}` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
        </View>

        <View style={styles.cardBottom}>
          {item.statusFab ? (
            <>
              <View style={styles.statusRow}>
                <StatusBadge status={item.statusFab} />
                <Text style={styles.stepCount}>
                  {stepAtual}/{STEPS.length} etapas
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progresso * 100}%` }]} />
              </View>
            </>
          ) : (
            <View style={styles.statusRow}>
              <View style={styles.semStatusBadge}>
                <Text style={styles.semStatusText}>Sem status registrado</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Acompanhamento" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.red} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Acompanhamento" />
      <FlatList
        data={veiculos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={veiculos.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchVeiculos(true)} colors={[COLORS.red]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="Nenhum veículo encontrado"
            subtitle="Os veículos vinculados a pedidos aparecerão aqui."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screenBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  emptyContainer: { flexGrow: 1 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  cardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  cardBottom: {},
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepCount: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },

  progressBg: {
    height: 5,
    backgroundColor: COLORS.ultraLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    backgroundColor: COLORS.red,
    borderRadius: 3,
  },

  semStatusBadge: {
    backgroundColor: COLORS.ultraLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  semStatusText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
});
