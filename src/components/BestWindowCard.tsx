import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../utils/colors';
import ScoreStars from './ScoreStars';

interface BestWindowCardProps {
  start: string;
  end: string;
  score: number;
}

export default function BestWindowCard({ start, end, score }: BestWindowCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>🏆 今日最佳戶外時段</Text>
      <Text style={styles.time}>
        {start} — {end}
      </Text>
      <ScoreStars score={score} size={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
  time: { fontSize: 28, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },
});
