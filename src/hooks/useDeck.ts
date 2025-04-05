import { useContext } from 'react';
import { DeckContext } from '../contexts/DeckContext';

export const useDeck = () => {
  const context = useContext(DeckContext);

  if (!context) {
    throw new Error('useDeck must be used within a DeckProvider');
  }

  return context;
};