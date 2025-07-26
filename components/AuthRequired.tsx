import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { authService } from '../services/auth';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type AuthRequiredProps = {
  message?: string;
};

export default function AuthRequired({ message = 'Necesitas iniciar sesión para acceder a esta función' }: AuthRequiredProps) {
  const router = useRouter();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.message}>{message}</ThemedText>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Iniciar Sesión</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    margin: 20,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});