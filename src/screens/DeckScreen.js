import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDeck } from '../contexts/DeckContext';
import { useTheme } from '../contexts/ThemeContext';

const DeckScreen = ({ navigation }) => {
  const { decks, createDeck, deleteDeck, loading } = useDeck();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o deck');
      return;
    }

    try {
      const newDeck = await createDeck({
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
      });

      setModalVisible(false);
      setNewDeckName('');
      setNewDeckDescription('');

      // Navega para a tela de detalhes do deck recém-criado
      navigation.navigate('DeckDetail', { deckId: newDeck.id });
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      Alert.alert('Erro', 'Não foi possível criar o deck. Tente novamente.');
    }
  };

  const handleDeleteDeck = (deckId, deckName) => {
    Alert.alert(
      'Excluir Deck',
      `Tem certeza que deseja excluir o deck "${deckName}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeck(deckId);
            } catch (error) {
              console.error('Erro ao excluir deck:', error);
              Alert.alert('Erro', 'Não foi possível excluir o deck. Tente novamente.');
            }
          }
        },
      ]
    );
  };

  const renderDeckItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.deckItem, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}
      >
        <View style={styles.deckInfo}>
          <Text style={[styles.deckName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={[styles.deckDescription, { color: theme.colors.placeholder }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.deckStats}>
            <Text style={[styles.deckStatsText, { color: theme.colors.text }]}>
              {item.cards?.length || 0} cartões
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, {
                    backgroundColor: theme.colors.primary,
                    width: `${item.stats?.completionPercentage || 0}%`
                  }]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.text }]}>
                {item.stats?.completionPercentage || 0}%
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDeck(item.id, item.name)}
        >
          <MaterialCommunityIcons name="delete-outline" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <MaterialCommunityIcons
          name="cards-outline"
          size={64}
          color={theme.colors.placeholder}
        />
        <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
          Nenhum deck encontrado
        </Text>
        <Text style={[styles.emptyStateDescription, { color: theme.colors.placeholder }]}>
          Crie seu primeiro deck para começar a estudar!
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={decks}
        renderItem={renderDeckItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Criar Novo Deck
            </Text>

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Nome do Deck"
              placeholderTextColor={theme.colors.placeholder}
              value={newDeckName}
              onChangeText={setNewDeckName}
            />

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
                height: 100,
                textAlignVertical: 'top'
              }]}
              placeholder="Descrição (opcional)"
              placeholderTextColor={theme.colors.placeholder}
              value={newDeckDescription}
              onChangeText={setNewDeckDescription}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewDeckName('');
                  setNewDeckDescription('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateDeck}
              >
                <Text style={styles.createButtonText}>
                  Criar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Espaço para o FAB
  },
  deckItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckInfo: {
    flex: 1,
    marginRight: 16,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deckDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckStatsText: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  createButton: {
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DeckScreen;