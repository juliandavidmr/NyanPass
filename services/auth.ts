import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	User,
	UserCredential,
} from "firebase/auth";
import { firebaseAuth } from "../config/firebase";

// Inicializar Firebase
const auth = firebaseAuth;

// Tipo para el usuario
export type UserData = {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
};

// Clase para el servicio de autenticación
class AuthService {
	// Obtener el usuario actual
	getCurrentUser(): User | null {
		return auth.currentUser;
	}

	// Obtener los datos del usuario actual
	getCurrentUserData(): UserData | null {
		const user = this.getCurrentUser();
		if (!user) return null;

		return {
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
		};
	}

	// Registrar un nuevo usuario
	async register(email: string, password: string): Promise<UserCredential> {
		try {
			return await createUserWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error("Error al registrar usuario:", error);
			throw error;
		}
	}

	// Iniciar sesión
	async login(email: string, password: string): Promise<UserCredential> {
		try {
			return await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error("Error al iniciar sesión:", error);
			throw error;
		}
	}

	// Cerrar sesión
	async logout(): Promise<void> {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Error al cerrar sesión:", error);
			throw error;
		}
	}

	// Actualizar el perfil del usuario
	async updateUserProfile(
		displayName?: string,
		photoURL?: string
	): Promise<void> {
		try {
			const user = this.getCurrentUser();
			if (!user) throw new Error("No hay usuario autenticado");

			await updateProfile(user, {
				displayName: displayName || user.displayName,
				photoURL: photoURL || user.photoURL,
			});
		} catch (error) {
			console.error("Error al actualizar perfil:", error);
			throw error;
		}
	}

	// Enviar correo para restablecer contraseña
	async resetPassword(email: string): Promise<void> {
		try {
			await sendPasswordResetEmail(auth, email);
		} catch (error) {
			console.error("Error al enviar correo de restablecimiento:", error);
			throw error;
		}
	}

	// Escuchar cambios en el estado de autenticación
	onAuthStateChange(callback: (user: User | null) => void): () => void {
		return onAuthStateChanged(auth, callback);
	}

	// Verificar si el usuario está autenticado
	isAuthenticated(): boolean {
		return !!this.getCurrentUser();
	}
}

// Exportar una instancia única del servicio
export const authService = new AuthService();
