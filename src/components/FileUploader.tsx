import React, { useState, useRef } from 'react';
import { PhotoIcon, DocumentIcon, SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';

type FileType = 'image' | 'document' | 'audio';

interface FileUploaderProps {
  type: FileType;
  deckId: string;
  initialValue?: string;
  onFileUploaded: (url: string, file?: File) => void;
  onFileRemoved?: () => void;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  type,
  deckId,
  initialValue,
  onFileUploaded,
  onFileRemoved,
  className = ''
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Configurações baseadas no tipo de arquivo
  const getConfig = () => {
    switch (type) {
      case 'image':
        return {
          accept: 'image/*',
          icon: <PhotoIcon className="h-8 w-8 text-gray-400" />,
          title: 'Imagem',
          description: 'PNG, JPG ou GIF (máx. 5MB)',
          uploadFn: (file: File) => storageService.uploadImage(file, user?.uid || '', deckId)
        };
      case 'document':
        return {
          accept: '.pdf,.doc,.docx',
          icon: <DocumentIcon className="h-8 w-8 text-gray-400" />,
          title: 'Documento',
          description: 'PDF, DOC ou DOCX (máx. 10MB)',
          uploadFn: (file: File) => storageService.uploadDocument(file, user?.uid || '', deckId)
        };
      case 'audio':
        return {
          accept: 'audio/*',
          icon: <SpeakerWaveIcon className="h-8 w-8 text-gray-400" />,
          title: 'Áudio',
          description: 'MP3, WAV ou WebM (máx. 5MB)',
          uploadFn: (file: File) => storageService.uploadAudio(file, user?.uid || '', deckId)
        };
      default:
        return {
          accept: '*/*',
          icon: <DocumentIcon className="h-8 w-8 text-gray-400" />,
          title: 'Arquivo',
          description: 'Selecione um arquivo',
          uploadFn: (file: File) => storageService.uploadFile(file, `users/${user?.uid || ''}/decks/${deckId}/files`)
        };
    }
  };

  const config = getConfig();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tamanho do arquivo
    const maxSize = type === 'document' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB para documentos, 5MB para outros
    if (selectedFile.size > maxSize) {
      setError(`O arquivo é muito grande. O tamanho máximo é ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Criar preview para imagens
    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (type === 'document') {
      setPreview(selectedFile.name);
    } else if (type === 'audio') {
      setPreview(selectedFile.name);
    }

    // Upload automático
    await handleUpload(selectedFile);
  };

  const handleUpload = async (fileToUpload: File) => {
    if (!fileToUpload || !user) return;

    try {
      setUploading(true);
      const url = await config.uploadFn(fileToUpload);
      onFileUploaded(url, fileToUpload);
      setUploading(false);
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setError('Falha ao enviar o arquivo. Por favor, tente novamente.');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileRemoved) {
      onFileRemoved();
    }
  };

  const startRecording = async () => {
    if (!audioService.isRecordingSupported()) {
      setError('Seu navegador não suporta gravação de áudio.');
      return;
    }

    try {
      const hasPermission = await audioService.requestMicrophonePermission();
      if (!hasPermission) {
        setError('Permissão para usar o microfone foi negada.');
        return;
      }

      const recorder = await audioService.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      setError(null);

      // Iniciar timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);

        // Limitar gravação a 3 minutos
        if (seconds >= 180) {
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    try {
      // Parar timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Parar gravação e obter o blob
      const audioBlob = await recorderRef.current.stop();
      setIsRecording(false);

      // Criar arquivo a partir do blob
      const audioFile = audioService.createAudioFile(audioBlob);
      setFile(audioFile);
      setPreview(audioFile.name);

      // Fazer upload
      await handleUpload(audioFile);
    } catch (err) {
      console.error('Erro ao parar gravação:', err);
      setError('Não foi possível finalizar a gravação.');
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number): string => {
    return audioService.formatDuration(seconds);
  };

  // Renderizar o componente com base no estado atual
  if (preview) {
    return (
      <div className={`relative ${className}`}>
        {type === 'image' ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex items-center">
              {type === 'document' ? (
                <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
              ) : (
                <SpeakerWaveIcon className="h-5 w-5 text-gray-500 mr-2" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                {preview}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-6 py-4">
        <div className="text-center">
          {config.icon}
          <div className="mt-2 flex text-sm text-gray-600 dark:text-gray-400">
            <label
              htmlFor={`file-upload-${type}`}
              className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none"
            >
              <span>Enviar {config.title}</span>
              <input
                id={`file-upload-${type}`}
                name={`file-upload-${type}`}
                type="file"
                className="sr-only"
                accept={config.accept}
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={uploading}
              />
            </label>
            {type === 'audio' && (
              <>
                <span className="pl-1">ou</span>
                <button
                  type="button"
                  className="pl-1 font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={uploading}
                >
                  {isRecording ? `Parar gravação (${formatTime(recordingTime)})` : 'Gravar áudio'}
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {config.description}
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
      {uploading && (
        <div className="mt-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600 mr-2"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enviando...</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;