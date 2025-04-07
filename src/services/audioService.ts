import { storageService } from './storageService';

/**
 * Serviço para gerenciar gravação e reprodução de áudio nos flashcards
 */
export const audioService = {
  /**
   * Verifica se o navegador suporta gravação de áudio
   * @returns Verdadeiro se o navegador suporta gravação de áudio
   */
  isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  /**
   * Solicita permissão para acessar o microfone
   * @returns Promessa que resolve com verdadeiro se a permissão foi concedida
   */
  async requestMicrophonePermission(): Promise<boolean> {
    if (!this.isRecordingSupported()) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Liberar a stream após obter permissão
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão para microfone:', error);
      return false;
    }
  },

  /**
   * Inicia a gravação de áudio
   * @returns Objeto com métodos para controlar a gravação
   */
  async startRecording(): Promise<{
    stop: () => Promise<Blob>;
    pause: () => void;
    resume: () => void;
    cancel: () => void;
  }> {
    if (!this.isRecordingSupported()) {
      throw new Error('Gravação de áudio não é suportada neste navegador');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorder.start();

      const stop = (): Promise<Blob> => {
        return new Promise((resolve) => {
          mediaRecorder.addEventListener('stop', () => {
            // Liberar a stream após parar a gravação
            stream.getTracks().forEach(track => track.stop());

            // Criar blob de áudio com os chunks gravados
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            resolve(audioBlob);
          });

          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        });
      };

      const pause = (): void => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.pause();
        }
      };

      const resume = (): void => {
        if (mediaRecorder.state === 'paused') {
          mediaRecorder.resume();
        }
      };

      const cancel = (): void => {
        // Parar a gravação sem salvar
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        // Liberar a stream
        stream.getTracks().forEach(track => track.stop());
      };

      return { stop, pause, resume, cancel };
    } catch (error) {
      console.error('Erro ao iniciar gravação de áudio:', error);
      throw new Error('Não foi possível iniciar a gravação de áudio');
    }
  },

  /**
   * Converte um Blob de áudio em um arquivo File
   * @param audioBlob Blob de áudio gravado
   * @param filename Nome do arquivo
   * @returns Arquivo de áudio
   */
  createAudioFile(audioBlob: Blob, filename: string = 'audio-recording'): File {
    // Adicionar timestamp para evitar nomes duplicados
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFilename = `${filename}-${timestamp}.webm`;

    return new File([audioBlob], fullFilename, { type: 'audio/webm' });
  },

  /**
   * Faz upload de um arquivo de áudio para o storage
   * @param audioFile Arquivo de áudio
   * @param userId ID do usuário
   * @param deckId ID do deck
   * @returns URL do áudio enviado
   */
  async uploadAudio(audioFile: File, userId: string, deckId: string): Promise<string> {
    return storageService.uploadAudio(audioFile, userId, deckId);
  },

  /**
   * Reproduz um áudio a partir de uma URL
   * @param audioUrl URL do áudio a ser reproduzido
   * @returns Objeto de áudio que está sendo reproduzido
   */
  playAudio(audioUrl: string): HTMLAudioElement {
    const audio = new Audio(audioUrl);

    audio.play().catch(error => {
      console.error('Erro ao reproduzir áudio:', error);
    });

    return audio;
  },

  /**
   * Converte duração em segundos para formato mm:ss
   * @param durationInSeconds Duração em segundos
   * @returns Duração formatada
   */
  formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};