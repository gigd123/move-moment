import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { INDOOR_RECOMMENDATION_MESSAGE } from '../domain/exercise/messages';
import type { BestWindow } from '../types/exercise';

// Stable identifier so we can always find/replace/cancel "today's" notification
// instead of accumulating duplicates, and so the tap listener can recognize it.
export const DAILY_NOTIFICATION_ID = 'move-window-daily';
const ANDROID_CHANNEL_ID = 'daily-reminder';

// §12: default daily notification time until Phase 7 adds a Settings screen
// to make this user-configurable and persist it via AsyncStorage.
export const DEFAULT_NOTIFICATION_TIME = { hour: 7, minute: 30 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: '每日運動提醒',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestNotificationPermissionAsync(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function buildNotificationContent(bestWindow: BestWindow | null): Notifications.NotificationContentInput {
  if (bestWindow) {
    return {
      title: '☀️ 今天適合運動',
      body: `最佳戶外時段：${bestWindow.start}～${bestWindow.end}`,
    };
  }

  return {
    title: '🏠 今天建議室內運動',
    body: INDOOR_RECOMMENDATION_MESSAGE,
  };
}

// §26.2: content baked in at schedule time goes stale, so "refreshing" a
// notification means cancelling and rescheduling it with the same
// identifier and trigger time but freshly computed content.
export async function scheduleDailyNotification(
  time: { hour: number; minute: number },
  bestWindow: BestWindow | null
): Promise<void> {
  await ensureAndroidChannelAsync();
  await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID).catch(() => undefined);

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_NOTIFICATION_ID,
    content: buildNotificationContent(bestWindow),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function cancelDailyNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID).catch(() => undefined);
}

export function addDailyNotificationTapListener(onTap: () => void): { remove: () => void } {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.notification.request.identifier === DAILY_NOTIFICATION_ID) {
      onTap();
    }
  });

  return subscription;
}
