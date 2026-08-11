import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../utils/colors';

interface WarningBannerProps {
  timeRange: string;
  reason: string;
}

export default function WarningBanner({ timeRange, reason }: WarningBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>⚠️ 不建議戶外</Text>
      <Text style={styles.time}>{timeRange}</Text>
      <Text style={styles.reason}>原因：{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warningSoft,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 4,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.warning },
  time: { fontSize: 15, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
  reason: { fontSize: 13, color: colors.inkMuted },
});
