import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contextos
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { DeckProvider } from './src/contexts/DeckContext';

// Navegação
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <DeckProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </DeckProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
