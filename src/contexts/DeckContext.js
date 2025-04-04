import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateNextReview } from '../utils/spacedRepetition';

// Cria o contexto de decks
const DeckContext = createContext();

// Hook personalizado para usar o contexto de decks
export function useDecks() {
  return useContext(DeckContext);
}

// Alias para manter compatibilidade com os componentes existentes
export function useDeck() {
  return useContext(DeckContext);
}

// Provedor do contexto de decks
export function DeckProvider({ children }) {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega os decks do usuário
  useEffect(() => {
    if (!currentUser) {
      setDecks([]);
      setLoading(false);
      return;
    }

    const loadDecks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Tenta carregar do cache primeiro para melhor experiência offline
        const cachedDecks = await AsyncStorage.getItem(`decks_${currentUser.uid}`);
        if (cachedDecks) {
          setDecks(JSON.parse(cachedDecks));
        }

        // Carrega os decks do Firestore
        const q = query(
          collection(db, 'decks'),
          where('userId', '==', currentUser.uid),
          orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const decksData = [];

        querySnapshot.forEach((doc) => {
          decksData.push({ id: doc.id, ...doc.data() });
        });

        setDecks(decksData);

        // Atualiza o cache
        await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(decksData));
      } catch (err) {
        console.error('Erro ao carregar decks:', err);
        setError('Não foi possível carregar seus decks. Verifique sua conexão.');
      } finally {
        setLoading(false);
      }
    };

    loadDecks();
  }, [currentUser]);

  // Função para criar um novo deck
  const createDeck = async (deckData) => {
    if (!currentUser) return null;

    try {
      const newDeck = {
        ...deckData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cards: [],
        stats: {
          totalCards: 0,
          newCards: 0,
          learningCards: 0,
          reviewCards: 0,
          masteredCards: 0
        },
        isPublic: false
      };

      const deckRef = doc(collection(db, 'decks'));
      await setDoc(deckRef, newDeck);

      const createdDeck = {
        id: deckRef.id,
        ...newDeck,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Atualiza o estado e o cache
      const updatedDecks = [createdDeck, ...decks];
      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return createdDeck;
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      throw error;
    }
  };

  // Função para atualizar um deck existente
  const updateDeck = async (deckId, deckData) => {
    if (!currentUser) return null;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToUpdate = deckDoc.data();

      // Verifica se o usuário é o proprietário do deck
      if (deckToUpdate.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para editar este deck');
      }

      const updatedDeck = {
        ...deckData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(deckRef, updatedDeck);

      // Atualiza o estado e o cache
      const updatedDecks = decks.map(deck =>
        deck.id === deckId ? { ...deck, ...deckData, updatedAt: new Date().toISOString() } : deck
      );

      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return { id: deckId, ...deckToUpdate, ...updatedDeck };
    } catch (error) {
      console.error('Erro ao atualizar deck:', error);
      throw error;
    }
  };

  // Função para excluir um deck
  const deleteDeck = async (deckId) => {
    if (!currentUser) return false;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToDelete = deckDoc.data();

      // Verifica se o usuário é o proprietário do deck
      if (deckToDelete.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para excluir este deck');
      }

      await deleteDoc(deckRef);

      // Atualiza o estado e o cache
      const updatedDecks = decks.filter(deck => deck.id !== deckId);
      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return true;
    } catch (error) {
      console.error('Erro ao excluir deck:', error);
      throw error;
    }
  };

  // Função para adicionar um novo cartão a um deck
  const addCard = async (deckId, cardData) => {
    if (!currentUser) return null;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToUpdate = deckDoc.data();

      // Verifica se o usuário é o proprietário do deck
      if (deckToUpdate.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para adicionar cartões a este deck');
      }

      const newCard = {
        id: Date.now().toString(),
        ...cardData,
        createdAt: new Date().toISOString(),
        status: 'new',
        repetitionData: {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: new Date().toISOString()
        }
      };

      // Atualiza as estatísticas do deck
      const updatedStats = {
        ...deckToUpdate.stats,
        totalCards: (deckToUpdate.stats.totalCards || 0) + 1,
        newCards: (deckToUpdate.stats.newCards || 0) + 1
      };

      await updateDoc(deckRef, {
        cards: arrayUnion(newCard),
        stats: updatedStats,
        updatedAt: serverTimestamp()
      });

      // Atualiza o estado e o cache
      const updatedDecks = decks.map(deck => {
        if (deck.id === deckId) {
          const updatedCards = [...(deck.cards || []), newCard];
          return {
            ...deck,
            cards: updatedCards,
            stats: updatedStats,
            updatedAt: new Date().toISOString()
          };
        }
        return deck;
      });

      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return newCard;
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      throw error;
    }
  };

  // Função para atualizar um cartão existente
  const updateCard = async (deckId, cardId, cardData) => {
    if (!currentUser) return null;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToUpdate = deckDoc.data();

      // Verifica se o usuário é o proprietário do deck
      if (deckToUpdate.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para editar cartões deste deck');
      }

      // Encontra o cartão a ser atualizado
      const cards = deckToUpdate.cards || [];
      const cardIndex = cards.findIndex(card => card.id === cardId);

      if (cardIndex === -1) {
        throw new Error('Cartão não encontrado');
      }

      // Remove o cartão antigo
      const oldCard = cards[cardIndex];
      await updateDoc(deckRef, {
        cards: arrayRemove(oldCard),
        updatedAt: serverTimestamp()
      });

      // Adiciona o cartão atualizado
      const updatedCard = {
        ...oldCard,
        ...cardData,
      };

      await updateDoc(deckRef, {
        cards: arrayUnion(updatedCard),
        updatedAt: serverTimestamp()
      });

      // Atualiza o estado e o cache
      const updatedDecks = decks.map(deck => {
        if (deck.id === deckId) {
          const updatedCards = deck.cards.map(card =>
            card.id === cardId ? { ...card, ...cardData } : card
          );
          return {
            ...deck,
            cards: updatedCards,
            updatedAt: new Date().toISOString()
          };
        }
        return deck;
      });

      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return updatedCard;
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      throw error;
    }
  };

  // Função para excluir um cartão
  const deleteCard = async (deckId, cardId) => {
    if (!currentUser) return false;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToUpdate = deckDoc.data();

      // Verifica se o usuário é o proprietário do deck
      if (deckToUpdate.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para excluir cartões deste deck');
      }

      // Encontra o cartão a ser excluído
      const cards = deckToUpdate.cards || [];
      const cardToDelete = cards.find(card => card.id === cardId);

      if (!cardToDelete) {
        throw new Error('Cartão não encontrado');
      }

      // Atualiza as estatísticas do deck
      const status = cardToDelete.status || 'new';
      const updatedStats = {
        ...deckToUpdate.stats,
        totalCards: Math.max(0, (deckToUpdate.stats.totalCards || 0) - 1)
      };

      // Decrementa o contador específico para o status do cartão
      const statusKey = `${status}Cards`;
      if (updatedStats[statusKey]) {
        updatedStats[statusKey] = Math.max(0, updatedStats[statusKey] - 1);
      }

      await updateDoc(deckRef, {
        cards: arrayRemove(cardToDelete),
        stats: updatedStats,
        updatedAt: serverTimestamp()
      });

      // Atualiza o estado e o cache
      const updatedDecks = decks.map(deck => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: deck.cards.filter(card => card.id !== cardId),
            stats: updatedStats,
            updatedAt: new Date().toISOString()
          };
        }
        return deck;
      });

      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return true;
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      throw error;
    }
  };

  // Função para registrar uma revisão de cartão
  const reviewCard = async (deckId, cardId, quality) => {
    if (!currentUser) return null;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToUpdate = deckDoc.data();

      // Verifica se o usuário é o proprietário do deck
      if (deckToUpdate.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para revisar cartões deste deck');
      }

      // Encontra o cartão a ser atualizado
      const cards = deckToUpdate.cards || [];
      const cardIndex = cards.findIndex(card => card.id === cardId);

      if (cardIndex === -1) {
        throw new Error('Cartão não encontrado');
      }

      // Remove o cartão antigo
      const oldCard = cards[cardIndex];
      await updateDoc(deckRef, {
        cards: arrayRemove(oldCard),
        updatedAt: serverTimestamp()
      });

      // Calcula os novos dados de repetição usando o algoritmo SM-2
      const oldStatus = oldCard.status || 'new';
      const repetitionData = oldCard.repetitionData || {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: new Date().toISOString()
      };

      const newRepetitionData = calculateNextReview(repetitionData, quality);

      // Determina o novo status do cartão
      let newStatus;
      if (quality < 3) {
        newStatus = 'learning';
      } else if (newRepetitionData.interval >= 21) {
        newStatus = 'mastered';
      } else {
        newStatus = 'review';
      }

      // Atualiza as estatísticas do deck
      const stats = { ...deckToUpdate.stats };

      // Decrementa o contador do status antigo
      const oldStatusKey = `${oldStatus}Cards`;
      if (stats[oldStatusKey]) {
        stats[oldStatusKey] = Math.max(0, stats[oldStatusKey] - 1);
      }

      // Incrementa o contador do novo status
      const newStatusKey = `${newStatus}Cards`;
      if (stats[newStatusKey] !== undefined) {
        stats[newStatusKey] += 1;
      } else {
        stats[newStatusKey] = 1;
      }

      // Cria o cartão atualizado
      const updatedCard = {
        ...oldCard,
        status: newStatus,
        repetitionData: newRepetitionData,
        lastReviewed: new Date().toISOString()
      };

      // Adiciona o cartão atualizado ao deck
      await updateDoc(deckRef, {
        cards: arrayUnion(updatedCard),
        stats: stats,
        updatedAt: serverTimestamp()
      });

      // Atualiza o estado e o cache
      const updatedDecks = decks.map(deck => {
        if (deck.id === deckId) {
          const updatedCards = deck.cards.map(card =>
            card.id === cardId ? updatedCard : card
          );
          return {
            ...deck,
            cards: updatedCards,
            stats: stats,
            updatedAt: new Date().toISOString()
          };
        }
        return deck;
      });

      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return updatedCard;
    } catch (error) {
      console.error('Erro ao revisar cartão:', error);
      throw error;
    }
  };

  // Função para obter cartões para revisão
  const getCardsForReview = (deckId, limit = 20) => {
    if (!decks.length) return [];

    const deck = decks.find(d => d.id === deckId);
    if (!deck || !deck.cards || !deck.cards.length) return [];

    const now = new Date();

    // Filtra os cartões que estão prontos para revisão
    const cardsForReview = deck.cards
      .filter(card => {
        const nextReview = new Date(card.repetitionData?.nextReview || 0);
        return nextReview <= now;
      })
      .sort((a, b) => {
        // Prioriza cartões com base no status e na data de próxima revisão
        const statusPriority = { new: 0, learning: 1, review: 2, mastered: 3 };
        const statusDiff = statusPriority[a.status || 'new'] - statusPriority[b.status || 'new'];

        if (statusDiff !== 0) return statusDiff;

        const aNextReview = new Date(a.repetitionData?.nextReview || 0);
        const bNextReview = new Date(b.repetitionData?.nextReview || 0);
        return aNextReview - bNextReview;
      })
      .slice(0, limit);

    return cardsForReview;
  };

  // Função para compartilhar um deck
  const shareDeck = async (deckId, isPublic) => {
    if (!currentUser) return null;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToUpdate = deckDoc.data();

      // Verifica se o usuário é o proprietário do deck
      if (deckToUpdate.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para compartilhar este deck');
      }

      await updateDoc(deckRef, {
        isPublic,
        updatedAt: serverTimestamp()
      });

      // Atualiza o estado e o cache
      const updatedDecks = decks.map(deck =>
        deck.id === deckId ? { ...deck, isPublic, updatedAt: new Date().toISOString() } : deck
      );

      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return { id: deckId, ...deckToUpdate, isPublic };
    } catch (error) {
      console.error('Erro ao compartilhar deck:', error);
      throw error;
    }
  };

  // Função para buscar decks públicos
  const getPublicDecks = async (searchTerm = '', limit = 20) => {
    try {
      let q;

      if (searchTerm) {
        // Nota: Esta é uma implementação simplificada. Para uma busca mais robusta,
        // seria necessário implementar um sistema de indexação como Algolia ou ElasticSearch
        q = query(
          collection(db, 'decks'),
          where('isPublic', '==', true),
          where('title', '>=', searchTerm),
          where('title', '<=', searchTerm + '\uf8ff'),
          orderBy('title'),
          orderBy('updatedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'decks'),
          where('isPublic', '==', true),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const publicDecks = [];

      querySnapshot.forEach((doc) => {
        const deckData = doc.data();
        // Não incluir os cartões nos resultados da busca para economizar dados
        const { cards, ...deckWithoutCards } = deckData;
        publicDecks.push({
          id: doc.id,
          ...deckWithoutCards,
          cardCount: cards ? cards.length : 0
        });
      });

      return publicDecks.slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar decks públicos:', error);
      throw error;
    }
  };

  // Função para copiar um deck público para a biblioteca do usuário
  const copyPublicDeck = async (deckId) => {
    if (!currentUser) return null;

    try {
      const deckRef = doc(db, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);

      if (!deckDoc.exists()) {
        throw new Error('Deck não encontrado');
      }

      const deckToCopy = deckDoc.data();

      // Verifica se o deck é público
      if (!deckToCopy.isPublic) {
        throw new Error('Este deck não está disponível para cópia');
      }

      // Cria uma cópia do deck para o usuário atual
      const newDeck = {
        title: `${deckToCopy.title} (Cópia)`,
        description: deckToCopy.description,
        category: deckToCopy.category,
        tags: deckToCopy.tags,
        cards: deckToCopy.cards ? [...deckToCopy.cards] : [],
        userId: currentUser.uid,
        originalDeckId: deckId,
        originalCreatorId: deckToCopy.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic: false,
        stats: {
          totalCards: deckToCopy.cards ? deckToCopy.cards.length : 0,
          newCards: deckToCopy.cards ? deckToCopy.cards.length : 0,
          learningCards: 0,
          reviewCards: 0,
          masteredCards: 0
        }
      };

      // Reseta os dados de repetição para todos os cartões
      if (newDeck.cards && newDeck.cards.length > 0) {
        newDeck.cards = newDeck.cards.map(card => ({
          ...card,
          status: 'new',
          repetitionData: {
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReview: new Date().toISOString()
          }
        }));
      }

      const newDeckRef = doc(collection(db, 'decks'));
      await setDoc(newDeckRef, newDeck);

      const createdDeck = {
        id: newDeckRef.id,
        ...newDeck,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Atualiza o estado e o cache
      const updatedDecks = [createdDeck, ...decks];
      setDecks(updatedDecks);
      await AsyncStorage.setItem(`decks_${currentUser.uid}`, JSON.stringify(updatedDecks));

      return createdDeck;
    } catch (error) {
      console.error('Erro ao copiar deck público:', error);
      throw error;
    }
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    decks,
    loading,
    error,
    createDeck,
    updateDeck,
    deleteDeck,
    addCard,
    updateCard,
    deleteCard,
    reviewCard,
    getCardsForReview,
    shareDeck,
    getPublicDecks,
    copyPublicDeck
  };

  return (
    <DeckContext.Provider value={value}>
      {children}
    </DeckContext.Provider>
  );
}