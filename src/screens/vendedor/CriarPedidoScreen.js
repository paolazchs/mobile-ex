import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS } from '../../constants';

const ETAPAS = ['cliente', 'veiculo'];
const ETAPA_LABELS = ['Cliente', 'Veículo'];

export default function CriarPedidoScreen({ navigation }) {
  const [etapa, setEtapa] = useState('cliente');

  const [tipoDoc, setTipoDoc] = useState('CPF');
  const [formCliente, setFormCliente] = useState({
    nome: '',
    email: '',
    senha: '',
    documento: '',
    razaoSocial: '',
    dataNascimento: '',
  });
  const [errosCliente, setErrosCliente] = useState({});
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [clienteCriado, setClienteCriado] = useState(null);

  const [formVeiculo, setFormVeiculo] = useState({
    modelo: '',
    cor: '',
    versao: '',
    ano: '',
  });
  const [errosVeiculo, setErrosVeiculo] = useState({});
  const [saving, setSaving] = useState(false);

  function setFieldCliente(field, value) {
    setFormCliente(prev => ({ ...prev, [field]: value }));
    if (errosCliente[field]) setErrosCliente(prev => ({ ...prev, [field]: null }));
  }

  function setFieldVeiculo(field, value) {
    setFormVeiculo(prev => ({ ...prev, [field]: value }));
    if (errosVeiculo[field]) setErrosVeiculo(prev => ({ ...prev, [field]: null }));
  }

  function validarCliente() {
    const e = {};
    if (!formCliente.nome.trim()) e.nome = 'Informe o nome';
    if (!formCliente.email.trim()) e.email = 'Informe o e-mail';
    if (!formCliente.senha || formCliente.senha.length < 6) e.senha = 'Mínimo 6 caracteres';
    if (!formCliente.documento.trim()) e.documento = `Informe o ${tipoDoc}`;
    if (tipoDoc === 'CNPJ' && !formCliente.razaoSocial.trim()) e.razaoSocial = 'Informe a razão social';
    if (!formCliente.dataNascimento.trim()) e.dataNascimento = 'Informe a data';
    setErrosCliente(e);
    return Object.keys(e).length === 0;
  }

  function validarVeiculo() {
    const e = {};
    if (!formVeiculo.modelo.trim()) e.modelo = 'Informe o modelo';
    if (!formVeiculo.ano.trim()) e.ano = 'Informe o ano';
    setErrosVeiculo(e);
    return Object.keys(e).length === 0;
  }

  function handleAvancarParaVeiculo() {
    setEtapa('veiculo');
  }

  function handleCriarPedido() {
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Novo Pedido" navigation={navigation} showBack />

      <View style={styles.steps}>
        {ETAPAS.map((s, i) => {
          const isActive = etapa === s;
          const isDone = ETAPAS.indexOf(etapa) > i;
          return (
            <React.Fragment key={s}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, isActive && styles.stepDotActive, isDone && styles.stepDotDone]}>
                  {isDone
                    ? <Ionicons name="checkmark" size={12} color={COLORS.white} />
                    : <Text style={styles.stepNum}>{i + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {ETAPA_LABELS[i]}
                </Text>
              </View>
              {i < ETAPAS.length - 1 && (
                <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {etapa === 'cliente' && (
          <View>
            <Text style={styles.etapaTitle}>Dados do Cliente</Text>

            <View style={styles.tipoRow}>
              {['CPF', 'CNPJ'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipoBtn, tipoDoc === t && styles.tipoBtnActive]}
                  onPress={() => {
                    setTipoDoc(t);
                    setFieldCliente('documento', '');
                  }}
                >
                  <Text style={[styles.tipoBtnText, tipoDoc === t && styles.tipoBtnTextActive]}>
                    {t === 'CPF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Nome *"
              value={formCliente.nome}
              onChangeText={v => setFieldCliente('nome', v)}
              placeholder="Nome completo"
              autoCapitalize="words"
              error={errosCliente.nome}
            />

            {tipoDoc === 'CNPJ' && (
              <Input
                label="Razão Social *"
                value={formCliente.razaoSocial}
                onChangeText={v => setFieldCliente('razaoSocial', v)}
                placeholder="Empresa Ltda."
                autoCapitalize="words"
                error={errosCliente.razaoSocial}
              />
            )}

            <Input
              label="E-mail *"
              value={formCliente.email}
              onChangeText={v => setFieldCliente('email', v)}
              placeholder="cliente@email.com"
              keyboardType="email-address"
              error={errosCliente.email}
            />

            <Input
              label="Senha *"
              value={formCliente.senha}
              onChangeText={v => setFieldCliente('senha', v)}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={errosCliente.senha}
            />

            <Input
              label={`${tipoDoc} *`}
              value={formCliente.documento}
              onChangeText={v => setFieldCliente('documento', v)}
              placeholder={tipoDoc === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
              keyboardType="numeric"
              error={errosCliente.documento}
            />

            <Input
              label={tipoDoc === 'CPF' ? 'Data de Nascimento *' : 'Data de Abertura *'}
              value={formCliente.dataNascimento}
              onChangeText={v => setFieldCliente('dataNascimento', v)}
              placeholder="AAAA-MM-DD"
              keyboardType="numeric"
              error={errosCliente.dataNascimento}
            />

            <Button
              title="Próximo: Veículo"
              onPress={handleAvancarParaVeiculo}
              loading={salvandoCliente}
              style={styles.nextBtn}
            />
          </View>
        )}

        {etapa === 'veiculo' && (
          <View>
            <Text style={styles.etapaTitle}>Dados do Veículo</Text>

            <Input
              label="Modelo *"
              value={formVeiculo.modelo}
              onChangeText={v => setFieldVeiculo('modelo', v)}
              placeholder="Ex: Civic"
              autoCapitalize="words"
              error={errosVeiculo.modelo}
            />

            <Input
              label="Versão"
              value={formVeiculo.versao}
              onChangeText={v => setFieldVeiculo('versao', v)}
              placeholder="Ex: EXL"
              autoCapitalize="characters"
            />

            <Input
              label="Cor"
              value={formVeiculo.cor}
              onChangeText={v => setFieldVeiculo('cor', v)}
              placeholder="Ex: Preto"
              autoCapitalize="words"
            />

            <Input
              label="Ano *"
              value={formVeiculo.ano}
              onChangeText={v => setFieldVeiculo('ano', v)}
              placeholder="Ex: 2024"
              keyboardType="numeric"
              error={errosVeiculo.ano}
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color="#17A2B8" />
              <Text style={styles.infoText}>
                O veículo será registrado com status inicial "Aguardando" e o pedido ficará disponível na área do cliente.
              </Text>
            </View>

            <View style={styles.btnRow}>
              <Button
                title="Voltar"
                variant="outline"
                onPress={() => setEtapa('cliente')}
                style={styles.btnHalf}
              />
              <Button
                title="Criar Pedido"
                onPress={handleCriarPedido}
                loading={saving}
                style={styles.btnHalf}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, backgroundColor: COLORS.screenBg, flexGrow: 1 },

  steps: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white, paddingVertical: 14, paddingHorizontal: 32,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.red },
  stepDotDone: { backgroundColor: COLORS.dark },
  stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  stepLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  stepLabelActive: { color: COLORS.red },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 10, marginBottom: 14 },
  stepLineDone: { backgroundColor: COLORS.dark },

  etapaTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 16 },

  tipoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tipoBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 6,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.white,
  },
  tipoBtnActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  tipoBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  tipoBtnTextActive: { color: COLORS.white },

  nextBtn: { marginTop: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnHalf: { flex: 1 },

  clienteConfirmado: { marginBottom: 20 },
  clienteConfirmadoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  clienteNome: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  clienteSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#E8F7FA', borderRadius: 8, padding: 12, marginBottom: 8,
  },
  infoText: { flex: 1, fontSize: 12, color: '#17A2B8', lineHeight: 18 },
});
