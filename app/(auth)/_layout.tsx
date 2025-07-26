import { Stack } from 'expo-router';

import { useColorScheme } from '../../hooks/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#ffffff',
        },
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Crear Cuenta',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Recuperar Contraseña',
        }}
      />
    </Stack>
  );
}