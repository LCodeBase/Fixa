/**
 * Serviço para gerenciar notificações e lembretes de estudo
 */

// Tipos de notificação
export enum NotificationType {
  STUDY_REMINDER = 'study_reminder',
  NEW_CARDS_DUE = 'new_cards_due',
  STREAK_REMINDER = 'streak_reminder',
  ACHIEVEMENT = 'achievement'
}

// Interface para notificação
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any; // Dados adicionais específicos do tipo de notificação
}

// Interface para configurações de notificação
export interface NotificationSettings {
  studyReminders: boolean;
  studyReminderTime: string; // Formato HH:MM
  streakReminders: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
}

/**
 * Verifica se o navegador suporta notificações
 */
const checkNotificationSupport = (): boolean => {
  return 'Notification' in window;
};

/**
 * Solicita permissão para enviar notificações do navegador
 */
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Envia uma notificação do navegador
 */
const sendBrowserNotification = (title: string, options: NotificationOptions): void => {
  if (!checkNotificationSupport()) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

/**
 * Agenda um lembrete de estudo
 */
const scheduleStudyReminder = (time: string, deckName?: string): void => {
  // Em uma implementação real, isso usaria um serviço de agendamento
  // como um worker ou uma API de agendamento

  // Exemplo simplificado para demonstração
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const reminderTime = new Date();

  reminderTime.setHours(hours, minutes, 0, 0);

  // Se o horário já passou hoje, agendar para amanhã
  if (reminderTime < now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const timeUntilReminder = reminderTime.getTime() - now.getTime();

  setTimeout(() => {
    const message = deckName
      ? `Hora de estudar seu deck "${deckName}"!`
      : 'Hora de estudar seus flashcards!';

    sendBrowserNotification('Lembrete de Estudo', {
      body: message,
      icon: '/logo.png'
    });
  }, timeUntilReminder);
};

/**
 * Verifica se há cartões para revisar e envia notificação
 */
const checkDueCards = (dueCards: number): void => {
  if (dueCards > 0) {
    sendBrowserNotification('Cartões para Revisar', {
      body: `Você tem ${dueCards} cartões aguardando revisão hoje.`,
      icon: '/logo.png'
    });
  }
};

/**
 * Envia lembrete para manter sequência de estudos
 */
const sendStreakReminder = (currentStreak: number): void => {
  if (currentStreak > 0) {
    sendBrowserNotification('Mantenha sua Sequência!', {
      body: `Você está com uma sequência de ${currentStreak} dias. Não perca seu progresso!`,
      icon: '/logo.png'
    });
  }
};

/**
 * Salva as configurações de notificação do usuário
 */
const saveNotificationSettings = (userId: string, settings: NotificationSettings): void => {
  localStorage.setItem(`fixa_notification_settings_${userId}`, JSON.stringify(settings));
};

/**
 * Carrega as configurações de notificação do usuário
 */
const loadNotificationSettings = (userId: string): NotificationSettings => {
  const defaultSettings: NotificationSettings = {
    studyReminders: true,
    studyReminderTime: '20:00',
    streakReminders: true,
    emailNotifications: false,
    browserNotifications: true
  };

  const savedSettings = localStorage.getItem(`fixa_notification_settings_${userId}`);

  if (!savedSettings) {
    return defaultSettings;
  }

  try {
    return JSON.parse(savedSettings);
  } catch (error) {
    console.error('Erro ao carregar configurações de notificação:', error);
    return defaultSettings;
  }
};

export const notificationService = {
  checkNotificationSupport,
  requestNotificationPermission,
  sendBrowserNotification,
  scheduleStudyReminder,
  checkDueCards,
  sendStreakReminder,
  saveNotificationSettings,
  loadNotificationSettings
};