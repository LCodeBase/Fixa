import React, { useState } from 'react';
import { SpeakerWaveIcon, PhotoIcon } from '@heroicons/react/24/outline';
import './FlipCard.css';

type FlipCardProps = {
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  frontAudio?: string;
  backAudio?: string;
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
};

const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  frontImage,
  backImage,
  frontAudio,
  backAudio,
  onFlip,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);

    // Reproduzir áudio do verso automaticamente quando virar o cartão
    if (newFlippedState && backAudio) {
      playAudio(backAudio);
    }

    if (onFlip) {
      onFlip(newFlippedState);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Erro ao reproduzir áudio:', error);
    });
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: '1000px', height: '100%' }}
    >
      <div
        className={`w-full h-full transition-transform duration-500 transform-gpu ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Frente do cartão */}
        <div
          className="absolute w-full h-full backface-hidden cursor-pointer p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md flex flex-col"
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex-1 flex flex-col justify-center items-center">
            <p className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap text-center">{front}</p>

            {frontImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={frontImage}
                  alt="Imagem frontal"
                  className="max-h-40 max-w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>

          {frontAudio && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(frontAudio);
                }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Reproduzir áudio"
              >
                <SpeakerWaveIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Verso do cartão */}
        <div
          className="absolute w-full h-full backface-hidden cursor-pointer p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md flex flex-col rotate-y-180"
          onClick={handleFlip}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="flex-1 flex flex-col justify-center items-center">
            <p className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap text-center">{back}</p>

            {backImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={backImage}
                  alt="Imagem do verso"
                  className="max-h-40 max-w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>

          {backAudio && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(backAudio);
                }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Reproduzir áudio"
              >
                <SpeakerWaveIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;