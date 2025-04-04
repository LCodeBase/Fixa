import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { View, Text, StyleSheet } from 'react-native';

// Contextos
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Telas
import HomeScreen from '../screens/HomeScreen';
import DeckScreen from '../screens/DeckScreen';
import StudyScreen from '../screens/StudyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

// Componente de navegação para web
const WebNavigator = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  // Estilo para links de navegação
  const navLinkStyle = {
    padding: '10px 15px',
    textDecoration: 'none',
    color: theme.colors.primary,
    fontWeight: 'bold',
  };

  // Componente de cabeçalho para web
  const WebHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Text style={[styles.logo, { color: theme.colors.primary }]}>Fixa</Text>
      </Link>
      <View style={styles.navLinks}>
        {currentUser ? (
          // Links para usuários autenticados
          <>
            <Link to="/" style={navLinkStyle}>Home</Link>
            <Link to="/decks" style={navLinkStyle}>Decks</Link>
            <Link to="/study" style={navLinkStyle}>Estudar</Link>
            <Link to="/profile" style={navLinkStyle}>Perfil</Link>
          </>
        ) : (
          // Links para usuários não autenticados
          <>
            <Link to="/login" style={navLinkStyle}>Entrar</Link>
            <Link to="/register" style={navLinkStyle}>Cadastrar</Link>
          </>
        )}
      </View>
    </View>
  );

  return (
    <Router>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <WebHeader />
        <View style={styles.content}>
          <Routes>
            {currentUser ? (
              // Rotas para usuários autenticados
              <>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/decks" element={<DeckScreen />} />
                <Route path="/study" element={<StudyScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
              </>
            ) : (
              // Rotas para usuários não autenticados
              <>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
              </>
            )}
            {/* Rotas comuns a todos os usuários */}
            <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
            <Route path="/terms-of-service" element={<TermsOfServiceScreen />} />
          </Routes>
        </View>
      </View>
    </Router>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  navLinks: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default WebNavigator;