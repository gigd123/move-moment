import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationTime {
  hour: number;
  minute: number;
}

export interface NotificationSettings {
  notificationEnabled: boolean;
  notificationTime: NotificationTime;
}

// §18: local-only settings storage, no account/cloud sync for the MVP.
const STORAGE_KEY = 'move-window:notification-settings';

// §12's example default, until the user picks their own in Settings.
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  notificationEnabled: true,
  notificationTime: { hour: 7, minute: 30 },
};

function isValidSettings(value: unknown): value is NotificationSettings {
  if (typeof value !== 'object' || value === null) return false;
  const settings = value as Record<string, unknown>;
  const time = settings.notificationTime as Record<string, unknown> | undefined;

  return (
    typeof settings.notificationEnabled === 'boolean' &&
    typeof time?.hour === 'number' &&
    typeof time?.minute === 'number'
  );
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;

    const parsed = JSON.parse(raw);
    return isValidSettings(parsed) ? parsed : DEFAULT_NOTIFICATION_SETTINGS;
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
