import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  getPedido, updatePedido,
  getStatusFabricacao, createStatusFabricacao,
} from '../../services/api';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { COLORS } from '../../constants';

const PEDIDO_STATUS = ['PENDENTE', 'CONFIRMADO', 'EM_PRODUCAO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];
const FAB_STATUS = ['AGUARDANDO', 'FABRICANDO', 'CONTROLE_QUALIDADE', 'APROVADO', 'DESPACHADO'];

const STATUS_LABELS = {
  PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', EM_PRODUCAO: 'Em Produção',
  PRONTO: 'Pronto', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado',
  AGUARDANDO: 'Aguardando', FABRICANDO: 'Fabricando',
  CONTROLE_QUALIDADE: 'Controle de Qualidade', APROVADO: 'Aprovado', DESPACHADO: 'Despachado',
};

export default function GerenciarPedidoScreen({ route, navigation }) {
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState(null);
  const [statusFab, setStatusFab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [novoStatusFab, setNovoStatusFab] = useState('');
  const [observacao, setObservacao] = useState('');
  const [showFabForm, setShowFabForm] = useState(false);

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
        } catch { setStatusFab([]); }
      }
    } catch { setPedido(null); }
    finally { setLoading(false); setRefreshing(false); }
  }, [pedidoId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  async function handleUpdateStatus(novoStatus) {
    Alert.alert(
      'Alterar Status',
      `Mudar para "${STATUS_LABELS[novoStatus]}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar', onPress: async () => {
            setSavingStatus(true);
            try {
              await updatePedido(pedidoId, { ...pedido, status: novoStatus });
              await fetchData();
            } catch (err) {
              Alert.alert('Erro', err.userMessage || 'Não foi possível atualizar.');
            } finally { setSavingStatus(false); }
          },
        },
      ]
    );
  }

  async function handleAddStatusFab() {
    if (!novoStatusFab) {
      Alert.alert('Atenção', 'Selecione um status de fabricação.');
      return;
    }
    const veiculoId = pedido?.itens?.[0]?.veiculo?.id || pedido?.veiculoId;
    if (!veiculoId) {
      Alert.alert('Erro', 'Veículo não encontrado neste pedido.');
      return;
    }
    setSavingStatus(true);
    try {
      await createStatusFabricacao(veiculoId, {
        status: novoStatusFab,
        observacao: observacao.trim() || undefined,
        dataStatus: new Date().toISOString().split('T')[0],
      });
      setNovoStatusFab('');
      setObservacao('');
      setShowFabForm(false);
      await fetchData();
    } catch (err) {
      Alert.alert('Erro', err.userMessage || 'Não foi possível registrar.');
    } finally { setSavingStatus(false); }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Gerenciar Pedido" navigation={navigation} showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.red} /></View>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.screen}>
        <Header title="Gerenciar Pedido" navigation={navigation} showBack />
        <View style={styles.center}><Text style={styles.errorText}>Pedido não encontrado.</Text></View>
      </View>
    );
  }

  const veiculo = pedido.itens?.[0]?.veiculo || pedido.veiculo;
  const cliente = pedido.cliente?.nome || pedido.usuario?.nome || '—';

  return (
    <View style={styles.screen}>
      <Header title={`Pedido #${pedido.id}`} navigation={navigation} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.red]} />}
      >
        <Card>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Row label="Cliente" value={cliente} />
          <Row label="Data" value={formatDate(pedido.dataPedido || pedido.createdAt)} />
          <Row label="Total" value={formatCurrency(pedido.valorTotal)} bold />
          <View style={styles.statusRow}>
            <Text style={styles.rowLabel}>Status Atual</Text>
            <StatusBadge status={pedido.status} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Alterar Status do Pedido</Text>
          <View style={styles.statusGrid}>
            {PEDIDO_STATUS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusChip, pedido.status === s && styles.statusChipActive]}
                onPress={() => pedido.status !== s && handleUpdateStatus(s)}
                disabled={savingStatus || pedido.status === s}
                activeOpacity={0.7}
              >
                <Text style={[styles.statusChipText, pedido.status === s && styles.statusChipTextActive]}>
                  {STATUS_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {veiculo && (
          <Card>
            <Text style={styles.sectionTitle}>Veículo</Text>
            <Row label="Modelo" value={veiculo.modelo || veiculo.nome || '—'} />
            <Row label="Ano" value={veiculo.ano || '—'} />
            <Row label="Cor" value={veiculo.cor || '—'} />
            <Row label="Chassi" value={veiculo.chassi || '—'} />
          </Card>
        )}

        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Status de Fabricação</Text>
            <TouchableOpacity onPress={() => setShowFabForm(!showFabForm)} style={styles.addBtn}>
              <Ionicons name={showFabForm ? 'close' : 'add'} size={18} color={COLORS.red} />
              <Text style={styles.addBtnText}>{showFabForm ? 'Fechar' : 'Registrar'}</Text>
            </TouchableOpacity>
          </View>

          {showFabForm && (
            <View style={styles.fabForm}>
              <Text style={styles.fabFormLabel}>Novo Status</Text>
              <View style={styles.statusGrid}>
                {FAB_STATUS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusChip, novoStatusFab === s && styles.statusChipActive]}
                    onPress={() => setNovoStatusFab(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.statusChipText, novoStatusFab === s && styles.statusChipTextActive]}>
                      {STATUS_LABELS[s]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input
                label="Observação (opcional)"
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Ex: Pintura concluída"
                autoCapitalize="sentences"
                style={{ marginTop: 8 }}
              />
              <Button title="Registrar Status" onPress={handleAddStatusFab} loading={savingStatus} />
            </View>
          )}

          {statusFab.length === 0 ? (
            <Text style={styles.noStatus}>Nenhum status registrado.</Text>
          ) : (
            [...statusFab].reverse().map((s, i) => (
              <View key={s.id || i} style={[styles.fabItem, i > 0 && styles.fabBorder]}>
                <StatusBadge status={s.status} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.fabDate}>{formatDate(s.dataStatus)}</Text>
                  {s.observacao && <Text style={styles.fabObs}>{s.observacao}</Text>}
                </View>
              </View>
            ))
          )}
        </Card>
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
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.red, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.ultraLight },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary },
  rowValue: { fontSize: 13, color: COLORS.dark, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  rowValueBold: { fontWeight: '700', fontSize: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 13, color: COLORS.red, fontWeight: '600' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statusChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  statusChipActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  statusChipText: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
  statusChipTextActive: { color: COLORS.white },
  fabForm: { backgroundColor: COLORS.ultraLight, borderRadius: 8, padding: 12, marginBottom: 12 },
  fabFormLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkGray, marginBottom: 8 },
  noStatus: { color: COLORS.textLight, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  fabItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  fabBorder: { borderTopWidth: 1, borderTopColor: COLORS.ultraLight },
  fabDate: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  fabObs: { fontSize: 12, color: COLORS.textLight, fontStyle: 'italic' },
});
