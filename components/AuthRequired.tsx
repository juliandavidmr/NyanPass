import { Link, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { authService } from "@/services/auth";

export default function AuthRequired() {
	const { t } = useTranslation();
	const router = useRouter();

	const handleLogin = () => {
		router.push("/(auth)/login");
	};

	if (authService.isAuthenticated()) {
		return null;
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">{t("auth.required.title")}</ThemedText>
			<ThemedText style={styles.message}>
				{t("auth.required.description")}
			</ThemedText>
			<TouchableOpacity style={styles.button} onPress={handleLogin}>
				<ThemedText style={styles.buttonText}>{t("auth.required.login")}</ThemedText>
			</TouchableOpacity>
			<Link href="/(auth)/register" style={styles.link}>
				<ThemedText type="link">{t("auth.required.register")}</ThemedText>
			</Link>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	message: {
		textAlign: "center",
		marginBottom: 20,
		fontSize: 16,
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginBottom: 20,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	link: {
		marginTop: 15,
	},
});