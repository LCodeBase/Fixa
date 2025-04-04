/**
 * Implementação do algoritmo SM-2 para repetição espaçada
 * Baseado no algoritmo original de Piotr Wozniak
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

/**
 * Calcula o próximo intervalo de revisão com base na qualidade da resposta
 * @param {Object} repetitionData - Dados atuais de repetição do cartão
 * @param {number} quality - Qualidade da resposta (0-5)
 *   0: Completo esquecimento / Resposta incorreta
 *   1: Resposta incorreta, mas lembrou ao ver a resposta
 *   2: Resposta incorreta, mas familiar
 *   3: Resposta correta, mas com dificuldade
 *   4: Resposta correta após leve hesitação
 *   5: Resposta correta, perfeita
 * @returns {Object} Novos dados de repetição
 */
export const calculateNextReview = (repetitionData, quality) => {
  // Clona os dados para não modificar o objeto original
  const newData = { ...repetitionData };

  // Limita a qualidade entre 0 e 5
  quality = Math.max(0, Math.min(5, quality));

  // Atualiza o fator de facilidade (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = newData.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // O fator de facilidade não deve ser menor que 1.3
  newData.easeFactor = Math.max(1.3, newEF);

  // Se a resposta foi correta (qualidade >= 3)
  if (quality >= 3) {
    // Incrementa o contador de repetições
    newData.repetitions += 1;

    // Calcula o novo intervalo
    if (newData.repetitions === 1) {
      // Primeira repetição bem-sucedida
      newData.interval = 1; // 1 dia
    } else if (newData.repetitions === 2) {
      // Segunda repetição bem-sucedida
      newData.interval = 6; // 6 dias
    } else {
      // Repetições subsequentes
      newData.interval = Math.round(newData.interval * newData.easeFactor);
    }
  } else {
    // Se a resposta foi incorreta, reinicia o processo
    newData.repetitions = 0;
    newData.interval = 0; // Revisão no mesmo dia
  }

  // Calcula a data da próxima revisão
  const now = new Date();
  const nextReview = new Date(now);

  if (newData.interval === 0) {
    // Se o intervalo for 0, agenda para revisão em 10 minutos
    nextReview.setMinutes(nextReview.getMinutes() + 10);
  } else {
    // Caso contrário, agenda para o número de dias calculado
    nextReview.setDate(nextReview.getDate() + newData.interval);
  }

  newData.nextReview = nextReview.toISOString();

  return newData;
};

/**
 * Calcula o status de um cartão com base nos dados de repetição
 * @param {Object} repetitionData - Dados de repetição do cartão
 * @returns {string} Status do cartão ('new', 'learning', 'review', 'mastered')
 */
export const getCardStatus = (repetitionData) => {
  if (!repetitionData || repetitionData.repetitions === 0) {
    return 'new';
  }

  if (repetitionData.repetitions < 3) {
    return 'learning';
  }

  if (repetitionData.interval >= 21) {
    return 'mastered';
  }

  return 'review';
};

/**
 * Verifica se um cartão está pronto para revisão
 * @param {Object} repetitionData - Dados de repetição do cartão
 * @returns {boolean} True se o cartão estiver pronto para revisão
 */
export const isCardDueForReview = (repetitionData) => {
  if (!repetitionData || !repetitionData.nextReview) {
    return true; // Cartões sem dados de repetição estão sempre prontos
  }

  const now = new Date();
  const nextReview = new Date(repetitionData.nextReview);

  return nextReview <= now;
};

/**
 * Calcula estatísticas de progresso para um conjunto de cartões
 * @param {Array} cards - Array de cartões
 * @returns {Object} Estatísticas de progresso
 */
export const calculateProgress = (cards) => {
  if (!cards || !cards.length) {
    return {
      totalCards: 0,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      masteredCards: 0,
      completionPercentage: 0
    };
  }

  const stats = {
    totalCards: cards.length,
    newCards: 0,
    learningCards: 0,
    reviewCards: 0,
    masteredCards: 0
  };

  // Conta os cartões em cada status
  cards.forEach(card => {
    const status = card.status || getCardStatus(card.repetitionData);
    switch (status) {
      case 'new':
        stats.newCards++;
        break;
      case 'learning':
        stats.learningCards++;
        break;
      case 'review':
        stats.reviewCards++;
        break;
      case 'mastered':
        stats.masteredCards++;
        break;
    }
  });

  // Calcula a porcentagem de conclusão (cartões dominados)
  stats.completionPercentage = Math.round((stats.masteredCards / stats.totalCards) * 100) || 0;

  return stats;
};

/**
 * Calcula quantos cartões estão prontos para revisão hoje
 * @param {Array} cards - Array de cartões
 * @returns {number} Número de cartões prontos para revisão
 */
export const getCardsForTodayCount = (cards) => {
  if (!cards || !cards.length) return 0;

  const now = new Date();

  return cards.filter(card => {
    if (!card.repetitionData || !card.repetitionData.nextReview) {
      return true; // Cartões sem dados de repetição estão sempre prontos
    }

    const nextReview = new Date(card.repetitionData.nextReview);
    return nextReview <= now;
  }).length;
};