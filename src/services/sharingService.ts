import { v4 as uuidv4 } from 'uuid';
import { Deck } from '../contexts/DeckContext';

/**
 * Interface para um deck compartilhado
 */
export interface SharedDeck {
  id: string;
  originalDeckId: string;
  ownerId: string;
  ownerName: string;
  name: string;
  description: string;
  tags: string[];
  flashcardCount: number;
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  shareCode: string;
}

/**
 * Interface para um comentário em um deck compartilhado
 */
export interface DeckComment {
  id: string;
  deckId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Serviço para gerenciar o compartilhamento de decks entre usuários
 */
export const sharingService = {
  /**
   * Compartilha um deck publicamente
   * @param deck Deck a ser compartilhado
   * @param userName Nome do usuário que está compartilhando
   * @returns Objeto com informações do deck compartilhado
   */
  sharePublicly(deck: Deck, userName: string): SharedDeck {
    // Em uma implementação real, isso salvaria no Firestore
    const sharedDeck: SharedDeck = {
      id: uuidv4(),
      originalDeckId: deck.id,
      ownerId: deck.ownerId,
      ownerName: userName,
      name: deck.name,
      description: deck.description,
      tags: [...deck.tags],
      flashcardCount: deck.flashcards.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadCount: 0,
      rating: 0,
      ratingCount: 0,
      shareCode: this.generateShareCode()
    };

    // Salvar em localStorage para demonstração
    const sharedDecks = this.getSharedDecks();
    sharedDecks.push(sharedDeck);
    localStorage.setItem('fixa_shared_decks', JSON.stringify(sharedDecks));

    return sharedDeck;
  },

  /**
   * Gera um código de compartilhamento único
   * @returns Código de compartilhamento
   */
  generateShareCode(): string {
    // Gera um código de 8 caracteres alfanuméricos
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },

  /**
   * Obtém todos os decks compartilhados publicamente
   * @returns Lista de decks compartilhados
   */
  getSharedDecks(): SharedDeck[] {
    const sharedDecksJson = localStorage.getItem('fixa_shared_decks');
    if (!sharedDecksJson) return [];

    try {
      // Converter strings de data para objetos Date
      return JSON.parse(sharedDecksJson, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error('Erro ao carregar decks compartilhados:', error);
      return [];
    }
  },

  /**
   * Busca decks compartilhados por termo de pesquisa
   * @param searchTerm Termo de pesquisa
   * @returns Lista de decks que correspondem à pesquisa
   */
  searchSharedDecks(searchTerm: string): SharedDeck[] {
    const sharedDecks = this.getSharedDecks();
    if (!searchTerm.trim()) return sharedDecks;

    const term = searchTerm.toLowerCase();
    return sharedDecks.filter(deck =>
      deck.name.toLowerCase().includes(term) ||
      deck.description.toLowerCase().includes(term) ||
      deck.tags.some(tag => tag.toLowerCase().includes(term))
    );
  },

  /**
   * Importa um deck compartilhado para a biblioteca do usuário
   * @param sharedDeckId ID do deck compartilhado
   * @param userId ID do usuário que está importando
   * @returns Promessa que resolve com o deck importado
   */
  async importSharedDeck(sharedDeckId: string, userId: string): Promise<Deck | null> {
    // Em uma implementação real, isso buscaria do Firestore
    const sharedDecks = this.getSharedDecks();
    const sharedDeck = sharedDecks.find(deck => deck.id === sharedDeckId);

    if (!sharedDeck) return null;

    // Incrementar contador de downloads
    sharedDeck.downloadCount += 1;
    localStorage.setItem('fixa_shared_decks', JSON.stringify(sharedDecks));

    // Em uma implementação real, isso buscaria os flashcards completos
    // do deck compartilhado no Firestore

    // Para demonstração, retornamos um deck vazio com as informações básicas
    const importedDeck: Deck = {
      id: uuidv4(),
      name: `${sharedDeck.name} (Importado)`,
      description: `Importado de ${sharedDeck.ownerName}: ${sharedDeck.description}`,
      flashcards: [],
      tags: [...sharedDeck.tags],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      ownerId: userId,
      isFavorite: false,
      studyStreak: 0
    };

    return importedDeck;
  },

  /**
   * Adiciona um comentário a um deck compartilhado
   * @param deckId ID do deck compartilhado
   * @param userId ID do usuário que está comentando
   * @param userName Nome do usuário que está comentando
   * @param content Conteúdo do comentário
   * @returns Comentário criado
   */
  addComment(deckId: string, userId: string, userName: string, content: string): DeckComment {
    if (!content.trim()) {
      throw new Error('O comentário não pode estar vazio');
    }

    const comment: DeckComment = {
      id: uuidv4(),
      deckId,
      userId,
      userName,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Salvar em localStorage para demonstração
    const comments = this.getDeckComments(deckId);
    comments.push(comment);
    localStorage.setItem(`fixa_deck_comments_${deckId}`, JSON.stringify(comments));

    return comment;
  },

  /**
   * Obtém todos os comentários de um deck compartilhado
   * @param deckId ID do deck compartilhado
   * @returns Lista de comentários
   */
  getDeckComments(deckId: string): DeckComment[] {
    const commentsJson = localStorage.getItem(`fixa_deck_comments_${deckId}`);
    if (!commentsJson) return [];

    try {
      // Converter strings de data para objetos Date
      return JSON.parse(commentsJson, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      return [];
    }
  },

  /**
   * Avalia um deck compartilhado
   * @param deckId ID do deck compartilhado
   * @param rating Avaliação (1-5)
   */
  rateDeck(deckId: string, rating: number): void {
    // Garantir que a avaliação está no intervalo correto
    rating = Math.max(1, Math.min(5, rating));

    const sharedDecks = this.getSharedDecks();
    const deckIndex = sharedDecks.findIndex(deck => deck.id === deckId);

    if (deckIndex === -1) return;

    const deck = sharedDecks[deckIndex];

    // Calcular nova avaliação média
    const totalRating = deck.rating * deck.ratingCount + rating;
    deck.ratingCount += 1;
    deck.rating = totalRating / deck.ratingCount;

    // Atualizar no localStorage
    localStorage.setItem('fixa_shared_decks', JSON.stringify(sharedDecks));
  }
};