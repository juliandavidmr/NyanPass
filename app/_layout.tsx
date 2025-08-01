import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui, TamaguiProvider } from '@tamagui/core';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { initI18n } from '@/config/i18n';
import { useColorScheme } from '@/hooks/useColorScheme';

import AuthGuard from '../components/AuthGuard';

const config = createTamagui(defaultConfig)

initI18n()

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme!}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </AuthGuard>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
