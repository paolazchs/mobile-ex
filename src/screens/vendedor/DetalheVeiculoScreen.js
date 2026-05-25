import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getVeiculo, getStatusFabricacao } from '../../services/api';
import Header from '../../components/Header';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../constants';

const STEPS = ['AGUARDANDO', 'FABRICANDO', 'CONTROLE_QUALIDADE', 'APROVADO', 'DESPACHADO'];

const STEP_LABELS = {
  AGUARDANDO: 'Aguardando',
  FABRICANDO: 'Fabricando',
  CONTROLE_QUALIDADE: 'Controle de Qualidade',
  APROVADO: 'Aprovado',
  DESPACHADO: 'Despachado',
};

const STEP_DESC = {
  AGUARDANDO: 'Veículo na fila de produção.',
  FABRICANDO: 'Montagem em andamento na linha de produção.',
  CONTROLE_QUALIDADE: 'Inspeção e testes de qualidade.',
  APROVADO: 'Veículo aprovado e pronto para despacho.',
  DESPACHADO: 'Veículo despachado para entrega.',
};

export default function DetalheVeiculoScreen({ route, navigation }) {
  const { veiculoId } = route.params;
  const [veiculo, setVeiculo] = useState(null);
  const [statusFab, setStatusFab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [veicRes, fabRes] = await Promise.all([
        getVeiculo(veiculoId),
        getStatusFabricacao(veiculoId),
      ]);
      setVeiculo(veicRes.data);
      setStatusFab(fabRes.data || []);
    } catch {
      setVeiculo(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [veiculoId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  function formatCurrency(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const latestStatus = statusFab.length > 0 ? statusFab[statusFab.length - 1]?.status : null;
  const currentStepIndex = STEPS.indexOf(latestStatus);
  const progresso = currentStepIndex >= 0 ? (currentStepIndex + 1) / STEPS.length : 0;

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Veículo" navigation={navigation} showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.red} /></View>
      </View>
    );
  }

  if (!veiculo) {
    return (
      <View style={styles.screen}>
        <Header title="Detalhe do Veículo" navigation={navigation} showBack />
        <View style={styles.center}><Text style={styles.errorText}>Veículo não encontrado.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title={veiculo.modelo || `Veículo #${veiculo.id}`} navigation={navigation} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[COLORS.red]} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="car-sport-outline" size={48} color={COLORS.red} />
          </View>
          <Text style={styles.heroTitle}>{veiculo.modelo || veiculo.nome || '—'}</Text>
          <Text style={styles.heroSub}>{[veiculo.ano, veiculo.cor].filter(Boolean).join(' · ')}</Text>
          {latestStatus && (
            <View style={styles.heroBadge}>
              <StatusBadge status={latestStatus} />
            </View>
          )}
        </View>

        {latestStatus && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progresso de Fabricação</Text>
              <Text style={styles.progressPct}>{Math.round(progresso * 100)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progresso * 100}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              Etapa {currentStepIndex + 1} de {STEPS.length} — {STEP_LABELS[latestStatus]}
            </Text>
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Dados do Veículo</Text>
          <Row label="Modelo" value={veiculo.modelo || '—'} />
          <Row label="Ano" value={veiculo.ano || '—'} />
          <Row label="Cor" value={veiculo.cor || '—'} />
          <Row label="Placa" value={veiculo.placa || '—'} />
          <Row label="Chassi" value={veiculo.chassi || '—'} />
          <Row label="Preço" value={formatCurrency(veiculo.preco)} bold />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Linha do Tempo</Text>
          {statusFab.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Ionicons name="time-outline" size={32} color={COLORS.lightGray} />
              <Text style={styles.emptyTimelineText}>Nenhum status registrado ainda.</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === STEPS.length - 1;
                const record = statusFab.find((s) => s.status === step);
                return (
                  <View key={step} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]}>
                        {isDone && !isCurrent && (
                          <Ionicons name="checkmark" size={12} color={COLORS.white} />
                        )}
                        {isCurrent && <View style={styles.dotInner} />}
                      </View>
                      {!isLast && (
                        <View style={[styles.line, isDone && !isCurrent && styles.lineDone, isCurrent && styles.lineCurrent]} />
                      )}
                    </View>
                    <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
                      <View style={styles.timelineHeader}>
                        <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                          {STEP_LABELS[step]}
                        </Text>
                        {record?.dataStatus && (
                          <Text style={styles.stepDate}>{formatDate(record.dataStatus)}</Text>
                        )}
                      </View>
                      <Text style={[styles.stepDesc, isDone && styles.stepDescDone]}>
                        {STEP_DESC[step]}
                      </Text>
                      {record?.observacao && (
                        <View style={styles.obsBox}>
                          <Ionicons name="chatbubble-outline" size={12} color={COLORS.mediumGray} style={{ marginRight: 4 }} />
                          <Text style={styles.stepObs}>{record.observacao}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
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
  hero: {
    alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10,
    padding: 24, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
  heroSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  heroBadge: { marginTop: 12 },
  progressCard: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  progressPct: { fontSize: 18, fontWeight: '900', color: COLORS.red },
  progressBg: { height: 8, backgroundColor: COLORS.ultraLight, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: COLORS.red, borderRadius: 4 },
  progressSub: { fontSize: 12, color: COLORS.textLight },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.red, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.ultraLight },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary },
  rowValue: { fontSize: 13, color: COLORS.dark, fontWeight: '500' },
  rowValueBold: { fontWeight: '700', fontSize: 14 },
  emptyTimeline: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyTimelineText: { fontSize: 13, color: COLORS.textLight },
  timeline: { paddingTop: 4 },
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 32, marginRight: 14 },
  dot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.ultraLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border,
  },
  dotDone: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  dotCurrent: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
  line: { width: 2, flex: 1, minHeight: 16, backgroundColor: COLORS.border, marginVertical: 3 },
  lineDone: { backgroundColor: COLORS.dark },
  lineCurrent: { backgroundColor: COLORS.border },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  stepLabel: { fontSize: 14, fontWeight: '700', color: COLORS.lightGray },
  stepLabelDone: { color: COLORS.dark },
  stepDate: { fontSize: 11, color: COLORS.textLight },
  stepDesc: { fontSize: 12, color: COLORS.lightGray, lineHeight: 17 },
  stepDescDone: { color: COLORS.textSecondary },
  obsBox: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6, backgroundColor: COLORS.ultraLight, borderRadius: 6, padding: 8 },
  stepObs: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', flex: 1 },
});
