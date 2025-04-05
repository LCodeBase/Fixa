import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeck } from '../hooks/useDeck';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Icons
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ShareIcon,
  TagIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Decks = () => {
  const { decks, loading, error, createDeck, deleteDeck, shareDeck } = useDeck();
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckTags, setNewDeckTags] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extrair todas as tags únicas de todos os decks
  const allTags = [...new Set(decks.flatMap(deck => deck.tags))];

  // Filtrar decks com base na pesquisa e tags selecionadas
  const filteredDecks = decks.filter(deck => {
    const matchesSearch = searchTerm === '' ||
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => deck.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    try {
      const tagsArray = newDeckTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      await createDeck(newDeckName, newDeckDescription, tagsArray);
      setNewDeckName('');
      setNewDeckDescription('');
      setNewDeckTags('');
      setIsCreating(false);
    } catch (error) {
      console.error('Erro ao criar deck:', error);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDeck(deckId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Erro ao excluir deck:', error);
    }
  };

  const handleShareDeck = async (deckId: string, isPublic: boolean) => {
    try {
      await shareDeck(deckId, !isPublic);
    } catch (error) {
      console.error('Erro ao compartilhar deck:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Decks</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Novo Deck
        </button>
      </div>

      {/* Formulário de criação de deck */}
      {isCreating && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Criar novo deck</h3>
            <form className="mt-5 space-y-4" onSubmit={handleCreateDeck}>
              <div>
                <label htmlFor="deck-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome do deck *
                </label>
                <input
                  type="text"
                  name="deck-name"
                  id="deck-name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Vocabulário de Inglês"
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
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Uma breve descrição do conteúdo deste deck"
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
                  value={newDeckTags}
                  onChange={(e) => setNewDeckTags(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: inglês, vocabulário, idiomas"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros e pesquisa */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/2">
              <label htmlFor="search" className="sr-only">Pesquisar decks</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Pesquisar decks..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedTags.includes(tag) ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    <TagIcon className="-ml-0.5 mr-1.5 h-3 w-3" />
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  >
                    <XMarkIcon className="-ml-0.5 mr-1.5 h-3 w-3" />
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de decks */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center">
          {decks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não tem nenhum deck.</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum deck encontrado com os filtros atuais.</p>
          )}
          <button
            onClick={() => {
              setIsCreating(true);
              setSearchTerm('');
              setSelectedTags([]);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Criar novo deck
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDecks.map((deck) => (
              <li key={deck.id} className="relative">
                {deleteConfirmId === deck.id ? (
                  <div className="px-4 py-4 sm:px-6 bg-red-50 dark:bg-red-900">
                    <div className="text-sm text-red-600 dark:text-red-200 mb-2">Tem certeza que deseja excluir este deck? Esta ação não pode ser desfeita.</div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          <Link to={`/decks/${deck.id}`} className="hover:underline focus:outline-none">
                            {deck.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{deck.description}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <Link
                          to={`/study/${deck.id}`}
                          className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Estudar
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {deck.flashcards.length} flashcards
                        </p>
                        {deck.tags.length > 0 && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                            <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <span>{deck.tags.join(', ')}</span>
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <p>
                          Atualizado em {format(new Date(deck.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <Link
                        to={`/decks/${deck.id}`}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <PencilIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                        Editar
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(deck.id)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <TrashIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                        Excluir
                      </button>
                      <button
                        onClick={() => handleShareDeck(deck.id, deck.isPublic)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <ShareIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                        {deck.isPublic ? 'Tornar privado' : 'Compartilhar'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Decks;