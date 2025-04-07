/**
 * Serviço para gerenciar estatísticas detalhadas de estudo
 */

// Tipos para estatísticas
export interface DailyStudyData {
  date: string; // Formato YYYY-MM-DD
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number; // Em segundos
}

export interface DeckStatistics {
  deckId: string;
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  averageEaseFactor: number;
  mostDifficultCards: string[]; // IDs dos cartões mais difíceis
  lastStudied: Date | null;
  studyStreak: number;
  dailyData: DailyStudyData[];
}

export interface UserStatistics {
  userId: string;
  totalCardsStudied: number;
  totalTimeSpent: number; // Em segundos
  longestStreak: number;
  currentStreak: number;
  averageRetentionRate: number;
  deckStats: Record<string, DeckStatistics>;
  dailyData: DailyStudyData[];
  startDate: Date;
  lastActive: Date;
}

/**
 * Inicializa estatísticas para um novo usuário
 */
const initUserStatistics = (userId: string): UserStatistics => {
  const now = new Date();
  return {
    userId,
    totalCardsStudied: 0,
    totalTimeSpent: 0,
    longestStreak: 0,
    currentStreak: 0,
    averageRetentionRate: 0,
    deckStats: {},
    dailyData: [],
    startDate: now,
    lastActive: now
  };
};

/**
 * Inicializa estatísticas para um novo deck
 */
const initDeckStatistics = (deckId: string): DeckStatistics => {
  return {
    deckId,
    totalReviews: 0,
    correctReviews: 0,
    incorrectReviews: 0,
    averageEaseFactor: 2.5,
    mostDifficultCards: [],
    lastStudied: null,
    studyStreak: 0,
    dailyData: []
  };
};

/**
 * Carrega as estatísticas do usuário
 */
const loadUserStatistics = (userId: string): UserStatistics => {
  const statsJson = localStorage.getItem(`fixa_user_stats_${userId}`);
  if (!statsJson) {
    return initUserStatistics(userId);
  }

  try {
    // Converter strings de data para objetos Date
    return JSON.parse(statsJson, (key, value) => {
      if (key === 'startDate' || key === 'lastActive' || key === 'lastStudied') {
        return value ? new Date(value) : null;
      }
      return value;
    });
  } catch (error) {
    console.error('Erro ao carregar estatísticas do usuário:', error);
    return initUserStatistics(userId);
  }
};

/**
 * Salva as estatísticas do usuário
 */
const saveUserStatistics = (stats: UserStatistics): void => {
  localStorage.setItem(`fixa_user_stats_${stats.userId}`, JSON.stringify(stats));
};

/**
 * Registra uma sessão de estudo
 */
const recordStudySession = (
  userId: string,
  deckId: string,
  cardsStudied: number,
  correctAnswers: number,
  timeSpent: number // Em segundos
): void => {
  const stats = loadUserStatistics(userId);
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Atualizar estatísticas do usuário
  stats.totalCardsStudied += cardsStudied;
  stats.totalTimeSpent += timeSpent;
  stats.lastActive = now;

  // Verificar e atualizar streak
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastActiveDay = stats.lastActive.toISOString().split('T')[0];

  if (lastActiveDay === yesterdayStr) {
    // Usuário estudou ontem, incrementar streak
    stats.currentStreak += 1;
  } else if (lastActiveDay !== today) {
    // Usuário não estudou ontem, resetar streak
    stats.currentStreak = 1;
  }

  // Atualizar streak mais longo se necessário
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  // Atualizar dados diários do usuário
  const dailyDataIndex = stats.dailyData.findIndex(data => data.date === today);
  if (dailyDataIndex >= 0) {
    const dailyData = stats.dailyData[dailyDataIndex];
    dailyData.cardsStudied += cardsStudied;
    dailyData.correctAnswers += correctAnswers;
    dailyData.incorrectAnswers += (cardsStudied - correctAnswers);
    dailyData.timeSpent += timeSpent;
  } else {
    stats.dailyData.push({
      date: today,
      cardsStudied,
      correctAnswers,
      incorrectAnswers: cardsStudied - correctAnswers,
      timeSpent
    });
  }

  // Limitar o histórico diário a 90 dias
  if (stats.dailyData.length > 90) {
    stats.dailyData.sort((a, b) => a.date.localeCompare(b.date));
    stats.dailyData = stats.dailyData.slice(-90);
  }

  // Inicializar estatísticas do deck se necessário
  if (!stats.deckStats[deckId]) {
    stats.deckStats[deckId] = initDeckStatistics(deckId);
  }

  // Atualizar estatísticas do deck
  const deckStats = stats.deckStats[deckId];
  deckStats.totalReviews += cardsStudied;
  deckStats.correctReviews += correctAnswers;
  deckStats.incorrectReviews += (cardsStudied - correctAnswers);
  deckStats.lastStudied = now;

  // Atualizar dados diários do deck
  const deckDailyDataIndex = deckStats.dailyData.findIndex(data => data.date === today);
  if (deckDailyDataIndex >= 0) {
    const dailyData = deckStats.dailyData[deckDailyDataIndex];
    dailyData.cardsStudied += cardsStudied;
    dailyData.correctAnswers += correctAnswers;
    dailyData.incorrectAnswers += (cardsStudied - correctAnswers);
    dailyData.timeSpent += timeSpent;
  } else {
    deckStats.dailyData.push({
      date: today,
      cardsStudied,
      correctAnswers,
      incorrectAnswers: cardsStudied - correctAnswers,
      timeSpent
    });
  }

  // Limitar o histórico diário do deck a 90 dias
  if (deckStats.dailyData.length > 90) {
    deckStats.dailyData.sort((a, b) => a.date.localeCompare(b.date));
    deckStats.dailyData = deckStats.dailyData.slice(-90);
  }

  // Calcular taxa de retenção média
  const totalReviews = Object.values(stats.deckStats).reduce(
    (sum, deck) => sum + deck.totalReviews, 0
  );
  const correctReviews = Object.values(stats.deckStats).reduce(
    (sum, deck) => sum + deck.correctReviews, 0
  );

  stats.averageRetentionRate = totalReviews > 0
    ? Math.round((correctReviews / totalReviews) * 100)
    : 0;

  // Salvar estatísticas atualizadas
  saveUserStatistics(stats);
};

