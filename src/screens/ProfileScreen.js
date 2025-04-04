import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { currentUser, logout, updateUserPreferences } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    darkMode: theme.mode === 'dark',
    notificationsEnabled: true,
    notificationFrequency: 'daily'
  });
  const [loading, setLoading] = useState(false);

  // Carrega as preferências do usuário
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPreferences = await AsyncStorage.getItem('userPreferences');
        if (storedPreferences) {
          const parsedPreferences = JSON.parse(storedPreferences);
          setPreferences({
            ...preferences,
            ...parsedPreferences,
            darkMode: theme.mode === 'dark' // Sincroniza com o tema atual
          });
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      }
    };

    loadPreferences();
  }, []);

  // Função para alternar o modo escuro
  const handleToggleDarkMode = () => {
    const newValue = !preferences.darkMode;
    setPreferences({ ...preferences, darkMode: newValue });
    toggleTheme();
    savePreferences({ ...preferences, darkMode: newValue });
  };

  // Função para alternar as notificações
  const handleToggleNotifications = () => {
    const newValue = !preferences.notificationsEnabled;
    setPreferences({ ...preferences, notificationsEnabled: newValue });
    savePreferences({ ...preferences, notificationsEnabled: newValue });
  };

  // Função para alterar a frequência das notificações
  const handleChangeNotificationFrequency = (frequency) => {
    setPreferences({ ...preferences, notificationFrequency: frequency });
    savePreferences({ ...preferences, notificationFrequency: frequency });
  };

  // Salva as preferências do usuário
  const savePreferences = async (newPreferences) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await updateUserPreferences(newPreferences);
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      Alert.alert('Erro', 'Não foi possível salvar suas preferências. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Image
          source={require('../../images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.profileInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {currentUser?.displayName || 'Usuário'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.placeholder }]}>
              {currentUser?.email || ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aparência</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons
              name={preferences.darkMode ? 'weather-night' : 'weather-sunny'}
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.settingText, { color: theme.colors.text }]}>
              Modo Escuro
            </Text>
          </View>
          <Switch
            value={preferences.darkMode}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notificações</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.settingText, { color: theme.colors.text }]}>
              Ativar Notificações
            </Text>
          </View>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>

        {preferences.notificationsEnabled && (
          <View style={styles.frequencyContainer}>
            <Text style={[styles.frequencyTitle, { color: theme.colors.text }]}>
              Frequência
            </Text>
            <View style={styles.frequencyOptions}>
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  preferences.notificationFrequency === 'daily' &&
                  { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => handleChangeNotificationFrequency('daily')}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    preferences.notificationFrequency === 'daily' ?
                    { color: 'white' } : { color: theme.colors.text }
                  ]}
                >
                  Diária
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  preferences.notificationFrequency === 'weekly' &&
                  { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => handleChangeNotificationFrequency('weekly')}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    preferences.notificationFrequency === 'weekly' ?
                    { color: 'white' } : { color: theme.colors.text }
                  ]}
                >
                  Semanal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Conta</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleLogout}
        >
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={theme.colors.error}
            />
            <Text style={[styles.settingText, { color: theme.colors.error }]}>
              Sair da Conta
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.placeholder}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.placeholder }]}>
          Fixa v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logo: {
    width: 80,
    height: 40,
  },
  profileCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  frequencyContainer: {
    padding: 16,
    paddingTop: 0,
  },
  frequencyTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  frequencyOptions: {
    flexDirection: 'row',
  },
  frequencyOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  frequencyText: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default ProfileScreen;