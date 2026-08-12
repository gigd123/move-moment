import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';

import { addDailyNotificationTapListener } from './src/notifications/notificationService';
import { registerBackgroundRefreshAsync } from './src/notifications/backgroundRefresh';
import ForecastScreen from './src/screens/ForecastScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TodayScreen from './src/screens/TodayScreen';

export type RootStackParamList = {
  Today: undefined;
  Forecast: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  useEffect(() => {
    registerBackgroundRefreshAsync().catch(() => undefined);

    const subscription = addDailyNotificationTapListener(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Today');
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Today">
        <Stack.Screen
          name="Today"
          component={TodayScreen}
          options={({ navigation }) => ({
            title: '今日運動',
            headerRight: () => (
              <Pressable
                accessibilityLabel="設定"
                hitSlop={8}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={{ fontSize: 20 }}>⚙️</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Forecast" component={ForecastScreen} options={{ title: '今日詳細' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '設定' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
