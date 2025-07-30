import { APP_LANGUAGES } from "@/constants/appLanguages";
import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { firebaseAuth, firebaseDb } from "../config/firebase";
import type {
	TAllergy,
	TCatProfile,
	TSettings,
	TTreatment,
	TVaccine,
} from "./models";

// Colecciones de Firestore
const COLLECTIONS = {
	USERS: "users",
	CATS: "cats",
	VACCINES: "vaccines",
	ALLERGIES: "allergies",
	TREATMENTS: "treatments",
	SETTINGS: "settings",
};

// Función para construir rutas de documentos
const getDocPath = {
	user: (userId: string) => `${COLLECTIONS.USERS}/${userId}`,
	cat: (userId: string, catId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}/${catId}`,
	vaccine: (userId: string, catId: string, vaccineId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}/${catId}/${COLLECTIONS.VACCINES}/${vaccineId}`,
	allergy: (userId: string, catId: string, allergyId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}/${catId}/${COLLECTIONS.ALLERGIES}/${allergyId}`,
	treatment: (userId: string, catId: string, treatmentId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}/${catId}/${COLLECTIONS.TREATMENTS}/${treatmentId}`,
	settings: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SETTINGS}/user_settings`,
};

// Función para construir rutas de colecciones
const getCollectionPath = {
	cats: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}`,
	vaccines: (userId: string, catId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}/${catId}/${COLLECTIONS.VACCINES}`,
	allergies: (userId: string, catId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}/${catId}/${COLLECTIONS.ALLERGIES}`,
	treatments: (userId: string, catId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.CATS}/${catId}/${COLLECTIONS.TREATMENTS}`,
};

// Función para generar un ID único
export const generateId = (): string => {
	return uuidv4();
};

// Funciones para convertir fechas a objetos Date
const convertDates = (obj: any): any => {
	if (!obj) return obj;

	const result = { ...obj };

	// Convertir campos de fecha específicos según el tipo de objeto
	if ("birthdate" in result && result.birthdate) {
		result.birthdate = result.birthdate.toDate();
	}

	if ("applicationDate" in result && result.applicationDate) {
		result.applicationDate = result.applicationDate.toDate();
	}

	if ("nextDoseDate" in result && result.nextDoseDate) {
		result.nextDoseDate = result.nextDoseDate.toDate();
	}

	if ("startDate" in result && result.startDate) {
		result.startDate = result.startDate.toDate();
	}

	if ("endDate" in result && result.endDate) {
		result.endDate = result.endDate.toDate();
	}

	return result;
};

// Servicio de almacenamiento con Firebase
class StorageService {
	// Obtener el ID de usuario actual o un ID por defecto si no hay sesión
	private getUserId(): string {
		const currentUser = firebaseAuth.currentUser;
		return currentUser ? currentUser.uid : "default_user";
	}

	// Gatos
	async getCats(): Promise<TCatProfile[]> {
		try {
			const userId = this.getUserId();
			const catsRef = collection(firebaseDb, getCollectionPath.cats(userId));
			const querySnapshot = await getDocs(catsRef);

			const cats: TCatProfile[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				cats.push(convertDates(data) as TCatProfile);
			});

			return cats;
		} catch (error) {
			console.error("Error al obtener gatos:", error);
			return [];
		}
	}

	async getCat(catId: string): Promise<TCatProfile | undefined> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.cat(userId, catId));
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				return convertDates(data) as TCatProfile;
			}

			return undefined;
		} catch (error) {
			console.error("Error al obtener gato:", error);
			return undefined;
		}
	}

	async addCat(cat: Omit<TCatProfile, "id">): Promise<TCatProfile> {
		try {
			const userId = this.getUserId();
			const newCat: TCatProfile = {
				...cat,
				id: generateId(),
			};

			const docRef = doc(firebaseDb, getDocPath.cat(userId, newCat.id));
			await setDoc(docRef, newCat);

			return newCat;
		} catch (error) {
			console.error("Error al añadir gato:", error);
			throw error;
		}
	}

	async updateCat(cat: TCatProfile): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.cat(userId, cat.id));
			await setDoc(docRef, cat, { merge: true });
		} catch (error) {
			console.error("Error al actualizar gato:", error);
			throw error;
		}
	}

	// Vacunas
	async getVaccines(catId: string): Promise<TVaccine[]> {
		try {
			const userId = this.getUserId();
			const vaccinesRef = collection(firebaseDb, getCollectionPath.vaccines(userId, catId));
			const querySnapshot = await getDocs(vaccinesRef);

			const vaccines: TVaccine[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				vaccines.push(convertDates(data) as TVaccine);
			});

			return vaccines;
		} catch (error) {
			console.error("Error al obtener vacunas:", error);
			return [];
		}
	}

	// Obtener todas las vacunas de todos los gatos del usuario
	async getAllVaccines(): Promise<TVaccine[]> {
		try {
			const cats = await this.getCats();
			const allVaccines: TVaccine[] = [];

			for (const cat of cats) {
				const vaccines = await this.getVaccines(cat.id);
				allVaccines.push(...vaccines);
			}

			return allVaccines;
		} catch (error) {
			console.error("Error al obtener todas las vacunas:", error);
			return [];
		}
	}

	async addVaccine(vaccine: Omit<TVaccine, "id">): Promise<TVaccine> {
		try {
			const userId = this.getUserId();
			const newVaccine: TVaccine = {
				...vaccine,
				id: generateId(),
			};

			const docRef = doc(firebaseDb, getDocPath.vaccine(userId, vaccine.catId, newVaccine.id));
			await setDoc(docRef, newVaccine);

			return newVaccine;
		} catch (error) {
			console.error("Error al añadir vacuna:", error);
			throw error;
		}
	}

	async updateVaccine(vaccine: TVaccine): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.vaccine(userId, vaccine.catId, vaccine.id));
			await setDoc(docRef, vaccine, { merge: true });
		} catch (error) {
			console.error("Error al actualizar vacuna:", error);
			throw error;
		}
	}

	async deleteVaccine(catId: string, vaccineId: string): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.vaccine(userId, catId, vaccineId));
			await deleteDoc(docRef);
		} catch (error) {
			console.error("Error al eliminar vacuna:", error);
			throw error;
		}
	}

	async getVaccine(catId: string, vaccineId: string): Promise<TVaccine | undefined> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.vaccine(userId, catId, vaccineId));
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				return convertDates(data) as TVaccine;
			}

			return undefined;
		} catch (error) {
			console.error("Error al obtener vacuna:", error);
			return undefined;
		}
	}

	// Alergias
	async getAllergies(catId: string): Promise<TAllergy[]> {
		try {
			const userId = this.getUserId();
			const allergiesRef = collection(firebaseDb, getCollectionPath.allergies(userId, catId));
			const querySnapshot = await getDocs(allergiesRef);

			const allergies: TAllergy[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				allergies.push(convertDates(data) as TAllergy);
			});

			return allergies;
		} catch (error) {
			console.error("Error al obtener alergias:", error);
			return [];
		}
	}

	// Obtener todas las alergias de todos los gatos del usuario
	async getAllAllergies(): Promise<TAllergy[]> {
		try {
			const cats = await this.getCats();
			const allAllergies: TAllergy[] = [];

			for (const cat of cats) {
				const allergies = await this.getAllergies(cat.id);
				allAllergies.push(...allergies);
			}

			return allAllergies;
		} catch (error) {
			console.error("Error al obtener todas las alergias:", error);
			return [];
		}
	}

	async addAllergy(allergy: Omit<TAllergy, "id">): Promise<TAllergy> {
		try {
			const userId = this.getUserId();
			const newAllergy: TAllergy = {
				...allergy,
				id: generateId(),
			};

			const docRef = doc(firebaseDb, getDocPath.allergy(userId, allergy.catId, newAllergy.id));
			await setDoc(docRef, newAllergy);

			return newAllergy;
		} catch (error) {
			console.error("Error al añadir alergia:", error);
			throw error;
		}
	}

	async updateAllergy(allergy: TAllergy): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.allergy(userId, allergy.catId, allergy.id));
			await setDoc(docRef, allergy, { merge: true });
		} catch (error) {
			console.error("Error al actualizar alergia:", error);
			throw error;
		}
	}

	async deleteAllergy(catId: string, allergyId: string): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.allergy(userId, catId, allergyId));
			await deleteDoc(docRef);
		} catch (error) {
			console.error("Error al eliminar alergia:", error);
			throw error;
		}
	}

	async getAllergy(catId: string, allergyId: string): Promise<TAllergy | undefined> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.allergy(userId, catId, allergyId));
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				return docSnap.data() as TAllergy;
			}

			return undefined;
		} catch (error) {
			console.error("Error al obtener alergia:", error);
			return undefined;
		}
	}

	// Tratamientos
	async getTreatments(catId: string): Promise<TTreatment[]> {
		try {
			const userId = this.getUserId();
			const treatmentsRef = collection(firebaseDb, getCollectionPath.treatments(userId, catId));
			const querySnapshot = await getDocs(treatmentsRef);

			const treatments: TTreatment[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				treatments.push(convertDates(data) as TTreatment);
			});

			return treatments;
		} catch (error) {
			console.error("Error al obtener tratamientos:", error);
			return [];
		}
	}

	// Obtener todos los tratamientos de todos los gatos del usuario
	async getAllTreatments(): Promise<TTreatment[]> {
		try {
			const cats = await this.getCats();
			const allTreatments: TTreatment[] = [];

			for (const cat of cats) {
				const treatments = await this.getTreatments(cat.id);
				allTreatments.push(...treatments);
			}

			return allTreatments;
		} catch (error) {
			console.error("Error al obtener todos los tratamientos:", error);
			return [];
		}
	}

	async addTreatment(treatment: Omit<TTreatment, "id">): Promise<TTreatment> {
		try {
			const userId = this.getUserId();
			const newTreatment: TTreatment = {
				...treatment,
				id: generateId(),
			};

			const docRef = doc(firebaseDb, getDocPath.treatment(userId, treatment.catId, newTreatment.id));
			await setDoc(docRef, newTreatment);

			return newTreatment;
		} catch (error) {
			console.error("Error al añadir tratamiento:", error);
			throw error;
		}
	}

	async updateTreatment(treatment: TTreatment): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.treatment(userId, treatment.catId, treatment.id));
			await setDoc(docRef, treatment, { merge: true });
		} catch (error) {
			console.error("Error al actualizar tratamiento:", error);
			throw error;
		}
	}

	async deleteTreatment(catId: string, treatmentId: string): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.treatment(userId, catId, treatmentId));
			await deleteDoc(docRef);
		} catch (error) {
			console.error("Error al eliminar tratamiento:", error);
			throw error;
		}
	}

	async getTreatment(catId: string, treatmentId: string): Promise<TTreatment | undefined> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, getDocPath.treatment(userId, catId, treatmentId));
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				return docSnap.data() as TTreatment;
			}

			return undefined;
		} catch (error) {
			console.error("Error al obtener tratamiento:", error);
			return undefined;
		}
	}

	// Configuraciones
	async getSettings(): Promise<TSettings> {
		try {
			const userId = this.getUserId();
			const settingsRef = doc(firebaseDb, getDocPath.settings(userId));
			const docSnap = await getDoc(settingsRef);

			if (docSnap.exists()) {
				return docSnap.data() as TSettings;
			}

			// Valores por defecto
			return {
				id: userId,
				language: APP_LANGUAGES.ES,
				weightUnit: "kg",
				lengthUnit: "cm",
				dateFormat: "DD/MM/YYYY",
				darkMode: false,
				offlineMode: false,
			};
		} catch (error) {
			console.error("Error al obtener configuraciones:", error);
			// Valores por defecto en caso de error
			return {
				language: APP_LANGUAGES.EN,
				weightUnit: "kg",
				lengthUnit: "cm",
				dateFormat: "DD/MM/YYYY",
				darkMode: false,
				offlineMode: false,
			};
		}
	}

	async saveSettings(settings: TSettings): Promise<void> {
		try {
			const userId = this.getUserId();
			const settingsRef = doc(firebaseDb, getDocPath.settings(userId));
			await setDoc(settingsRef, { ...settings, id: userId });
		} catch (error) {
			console.error("Error al guardar configuraciones:", error);
		}
	}
}

export const storageService = new StorageService();
