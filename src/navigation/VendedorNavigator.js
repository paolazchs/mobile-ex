import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeVendedorScreen from '../screens/vendedor/HomeVendedorScreen';

const Stack = createNativeStackNavigator();

export default function VendedorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeVendedor" component={HomeVendedorScreen} />
    </Stack.Navigator>
  );
}
