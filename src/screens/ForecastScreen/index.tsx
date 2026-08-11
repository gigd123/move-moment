import { StyleSheet, Text, View } from 'react-native';

export default function ForecastScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forecast</Text>
      <Text style={styles.body}>逐小時運動適合度會顯示在這裡（Phase 5 起接入 Best Window）。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 32 },
});
