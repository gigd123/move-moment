import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../App';
import BestWindowCard from '../../components/BestWindowCard';
import IndoorRecommendationCard from '../../components/IndoorRecommendationCard';
import WarningBanner from '../../components/WarningBanner';
import { colors } from '../../utils/colors';
import { badDayMock, goodDayMock } from './mockData';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Today'>;

// Phase 2 只有假資料，用這個開關手動切換「好天氣／全天不適合戶外」兩種情境給人看。
// Phase 5 接上 bestWindow.ts 的 60 分 threshold 後，這個狀態會改成算出來的，這個開關就會拿掉。
const DEMO_SCENARIOS = { good: goodDayMock, bad: badDayMock };

export default function TodayScreen() {
  const navigation = useNavigation<Navigation>();
  const [scenario, setScenario] = useState<keyof typeof DEMO_SCENARIOS>('good');
  const today = DEMO_SCENARIOS[scenario];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>{today.greeting}</Text>
        <Text style={styles.question}>今天適合運動嗎？</Text>

        <View style={styles.weatherRow}>
          <Text style={styles.weatherEmoji}>{today.weather.emoji}</Text>
          <View>
            <Text style={styles.weatherCondition}>{today.weather.condition}</Text>
            <Text style={styles.temperature}>
              {today.weather.temperature}°C ・ 體感 {today.weather.feelsLike}°C
            </Text>
          </View>
        </View>

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
        <Text style={styles.demoLabel}>🔧 Phase 2 預覽</Text>
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
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  weatherEmoji: { fontSize: 40 },
  weatherCondition: { fontSize: 17, fontWeight: '600', color: colors.ink },
  temperature: { fontSize: 14, color: colors.inkMuted, marginTop: 2, fontVariant: ['tabular-nums'] },
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
