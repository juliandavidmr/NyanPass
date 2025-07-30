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
	CATS: "cats",
	VACCINES: "vaccines",
	ALLERGIES: "allergies",
	TREATMENTS: "treatments",
	SETTINGS: "settings",
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
			const catsRef = collection(firebaseDb, COLLECTIONS.CATS);
			const q = query(catsRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

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
			const docRef = doc(firebaseDb, COLLECTIONS.CATS, catId);
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

			const docRef = doc(firebaseDb, COLLECTIONS.CATS, newCat.id);
			await setDoc(docRef, { ...newCat, userId });

			return newCat;
		} catch (error) {
			console.error("Error al añadir gato:", error);
			throw error;
		}
	}

	async updateCat(cat: TCatProfile): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, COLLECTIONS.CATS, cat.id);
			await setDoc(docRef, { ...cat, userId }, { merge: true });
		} catch (error) {
			console.error("Error al actualizar gato:", error);
			throw error;
		}
	}

	// Vacunas
	async getVaccines(): Promise<TVaccine[]> {
		try {
			const userId = this.getUserId();
			const vaccinesRef = collection(firebaseDb, COLLECTIONS.VACCINES);
			const q = query(vaccinesRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

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

	async addVaccine(vaccine: Omit<TVaccine, "id">): Promise<TVaccine> {
		try {
			const userId = this.getUserId();
			const newVaccine: TVaccine = {
				...vaccine,
				id: generateId(),
			};

			const docRef = doc(firebaseDb, COLLECTIONS.VACCINES, newVaccine.id);
			await setDoc(docRef, { ...newVaccine, userId });

			return newVaccine;
		} catch (error) {
			console.error("Error al añadir vacuna:", error);
			throw error;
		}
	}

	async updateVaccine(vaccine: TVaccine): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, COLLECTIONS.VACCINES, vaccine.id);
			await setDoc(docRef, { ...vaccine, userId }, { merge: true });
		} catch (error) {
			console.error("Error al actualizar vacuna:", error);
			throw error;
		}
	}

	async deleteVaccine(vaccineId: string): Promise<void> {
		try {
			const docRef = doc(firebaseDb, COLLECTIONS.VACCINES, vaccineId);
			await deleteDoc(docRef);
		} catch (error) {
			console.error("Error al eliminar vacuna:", error);
			throw error;
		}
	}

	async getVaccine(vaccineId: string): Promise<TVaccine | undefined> {
		try {
			const docRef = doc(firebaseDb, COLLECTIONS.VACCINES, vaccineId);
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
	async getAllergies(): Promise<TAllergy[]> {
		try {
			const userId = this.getUserId();
			const allergiesRef = collection(firebaseDb, COLLECTIONS.ALLERGIES);
			const q = query(allergiesRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

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

	async addAllergy(allergy: Omit<TAllergy, "id">): Promise<TAllergy> {
		try {
			const userId = this.getUserId();
			const newAllergy: TAllergy = {
				...allergy,
				id: generateId(),
			};

			const docRef = doc(firebaseDb, COLLECTIONS.ALLERGIES, newAllergy.id);
			await setDoc(docRef, { ...newAllergy, userId });

			return newAllergy;
		} catch (error) {
			console.error("Error al añadir alergia:", error);
			throw error;
		}
	}

	async updateAllergy(allergy: TAllergy): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, COLLECTIONS.ALLERGIES, allergy.id);
			await setDoc(docRef, { ...allergy, userId }, { merge: true });
		} catch (error) {
			console.error("Error al actualizar alergia:", error);
			throw error;
		}
	}

	async deleteAllergy(allergyId: string): Promise<void> {
		try {
			const docRef = doc(firebaseDb, COLLECTIONS.ALLERGIES, allergyId);
			await deleteDoc(docRef);
		} catch (error) {
			console.error("Error al eliminar alergia:", error);
			throw error;
		}
	}

	async getAllergy(allergyId: string): Promise<TAllergy | undefined> {
		try {
			const docRef = doc(firebaseDb, COLLECTIONS.ALLERGIES, allergyId);
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
	async getTreatments(): Promise<TTreatment[]> {
		try {
			const userId = this.getUserId();
			const treatmentsRef = collection(firebaseDb, COLLECTIONS.TREATMENTS);
			const q = query(treatmentsRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

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

	async addTreatment(treatment: Omit<TTreatment, "id">): Promise<TTreatment> {
		try {
			const userId = this.getUserId();
			const newTreatment: TTreatment = {
				...treatment,
				id: generateId(),
			};

			const docRef = doc(firebaseDb, COLLECTIONS.TREATMENTS, newTreatment.id);
			await setDoc(docRef, { ...newTreatment, userId });

			return newTreatment;
		} catch (error) {
			console.error("Error al añadir tratamiento:", error);
			throw error;
		}
	}

	async updateTreatment(treatment: TTreatment): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, COLLECTIONS.TREATMENTS, treatment.id);
			await setDoc(docRef, { ...treatment, userId }, { merge: true });
		} catch (error) {
			console.error("Error al actualizar tratamiento:", error);
			throw error;
		}
	}

	async deleteTreatment(treatmentId: string): Promise<void> {
		try {
			const docRef = doc(firebaseDb, COLLECTIONS.TREATMENTS, treatmentId);
			await deleteDoc(docRef);
		} catch (error) {
			console.error("Error al eliminar tratamiento:", error);
			throw error;
		}
	}

	async getTreatment(treatmentId: string): Promise<TTreatment | undefined> {
		try {
			const docRef = doc(firebaseDb, COLLECTIONS.TREATMENTS, treatmentId);
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
			const settingsRef = doc(firebaseDb, COLLECTIONS.SETTINGS, userId);
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
			const settingsRef = doc(firebaseDb, COLLECTIONS.SETTINGS, userId);
			await setDoc(settingsRef, { ...settings, id: userId });
		} catch (error) {
			console.error("Error al guardar configuraciones:", error);
		}
	}
}

export const storageService = new StorageService();
