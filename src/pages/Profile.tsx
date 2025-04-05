import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDeck } from '../hooks/useDeck';
import { useTheme } from '../hooks/useTheme';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Icons
import {
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { decks } = useDeck();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('stats');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Estatísticas
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [totalDecks, setTotalDecks] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [dueToday, setDueToday] = useState(0);

  // Dados para os gráficos
  const [reviewsPerDay, setReviewsPerDay] = useState<number[]>([]);
  const [reviewsPerDayLabels, setReviewsPerDayLabels] = useState<string[]>([]);
  const [performanceData, setPerformanceData] = useState<number[]>([0, 0, 0]); // Fácil, Médio, Difícil

  // Calcular estatísticas
  useEffect(() => {
    if (decks.length > 0) {
      // Total de decks
      setTotalDecks(decks.length);

      // Total de flashcards
      const flashcardCount = decks.reduce((total, deck) => total + deck.flashcards.length, 0);
      setTotalFlashcards(flashcardCount);

      // Cartões para revisar hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dueCount = 0;
      let reviewCount = 0;
      let easy = 0;
      let medium = 0;
      let hard = 0;

      // Contagem de revisões por dia (últimos 7 dias)
      const last7Days = Array(7).fill(0);
      const last7DaysLabels = Array(7)
        .fill(0)
        .map((_, i) => {
          const date = subDays(new Date(), 6 - i);
          return format(date, 'dd/MM', { locale: ptBR });
        });

      decks.forEach(deck => {
        deck.flashcards.forEach(card => {
          // Verificar se está para revisão hoje
          const dueDate = new Date(card.repetitionData.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate <= today) {
            dueCount++;
          }

          // Contar total de revisões
          reviewCount += card.repetitionData.repetitions;

          // Classificar por dificuldade (baseado no fator de facilidade)
          if (card.repetitionData.easeFactor >= 2.1) {
            easy++;
          } else if (card.repetitionData.easeFactor >= 1.7) {
            medium++;
          } else {
            hard++;
          }

          // Contar revisões dos últimos 7 dias
          const lastReview = new Date(card.repetitionData.lastReview);
          const daysDiff = Math.floor((today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff >= 0 && daysDiff < 7) {
            last7Days[6 - daysDiff]++;
          }
        });
      });

      setDueToday(dueCount);
      setTotalReviews(reviewCount);
      setPerformanceData([easy, medium, hard]);
      setReviewsPerDay(last7Days);
      setReviewsPerDayLabels(last7DaysLabels);
    }
  }, [decks]);

  // Dados para o gráfico de revisões por dia
  const reviewsChartData = {
    labels: reviewsPerDayLabels,
    datasets: [
      {
        label: 'Cartões revisados',
        data: reviewsPerDay,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Dados para o gráfico de desempenho
  const performanceChartData = {
    labels: ['Fácil', 'Médio', 'Difícil'],
    datasets: [
      {
        data: performanceData,
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Opções para os gráficos
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revisões nos últimos 7 dias',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribuição por dificuldade',
      },
    },
  };

  // Atualizar perfil do usuário
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setUpdateSuccess(false);
    setUpdateError('');

    try {
      await updateUserProfile(displayName, photoURL);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      setUpdateError(error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Perfil</h1>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        {/* Informações do usuário */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuário'}
                className="h-12 w-12 rounded-full mr-4"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-4">
                <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {user?.displayName || 'Usuário'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-4 text-sm font-medium ${activeTab === 'stats' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <ChartBarIcon className="-ml-0.5 mr-2 h-4 w-4 inline-block" />
              Estatísticas
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-4 text-sm font-medium ${activeTab === 'settings' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Cog6ToothIcon className="-ml-0.5 mr-2 h-4 w-4 inline-block" />
              Configurações
            </button>
          </div>
        </div>

        {/* Conteúdo da aba */}
        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'stats' ? (
            <div>
              {/* Cards de estatísticas */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-md p-3">
                        <ClockIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Para revisar hoje</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">{dueToday}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
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
                </div>

                <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                        <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total de revisões</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">{totalReviews}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
                        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total de decks</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">{totalDecks}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <Line data={reviewsChartData} options={lineOptions} />
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <Doughnut data={performanceChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Configurações */}
              <div className="space-y-6">
                {/* Perfil */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Perfil</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Atualize suas informações pessoais.</p>
                  </div>
                  <form className="mt-5 space-y-4" onSubmit={handleUpdateProfile}>
                    <div>
                      <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nome de exibição
                      </label>
                      <input
                        type="text"
                        name="display-name"
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="photo-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        URL da foto de perfil
                      </label>
                      <input
                        type="text"
                        name="photo-url"
                        id="photo-url"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="https://exemplo.com/foto.jpg"
                      />
                    </div>
                    {updateSuccess && (
                      <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">Perfil atualizado com sucesso!</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {updateError && (
                      <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">{updateError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Atualizando...
                          </>
                        ) : (
                          'Atualizar perfil'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tema */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Aparência</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Personalize a aparência do aplicativo.</p>
                  </div>
                  <div className="mt-5">
                    <button
                      onClick={toggleTheme}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {theme === 'dark' ? (
                        <>
                          <SunIcon className="-ml-1 mr-2 h-5 w-5 text-yellow-500" />
                          Mudar para modo claro
                        </>
                      ) : (
                        <>
                          <MoonIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                          Mudar para modo escuro
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Notificações */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Notificações</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Configure como e quando deseja receber notificações.</p>
                  </div>
                  <div className="mt-5">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="browser-notifications"
                          name="browser-notifications"
                          type="checkbox"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="browser-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                          Notificações do navegador
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">Receba notificações quando tiver cartões para revisar.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;