import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useDeck } from '../contexts/DeckContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCardsForTodayCount } from '../utils/spacedRepetition';

const HomeScreen = ({ navigation }) => {
  const { currentUser } = useAuth();
  const { decks, loading } = useDeck();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [todayCards, setTodayCards] = useState(0);

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Aqui você pode adicionar lógica para recarregar os dados
    // Por exemplo, recarregar os decks do usuário
    setRefreshing(false);
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
        onPress={() => navigation.navigate('Study')}
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
          <TouchableOpacity onPress={() => navigation.navigate('Decks')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {decks && decks.length > 0 ? (
          <View style={styles.decksContainer}>
            {decks.slice(0, 3).map(deck => (
              <TouchableOpacity
                key={deck.id}
                style={[styles.deckItem, { backgroundColor: theme.colors.cardHighlight }]}
                onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}
              >
                <Text style={[styles.deckName, { color: theme.colors.text }]} numberOfLines={1}>
                  {deck.name}
                </Text>
                <Text style={[styles.deckCardCount, { color: theme.colors.placeholder }]}>
                  {deck.cards?.length || 0} cartões
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, {
                      backgroundColor: theme.colors.primary,
                      width: `${deck.stats?.completionPercentage || 0}%`
                    }]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: theme.colors.placeholder }]}>
              Você ainda não tem decks. Crie seu primeiro deck para começar a estudar!
            </Text>
            <TouchableOpacity
              style={[styles.createDeckButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Decks')}
            >
              <Text style={styles.createDeckButtonText}>Criar Deck</Text>
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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
    padding: 16,
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  studyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studyCardTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  studyCardCount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  studyCardAction: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  decksContainer: {
    gap: 12,
  },
  deckItem: {
    borderRadius: 12,
    padding: 16,
  },
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deckCardCount: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  createDeckButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createDeckButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;