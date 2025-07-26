import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { Button, Input } from "tamagui";

import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { authService } from "../../services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { t } = useTranslation();

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert(t("general.error"), t("login.error.missing_fields"));
			return;
		}

    setIsLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';

      // Manejar errores específicos de Firebase Auth
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
			<ThemedView style={styles.container}>
				<ThemedView style={styles.header}>
					<ThemedText style={styles.title}>{t("login.title")}</ThemedText>
					<ThemedText style={styles.subtitle}>
						{t("login.subtitle")}
					</ThemedText>
				</ThemedView>

				<ThemedView style={styles.form}>
					<Input
						placeholder={t("login.email")}
						placeholderTextColor="#888"
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						keyboardType="email-address"
					/>
					<Input
						placeholder={t("login.password")}
						placeholderTextColor="#888"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
					/>

					<Button onPress={handleLogin} disabled={isLoading}>
						{isLoading ? t("general.loading") : t("login.submit")}
					</Button>

					<TouchableOpacity onPress={handleForgotPassword}>
						<ThemedText style={styles.linkText}>
							{t("login.forgot.password")}
						</ThemedText>
					</TouchableOpacity>

					<ThemedView style={styles.registerContainer}>
						<ThemedText>{t("login.register.question")}</ThemedText>
						<TouchableOpacity onPress={handleRegister}>
							<ThemedText style={styles.linkText}>
								{t("login.register.link")}
							</ThemedText>
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});