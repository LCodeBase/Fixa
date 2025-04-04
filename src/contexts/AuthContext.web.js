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

// Cria o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  return useContext(AuthContext);
}

// Provedor do contexto de autenticação para web
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

  // Função para fazer login com Google (versão web)
  async function loginWithGoogle() {
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
  }

  // Função para fazer logout
  function logout() {
    return signOut(auth);
  }

  // Função para redefinir a senha
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Função para atualizar o perfil do usuário
  async function updateUserProfile(userData) {
    if (!currentUser) return null;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });
      return true;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  }

  // Função para atualizar as preferências do usuário
  async function updateUserPreferences(preferences) {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), { preferences }, { merge: true });
      return true;
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      throw error;
    }
  }

  // Efeito para monitorar o estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    updateUserProfile,
    updateUserPreferences,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}