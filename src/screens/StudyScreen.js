import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDeck } from '../contexts/DeckContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { calculateNextReview, isCardDueForReview } from '../utils/spacedRepetition';

const StudyScreen = ({ navigation, route }) => {
  // Para navegação na versão web
  const navigate = Platform.OS === 'web' ? useNavigate() : null;
  const { decks, updateDeck } = useDeck();
  const { theme } = useTheme();
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [studyDecks, setStudyDecks] = useState([]);
  const [studyCards, setStudyCards] = useState([]);
  const [flipAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

  // Prepara os decks e cartões para estudo
  useEffect(() => {
    if (!decks || decks.length === 0) {
      setLoading(false);
      return;
    }

    // Filtra decks que têm cartões prontos para revisão
    const decksWithDueCards = decks.filter(deck => {
      if (!deck.cards || deck.cards.length === 0) return false;
      return deck.cards.some(card => isCardDueForReview(card.repetitionData));
    });

    setStudyDecks(decksWithDueCards);

    if (decksWithDueCards.length > 0) {
      // Prepara os cartões do primeiro deck
      prepareCardsForDeck(decksWithDueCards[0]);
    } else {
      setStudyComplete(true);
    }

    setLoading(false);
  }, [decks]);

  // Prepara os cartões de um deck específico para estudo
  const prepareCardsForDeck = (deck) => {
    if (!deck || !deck.cards || deck.cards.length === 0) {
      setStudyCards([]);
      return;
    }

    // Filtra cartões prontos para revisão e os embaralha
    const dueCards = deck.cards
      .filter(card => isCardDueForReview(card.repetitionData))
      .sort(() => Math.random() - 0.5);

    setStudyCards(dueCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  // Avança para o próximo cartão ou deck
  const goToNextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      // Ainda há cartões no deck atual
      setCurrentCardIndex(currentCardIndex + 1);
      resetCard();
    } else if (currentDeckIndex < studyDecks.length - 1) {
      // Avança para o próximo deck
      setCurrentDeckIndex(currentDeckIndex + 1);
      prepareCardsForDeck(studyDecks[currentDeckIndex + 1]);
    } else {
      // Estudo completo
      setStudyComplete(true);
    }
  };

  // Reinicia o estado do cartão atual
  const resetCard = () => {
    setShowAnswer(false);
    flipAnim.setValue(0);
  };

  // Anima a virada do cartão
  const flipCard = () => {
    setShowAnswer(!showAnswer);
    Animated.spring(flipAnim, {
      toValue: showAnswer ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  // Processa a resposta do usuário
  const handleResponse = async (quality) => {
    if (!studyDecks.length || !studyCards.length) return;

    const currentDeck = studyDecks[currentDeckIndex];
    const currentCard = studyCards[currentCardIndex];

    try {
      // Calcula os novos dados de repetição
      const newRepetitionData = calculateNextReview(
        currentCard.repetitionData || {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: new Date().toISOString()
        },
        quality
      );

      // Atualiza o cartão no deck
      const updatedCards = currentDeck.cards.map(card => {
        if (card.id === currentCard.id) {
          return {
            ...card,
            repetitionData: newRepetitionData,
            status: getCardStatus(newRepetitionData),
          };
        }
        return card;
      });

      // Atualiza as estatísticas do deck
      const updatedStats = calculateProgress(updatedCards);

      // Atualiza o deck no Firestore
      await updateDeck(currentDeck.id, {
        cards: updatedCards,
        stats: updatedStats,
      });

      // Avança para o próximo cartão
      goToNextCard();
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu progresso. Tente novamente.');
    }
  };

  // Calcula o status do cartão com base nos dados de repetição
  const getCardStatus = (repetitionData) => {
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

  // Calcula estatísticas de progresso para um conjunto de cartões
  const calculateProgress = (cards) => {
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

  // Renderiza a tela de estudo completo
  const renderStudyComplete = () => {
    return (
      <View style={[styles.completeContainer, { backgroundColor: theme.colors.card }]}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={80}
          color={theme.colors.success}
        />
        <Text style={[styles.completeTitle, { color: theme.colors.text }]}>
          Estudo Completo!
        </Text>
        <Text style={[styles.completeMessage, { color: theme.colors.placeholder }]}>
          Você revisou todos os cartões programados para hoje.
        </Text>
        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>Voltar para o Início</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Renderiza a tela de carregamento
  const renderLoading = () => {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Carregando cartões...
        </Text>
      </View>
    );
  };

  // Renderiza a tela sem cartões para estudar
  const renderNoCards = () => {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons
          name="cards-outline"
          size={64}
          color={theme.colors.placeholder}
        />
        <Text style={[styles.noCardsTitle, { color: theme.colors.text }]}>
          Nenhum cartão para estudar
        </Text>
        <Text style={[styles.noCardsMessage, { color: theme.colors.placeholder }]}>
          Você não tem cartões prontos para revisão no momento.
        </Text>
        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            // Usa o objeto de navegação apropriado dependendo da plataforma
            if (Platform.OS === 'web') {
              navigate('/decks');
            } else if (navigation) {
              navigation.navigate('Decks');
            }
          }}
        >
          <Text style={styles.homeButtonText}>Criar Novos Cartões</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Renderiza o cartão de estudo
  const renderStudyCard = () => {
    if (!studyDecks.length || !studyCards.length) {
      return renderNoCards();
    }

    const currentDeck = studyDecks[currentDeckIndex];
    const currentCard = studyCards[currentCardIndex];

    // Calcula as transformações para a animação de virada
    const frontInterpolate = flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });

    const backInterpolate = flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg']
    });

    const frontAnimatedStyle = {
      transform: [{ rotateY: frontInterpolate }]
    };

    const backAnimatedStyle = {
      transform: [{ rotateY: backInterpolate }]
    };

    return (
      <View style={styles.studyContainer}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            Deck: {currentDeck.name}
          </Text>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            Cartão {currentCardIndex + 1} de {studyCards.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cardContainer}
          onPress={flipCard}
          activeOpacity={0.9}
        >
          <Animated.View
            style={[styles.card, frontAnimatedStyle, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              {currentCard.front}
            </Text>
            <Text style={[styles.tapHint, { color: theme.colors.placeholder }]}>
              Toque para ver a resposta
            </Text>
          </Animated.View>

          <Animated.View
            style={[styles.card, styles.cardBack, backAnimatedStyle, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              {currentCard.back}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {showAnswer && (
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingTitle, { color: theme.colors.text }]}>
              Como você se saiu?
            </Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity
                style={[styles.ratingButton, { backgroundColor: theme.colors.error }]}
                onPress={() => handleResponse(0)}
              >
                <Text style={styles.ratingButtonText}>Não Lembrei</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ratingButton, { backgroundColor: theme.colors.warning }]}
                onPress={() => handleResponse(3)}
              >
                <Text style={styles.ratingButtonText}>Difícil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ratingButton, { backgroundColor: theme.colors.success }]}
                onPress={() => handleResponse(5)}
              >
                <Text style={styles.ratingButtonText}>Fácil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return renderLoading();
  }

  if (studyComplete) {
    return renderStudyComplete();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderStudyCard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
  },
  noCardsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noCardsMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  studyContainer: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    perspective: 1000,
    marginBottom: 16,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardText: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  ratingButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    margin: 16,
    borderRadius: 16,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  completeMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StudyScreen;