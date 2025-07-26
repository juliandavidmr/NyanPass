import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Input } from 'tamagui';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { authService } from '../../services/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // Validaciones básicas
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      // Registrar usuario
      const userCredential = await authService.register(email, password);

      // Actualizar el nombre de usuario
      await authService.updateUserProfile(displayName);

      // Redirigir a la pantalla principal
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = 'Error al registrar usuario';

      // Manejar errores específicos de Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está en uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Crear Cuenta</ThemedText>
          <ThemedText style={styles.subtitle}>Únete a NyanPass para gestionar la información de tus gatos</ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <Input
            placeholder="Nombre"
            placeholderTextColor="#888"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
          <Input
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Contraseña"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            placeholder="Confirmar Contraseña"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <ThemedView style={styles.loginContainer}>
            <ThemedText style={styles.smallText}> ¿Ya tienes una cuenta? </ThemedText>
            <TouchableOpacity onPress={handleLogin}>
              <ThemedText style={{ ...styles.linkText, ...styles.smallText }}>Inicia Sesión</ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
    marginBottom: 10,
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
    marginBottom: 15,
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
  },
  smallText: {
    fontSize: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});