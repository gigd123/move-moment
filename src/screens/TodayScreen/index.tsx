import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../App';
import BestWindowCard from '../../components/BestWindowCard';
import IndoorRecommendationCard from '../../components/IndoorRecommendationCard';
import WeatherSummary, { type WeatherLoadState } from '../../components/WeatherSummary';
import { findBestOutdoorWindow } from '../../domain/exercise/bestWindow';
import { INDOOR_RECOMMENDATION_MESSAGE } from '../../domain/exercise/messages';
import {
  DEFAULT_NOTIFICATION_TIME,
  requestNotificationPermissionAsync,
  scheduleDailyNotification,
} from '../../notifications/notificationService';
import { fetchHourlyForecast } from '../../services/weather/weatherApi';
import type { HourlyWeather } from '../../types/weather';
import { colors } from '../../utils/colors';
import { findCurrentHour } from '../../utils/time';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Today'>;

type ForecastState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; hourly: HourlyWeather[] };

const LOCATION_DENIED_MESSAGE = '需要定位權限才能取得今天的天氣，請到系統設定開啟後重試。';
const FETCH_FAILED_MESSAGE = '取得天氣資料失敗，請檢查網路連線後重試。';

export default function TodayScreen() {
  const navigation = useNavigation<Navigation>();
  const [forecast, setForecast] = useState<ForecastState>({ status: 'loading' });

  const loadWeather = useCallback(async () => {
    setForecast({ status: 'loading' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setForecast({ status: 'error', message: LOCATION_DENIED_MESSAGE });
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const daily = await fetchHourlyForecast(position.coords.latitude, position.coords.longitude);

      if (daily.hourly.length === 0) {
        setForecast({ status: 'error', message: FETCH_FAILED_MESSAGE });
        return;
      }

      setForecast({ status: 'ready', hourly: daily.hourly });
    } catch {
      setForecast({ status: 'error', message: FETCH_FAILED_MESSAGE });
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const weatherSummary: WeatherLoadState = useMemo(() => {
    if (forecast.status === 'loading') return { status: 'loading' };
    if (forecast.status === 'error') return { status: 'error', message: forecast.message, onRetry: loadWeather };
    return { status: 'ready', hour: findCurrentHour(forecast.hourly) ?? forecast.hourly[0] };
  }, [forecast, loadWeather]);

  const bestWindow = useMemo(
    () => (forecast.status === 'ready' ? findBestOutdoorWindow(forecast.hourly) : null),
    [forecast]
  );

  useEffect(() => {
    // §26.2 fallback mechanism: whenever the app is opened with today's
    // notification still ahead, refresh its content with what we just
    // computed instead of waiting on the (best-effort, imprecise)
    // background task.
    if (forecast.status !== 'ready') return;

    const notificationTimeToday = new Date();
    notificationTimeToday.setHours(DEFAULT_NOTIFICATION_TIME.hour, DEFAULT_NOTIFICATION_TIME.minute, 0, 0);
    if (Date.now() >= notificationTimeToday.getTime()) return;

    requestNotificationPermissionAsync()
      .then((granted) => {
        if (!granted) return;
        return scheduleDailyNotification(DEFAULT_NOTIFICATION_TIME, bestWindow);
      })
      .catch(() => undefined);
  }, [forecast, bestWindow]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Good morning, Leo</Text>
        <Text style={styles.question}>今天適合運動嗎？</Text>

        <WeatherSummary {...weatherSummary} />

        <View style={styles.divider} />

        {forecast.status === 'ready' ? (
          bestWindow ? (
            <BestWindowCard start={bestWindow.start} end={bestWindow.end} score={bestWindow.averageScore} />
          ) : (
            <IndoorRecommendationCard message={INDOOR_RECOMMENDATION_MESSAGE} />
          )
        ) : null}

        <View style={styles.divider} />

        <Pressable
          style={({ pressed }) => [styles.forecastButton, pressed && styles.forecastButtonPressed]}
          onPress={() => navigation.navigate('Forecast')}
        >
          <Text style={styles.forecastButtonText}>查看今日完整預報</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, gap: 16 },
  greeting: { fontSize: 15, color: colors.inkMuted, fontWeight: '500' },
  question: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  forecastButton: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  forecastButtonPressed: { backgroundColor: colors.surface },
  forecastButtonText: { fontSize: 15, fontWeight: '600', color: colors.ink },
});
