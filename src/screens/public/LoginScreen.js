import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS } from '../../constants';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!email.trim()) e.email = 'Informe o e-mail';
    if (!senha) e.senha = 'Informe a senha';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), senha);
    } catch (err) {
      Alert.alert('Erro ao entrar', err.userMessage || 'Verifique suas credenciais');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>TOYOTA</Text>
            <View style={styles.logoBar} />
          </View>
          <Text style={styles.subtitle}>Sistema de Acompanhamento</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Entrar</Text>

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            secureTextEntry
            error={errors.senha}
          />

          <Button title="Entrar" onPress={handleLogin} loading={loading} style={styles.btnLogin} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Novo por aqui?</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerRow}>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('CadastroPF')}
            >
              <Text style={styles.registerBtnText}>Pessoa Física</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.registerBtn, styles.registerBtnSecondary]}
              onPress={() => navigation.navigate('CadastroPJ')}
            >
              <Text style={[styles.registerBtnText, { color: COLORS.dark }]}>Pessoa Jurídica</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.screenBg,
    justifyContent: 'center',
    padding: 24,
  },
  header: { alignItems: 'center', marginBottom: 36 },
  logoBox: { alignItems: 'center', marginBottom: 8 },
  logoText: { fontSize: 32, fontWeight: '900', color: COLORS.dark, letterSpacing: 6 },
  logoBar: { width: 60, height: 4, backgroundColor: COLORS.red, marginTop: 6, borderRadius: 2 },
  subtitle: { color: COLORS.mediumGray, fontSize: 14, letterSpacing: 1 },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark, marginBottom: 20 },
  btnLogin: { marginTop: 6 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 12, color: COLORS.textLight, fontSize: 13 },
  registerRow: { flexDirection: 'row', gap: 10 },
  registerBtn: {
    flex: 1, backgroundColor: COLORS.red,
    paddingVertical: 12, borderRadius: 6, alignItems: 'center',
  },
  registerBtnSecondary: {
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.dark,
  },
  registerBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
});
