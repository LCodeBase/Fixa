import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDeck } from '../contexts/DeckContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCardsForTodayCount } from '../utils/spacedRepetition';

const HomeScreen = () => {
  const { currentUser } = useAuth();
  const { decks, loading } = useDeck();
  const { theme } = useTheme();
  const [todayCards, setTodayCards] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    calculateTodayCards();
  }, [decks]);

  const calculateTodayCards = () => {
    if (!decks || decks.length === 0) {
      setTodayCards(0);
      return;
    }

    let totalCards = 0;
    decks.forEach(deck => {
      if (deck.cards && deck.cards.length > 0) {
        totalCards += getCardsForTodayCount(deck.cards);
      }
    });

    setTodayCards(totalCards);
  };

  const renderWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) {
      greeting = 'Bom dia';
    } else if (hour < 18) {
      greeting = 'Boa tarde';
    } else {
      greeting = 'Boa noite';
    }

    return (
      <View style={styles.welcomeContainer}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          {greeting},
        </Text>
        <Text style={[styles.userName, { color: theme.colors.primary }]}>
          {currentUser?.displayName || 'Estudante'}
        </Text>
      </View>
    );
  };

  const renderStudyCard = () => {
    return (
      <TouchableOpacity
        style={[styles.studyCard, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigate('/study')}
      >
        <View>
          <Text style={styles.studyCardTitle}>Cartões para hoje</Text>
          <Text style={styles.studyCardCount}>{todayCards}</Text>
        </View>
        <Text style={styles.studyCardAction}>Estudar agora →</Text>
      </TouchableOpacity>
    );
  };

  const renderDeckSummary = () => {
    return (
      <View style={[styles.sectionContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Meus Decks</Text>
          <TouchableOpacity onPress={() => navigate('/decks')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {decks && decks.length > 0 ? (
          <View style={styles.decksContainer}>
            {decks.slice(0, 3).map(deck => (
              <TouchableOpacity
                key={deck.id}
                style={[styles.deckItem, { backgroundColor: theme.colors.cardHighlight }]}
                onPress={() => navigate(`/deck/${deck.id}`)}
              >
                <Text style={[styles.deckName, { color: theme.colors.text }]} numberOfLines={1}>
                  {deck.name}
                </Text>
                <Text style={[styles.deckCount, { color: theme.colors.textSecondary }]}>
                  {deck.cards ? deck.cards.length : 0} cartões
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Você ainda não tem nenhum deck.
            </Text>
            <TouchableOpacity
              style={[styles.createDeckButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigate('/decks')}
            >
              <Text style={styles.createDeckButtonText}>Criar meu primeiro deck</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {renderWelcomeMessage()}
      {renderStudyCard()}
      {renderDeckSummary()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  studyCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studyCardTitle: {
    color: 'white',
    fontSize: 16,
  },
  studyCardCount: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  studyCardAction: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionContainer: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
  },
  decksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deckItem: {
    width: '31%',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    // Ajustes para responsividade na web
    '@media (max-width: 768px)': {
      width: '48%',
    },
    '@media (max-width: 480px)': {
      width: '100%',
    },
  },
  deckName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deckCount: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  createDeckButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  createDeckButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;