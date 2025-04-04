import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

// Definição dos temas claro e escuro
export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#4A6FFF',
    secondary: '#FF6B6B',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#333333',
    border: '#E0E0E0',
    notification: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    info: '#5AC8FA',
    error: '#FF3B30',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.3)',
    cardHighlight: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  roundness: {
    small: 4,
    medium: 8,
    large: 16,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
  },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#6B8AFF',
    secondary: '#FF8585',
    background: '#121212',
    card: '#1E1E1E',
    text: '#F5F5F5',
    border: '#333333',
    notification: '#FF453A',
    success: '#30D158',
    warning: '#FFD60A',
    info: '#64D2FF',
    error: '#FF453A',
    disabled: '#666666',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    cardHighlight: '#2C2C2C',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  roundness: {
    small: 4,
    medium: 8,
    large: 16,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
  },
};

// Cria o contexto de tema
const ThemeContext = createContext();

// Hook personalizado para usar o contexto de tema
export function useTheme() {
  return useContext(ThemeContext);
}

// Provedor do contexto de tema
export function ThemeProvider({ children }) {
  const { currentUser } = useAuth();
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme === 'dark' ? darkTheme : lightTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Carrega o tema salvo no AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme');
        if (savedTheme) {
          setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
        } else if (currentUser) {
          // Se o usuário estiver logado, tenta carregar as preferências do usuário
          const userPreferences = await AsyncStorage.getItem('userPreferences');
          if (userPreferences) {
            const { darkMode } = JSON.parse(userPreferences);
            setTheme(darkMode ? darkTheme : lightTheme);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, [currentUser]);

  // Função para alternar entre os temas claro e escuro
  const toggleTheme = async () => {
    const newTheme = theme.mode === 'dark' ? lightTheme : darkTheme;
    setTheme(newTheme);

    try {
      await AsyncStorage.setItem('userTheme', newTheme.mode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  // Função para definir o tema específico
  const setThemeMode = async (mode) => {
    const newTheme = mode === 'dark' ? darkTheme : lightTheme;
    setTheme(newTheme);

    try {
      await AsyncStorage.setItem('userTheme', mode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isDarkMode: theme.mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {isThemeLoaded ? children : null}
    </ThemeContext.Provider>
  );
}