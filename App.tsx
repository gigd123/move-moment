import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text } from 'react-native';

import ForecastScreen from './src/screens/ForecastScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TodayScreen from './src/screens/TodayScreen';

export type RootStackParamList = {
  Today: undefined;
  Forecast: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
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
