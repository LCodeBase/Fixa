import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeck } from '../hooks/useDeck';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Icons
import {
  PlusIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const { decks, loading, error } = useDeck();
  const [dueFlashcards, setDueFlashcards] = useState<number>(0);
  const [totalFlashcards, setTotalFlashcards] = useState<number>(0);
  const [studiedToday, setStudiedToday] = useState<number>(0);

  useEffect(() => {
    if (decks.length > 0) {
      // Calcular flashcards para revisão
      let due = 0;
      let total = 0;
      let studied = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      decks.forEach(deck => {
        deck.flashcards.forEach(card => {
          total++;

          // Verificar se está para revisão hoje
          const dueDate = new Date(card.repetitionData.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate <= today) {
            due++;
          }

          // Verificar se foi estudado hoje
          const lastReview = new Date(card.repetitionData.lastReview);
          lastReview.setHours(0, 0, 0, 0);
          if (lastReview.getTime() === today.getTime()) {
            studied++;
          }
        });
      });

      setDueFlashcards(due);
      setTotalFlashcards(total);
      setStudiedToday(studied);
    }
  }, [decks]);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link
          to="/decks"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Novo Deck
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Para revisar hoje</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{dueFlashcards}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/decks" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                Ver todos os decks
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Estudados hoje</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{studiedToday}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/profile" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                Ver estatísticas
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total de flashcards</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{totalFlashcards}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/decks" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                Gerenciar flashcards
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decks recentes */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Decks recentes</h2>

      {decks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não tem nenhum deck.</p>
          <Link
            to="/decks"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Criar meu primeiro deck
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {decks.slice(0, 5).map((deck) => (
              <li key={deck.id}>
                <Link to={`/decks/${deck.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">{deck.name}</p>
                        {deck.isPublic && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Público
                          </span>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <ArrowRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {deck.flashcards.length} flashcards
                        </p>
                        {deck.tags.length > 0 && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                            <span className="truncate">{deck.tags.join(', ')}</span>
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <p>
                          Atualizado em {format(new Date(deck.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {decks.length > 5 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right sm:px-6">
              <Link
                to="/decks"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Ver todos os decks
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;