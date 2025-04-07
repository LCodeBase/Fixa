import React, { useState, useEffect } from 'react';
import { DocumentIcon, PhotoIcon, ArrowPathIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import './FlipCard.css';

type FlipCardProps = {
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  frontAudio?: string;
  backAudio?: string;
  frontDocument?: {
    url: string;
    name: string;
    type: string;
  };
  backDocument?: {
    url: string;
    name: string;
    type: string;
  };
  onFlip?: (isFlipped: boolean) => void;
  onReset?: () => void;
  className?: string;
};

const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  frontImage,
  backImage,
  frontAudio,
  backAudio,
  frontDocument,
  backDocument,
  onFlip,
  onReset,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);

    if (onFlip) {
      onFlip(newFlippedState);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que o cartão vire
    setIsFlipped(false);
    if (onReset) {
      onReset();
    }
  };

  const handleAudioPlay = (e: React.MouseEvent, audioUrl?: string) => {
    e.stopPropagation();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
      });
    }
  };

  const handleDocumentClick = (e: React.MouseEvent, documentUrl: string) => {
    e.stopPropagation();
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className={`relative ${className}`}
      style={{ perspective: '1000px', height: '100%' }}
      aria-label="Flashcard"
    >
      <div
        className={`w-full h-full transition-transform duration-500 transform-gpu`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Frente do cartão */}
        <section
          className="absolute w-full h-full backface-hidden cursor-pointer p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md flex flex-col"
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
          aria-label="Frente do flashcard"
          role="button"
          tabIndex={0}
        >
          <div className="flex-1 flex flex-col justify-center items-center">
            <p className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap text-center">{front}</p>

            {frontImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={frontImage}
                  alt="Imagem frontal do flashcard"
                  className="max-h-40 max-w-full rounded-lg object-contain"
                  loading="lazy"
                />
              </div>
            )}

            {frontAudio && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => handleAudioPlay(e, frontAudio)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label="Ouvir áudio do flashcard"
                >
                  <SpeakerWaveIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  Ouvir áudio
                </button>
              </div>
            )}

            {frontDocument && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => handleDocumentClick(e, frontDocument.url)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label={`Abrir documento: ${frontDocument.name}`}
                >
                  <DocumentIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  {frontDocument.name}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Verso do cartão */}
        <section
          className="absolute w-full h-full backface-hidden cursor-pointer p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md flex flex-col"
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          aria-label="Verso do flashcard"
          role="button"
          tabIndex={0}
        >
          <div className="flex-1 flex flex-col justify-center items-center">
            <p className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap text-center">{back}</p>

            {backImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={backImage}
                  alt="Imagem do verso do flashcard"
                  className="max-h-40 max-w-full rounded-lg object-contain"
                  loading="lazy"
                />
              </div>
            )}

            {backAudio && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => handleAudioPlay(e, backAudio)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label="Ouvir áudio do verso do flashcard"
                >
                  <SpeakerWaveIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  Ouvir áudio
                </button>
              </div>
            )}

            {backDocument && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => handleDocumentClick(e, backDocument.url)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label={`Abrir documento: ${backDocument.name}`}
                >
                  <DocumentIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                  {backDocument.name}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            {/* Botão de reset */}
            <button
              onClick={handleReset}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="Resetar flashcard"
            >
              <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </article>
  );
};

export default FlipCard;