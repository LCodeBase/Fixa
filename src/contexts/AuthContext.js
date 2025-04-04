import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';

// Cria o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  return useContext(AuthContext);
}

// Provedor do contexto de autenticação
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para registrar um novo usuário com email e senha
  async function signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Cria um documento para o usuário no Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        preferences: {
          darkMode: false,
          notificationsEnabled: true,
          notificationFrequency: 'daily'
        }
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Função para fazer login com email e senha
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Função para fazer login com Google
  async function loginWithGoogle() {
    // Verificar se estamos em ambiente web ou mobile
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      // Adiciona o ID do projeto como escopo
      provider.addScope('https://www.googleapis.com/auth/firebase.project-646836569734');

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Verifica se o usuário já existe no Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        // Se não existir, cria um novo documento
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName,
            email: user.email,
            createdAt: new Date().toISOString(),
            preferences: {
              darkMode: false,
              notificationsEnabled: true,
              notificationFrequency: 'daily'
            }
          });
        }

        return user;
      } catch (error) {
        console.error("Erro no login com Google:", error);
        throw error;
      }
    } else {
      // Para ambiente mobile (Expo)
      try {
        // Configuração para o projeto específico
        const { type, accessToken, idToken } = await Google.logInAsync({
          iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
          androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
          webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
          scopes: ['profile', 'email', 'https://www.googleapis.com/auth/firebase.project-646836569734'],
        });

        if (type === 'success') {
          // Criar credencial do Google com o token
          const credential = GoogleAuthProvider.credential(idToken, accessToken);

          // Fazer login no Firebase com a credencial
          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;

          // Verifica se o usuário já existe no Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          // Se não existir, cria um novo documento
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              name: user.displayName,
              email: user.email,
              createdAt: new Date().toISOString(),
              preferences: {
                darkMode: false,
                notificationsEnabled: true,
                notificationFrequency: 'daily'
              }
            });
          }

          return user;
        } else {
          return null;
        }
      } catch (error) {
        console.error("Erro no login com Google:", error);
        throw error;
      }
    }
  }

  // Função para fazer logout
  function logout() {
    return signOut(auth);
  }

  // Função para redefinir a senha
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Função para atualizar as preferências do usuário
  async function updateUserPreferences(preferences) {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), { preferences }, { merge: true });

      // Atualiza o cache local
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      await AsyncStorage.setItem('userPreferences', JSON.stringify(userData.preferences));

      return userData;
    } catch (error) {
      throw error;
    }
  }

  // Efeito para monitorar o estado de autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Carrega as preferências do usuário do Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Armazena as preferências no AsyncStorage para acesso offline
            await AsyncStorage.setItem('userPreferences', JSON.stringify(userData.preferences));
          }
        } catch (error) {
          console.error('Erro ao carregar preferências do usuário:', error);
        }
      } else {
        // Limpa as preferências do usuário do AsyncStorage
        await AsyncStorage.removeItem('userPreferences');
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Valores a serem disponibilizados pelo contexto
  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}