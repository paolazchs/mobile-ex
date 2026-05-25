import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import PublicNavigator from './PublicNavigator';

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <PublicNavigator />
    </NavigationContainer>
  );
}
