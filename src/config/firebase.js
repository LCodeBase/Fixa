// Configuração do Firebase para o aplicativo Fixa
// Nota: Em um ambiente de produção, estas chaves devem ser armazenadas em variáveis de ambiente

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase
// Substitua estas informações pelas suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id",
  measurementId: "seu-measurement-id"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase que serão utilizados no aplicativo
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;