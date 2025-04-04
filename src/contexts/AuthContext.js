import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const provider = new GoogleAuthProvider();
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
      throw error;
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