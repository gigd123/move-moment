import * as BackgroundTask from 'expo-background-task';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { findBestOutdoorWindow } from '../domain/exercise/bestWindow';
import { fetchHourlyForecast } from '../services/weather/weatherApi';
import { DEFAULT_NOTIFICATION_TIME, scheduleDailyNotification } from './notificationService';

export const BACKGROUND_REFRESH_TASK = 'move-window-background-refresh';

// §26.2: only worth refreshing within ~2 hours of the scheduled notification
// time — any earlier and it'll just get refreshed again before it fires.
const REFRESH_WINDOW_HOURS = 2;

function isWithinRefreshWindow(target: { hour: number; minute: number }): boolean {
  const now = new Date();
  const targetToday = new Date(now);
  targetToday.setHours(target.hour, target.minute, 0, 0);

  const hoursUntilTarget = (targetToday.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilTarget >= 0 && hoursUntilTarget <= REFRESH_WINDOW_HOURS;
}

TaskManager.defineTask(BACKGROUND_REFRESH_TASK, async () => {
  try {
    if (!isWithinRefreshWindow(DEFAULT_NOTIFICATION_TIME)) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const position = await Location.getCurrentPositionAsync({});
    const forecast = await fetchHourlyForecast(position.coords.latitude, position.coords.longitude);
    const bestWindow = findBestOutdoorWindow(forecast.hourly);

    await scheduleDailyNotification(DEFAULT_NOTIFICATION_TIME, bestWindow);

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    // iOS/Android background execution isn't guaranteed to be timely or to
    // succeed every run (§26.2) — the app-open fallback in TodayScreen
    // covers the gap.
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundRefreshAsync(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_REFRESH_TASK);
  if (isRegistered) return;

  await BackgroundTask.registerTaskAsync(BACKGROUND_REFRESH_TASK);
}
