import React from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../services/auth';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

type UserProfileProps = {
  minimal?: boolean;
};

export default function UserProfile({ minimal = false }: UserProfileProps) {
  const router = useRouter();
  const userData = authService.getCurrentUserData();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // La redirección se manejará automáticamente en _layout.tsx
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ],
    );
  };

  if (!userData) {
    return null;
  }

  if (minimal) {
    return (
      <TouchableOpacity onPress={handleLogout}>
        <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.userInfo}>
        <ThemedText style={styles.userName}>
          {userData.displayName || 'Usuario'}
        </ThemedText>
        <ThemedText style={styles.userEmail}>{userData.email}</ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <ThemedText style={styles.logoutButtonText}>Cerrar Sesión</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#FF3B30',
  },
});