import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMeusPedidos } from '../../services/api';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../constants';

export default function MeusPedidosScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPedidos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getMeusPedidos();
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
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderItem({ item }) {
    const veiculo = item.itens?.[0]?.veiculo || item.veiculo;
    const modelo = veiculo?.modelo || veiculo?.nome || `Pedido #${item.id}`;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetalhePedido', { pedidoId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Ionicons name="car-sport-outline" size={26} color={COLORS.red} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{modelo}</Text>
            <Text style={styles.cardSub}>Pedido #{item.id} · {formatDate(item.dataPedido || item.createdAt)}</Text>
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
        <Header title="Meus Pedidos" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.red} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Meus Pedidos" />
      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={pedidos.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchPedidos(true)} colors={[COLORS.red]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Nenhum pedido encontrado"
            subtitle="Seus pedidos aparecerão aqui assim que forem realizados."
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
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  cardSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardValue: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
});
