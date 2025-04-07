import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Serviço para gerenciar uploads e downloads de arquivos no Firebase Storage
 */
export const storageService = {
  /**
   * Faz upload de um arquivo para o Firebase Storage
   * @param file Arquivo a ser enviado
   * @param path Caminho onde o arquivo será armazenado
   * @returns URL do arquivo enviado
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    try {
      // Criar referência para o arquivo no Storage
      const storageRef = ref(storage, `${path}/${file.name}`);

      // Fazer upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);

      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw new Error('Falha ao enviar o arquivo. Por favor, tente novamente.');
    }
  },

  /**
   * Faz upload de uma imagem para o Firebase Storage
   * @param file Arquivo de imagem
   * @param userId ID do usuário
   * @param deckId ID do deck
   * @returns URL da imagem enviada
   */
  async uploadImage(file: File, userId: string, deckId: string): Promise<string> {
    return this.uploadFile(file, `users/${userId}/decks/${deckId}/images`);
  },

  /**
   * Faz upload de um documento para o Firebase Storage
   * @param file Arquivo de documento
   * @param userId ID do usuário
   * @param deckId ID do deck
   * @returns URL do documento enviado
   */
  async uploadDocument(file: File, userId: string, deckId: string): Promise<string> {
    return this.uploadFile(file, `users/${userId}/decks/${deckId}/documents`);
  },

  /**
   * Faz upload de um áudio para o Firebase Storage
   * @param file Arquivo de áudio
   * @param userId ID do usuário
   * @param deckId ID do deck
   * @returns URL do áudio enviado
   */
  async uploadAudio(file: File, userId: string, deckId: string): Promise<string> {
    return this.uploadFile(file, `users/${userId}/decks/${deckId}/audio`);
  },

  /**
   * Exclui um arquivo do Firebase Storage
   * @param fileUrl URL do arquivo a ser excluído
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.includes('firebase')) {
      return; // Não é um arquivo do Firebase Storage
    }

    try {
      // Criar referência para o arquivo a partir da URL
      const fileRef = ref(storage, fileUrl);

      // Excluir o arquivo
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      // Não lançar erro para não interromper outras operações
    }
  }
};