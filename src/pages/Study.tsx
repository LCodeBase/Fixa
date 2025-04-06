import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeck } from '../hooks/useDeck';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FlipCard from '../components/FlipCard';

// Icons
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  PhotoIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

// Tipo para representar a qualidade da resposta (0-5)
type ResponseQuality = 0 | 1 | 2 | 3 | 4 | 5;

const Study = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { decks, loading, error, getDeck, updateFlashcardReview, getDueFlashcards } = useDeck();

  const [deck, setDeck] = useState(getDeck(deckId || ''));
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [studyStats, setStudyStats] = useState({
    total: 0,
    reviewed: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });

  // Carregar deck e cartões para revisão
  useEffect(() => {
    if (deckId) {
      const currentDeck = getDeck(deckId);
      setDeck(currentDeck);

      if (currentDeck) {
        const cardsToStudy = getDueFlashcards(deckId);
        setDueCards(cardsToStudy);
        setStudyStats(prev => ({
          ...prev,
          total: cardsToStudy.length
        }));
      }
    }
  }, [deckId, decks, getDeck, getDueFlashcards]);

  // Reproduzir áudio se disponível
  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
      });
    }
  };

  // Virar o cartão para mostrar a resposta
  const handleShowAnswer = () => {
    setShowAnswer(true);

    // Reproduzir áudio do verso automaticamente
    const currentCard = dueCards[currentCardIndex];
    if (currentCard?.backAudio) {
      playAudio(currentCard.backAudio);
    }
  };

  // Processar a resposta do usuário
  const handleResponse = async (quality: ResponseQuality) => {
    if (!deckId || dueCards.length === 0) return;

    const currentCard = dueCards[currentCardIndex];

    try {
      await updateFlashcardReview(deckId, currentCard.id, quality);

      // Atualizar estatísticas
      setStudyStats(prev => {
        const newStats = {
          ...prev,
          reviewed: prev.reviewed + 1
        };

        if (quality <= 2) newStats.hard = prev.hard + 1;
        else if (quality <= 3) newStats.medium = prev.medium + 1;
        else newStats.easy = prev.easy + 1;

        return newStats;
      });

      // Avançar para o próximo cartão ou finalizar o estudo
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        setStudyComplete(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar revisão:', error);
    }
  };

  // Reiniciar a sessão de estudo
  const handleRestartStudy = () => {
    if (deckId) {
      const cardsToStudy = getDueFlashcards(deckId);
      setDueCards(cardsToStudy);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setStudyComplete(false);
      setStudyStats({
        total: cardsToStudy.length,
        reviewed: 0,
        easy: 0,
        medium: 0,
        hard: 0
      });
    }
  };

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

  if (!deck) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Deck não encontrado!</strong>
        <span className="block sm:inline"> O deck que você está procurando não existe ou foi removido.</span>
        <div className="mt-4">
          <button
            onClick={() => navigate('/decks')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Voltar para meus decks
          </button>
        </div>
      </div>
    );
  }

  // Se não houver cartões para revisar
  if (dueCards.length === 0) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(`/decks/${deckId}`)}
            className="mr-4 inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudar: {deck.name}</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Nada para revisar!</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Você não tem flashcards para revisar neste momento. Volte mais tarde ou adicione novos flashcards ao deck.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate(`/decks/${deckId}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voltar para o deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de conclusão do estudo
  if (studyComplete) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(`/decks/${deckId}`)}
            className="mr-4 inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudo Concluído!</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-center text-gray-900 dark:text-white">Parabéns!</h3>
          <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
            Você concluiu a revisão de todos os flashcards programados para hoje.
          </p>

          {/* Estatísticas da sessão */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Resumo da sessão:</h4>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                <dt className="text-sm font-medium text-green-800 dark:text-green-300">Fácil</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-800 dark:text-green-300">{studyStats.easy}</dd>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                <dt className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Médio</dt>
                <dd className="mt-1 text-2xl font-semibold text-yellow-800 dark:text-yellow-300">{studyStats.medium}</dd>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                <dt className="text-sm font-medium text-red-800 dark:text-red-300">Difícil</dt>
                <dd className="mt-1 text-2xl font-semibold text-red-800 dark:text-red-300">{studyStats.hard}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/decks/${deckId}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voltar para o deck
            </button>
            <button
              onClick={handleRestartStudy}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Estudar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de estudo
  const currentCard = dueCards[currentCardIndex];

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="mr-4 inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudar: {deck.name}</h1>
      </div>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>Progresso</span>
          <span>{currentCardIndex + 1} de {dueCards.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full"
            style={{ width: `${((currentCardIndex + 1) / dueCards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Cartão com animação */}
      <div className="mb-6">
        <div className="h-[350px] w-full max-w-xl mx-auto">
          <FlipCard
            front={currentCard.front}
            back={currentCard.back}
            frontImage={currentCard.frontImage}
            backImage={currentCard.backImage}
            frontAudio={currentCard.frontAudio}
            backAudio={currentCard.backAudio}
            onFlip={(isFlipped) => setShowAnswer(isFlipped)}
            className="card-shine h-full"
          />
        </div>

        {/* Botões de ação */}
        <div className="mt-6 px-4 py-4 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          {!showAnswer ? (
            <div className="flex justify-center">
              <button
                onClick={handleShowAnswer}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Mostrar resposta
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">
                Quão bem você lembrou deste flashcard?
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleResponse(0)}
                  className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center">
                    <FaceFrownIcon className="h-4 w-4 mr-1" />
                    Não lembrei
                  </span>
                </button>
                <button
                  onClick={() => handleResponse(3)}
                  className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-transform hover:scale-105 active:scale-95"
                >
                  Difícil
                </button>
                <button
                  onClick={() => handleResponse(4)}
                  className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-105 active:scale-95"
                >
                  Bom
                </button>
                <button
                  onClick={() => handleResponse(5)}
                  className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center">
                    <FaceSmileIcon className="h-4 w-4 mr-1" />
                    Fácil
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Study;