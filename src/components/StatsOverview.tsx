import React from 'react';
import { Deck, Flashcard } from '../contexts/DeckContext';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatsOverviewProps = {
  decks: Deck[];
  className?: string;
};

const StatsOverview: React.FC<StatsOverviewProps> = ({ decks, className = '' }) => {
  // Calcular estatísticas gerais
  const totalDecks = decks.length;
  const totalFlashcards = decks.reduce((sum, deck) => sum + deck.flashcards.length, 0);

  // Calcular cartões estudados nos últimos 7 dias
  const calculateRecentlyStudied = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date,
        day: format(date, 'EEE', { locale: ptBR }),
        count: 0
      };
    });

    // Contar cartões estudados por dia
    decks.forEach(deck => {
      deck.flashcards.forEach(card => {
        const reviewDate = new Date(card.repetitionData.lastReview);

        // Verificar em qual dos últimos 7 dias esta revisão ocorreu
        const dayIndex = last7Days.findIndex(day =>
          isWithinInterval(reviewDate, {
            start: startOfDay(day.date),
            end: endOfDay(day.date)
          })
        );

        if (dayIndex !== -1) {
          last7Days[dayIndex].count++;
        }
      });
    });

    return last7Days;
  };

  // Calcular distribuição de facilidade
  const calculateDifficultyDistribution = () => {
    let easy = 0;
    let medium = 0;
    let hard = 0;
    let total = 0;

    decks.forEach(deck => {
      deck.flashcards.forEach(card => {
        total++;
        const ef = card.repetitionData.easeFactor;

        if (ef >= 2.5) easy++;
        else if (ef >= 1.8) medium++;
        else hard++;
      });
    });

    return {
      easy: total > 0 ? Math.round((easy / total) * 100) : 0,
      medium: total > 0 ? Math.round((medium / total) * 100) : 0,
      hard: total > 0 ? Math.round((hard / total) * 100) : 0
    };
  };

  // Calcular sequência atual de estudos
  const calculateStudyStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar se estudou hoje
    const studiedToday = decks.some(deck =>
      deck.flashcards.some(card => {
        const reviewDate = new Date(card.repetitionData.lastReview);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === today.getTime();
      })
    );

    // Se não estudou hoje, a sequência é 0
    if (!studiedToday) return 0;

    // Contar dias consecutivos estudados
    let streak = 1;
    let currentDate = subDays(today, 1);

    while (true) {
      const studiedOnDate = decks.some(deck =>
        deck.flashcards.some(card => {
          const reviewDate = new Date(card.repetitionData.lastReview);
          reviewDate.setHours(0, 0, 0, 0);
          return reviewDate.getTime() === currentDate.getTime();
        })
      );

      if (!studiedOnDate) break;

      streak++;
      currentDate = subDays(currentDate, 1);
    }

    return streak;
  };

  const recentlyStudied = calculateRecentlyStudied();
  const difficultyDistribution = calculateDifficultyDistribution();
  const streak = calculateStudyStreak();

  // Encontrar o valor máximo para normalizar o gráfico
  const maxStudyCount = Math.max(...recentlyStudied.map(day => day.count), 1);

  // Calcular estatísticas reais
  const calculateRealStats = () => {
    // Total de revisões e revisões bem-sucedidas
    let totalReviews = 0;
    let successfulReviews = 0;
    
    decks.forEach(deck => {
      deck.flashcards.forEach(card => {
        if (card.repetitionData.repetitions > 0) {
          totalReviews++;
          if (card.repetitionData.easeFactor > 2.0) {
            successfulReviews++;
          }
        }
      });
    });
    
    // Taxa de retenção real
    const retentionRate = totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 0;
    
    return {
      retentionRate,
      streak
    };
  };

  const realStats = calculateRealStats();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Estatísticas de Estudo</h2>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <dt className="text-sm font-medium text-blue-800 dark:text-blue-300">Total de Decks</dt>
            <dd className="mt-1 text-2xl font-semibold text-blue-800 dark:text-blue-300">{totalDecks}</dd>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <dt className="text-sm font-medium text-purple-800 dark:text-purple-300">Taxa de Retenção</dt>
            <dd className="mt-1 text-2xl font-semibold text-purple-800 dark:text-purple-300">{realStats.retentionRate}%</dd>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <dt className="text-sm font-medium text-green-800 dark:text-green-300">Sequência de Estudos</dt>
            <dd className="mt-1 text-2xl font-semibold text-green-800 dark:text-green-300">{realStats.streak} dias</dd>
          </div>
        </div>

        {/* Gráfico de atividade semanal */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Atividade nos Últimos 7 Dias</h3>
          <div className="h-40 flex items-end justify-between">
            {recentlyStudied.map((day, index) => {
              // Calcular altura relativa (mínimo 5% para visualização)
              const height = day.count > 0
                ? 5 + ((day.count / maxStudyCount) * 95)
                : 5;

              return (
                <div key={index} className="flex flex-col items-center w-full">
                  <div
                    className="w-full max-w-[30px] bg-primary-500 dark:bg-primary-600 rounded-t-md transition-all duration-300 hover:bg-primary-400 dark:hover:bg-primary-500 group relative"
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip com o número exato */}
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {day.count} cartões
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribuição de dificuldade */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Distribuição de Dificuldade</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Fácil</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{difficultyDistribution.easy}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${difficultyDistribution.easy}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Médio</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{difficultyDistribution.medium}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${difficultyDistribution.medium}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Difícil</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{difficultyDistribution.hard}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${difficultyDistribution.hard}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;