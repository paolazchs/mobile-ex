import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

import PedidosVendedorScreen from '../screens/vendedor/PedidosVendedorScreen';
import GerenciarPedidoScreen from '../screens/vendedor/GerenciarPedidoScreen';
import CriarPedidoScreen from '../screens/vendedor/CriarPedidoScreen';
import VeiculosScreen from '../screens/vendedor/VeiculosScreen';
import DetalheVeiculoScreen from '../screens/vendedor/DetalheVeiculoScreen';
import PerfilVendedorScreen from '../screens/vendedor/PerfilVendedorScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PedidosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaPedidos" component={PedidosVendedorScreen} />
      <Stack.Screen name="GerenciarPedido" component={GerenciarPedidoScreen} />
      <Stack.Screen name="CriarPedido" component={CriarPedidoScreen} />
    </Stack.Navigator>
  );
}

function VeiculosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaVeiculos" component={VeiculosScreen} />
      <Stack.Screen name="DetalheVeiculo" component={DetalheVeiculoScreen} />
    </Stack.Navigator>
  );
}

export default function VendedorNavigator() {
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
            Veiculos: 'car-sport-outline',
            Perfil: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pedidos" component={PedidosStack} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="Veiculos" component={VeiculosStack} options={{ title: 'Veículos' }} />
      <Tab.Screen name="Perfil" component={PerfilVendedorScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
