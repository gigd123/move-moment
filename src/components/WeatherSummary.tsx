import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getWeatherCondition } from '../services/weather/weatherCode';
import type { HourlyWeather } from '../types/weather';
import { colors } from '../utils/colors';

export type WeatherLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string; onRetry: () => void }
  | { status: 'ready'; hour: HourlyWeather };

export default function WeatherSummary(props: WeatherLoadState) {
  if (props.status === 'loading') {
    return (
      <View style={styles.row}>
        <Text style={styles.loadingText}>取得目前位置的天氣中…</Text>
      </View>
    );
  }

  if (props.status === 'error') {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{props.message}</Text>
        <Pressable style={styles.retryButton} onPress={props.onRetry}>
          <Text style={styles.retryText}>重試</Text>
        </Pressable>
      </View>
    );
  }

  const { emoji, condition } = getWeatherCondition(props.hour.weatherCode);

  return (
    <View style={styles.row}>
      <Text style={styles.weatherEmoji}>{emoji}</Text>
      <View>
        <Text style={styles.weatherCondition}>{condition}</Text>
        <Text style={styles.temperature}>
          {Math.round(props.hour.temperature)}°C ・ 體感 {Math.round(props.hour.feelsLike)}°C
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 48 },
  loadingText: { fontSize: 14, color: colors.inkMuted },
  weatherEmoji: { fontSize: 40 },
  weatherCondition: { fontSize: 17, fontWeight: '600', color: colors.ink },
  temperature: { fontSize: 14, color: colors.inkMuted, marginTop: 2, fontVariant: ['tabular-nums'] },
  errorBox: {
    backgroundColor: colors.warningSoft,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  errorText: { fontSize: 13, color: colors.ink },
  retryButton: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.warning },
  retryText: { fontSize: 12, fontWeight: '600', color: colors.warning },
});
