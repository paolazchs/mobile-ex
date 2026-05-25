import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPedidos } from '../../services/api';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';

export default function PedidosVendedorScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPedidos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getPedidos();
      setPedidos(res.data || []);
    } catch {
      setPedidos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchPedidos(); }, [fetchPedidos]));

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderItem({ item }) {
    const cliente = item.cliente?.nome || item.usuario?.nome || `Cliente #${item.clienteId || '—'}`;
    const veiculo = item.itens?.[0]?.veiculo?.modelo || item.veiculo?.modelo || '—';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GerenciarPedido', { pedidoId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Ionicons name="receipt-outline" size={22} color={COLORS.red} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>Pedido #{item.id}</Text>
            <Text style={styles.cardSub}>{cliente} · {veiculo}</Text>
            <Text style={styles.cardDate}>{formatDate(item.dataPedido || item.createdAt)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.lightGray} />
        </View>
        <View style={styles.cardBottom}>
          <StatusBadge status={item.status} />
          <Text style={styles.cardValue}>{formatCurrency(item.valorTotal)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Pedidos" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.red} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Pedidos" />
      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={pedidos.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchPedidos(true)} colors={[COLORS.red]} />
        }
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" title="Nenhum pedido encontrado" />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CriarPedido')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screenBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 88 },
  emptyContainer: { flexGrow: 1 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 14, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  cardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  cardDate: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardValue: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5,
  },
});
