import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

import MeusPedidosScreen from '../screens/cliente/MeusPedidosScreen';
import DetalhePedidoScreen from '../screens/cliente/DetalhePedidoScreen';
import PerfilClienteScreen from '../screens/cliente/PerfilClienteScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PedidosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeusPedidos" component={MeusPedidosScreen} />
      <Stack.Screen name="DetalhePedido" component={DetalhePedidoScreen} />
    </Stack.Navigator>
  );
}

export default function ClienteNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Pedidos: 'receipt-outline',
            Perfil: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pedidos" component={PedidosStack} options={{ title: 'Meus Pedidos' }} />
      <Tab.Screen name="Perfil" component={PerfilClienteScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
