import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Deck } from '../contexts/DeckContext';
import {
  PencilIcon,
  TrashIcon,
  ShareIcon,
  TagIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  StarIcon as StarIconOutline,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

type DeckCardProps = {
  deck: Deck;
  onDelete?: (deckId: string) => void;
  onShare?: (deckId: string, isPublic: boolean) => void;
  onToggleFavorite?: (deckId: string) => void;
  showActions?: boolean;
  className?: string;
};

const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onDelete,
  onShare,
  onToggleFavorite,
  showActions = true,
  className = '',
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(deck.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(deck.id, !deck.isPublic);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(deck.id);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${className} ${isHovered ? 'transform-gpu scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showDeleteConfirm ? (
        <div className="p-5 h-full flex flex-col">
          <div className="text-sm text-red-600 dark:text-red-400 mb-3">
            Tem certeza que deseja excluir este deck? Esta ação não pode ser desfeita.
          </div>
          <div className="flex space-x-2 mt-auto">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Excluir
            </button>
            <button
              onClick={handleCancelDelete}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-5">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 truncate">
                {deck.name}
              </h3>
              {deck.isPublic && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Público
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {deck.description || 'Sem descrição'}
            </p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
              <DocumentDuplicateIcon className="h-4 w-4 mr-1" aria-hidden="true" />
              <span>{deck.flashcards.length} flashcards</span>
            </div>
            {deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {deck.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <TagIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-col space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Criado em {format(new Date(deck.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              {deck.lastStudied && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Último estudo: {format(new Date(deck.lastStudied), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3 flex justify-between items-center">
            <Link
              to={`/decks/${deck.id}`}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Ver detalhes
              <ArrowRightIcon className="inline-block h-4 w-4 ml-1" aria-hidden="true" />
            </Link>

            {showActions && (
              <div className="flex space-x-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-1.5 transition-colors ${deck.isFavorite ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500'}`}
                  title={deck.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  {deck.isFavorite ? (
                    <StarIconSolid className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <StarIconOutline className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <button
                  onClick={handleShareClick}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title={deck.isPublic ? 'Tornar privado' : 'Compartilhar'}
                >
                  <ShareIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  to={`/decks/${deck.id}/edit`}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Editar"
                >
                  <PencilIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Excluir"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DeckCard;