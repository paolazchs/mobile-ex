import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPedido, getStatusFabricacao } from '../../services/api';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import { COLORS } from '../../constants';

const FABRICACAO_STEPS = ['AGUARDANDO', 'FABRICANDO', 'CONTROLE_QUALIDADE', 'APROVADO', 'DESPACHADO'];

const STEP_LABELS = {
  AGUARDANDO: 'Aguardando',
  FABRICANDO: 'Fabricando',
  CONTROLE_QUALIDADE: 'Controle de Qualidade',
  APROVADO: 'Aprovado',
  DESPACHADO: 'Despachado',
};

export default function DetalhePedidoScreen({ route, navigation }) {
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState(null);
  const [statusFab, setStatusFab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const pedRes = await getPedido(pedidoId);
      const ped = pedRes.data;
      setPedido(ped);
      const veiculoId = ped.itens?.[0]?.veiculo?.id || ped.veiculoId;
      if (veiculoId) {
        try {
          const fabRes = await getStatusFabricacao(veiculoId);
          setStatusFab(fabRes.data || []);
        } catch {
          setStatusFab([]);
        }
      }
    } catch {
      setPedido(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pedidoId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const latestStatus = statusFab.length > 0 ? statusFab[statusFab.length - 1]?.status : null;
  const currentStepIndex = FABRICACAO_STEPS.indexOf(latestStatus);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Pedido" navigation={navigation} showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.red} />
        </View>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Pedido" navigation={navigation} showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>Pedido não encontrado.</Text>
        </View>
      </View>
    );
  }

  const veiculo = pedido.itens?.[0]?.veiculo || pedido.veiculo;

  return (
    <View style={styles.screen}>
      <Header title={`Pedido #${pedido.id}`} navigation={navigation} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.red]} />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          <Row label="Número" value={`#${pedido.id}`} />
          <Row label="Data" value={formatDate(pedido.dataPedido || pedido.createdAt)} />
          <Row label="Valor Total" value={formatCurrency(pedido.valorTotal)} bold />
          <View style={styles.statusRow}>
            <Text style={styles.rowLabel}>Status</Text>
            <StatusBadge status={pedido.status} />
          </View>
        </Card>

        {veiculo && (
          <Card>
            <Text style={styles.sectionTitle}>Veículo</Text>
            <Row label="Modelo" value={veiculo.modelo || veiculo.nome || '—'} />
            <Row label="Ano" value={veiculo.ano || '—'} />
            <Row label="Cor" value={veiculo.cor || '—'} />
            <Row label="Placa" value={veiculo.placa || '—'} />
            <Row label="Chassi" value={veiculo.chassi || '—'} />
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Acompanhamento de Fabricação</Text>
          {statusFab.length === 0 && latestStatus === null ? (
            <Text style={styles.noStatus}>Nenhum status de fabricação registrado ainda.</Text>
          ) : (
            <View style={styles.timeline}>
              {FABRICACAO_STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === FABRICACAO_STEPS.length - 1;
                const record = statusFab.find((s) => s.status === step);
                return (
                  <View key={step} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]}>
                        {isDone && (
                          <Ionicons
                            name={isCurrent ? 'ellipse' : 'checkmark'}
                            size={isCurrent ? 8 : 12}
                            color={COLORS.white}
                          />
                        )}
                      </View>
                      {!isLast && <View style={[styles.line, isDone && styles.lineDone]} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                        {STEP_LABELS[step]}
                      </Text>
                      {record?.dataStatus && (
                        <Text style={styles.stepDate}>{formatDate(record.dataStatus)}</Text>
                      )}
                      {record?.observacao && (
                        <Text style={styles.stepObs}>{record.observacao}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {pedido.itens && pedido.itens.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Itens do Pedido</Text>
            {pedido.itens.map((item, i) => (
              <View key={item.id || i} style={[styles.itemRow, i > 0 && styles.itemBorder]}>
                <View style={styles.itemIcon}>
                  <Ionicons name="car-outline" size={20} color={COLORS.red} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {item.veiculo?.modelo || item.produto?.nome || `Item #${item.id}`}
                  </Text>
                  <Text style={styles.itemSub}>
                    Qtd: {item.quantidade || 1} · {formatCurrency(item.valorUnitario || item.preco)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency((item.quantidade || 1) * (item.valorUnitario || item.preco || 0))}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screenBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16 },
  errorText: { color: COLORS.mediumGray, fontSize: 15 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.red,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.ultraLight },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary },
  rowValue: { fontSize: 13, color: COLORS.dark, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  rowValueBold: { fontWeight: '700', fontSize: 15 },
  noStatus: { color: COLORS.textLight, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  timeline: { paddingTop: 4 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { alignItems: 'center', width: 28, marginRight: 12 },
  dot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.border,
  },
  dotDone: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  dotCurrent: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  line: { width: 2, flex: 1, minHeight: 20, backgroundColor: COLORS.border, marginVertical: 2 },
  lineDone: { backgroundColor: COLORS.dark },
  timelineContent: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: COLORS.lightGray },
  stepLabelDone: { color: COLORS.dark },
  stepDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  stepObs: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  itemBorder: { borderTopWidth: 1, borderTopColor: COLORS.ultraLight },
  itemIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  itemSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
});
