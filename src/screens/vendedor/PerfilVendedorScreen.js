import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getPessoaFisica, updatePessoaFisica, getPessoaJuridica, updatePessoaJuridica } from '../../services/api';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS } from '../../constants';

export default function PerfilVendedorScreen() {
  const { user, signOut } = useAuth();
  const isPF = !user?.cnpj && !user?.razaoSocial;

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    try {
      const res = isPF ? await getPessoaFisica(user.id) : await getPessoaJuridica(user.id);
      setForm(res.data);
    } catch { setForm(user || {}); }
    finally { setLoading(false); }
  }, [user, isPF]);

  useFocusEffect(useCallback(() => { fetchPerfil(); }, [fetchPerfil]));

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.nome?.trim()) e.nome = 'Informe o nome';
    if (!form.email?.trim()) e.email = 'Informe o e-mail';
    if (!isPF && !form.razaoSocial?.trim()) e.razaoSocial = 'Informe a razão social';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isPF) await updatePessoaFisica(user.id, form);
      else await updatePessoaJuridica(user.id, form);
      Alert.alert('Sucesso', 'Dados atualizados!');
      setEditing(false);
    } catch (err) {
      Alert.alert('Erro', err.userMessage || 'Não foi possível salvar.');
    } finally { setSaving(false); }
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  const avatarLetter = (form.nome || form.razaoSocial || 'V')[0]?.toUpperCase();

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Meu Perfil" />
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.red} /></View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Meu Perfil" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: COLORS.red }]}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.userName}>{form.nome || form.razaoSocial || '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>VENDEDOR</Text>
          </View>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.red} />
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input label="Nome *" value={form.nome || ''} onChangeText={(v) => set('nome', v)}
            placeholder="Seu nome" autoCapitalize="words" error={errors.nome}
            editable={editing} style={!editing && styles.readOnly} />

          {!isPF && (
            <Input label="Razão Social *" value={form.razaoSocial || ''} onChangeText={(v) => set('razaoSocial', v)}
              placeholder="Empresa Ltda." autoCapitalize="words" error={errors.razaoSocial}
              editable={editing} style={!editing && styles.readOnly} />
          )}

          <Input label="E-mail *" value={form.email || ''} onChangeText={(v) => set('email', v)}
            placeholder="seu@email.com" keyboardType="email-address" error={errors.email}
            editable={editing} style={!editing && styles.readOnly} />

          {isPF ? (
            <>
              <Input label="CPF" value={form.cpf || ''} onChangeText={(v) => set('cpf', v)}
                placeholder="000.000.000-00" keyboardType="numeric"
                editable={editing} style={!editing && styles.readOnly} />
              <Input label="Data de Nascimento" value={form.dataNascimento || ''} onChangeText={(v) => set('dataNascimento', v)}
                placeholder="AAAA-MM-DD" editable={editing} style={!editing && styles.readOnly} />
            </>
          ) : (
            <>
              <Input label="CNPJ" value={form.cnpj || ''} onChangeText={(v) => set('cnpj', v)}
                placeholder="00.000.000/0000-00" keyboardType="numeric"
                editable={editing} style={!editing && styles.readOnly} />
              <Input label="Data de Abertura" value={form.dataNascimento || ''} onChangeText={(v) => set('dataNascimento', v)}
                placeholder="AAAA-MM-DD" editable={editing} style={!editing && styles.readOnly} />
            </>
          )}

          {editing && (
            <View style={styles.actionRow}>
              <Button title="Cancelar" variant="outline" onPress={() => { setEditing(false); fetchPerfil(); }} style={styles.btnHalf} />
              <Button title="Salvar" onPress={handleSave} loading={saving} style={styles.btnHalf} />
            </View>
          )}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.dark} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screenBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 20, paddingVertical: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: COLORS.white, fontSize: 32, fontWeight: '700' },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.dark },
  roleBadge: { marginTop: 6, backgroundColor: '#FFF0F0', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '700', color: COLORS.red, letterSpacing: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.red, textTransform: 'uppercase', letterSpacing: 0.8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 13, color: COLORS.red, fontWeight: '600' },
  readOnly: { opacity: 0.7 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnHalf: { flex: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 8, marginBottom: 24, borderWidth: 1.5, borderColor: COLORS.dark,
    paddingVertical: 13, borderRadius: 6, backgroundColor: COLORS.white,
  },
  logoutText: { color: COLORS.dark, fontWeight: '700', fontSize: 14 },
});
