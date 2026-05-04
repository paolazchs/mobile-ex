import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { cadastroPF } from '../../services/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Header from '../../components/Header';
import { COLORS } from '../../constants';

const ROLES = [
  { label: 'Cliente', value: 'CLIENTE' },
  { label: 'Vendedor', value: 'VENDEDOR' },
];

export default function CadastroPFScreen({ navigation }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    dataNascimento: '',
    role: 'CLIENTE',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome';
    if (!form.email.trim()) e.email = 'Informe o e-mail';
    if (!form.senha || form.senha.length < 6) e.senha = 'Mínimo 6 caracteres';
    if (!form.cpf.trim()) e.cpf = 'Informe o CPF';
    if (!form.dataNascimento.trim()) e.dataNascimento = 'Informe a data de nascimento';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCadastro() {
    if (!validate()) return;
    setLoading(true);
    try {
      await cadastroPF(form);
      Alert.alert('Cadastro realizado!', 'Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      Alert.alert('Erro no cadastro', err.userMessage || 'Tente novamente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Cadastro — Pessoa Física" navigation={navigation} showBack />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input label="Nome *" value={form.nome} onChangeText={(v) => set('nome', v)}
          placeholder="João da Silva" autoCapitalize="words" error={errors.nome} />
        <Input label="E-mail *" value={form.email} onChangeText={(v) => set('email', v)}
          placeholder="joao@email.com" keyboardType="email-address" error={errors.email} />
        <Input label="Senha *" value={form.senha} onChangeText={(v) => set('senha', v)}
          placeholder="Mínimo 6 caracteres" secureTextEntry error={errors.senha} />
        <Input label="CPF *" value={form.cpf} onChangeText={(v) => set('cpf', v)}
          placeholder="000.000.000-00" keyboardType="numeric" error={errors.cpf} />
        <Input label="Data de nascimento *" value={form.dataNascimento} onChangeText={(v) => set('dataNascimento', v)}
          placeholder="AAAA-MM-DD" keyboardType="numeric" error={errors.dataNascimento} />

        <Text style={styles.label}>Perfil *</Text>
        <View style={styles.selectRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.option, form.role === r.value && styles.optionActive]}
              onPress={() => set('role', r.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, form.role === r.value && styles.optionTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Cadastrar" onPress={handleCadastro} loading={loading} style={styles.btn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: COLORS.screenBg, flexGrow: 1 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.darkGray, marginBottom: 8 },
  selectRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  option: {
    flex: 1, paddingVertical: 12, borderRadius: 6,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.white,
  },
  optionActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  optionText: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  optionTextActive: { color: COLORS.white },
  btn: { marginTop: 4 },
});
