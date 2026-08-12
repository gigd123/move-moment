import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
  type NotificationTime,
} from '../../storage/settingsStorage';
import { colors } from '../../utils/colors';

const TIME_STEP_MINUTES = 30;
const MINUTES_PER_DAY = 24 * 60;

function shiftTime(time: NotificationTime, deltaMinutes: number): NotificationTime {
  const totalMinutes = (time.hour * 60 + time.minute + deltaMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

function formatTime(time: NotificationTime): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotificationSettings().then((loadedSettings) => {
        setSettings(loadedSettings);
        setLoaded(true);
      });
    }, [])
  );

  const updateSettings = useCallback((next: NotificationSettings) => {
    setSettings(next);
    saveNotificationSettings(next);
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeText}>
              瀏覽器版不支援本地通知排程，設定值會照常儲存，但不會實際發出通知。請在手機上用 Expo Go 測試。
            </Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.rowLabel}>每日通知</Text>
          <Switch
            value={settings.notificationEnabled}
            onValueChange={(notificationEnabled) => updateSettings({ ...settings, notificationEnabled })}
            trackColor={{ true: colors.accent }}
          />
        </View>

        <View style={styles.divider} />

        <View style={[styles.row, !settings.notificationEnabled && styles.rowDisabled]}>
          <Text style={styles.rowLabel}>通知時間</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepperButton}
              disabled={!settings.notificationEnabled}
              onPress={() =>
                updateSettings({
                  ...settings,
                  notificationTime: shiftTime(settings.notificationTime, -TIME_STEP_MINUTES),
                })
              }
            >
              <Text style={styles.stepperButtonText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{formatTime(settings.notificationTime)}</Text>
            <Pressable
              style={styles.stepperButton}
              disabled={!settings.notificationEnabled}
              onPress={() =>
                updateSettings({
                  ...settings,
                  notificationTime: shiftTime(settings.notificationTime, TIME_STEP_MINUTES),
                })
              }
            >
              <Text style={styles.stepperButtonText}>＋</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, gap: 4 },
  webNotice: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  webNoticeText: { fontSize: 13, color: colors.ink, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowDisabled: { opacity: 0.4 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: colors.ink },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { fontSize: 18, fontWeight: '600', color: colors.ink },
  stepperValue: { fontSize: 17, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'], minWidth: 56, textAlign: 'center' },
});
