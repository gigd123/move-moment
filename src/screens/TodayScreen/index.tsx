import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../../App';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Today'>;

export default function TodayScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.body}>今日運動建議會顯示在這裡（Phase 3 起接入真實資料）。</Text>
      <View style={styles.actions}>
        <Button title="查看今日詳細" onPress={() => navigation.navigate('Forecast')} />
        <Button title="設定" onPress={() => navigation.navigate('Settings')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 32 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 16 },
});
