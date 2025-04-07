import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import FileUploader from './FileUploader';
import { TagIcon } from '@heroicons/react/24/outline';

type FlashcardFormData = {
  front: string;
  back: string;
  frontImage?: File | string;
  backImage?: File | string;
  frontAudio?: string;
  backAudio?: string;
  frontDocument?: {
    file?: File;
    url?: string;
    name: string;
    type: string;
  };
  backDocument?: {
    file?: File;
    url?: string;
    name: string;
    type: string;
  };
  tags: string;
};

interface FlashcardFormProps {
  deckId: string;
  initialData?: FlashcardFormData;
  onSubmit: (data: FlashcardFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  deckId,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FlashcardFormData>(initialData || {
    front: '',
    back: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualizar o formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.front.trim() || !formData.back.trim()) {
      setError('Os campos frente e verso são obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Erro ao salvar flashcard:', err);
      setError('Ocorreu um erro ao salvar o flashcard. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };

  // Manipuladores para uploads de arquivos
  const handleFrontImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, frontImage: url }));
  };

  const handleBackImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, backImage: url }));
  };

  const handleFrontAudioUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, frontAudio: url }));
  };

  const handleBackAudioUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, backAudio: url }));
  };

  const handleFrontDocumentUploaded = (url: string, file?: File) => {
    setFormData(prev => ({
      ...prev,
      frontDocument: {
        url,
        name: file?.name || 'Documento',
        type: file?.type || 'application/pdf'
      }
    }));
  };

  const handleBackDocumentUploaded = (url: string, file?: File) => {
    setFormData(prev => ({
      ...prev,
      backDocument: {
        url,
        name: file?.name || 'Documento',
        type: file?.type || 'application/pdf'
      }
    }));
  };

  // Manipuladores para remoção de arquivos
  const handleFrontImageRemoved = () => {
    setFormData(prev => ({ ...prev, frontImage: undefined }));
  };

  const handleBackImageRemoved = () => {
    setFormData(prev => ({ ...prev, backImage: undefined }));
  };

  const handleFrontAudioRemoved = () => {
    setFormData(prev => ({ ...prev, frontAudio: undefined }));
  };

  const handleBackAudioRemoved = () => {
    setFormData(prev => ({ ...prev, backAudio: undefined }));
  };

  const handleFrontDocumentRemoved = () => {
    setFormData(prev => ({ ...prev, frontDocument: undefined }));
  };

  const handleBackDocumentRemoved = () => {
    setFormData(prev => ({ ...prev, backDocument: undefined }));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="front" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Frente *
        </label>
        <textarea
          id="front"
          name="front"
          value={formData.front}
          onChange={handleChange}
          rows={2}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Imagem (frente)
          </label>
          <FileUploader
            type="image"
            deckId={deckId}
            initialValue={typeof formData.frontImage === 'string' ? formData.frontImage : undefined}
            onFileUploaded={handleFrontImageUploaded}
            onFileRemoved={handleFrontImageRemoved}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Áudio (frente)
          </label>
          <FileUploader
            type="audio"
            deckId={deckId}
            initialValue={formData.frontAudio}
            onFileUploaded={handleFrontAudioUploaded}
            onFileRemoved={handleFrontAudioRemoved}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Documento (frente)
        </label>
        <FileUploader
          type="document"
          deckId={deckId}
          initialValue={formData.frontDocument?.url}
          onFileUploaded={handleFrontDocumentUploaded}
          onFileRemoved={handleFrontDocumentRemoved}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label htmlFor="back" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Verso *
        </label>
        <textarea
          id="back"
          name="back"
          value={formData.back}
          onChange={handleChange}
          rows={2}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Imagem (verso)
          </label>
          <FileUploader
            type="image"
            deckId={deckId}
            initialValue={typeof formData.backImage === 'string' ? formData.backImage : undefined}
            onFileUploaded={handleBackImageUploaded}
            onFileRemoved={handleBackImageRemoved}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Áudio (verso)
          </label>
          <FileUploader
            type="audio"
            deckId={deckId}
            initialValue={formData.backAudio}
            onFileUploaded={handleBackAudioUploaded}
            onFileRemoved={handleBackAudioRemoved}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Documento (verso)
        </label>
        <FileUploader
          type="document"
          deckId={deckId}
          initialValue={formData.backDocument?.url}
          onFileUploaded={handleBackDocumentUploaded}
          onFileRemoved={handleBackDocumentRemoved}
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            <span>Tags (separadas por vírgula)</span>
          </div>
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Ex: matemática, álgebra, equações"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            isEditing ? 'Atualizar' : 'Adicionar'
          )}
        </button>
      </div>
    </form>
  );
};

export default FlashcardForm;