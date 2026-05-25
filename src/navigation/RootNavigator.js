import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import ClienteNavigator from './ClienteNavigator';

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <ClienteNavigator />
    </NavigationContainer>
  );
}
