import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatMoney } from './currency';

// Cómo se muestran las notificaciones con la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Pide permiso de notificaciones (y crea el canal en Android). Devuelve true si fue concedido. */
export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('recordatorios', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

function reminderId(fixedExpenseId: number): string {
  return `fixed-expense-${fixedExpenseId}`;
}

/**
 * Programa el recordatorio mensual de un gasto fijo: el día anterior al
 * vencimiento, a las 9am. Para gastos que vencen el día 1 se usa el día 28
 * (un trigger mensual no puede expresar "último día del mes").
 */
export async function scheduleFixedExpenseReminder(
  fixedExpenseId: number,
  name: string,
  amount: number,
  dayOfMonth: number,
): Promise<void> {
  try {
    const granted = await ensureNotificationPermissions();
    if (!granted) return;
    await cancelFixedExpenseReminder(fixedExpenseId);
    const reminderDay = dayOfMonth === 1 ? 28 : Math.min(dayOfMonth - 1, 28);
    await Notifications.scheduleNotificationAsync({
      identifier: reminderId(fixedExpenseId),
      content: {
        title: 'Magsave',
        body: `Mañana vence ${name} por ${formatMoney(amount)} 💸`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: reminderDay,
        hour: 9,
        minute: 0,
      },
    });
  } catch (error) {
    // La app sigue funcionando aunque falle la notificación
    console.warn('No se pudo programar el recordatorio:', error);
  }
}

export async function cancelFixedExpenseReminder(
  fixedExpenseId: number,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      reminderId(fixedExpenseId),
    );
  } catch (error) {
    console.warn('No se pudo cancelar el recordatorio:', error);
  }
}

/** Notificación inmediata al completar una meta de ahorro. */
export async function notifyGoalCompleted(goalName: string, emoji: string) {
  try {
    const granted = await ensureNotificationPermissions();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Meta cumplida! 🎉',
        body: `Completaste "${goalName}" ${emoji} — a celebrar (con moderación 😄)`,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('No se pudo enviar la notificación:', error);
  }
}
