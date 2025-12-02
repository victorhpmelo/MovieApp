import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from './src/utils/FavoritesContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <FavoritesProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </FavoritesProvider>
  );
}
