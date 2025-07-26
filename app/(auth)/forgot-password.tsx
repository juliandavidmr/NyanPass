import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Input } from 'tamagui';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { authService } from '../../services/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, ingresa tu email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email);
      setResetSent(true);
    } catch (error: any) {
      let errorMessage = 'Error al enviar el correo de recuperación';

      // Manejar errores específicos de Firebase Auth
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Recuperar Contraseña</ThemedText>
          <ThemedText style={styles.subtitle}>
            {resetSent
              ? 'Hemos enviado un correo con instrucciones para recuperar tu contraseña'
              : 'Ingresa tu email para recibir instrucciones de recuperación'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          {!resetSent ? (
            <>
              <Input
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Button
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
              </Button>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleBackToLogin}
            >
              <ThemedText style={styles.buttonText}>Volver al Inicio de Sesión</ThemedText>
            </TouchableOpacity>
          )}

          {!resetSent && (
            <TouchableOpacity onPress={handleBackToLogin}>
              <ThemedText style={styles.linkText}>
                Volver al Inicio de Sesión
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 5,
  },
});