import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../App';
import BestWindowCard from '../../components/BestWindowCard';
import IndoorRecommendationCard from '../../components/IndoorRecommendationCard';
import WarningBanner from '../../components/WarningBanner';
import WeatherSummary, { type WeatherLoadState } from '../../components/WeatherSummary';
import { fetchHourlyForecast } from '../../services/weather/weatherApi';
import { colors } from '../../utils/colors';
import { findCurrentHour } from '../../utils/time';
import { badDayMock, goodDayMock } from './mockData';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Today'>;

// Phase 4、5 才會實作 domain/exercise，最佳時段／室內建議暫時還是假資料。
// 這個開關讓兩種情境都能直接看到，Phase 5 接上真實 threshold 後會拿掉。
const DEMO_SCENARIOS = { good: goodDayMock, bad: badDayMock };

const LOCATION_DENIED_MESSAGE = '需要定位權限才能取得今天的天氣，請到系統設定開啟後重試。';
const FETCH_FAILED_MESSAGE = '取得天氣資料失敗，請檢查網路連線後重試。';

export default function TodayScreen() {
  const navigation = useNavigation<Navigation>();
  const [scenario, setScenario] = useState<keyof typeof DEMO_SCENARIOS>('good');
  const [weather, setWeather] = useState<WeatherLoadState>({ status: 'loading' });
  const today = DEMO_SCENARIOS[scenario];

  const loadWeather = useCallback(async () => {
    setWeather({ status: 'loading' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeather({ status: 'error', message: LOCATION_DENIED_MESSAGE, onRetry: loadWeather });
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const forecast = await fetchHourlyForecast(position.coords.latitude, position.coords.longitude);
      const currentHour = findCurrentHour(forecast.hourly);

      if (!currentHour) {
        setWeather({ status: 'error', message: FETCH_FAILED_MESSAGE, onRetry: loadWeather });
        return;
      }

      setWeather({ status: 'ready', hour: currentHour });
    } catch {
      setWeather({ status: 'error', message: FETCH_FAILED_MESSAGE, onRetry: loadWeather });
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>{today.greeting}</Text>
        <Text style={styles.question}>今天適合運動嗎？</Text>

        <WeatherSummary {...weather} />

        <View style={styles.divider} />

        {today.status === 'good' ? (
          <>
            <BestWindowCard start={today.bestWindow.start} end={today.bestWindow.end} score={today.bestWindow.score} />
            {today.warning ? (
              <>
                <View style={styles.divider} />
                <WarningBanner timeRange={today.warning.timeRange} reason={today.warning.reason} />
              </>
            ) : null}
          </>
        ) : (
          <IndoorRecommendationCard message={today.recommendation} />
        )}

        <View style={styles.divider} />

        <Pressable
          style={({ pressed }) => [styles.forecastButton, pressed && styles.forecastButtonPressed]}
          onPress={() => navigation.navigate('Forecast')}
        >
          <Text style={styles.forecastButtonText}>查看今日完整預報</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.demoBar}>
        <Text style={styles.demoLabel}>🔧 Phase 3 預覽（最佳時段仍為假資料）</Text>
        <View style={styles.demoChips}>
          <Pressable
            style={[styles.demoChip, scenario === 'good' && styles.demoChipActive]}
            onPress={() => setScenario('good')}
          >
            <Text style={[styles.demoChipText, scenario === 'good' && styles.demoChipTextActive]}>☀️ 好天氣</Text>
          </Pressable>
          <Pressable
            style={[styles.demoChip, scenario === 'bad' && styles.demoChipActive]}
            onPress={() => setScenario('bad')}
          >
            <Text style={[styles.demoChipText, scenario === 'bad' && styles.demoChipTextActive]}>🌧️ 全天不適合戶外</Text>
          </Pressable>
        </View>
      </View>
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
  demoBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: colors.surface,
  },
  demoLabel: { fontSize: 11, color: colors.inkMuted, fontWeight: '600' },
  demoChips: { flexDirection: 'row', gap: 8 },
  demoChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  demoChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  demoChipText: { fontSize: 12, fontWeight: '600', color: colors.inkMuted },
  demoChipTextActive: { color: colors.surface },
});
