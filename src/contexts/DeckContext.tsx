import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

// Tipos para o algoritmo de repetição espaçada (SM-2)
type RepetitionData = {
  repetitions: number; // Número de repetições bem-sucedidas
  easeFactor: number; // Fator de facilidade (1.3 - 2.5)
  interval: number; // Intervalo em dias
  dueDate: Date; // Data da próxima revisão
  lastReview: Date; // Data da última revisão
};

// Tipo para um flashcard
export type Flashcard = {
  id: string;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  frontAudio?: string;
  backAudio?: string;
  tags: string[];
  repetitionData: RepetitionData;
  createdAt: Date;
  updatedAt: Date;
};

// Tipo para um deck de flashcards
export type Deck = {
  id: string;
  name: string;
  description: string;
  flashcards: Flashcard[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  ownerId: string;
  isFavorite: boolean;
  lastStudied?: Date;
  studyStreak: number;
};

// Tipo para o contexto de decks
type DeckContextType = {
  decks: Deck[];
  loading: boolean;
  error: string | null;
  createDeck: (name: string, description: string, tags?: string[]) => Promise<Deck>;
  updateDeck: (deckId: string, data: Partial<Deck>) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  getDeck: (deckId: string) => Deck | undefined;
  addFlashcard: (deckId: string, front: string, back: string, options?: Partial<Omit<Flashcard, 'id' | 'repetitionData' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  updateFlashcard: (deckId: string, flashcardId: string, data: Partial<Flashcard>) => Promise<void>;
  deleteFlashcard: (deckId: string, flashcardId: string) => Promise<void>;
  updateFlashcardReview: (deckId: string, flashcardId: string, quality: number) => Promise<void>;
  getDueFlashcards: (deckId: string) => Flashcard[];
  importDeck: (file: File) => Promise<void>;
  exportDeck: (deckId: string) => Promise<void>;
  shareDeck: (deckId: string, isPublic: boolean) => Promise<void>;
  toggleFavorite: (deckId: string) => Promise<void>;
  getFavoriteDecks: () => Deck[];
  getStudyStats: () => { totalStudied: number, studiedToday: number, streak: number };
};

export const DeckContext = createContext<DeckContextType>({} as DeckContextType);

type DeckProviderProps = {
  children: ReactNode;
};

export const DeckProvider = ({ children }: DeckProviderProps) => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar decks do localStorage ao iniciar
  useEffect(() => {
    if (user) {
      try {
        const savedDecks = localStorage.getItem(`fixa_decks_${user.uid}`);
        if (savedDecks) {
          // Converter strings de data para objetos Date
          const parsedDecks = JSON.parse(savedDecks, (key, value) => {
            if (key === 'createdAt' || key === 'updatedAt' || key === 'dueDate' || key === 'lastReview') {
              return new Date(value);
            }
            return value;
          });
          setDecks(parsedDecks);
        }
      } catch (err) {
        console.error('Erro ao carregar decks:', err);
        setError('Não foi possível carregar seus decks. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    } else {
      setDecks([]);
      setLoading(false);
    }
  }, [user]);

  // Salvar decks no localStorage quando mudam
  useEffect(() => {
    if (user && decks.length > 0) {
      localStorage.setItem(`fixa_decks_${user.uid}`, JSON.stringify(decks));
    }
  }, [decks, user]);

  // Criar um novo deck
  const createDeck = async (name: string, description: string, tags: string[] = []): Promise<Deck> => {
    if (!user) throw new Error('Usuário não autenticado');

    const newDeck: Deck = {
      id: uuidv4(),
      name,
      description,
      flashcards: [],
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      ownerId: user.uid,
      isFavorite: false,
      studyStreak: 0
    };

    setDecks(prevDecks => [...prevDecks, newDeck]);
    return newDeck;
  };

  // Atualizar um deck existente
  const updateDeck = async (deckId: string, data: Partial<Deck>): Promise<void> => {
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? { ...deck, ...data, updatedAt: new Date() }
          : deck
      )
    );
  };

  // Excluir um deck
  const deleteDeck = async (deckId: string): Promise<void> => {
    setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
  };

  // Obter um deck específico
  const getDeck = (deckId: string): Deck | undefined => {
    return decks.find(deck => deck.id === deckId);
  };

  // Adicionar um flashcard a um deck
  const addFlashcard = async (
    deckId: string,
    front: string,
    back: string,
    options?: Partial<Omit<Flashcard, 'id' | 'repetitionData' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    const now = new Date();
    const newFlashcard: Flashcard = {
      id: uuidv4(),
      front,
      back,
      frontImage: options?.frontImage,
      backImage: options?.backImage,
      frontAudio: options?.frontAudio,
      backAudio: options?.backAudio,
      tags: options?.tags || [],
      repetitionData: {
        repetitions: 0,
        easeFactor: 2.5, // Valor inicial padrão do algoritmo SM-2
        interval: 0,
        dueDate: now,
        lastReview: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? {
            ...deck,
            flashcards: [...deck.flashcards, newFlashcard],
            updatedAt: now,
          }
          : deck
      )
    );
  };

  // Atualizar um flashcard
  const updateFlashcard = async (
    deckId: string,
    flashcardId: string,
    data: Partial<Flashcard>
  ): Promise<void> => {
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? {
            ...deck,
            flashcards: deck.flashcards.map(card =>
              card.id === flashcardId
                ? { ...card, ...data, updatedAt: new Date() }
                : card
            ),
            updatedAt: new Date(),
          }
          : deck
      )
    );
  };

  // Excluir um flashcard
  const deleteFlashcard = async (deckId: string, flashcardId: string): Promise<void> => {
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? {
            ...deck,
            flashcards: deck.flashcards.filter(card => card.id !== flashcardId),
            updatedAt: new Date(),
          }
          : deck
      )
    );
  };

  // Implementação do algoritmo SM-2 para repetição espaçada
  const updateFlashcardReview = async (
    deckId: string,
    flashcardId: string,
    quality: number // 0-5, onde 0 é falha completa e 5 é resposta perfeita
  ): Promise<void> => {
    // Garantir que a qualidade está no intervalo correto
    quality = Math.max(0, Math.min(5, quality));
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    setDecks(prevDecks =>
      prevDecks.map(deck => {
        if (deck.id !== deckId) return deck;

        // Verificar se é o primeiro estudo do dia para este deck
        let isFirstStudyToday = true;
        let updatedStreak = deck.studyStreak;

        if (deck.lastStudied) {
          const lastStudiedDate = new Date(deck.lastStudied);
          lastStudiedDate.setHours(0, 0, 0, 0);

          // Se já estudou hoje, não é o primeiro estudo
          if (lastStudiedDate.getTime() === today.getTime()) {
            isFirstStudyToday = false;
          } else {
            // Verificar se o último estudo foi ontem para manter o streak
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastStudiedDate.getTime() === yesterday.getTime()) {
              // Estudou ontem, incrementa o streak
              updatedStreak += 1;
            } else if (lastStudiedDate.getTime() < yesterday.getTime()) {
              // Não estudou ontem, reseta o streak
              updatedStreak = 1;
            }
          }
        } else {
          // Primeiro estudo de todos, começa o streak
          updatedStreak = 1;
        }

        return {
          ...deck,
          lastStudied: now,
          studyStreak: updatedStreak,
          flashcards: deck.flashcards.map(card => {
            if (card.id !== flashcardId) return card;

            const { repetitionData } = card;
            let newRepetitionData: RepetitionData;

            // Algoritmo SM-2
            if (quality >= 3) {
              // Resposta correta
              let newEaseFactor = repetitionData.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
              newEaseFactor = Math.max(1.3, newEaseFactor); // Mínimo de 1.3

              let newInterval;
              if (repetitionData.repetitions === 0) {
                newInterval = 1; // 1 dia após a primeira revisão correta
              } else if (repetitionData.repetitions === 1) {
                newInterval = 6; // 6 dias após a segunda revisão correta
              } else {
                // Para revisões subsequentes, multiplica o intervalo anterior pelo fator de facilidade
                newInterval = Math.round(repetitionData.interval * newEaseFactor);
              }

              // Calcular a próxima data de revisão
              const dueDate = new Date(now);
              dueDate.setDate(dueDate.getDate() + newInterval);

              newRepetitionData = {
                repetitions: repetitionData.repetitions + 1,
                easeFactor: newEaseFactor,
                interval: newInterval,
                dueDate,
                lastReview: now,
              };
            } else {
              // Resposta incorreta - resetar repetições, mas manter o fator de facilidade
              let newEaseFactor = repetitionData.easeFactor - 0.2;
              newEaseFactor = Math.max(1.3, newEaseFactor); // Mínimo de 1.3

              // Revisão no dia seguinte
              const dueDate = new Date(now);
              dueDate.setDate(dueDate.getDate() + 1);

              newRepetitionData = {
                repetitions: 0,
                easeFactor: newEaseFactor,
                interval: 0,
                dueDate,
                lastReview: now,
              };
            }

            return {
              ...card,
              repetitionData: newRepetitionData,
              updatedAt: now,
            };
          }),
          updatedAt: new Date(),
        };
      })
    );
  };

  // Obter flashcards que precisam ser revisados hoje
  const getDueFlashcards = (deckId: string): Flashcard[] => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return [];

    const now = new Date();
    return deck.flashcards.filter(card => {
      const dueDate = new Date(card.repetitionData.dueDate);
      return dueDate <= now;
    });
  };

  // Importar deck (de um arquivo CSV ou Anki)
  const importDeck = async (file: File): Promise<void> => {
    try {
      // Implementação básica para CSV
      // Em uma implementação real, você precisaria analisar diferentes formatos
      const text = await file.text();
      const lines = text.split('\n');

      if (lines.length < 2) throw new Error('Arquivo vazio ou inválido');

      // Criar um novo deck com o nome do arquivo
      const deckName = file.name.replace(/\.[^/.]+$/, ""); // Remove a extensão
      const newDeck = await createDeck(deckName, `Importado de ${file.name}`);

      // Pular o cabeçalho e processar cada linha
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [front, back] = line.split(',').map(item => item.trim());
        if (front && back) {
          await addFlashcard(newDeck.id, front, back);
        }
      }
    } catch (err) {
      console.error('Erro ao importar deck:', err);
      setError('Não foi possível importar o deck. Verifique o formato do arquivo.');
    }
  };

  // Exportar deck para CSV
  const exportDeck = async (deckId: string): Promise<void> => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) {
      setError('Deck não encontrado');
      return;
    }

    try {
      // Criar conteúdo CSV
      let csvContent = "front,back\n";
      deck.flashcards.forEach(card => {
        // Escapar aspas e vírgulas para evitar problemas no CSV
        const front = `"${card.front.replace(/"/g, '""')}"`;
        const back = `"${card.back.replace(/"/g, '""')}"`;
        csvContent += `${front},${back}\n`;
      });

      // Criar e baixar o arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${deck.name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao exportar deck:', err);
      setError('Não foi possível exportar o deck.');
    }
  };

  // Compartilhar deck (tornar público/privado)
  const shareDeck = async (deckId: string, isPublic: boolean): Promise<void> => {
    await updateDeck(deckId, { isPublic });
  };

  // Alternar favorito
  const toggleFavorite = async (deckId: string): Promise<void> => {
    const deck = getDeck(deckId);
    if (deck) {
      await updateDeck(deckId, { isFavorite: !deck.isFavorite });
    }
  };

  // Obter decks favoritos
  const getFavoriteDecks = (): Deck[] => {
    return decks.filter(deck => deck.isFavorite);
  };

  // Obter estatísticas de estudo
  // Modificar a função getStudyStats para calcular estatísticas reais
  const getStudyStats = () => {
    let totalStudied = 0;
    let studiedToday = 0;
    let maxStreak = 0;
    let retentionRate = 0;
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Para calcular taxa de retenção
    let totalReviews = 0;
    let successfulReviews = 0;
  
    decks.forEach(deck => {
      // Atualizar o streak máximo
      if (deck.studyStreak > maxStreak) {
        maxStreak = deck.studyStreak;
      }
  
      deck.flashcards.forEach(card => {
        if (card.repetitionData.repetitions > 0) {
          totalStudied++;
          totalReviews++;
          
          // Considerar cartões com fator de facilidade > 2.0 como bem retidos
          if (card.repetitionData.easeFactor > 2.0) {
            successfulReviews++;
          }
  
          // Verificar se foi estudado hoje
          const lastReview = new Date(card.repetitionData.lastReview);
          lastReview.setHours(0, 0, 0, 0);
          if (lastReview.getTime() === today.getTime()) {
            studiedToday++;
          }
        }
      });
    });
  
    // Calcular taxa de retenção real (evitar divisão por zero)
    retentionRate = totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 0;
  
    return { 
      totalStudied, 
      studiedToday, 
      streak: maxStreak,
      retentionRate
    };
  };

  return (
    <DeckContext.Provider
      value={{
        decks,
        loading,
        error,
        createDeck,
        updateDeck,
        deleteDeck,
        getDeck,
        addFlashcard,
        updateFlashcard,
        deleteFlashcard,
        updateFlashcardReview,
        getDueFlashcards,
        importDeck,
        exportDeck,
        shareDeck,
        toggleFavorite,
        getFavoriteDecks,
        getStudyStats,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};