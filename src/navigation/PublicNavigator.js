import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/public/LoginScreen';
import CadastroPFScreen from '../screens/public/CadastroPFScreen';
import CadastroPJScreen from '../screens/public/CadastroPJScreen';

const Stack = createNativeStackNavigator();

export default function PublicNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CadastroPF" component={CadastroPFScreen} />
      <Stack.Screen name="CadastroPJ" component={CadastroPJScreen} />
    </Stack.Navigator>
  );
}
