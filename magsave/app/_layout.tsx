import '../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/constants/colors';
import { ONBOARDING_KEY } from '@/constants/storage';
import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import { seedDatabase } from '@/db/seed';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!success) return;
    (async () => {
      try {
        await seedDatabase();
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(done !== 'true');
      } catch (e) {
        console.error('Error inicializando la app:', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync();
      }
    })();
  }, [success]);

  if (error) {
    SplashScreen.hideAsync();
    return (
      <View className="flex-1 items-center justify-center bg-bg px-8">
        <Text className="text-center text-base text-text-primary">
          Ups, no pudimos preparar la base de datos 😢{'\n'}
          Cierra la app y vuelve a intentarlo.
        </Text>
      </View>
    );
  }

  if (!ready) return null; // el splash sigue visible

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        </Stack>
        {showOnboarding && <Redirect href="/onboarding" />}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
