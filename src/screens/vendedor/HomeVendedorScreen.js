import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants';

export default function HomeVendedorScreen() {
  const { user, signOut } = useAuth();

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>TOYOTA</Text>
        <View style={styles.logoBar} />
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.nome || user?.razaoSocial || 'V')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.welcome}>Bem-vindo,</Text>
        <Text style={styles.name}>{user?.nome || user?.razaoSocial || '—'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>VENDEDOR</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.screenBg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 28, fontWeight: '900', color: COLORS.dark, letterSpacing: 6 },
  logoBar: { width: 50, height: 4, backgroundColor: COLORS.red, marginTop: 6, borderRadius: 2 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 32,
    alignItems: 'center', width: '100%',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  avatarText: { color: COLORS.white, fontSize: 28, fontWeight: '700' },
  welcome: { fontSize: 14, color: COLORS.mediumGray },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.dark, marginTop: 4, textAlign: 'center' },
  badge: {
    marginTop: 12, backgroundColor: COLORS.red,
    paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
  },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  logoutBtn: {
    marginTop: 24, borderWidth: 1.5, borderColor: COLORS.dark,
    paddingVertical: 12, paddingHorizontal: 32, borderRadius: 6,
  },
  logoutText: { color: COLORS.dark, fontWeight: '700', fontSize: 14 },
});
