import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import PublicNavigator from './PublicNavigator';
import ClienteNavigator from './ClienteNavigator';
import VendedorNavigator from './VendedorNavigator';

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  function getNavigator() {
    if (!user) return <PublicNavigator />;
    if (user.role === 'VENDEDOR') return <VendedorNavigator />;
    return <ClienteNavigator />;
  }

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
}
