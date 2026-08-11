import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../utils/colors';

interface IndoorRecommendationCardProps {
  message: string;
}

export default function IndoorRecommendationCard({ message }: IndoorRecommendationCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>🏠</Text>
      <Text style={styles.title}>建議室內運動</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accent2Soft,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  icon: { fontSize: 32 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  message: { fontSize: 14, color: colors.inkMuted, textAlign: 'center' },
});
