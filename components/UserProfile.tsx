import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

import { authService } from "../services/auth";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type UserProfileProps = {
	minimal?: boolean;
};

export default function UserProfile({ minimal = false }: UserProfileProps) {
	const userData = authService.getCurrentUserData();
	const { t } = useTranslation();

	const handleLogout = async () => {
		Alert.alert(
			t("user.profile.logout"),
			t("user.profile.logout_confirm"),
			[
				{
					text: t("general.cancel"),
					style: "cancel",
				},
				{
					text: t("user.profile.logout"),
					style: "destructive",
					onPress: async () => {
						try {
							await authService.logout();
							// La redirección se manejará automáticamente en _layout.tsx
						} catch (error) {
							Alert.alert(t("general.error"), t("user.profile.logout_error"));
						}
					},
				},
			]
		);
	};

	if (!userData) {
		return null;
	}

	if (minimal) {
		return (
			<TouchableOpacity onPress={handleLogout}>
				<ThemedText style={styles.logoutText}>
					{t("user.profile.logout")}
				</ThemedText>
			</TouchableOpacity>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedView style={styles.userInfo}>
				<ThemedText style={styles.userName}>
					{userData.displayName || t("user.profile.anonymous")}
				</ThemedText>
				<ThemedText style={styles.userEmail}>{userData.email}</ThemedText>
			</ThemedView>

			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<ThemedText style={styles.logoutButtonText}>
					{t("user.profile.logout")}
				</ThemedText>
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