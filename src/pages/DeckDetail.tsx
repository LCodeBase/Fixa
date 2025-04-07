import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeck } from '../hooks/useDeck';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FlashcardForm from '../components/FlashcardForm';

// Icons
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ShareIcon,
  TagIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

// Definição do tipo FlashcardFormData compatível com o componente FlashcardForm
type FlashcardFormData = {
  front: string;
  back: string;
  frontImage?: File | string;
  backImage?: File | string;
  frontAudio?: string;
  backAudio?: string;
  frontDocument?: {
    file?: File;
    url?: string;
    name: string;
    type: string;
  };
  backDocument?: {
    file?: File;
    url?: string;
    name: string;
    type: string;
  };
  tags: string;
};

const DeckDetail = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { decks, loading, error, getDeck, updateDeck, addFlashcard, updateFlashcard, deleteFlashcard } = useDeck();

  const [deck, setDeck] = useState(getDeck(deckId || ''));
  const [isEditing, setIsEditing] = useState(false);
  const [deckName, setDeckName] = useState(deck?.name || '');
  const [deckDescription, setDeckDescription] = useState(deck?.description || '');
  const [deckTags, setDeckTags] = useState(deck?.tags.join(', ') || '');

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCardBacks, setShowCardBacks] = useState<Record<string, boolean>>({});

  const [newCard, setNewCard] = useState<FlashcardFormData>({
    front: '',
    back: '',
    tags: ''
  });

  // Atualizar o deck quando os decks mudarem
  useEffect(() => {
    if (deckId) {
      const currentDeck = getDeck(deckId);
      setDeck(currentDeck);

      if (currentDeck) {
        setDeckName(currentDeck.name);
        setDeckDescription(currentDeck.description);
        setDeckTags(currentDeck.tags.join(', '));
      }
    }
  }, [deckId, decks, getDeck]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Deck não encontrado!</strong>
        <span className="block sm:inline"> O deck que você está procurando não existe ou foi removido.</span>
        <div className="mt-4">
          <button
            onClick={() => navigate('/decks')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Voltar para meus decks
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId || !deckName.trim()) return;

    try {
      const tagsArray = deckTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      await updateDeck(deckId, {
        name: deckName,
        description: deckDescription,
        tags: tagsArray
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar deck:', error);
    }
  };

  const handleAddFlashcard = async (formData: FlashcardFormData) => {
    if (!deckId) return;

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      // Garantir que os tipos de imagem sejam compatíveis
      const frontImageValue = typeof formData.frontImage === 'string' ? formData.frontImage : undefined;
      const backImageValue = typeof formData.backImage === 'string' ? formData.backImage : undefined;

      // Garantir que os documentos tenham a estrutura correta
      const frontDocumentValue = formData.frontDocument ? {
        url: formData.frontDocument.url || '',
        name: formData.frontDocument.name,
        type: formData.frontDocument.type
      } : undefined;

      const backDocumentValue = formData.backDocument ? {
        url: formData.backDocument.url || '',
        name: formData.backDocument.name,
        type: formData.backDocument.type
      } : undefined;

      await addFlashcard(deckId, formData.front, formData.back, {
        frontImage: frontImageValue,
        backImage: backImageValue,
        frontAudio: formData.frontAudio,
        backAudio: formData.backAudio,
        frontDocument: frontDocumentValue,
        backDocument: backDocumentValue,
        tags: tagsArray
      });

      setNewCard({
        front: '',
        back: '',
        tags: ''
      });
      setIsAddingCard(false);
    } catch (error) {
      console.error('Erro ao adicionar flashcard:', error);
    }
  };

  const handleUpdateFlashcard = async (formData: FlashcardFormData) => {
    if (!deckId || !editingCardId) return;

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      // Garantir que os tipos de imagem sejam compatíveis
      const frontImageValue = typeof formData.frontImage === 'string' ? formData.frontImage : undefined;
      const backImageValue = typeof formData.backImage === 'string' ? formData.backImage : undefined;

      // Garantir que os documentos tenham a estrutura correta
      const frontDocumentValue = formData.frontDocument ? {
        url: formData.frontDocument.url || '',
        name: formData.frontDocument.name,
        type: formData.frontDocument.type
      } : undefined;

      const backDocumentValue = formData.backDocument ? {
        url: formData.backDocument.url || '',
        name: formData.backDocument.name,
        type: formData.backDocument.type
      } : undefined;

      await updateFlashcard(deckId, editingCardId, {
        front: formData.front,
        back: formData.back,
        frontImage: frontImageValue,
        backImage: backImageValue,
        frontAudio: formData.frontAudio,
        backAudio: formData.backAudio,
        frontDocument: frontDocumentValue,
        backDocument: backDocumentValue,
        tags: tagsArray
      });

      setNewCard({
        front: '',
        back: '',
        tags: ''
      });
      setEditingCardId(null);
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error);
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!deckId) return;

    try {
      await deleteFlashcard(deckId, flashcardId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Erro ao excluir flashcard:', error);
    }
  };

  const startEditingFlashcard = (flashcardId: string) => {
    const flashcard = deck.flashcards.find(card => card.id === flashcardId);
    if (flashcard) {
      setNewCard({
        front: flashcard.front,
        back: flashcard.back,
        frontImage: flashcard.frontImage,
        backImage: flashcard.backImage,
        frontAudio: flashcard.frontAudio,
        backAudio: flashcard.backAudio,
        tags: flashcard.tags.join(', ')
      });
      setEditingCardId(flashcardId);
      setIsAddingCard(false);
    }
  };

  const toggleCardBack = (flashcardId: string) => {
    setShowCardBacks(prev => ({
      ...prev,
      [flashcardId]: !prev[flashcardId]
    }));
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/decks')}
          className="mr-4 inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
        </button>

        {isEditing ? (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Deck</h1>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{deck.name}</h1>
        )}
      </div>

      {/* Informações do deck */}
      {!isEditing ? (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{deck.name}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{deck.description}</p>

                {deck.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {deck.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                        <TagIcon className="-ml-0.5 mr-1.5 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>Criado em {format(new Date(deck.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p>Última atualização em {format(new Date(deck.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p>{deck.flashcards.length} flashcards</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                  Editar
                </button>
                <button
                  onClick={() => navigate(`/study/${deckId}`)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Estudar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Editar deck</h3>
            <form className="mt-5 space-y-4" onSubmit={handleUpdateDeck}>
              <div>
                <label htmlFor="deck-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome do deck *
                </label>
                <input
                  type="text"
                  name="deck-name"
                  id="deck-name"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="deck-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descrição
                </label>
                <textarea
                  name="deck-description"
                  id="deck-description"
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="deck-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  name="deck-tags"
                  id="deck-tags"
                  value={deckTags}
                  onChange={(e) => setDeckTags(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flashcards */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Flashcards</h2>
        <button
          onClick={() => {
            setIsAddingCard(true);
            setEditingCardId(null);
            setNewCard({
              front: '',
              back: '',
              tags: ''
            });
          }}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
          Novo Flashcard
        </button>
      </div>

      {/* Formulário de adição/edição de flashcard */}
      {(isAddingCard || editingCardId) && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {editingCardId ? 'Editar flashcard' : 'Adicionar novo flashcard'}
            </h3>
            <div className="mt-5">
              <FlashcardForm
                deckId={deckId || ''}
                initialData={newCard}
                onSubmit={editingCardId ? handleUpdateFlashcard : handleAddFlashcard}
                onCancel={() => {
                  setIsAddingCard(false);
                  setEditingCardId(null);
                  setNewCard({
                    front: '',
                    back: '',
                    tags: ''
                  });
                }}
                isEditing={!!editingCardId}
              />
            </div>
            {/* Input de arquivo removido pois o componente FlashcardForm já lida com o upload de imagens */}
          </div>
        </div>
      )}

      {/* Lista de flashcards */}
      {
        deck.flashcards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Este deck ainda não tem flashcards.</p>
            <button
              onClick={() => {
                setIsAddingCard(true);
                setEditingCardId(null);
                setNewCard({
                  front: '',
                  back: '',
                  tags: ''
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Criar primeiro flashcard
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {deck.flashcards.map((card) => (
                <li key={card.id} className="relative">
                  {deleteConfirmId === card.id ? (
                    <div className="px-4 py-4 sm:px-6 bg-red-50 dark:bg-red-900">
                      <div className="text-sm text-red-600 dark:text-red-200 mb-2">Tem certeza que deseja excluir este flashcard? Esta ação não pode ser desfeita.</div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDeleteFlashcard(card.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Sim, excluir
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium">
                                <button
                                  onClick={() => toggleCardBack(card.id)}
                                  className="focus:outline-none w-full text-left"
                                >
                                  <span className="absolute inset-0" aria-hidden="true" />
                                  <span className="text-gray-900 dark:text-white">{card.front}</span>
                                </button>
                              </h3>
                              {card.frontImage && (
                                <div className="mt-2">
                                  <img
                                    src={card.frontImage}
                                    alt="Imagem da frente"
                                    className="max-h-40 rounded-md"
                                  />
                                </div>
                              )}
                              {card.frontAudio && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => new Audio(card.frontAudio).play()}
                                    className="inline-flex items-center px-2 py-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                  >
                                    <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                                    Ouvir áudio
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-shrink-0 flex">
                              <button
                                onClick={() => toggleCardBack(card.id)}
                                className="mr-2 inline-flex items-center px-2 py-1 border border-transparent text-xs rounded-md text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                {showCardBacks[card.id] ? (
                                  <>
                                    <EyeSlashIcon className="h-4 w-4 mr-1" />
                                    Esconder
                                  </>
                                ) : (
                                  <>
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    Mostrar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Mostrar o verso do cartão se showCardBacks[card.id] for true */}
                          {showCardBacks[card.id] && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="text-sm text-gray-900 dark:text-white">
                                <span className="font-medium text-gray-500 dark:text-gray-400 block mb-1">Verso:</span>
                                {card.back}
                              </div>
                              {card.backImage && (
                                <div className="mt-2">
                                  <img
                                    src={card.backImage}
                                    alt="Imagem do verso"
                                    className="max-h-40 rounded-md"
                                  />
                                </div>
                              )}
                              {card.backAudio && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => new Audio(card.backAudio).play()}
                                    className="inline-flex items-center px-2 py-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                  >
                                    <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                                    Ouvir áudio
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Tags do flashcard */}
                          {card.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {card.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingFlashcard(card.id)}
                            className="inline-flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(card.id)}
                            className="inline-flex items-center px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      }
    </div >
  );
};

export default DeckDetail;
