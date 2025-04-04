import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contextos
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { DeckProvider } from './src/contexts/DeckContext';

// Navegação para Web
import WebNavigator from './src/navigation/WebNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <DeckProvider>
            <WebNavigator />
          </DeckProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}