/**
 * Registra um cartão difícil
 */
const recordDifficultCard = (userId: string, deckId: string, cardId: string): void => {
  const stats = loadUserStatistics(userId);

  // Inicializar estatísticas do deck se necessário
  if (!stats.deckStats[deckId]) {
    stats.deckStats[deckId] = initDeckStatistics(deckId);
  }

  const deckStats = stats.deckStats[deckId];

  // Adicionar cartão à lista de difíceis se ainda não estiver lá
  if (!deckStats.mostDifficultCards.includes(cardId)) {
    deckStats.mostDifficultCards.push(cardId);

    // Limitar a 10 cartões mais difíceis
    if (deckStats.mostDifficultCards.length > 10) {
      deckStats.mostDifficultCards.shift();
    }
  }

  saveUserStatistics(stats);
};

/**
 * Atualiza o fator de facilidade médio de um deck
 */
const updateAverageEaseFactor = (userId: string, deckId: string, averageEaseFactor: number): void => {
  const stats = loadUserStatistics(userId);

  // Inicializar estatísticas do deck se necessário
  if (!stats.deckStats[deckId]) {
    stats.deckStats[deckId] = initDeckStatistics(deckId);
  }

  stats.deckStats[deckId].averageEaseFactor = averageEaseFactor;
  saveUserStatistics(stats);
};

/**
 * Obtém estatísticas resumidas para exibição rápida
 */
const getQuickStats = (userId: string): {
  cardsToday: number;
  totalCards: number;
  currentStreak: number;
  retentionRate: number;
} => {
  const stats = loadUserStatistics(userId);
  const today = new Date().toISOString().split('T')[0];

  const todayData = stats.dailyData.find(data => data.date === today);
  const cardsToday = todayData ? todayData.cardsStudied : 0;

  return {
    cardsToday,
    totalCards: stats.totalCardsStudied,
    currentStreak: stats.currentStreak,
    retentionRate: stats.averageRetentionRate
  };
};

/**
 * Obtém dados para gráficos de progresso
 */
const getProgressChartData = (userId: string, days: number = 30): {
  dates: string[];
  cardsStudied: number[];
  correctRate: number[];
} => {
  const stats = loadUserStatistics(userId);

  // Ordenar dados por data
  const sortedData = [...stats.dailyData].sort((a, b) => a.date.localeCompare(b.date));

  // Limitar ao número de dias solicitado
  const recentData = sortedData.slice(-days);

  const dates = recentData.map(data => data.date);
  const cardsStudied = recentData.map(data => data.cardsStudied);
  const correctRate = recentData.map(data => {
    const total = data.correctAnswers + data.incorrectAnswers;
    return total > 0 ? Math.round((data.correctAnswers / total) * 100) : 0;
  });

  return { dates, cardsStudied, correctRate };
};

export const statisticsService = {
  loadUserStatistics,
  saveUserStatistics,
  recordStudySession,
  recordDifficultCard,
  updateAverageEaseFactor,
  getQuickStats,
  getProgressChartData
};