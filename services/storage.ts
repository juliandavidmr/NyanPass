import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	where,
	writeBatch,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "../config/firebase";

// Colecciones de Firestore
const COLLECTIONS = {
	CATS: "cats",
	VACCINES: "vaccines",
	ALLERGIES: "allergies",
	TREATMENTS: "treatments",
	SETTINGS: "settings",
};

// Tipos de datos
export type CatProfile = {
	id: string;
	name: string;
	nickname?: string;
	birthdate: Date;
	breed: string;
	weight: number;
	weightUnit: "kg" | "lbs";
	traits: string[];
	image?: string;
};

export type Vaccine = {
	id: string;
	catId: string;
	name: string;
	applicationDate: Date;
	nextDoseDate?: Date;
	notes?: string;
};

export type Severity = "low" | "medium" | "high";

export type Allergy = {
	id: string;
	catId: string;
	name: string;
	symptoms: string;
	severity: Severity;
	notes?: string;
};

export type Treatment = {
	id: string;
	catId: string;
	name: string;
	startDate: Date;
	endDate?: Date;
	dosage?: string;
	frequency?: string;
	notes?: string;
	attachments?: string[];
};

export type Language = "es" | "en" | "fr" | "pt";
export type WeightUnit = "kg" | "lbs";
export type LengthUnit = "cm" | "in";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY";

export type Settings = {
	id?: string;
	language: Language;
	weightUnit: WeightUnit;
	lengthUnit: LengthUnit;
	dateFormat: DateFormat;
	darkMode: boolean;
	offlineMode: boolean;
};

// Función para generar un ID único
export const generateId = (): string => {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
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
	async getCats(): Promise<CatProfile[]> {
		try {
			const userId = this.getUserId();
			const catsRef = collection(firebaseDb, COLLECTIONS.CATS);
			const q = query(catsRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			const cats: CatProfile[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				cats.push(convertDates(data) as CatProfile);
			});

			return cats;
		} catch (error) {
			console.error("Error al obtener gatos:", error);
			return [];
		}
	}

	async saveCats(cats: CatProfile[]): Promise<void> {
		try {
			const userId = this.getUserId();
			const batch = writeBatch(firebaseDb);

			// Primero eliminamos todos los gatos existentes del usuario
			const catsRef = collection(firebaseDb, COLLECTIONS.CATS);
			const q = query(catsRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			querySnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.CATS, document.id));
			});

			// Luego añadimos los nuevos gatos
			cats.forEach((cat) => {
				const docRef = doc(firebaseDb, COLLECTIONS.CATS, cat.id);
				batch.set(docRef, { ...cat, userId });
			});

			await batch.commit();
		} catch (error) {
			console.error("Error al guardar gatos:", error);
		}
	}

	async getCat(catId: string): Promise<CatProfile | undefined> {
		try {
			const docRef = doc(firebaseDb, COLLECTIONS.CATS, catId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				return convertDates(data) as CatProfile;
			}

			return undefined;
		} catch (error) {
			console.error("Error al obtener gato:", error);
			return undefined;
		}
	}

	async addCat(cat: Omit<CatProfile, "id">): Promise<CatProfile> {
		try {
			const userId = this.getUserId();
			const newCat: CatProfile = {
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

	async updateCat(cat: CatProfile): Promise<void> {
		try {
			const userId = this.getUserId();
			const docRef = doc(firebaseDb, COLLECTIONS.CATS, cat.id);
			await setDoc(docRef, { ...cat, userId }, { merge: true });
		} catch (error) {
			console.error("Error al actualizar gato:", error);
			throw error;
		}
	}

	async deleteCat(catId: string): Promise<void> {
		try {
			const batch = writeBatch(firebaseDb);

			// Eliminar el gato
			const catRef = doc(firebaseDb, COLLECTIONS.CATS, catId);
			batch.delete(catRef);

			// Eliminar vacunas asociadas
			const vaccinesRef = collection(firebaseDb, COLLECTIONS.VACCINES);
			const vaccinesQuery = query(vaccinesRef, where("catId", "==", catId));
			const vaccinesSnapshot = await getDocs(vaccinesQuery);
			vaccinesSnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.VACCINES, document.id));
			});

			// Eliminar alergias asociadas
			const allergiesRef = collection(firebaseDb, COLLECTIONS.ALLERGIES);
			const allergiesQuery = query(allergiesRef, where("catId", "==", catId));
			const allergiesSnapshot = await getDocs(allergiesQuery);
			allergiesSnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.ALLERGIES, document.id));
			});

			// Eliminar tratamientos asociados
			const treatmentsRef = collection(firebaseDb, COLLECTIONS.TREATMENTS);
			const treatmentsQuery = query(treatmentsRef, where("catId", "==", catId));
			const treatmentsSnapshot = await getDocs(treatmentsQuery);
			treatmentsSnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.TREATMENTS, document.id));
			});

			await batch.commit();
		} catch (error) {
			console.error("Error al eliminar gato:", error);
			throw error;
		}
	}

	// Vacunas
	async getVaccines(): Promise<Vaccine[]> {
		try {
			const userId = this.getUserId();
			const vaccinesRef = collection(firebaseDb, COLLECTIONS.VACCINES);
			const q = query(vaccinesRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			const vaccines: Vaccine[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				vaccines.push(convertDates(data) as Vaccine);
			});

			return vaccines;
		} catch (error) {
			console.error("Error al obtener vacunas:", error);
			return [];
		}
	}

	async saveVaccines(vaccines: Vaccine[]): Promise<void> {
		try {
			const userId = this.getUserId();
			const batch = writeBatch(firebaseDb);

			// Primero eliminamos todas las vacunas existentes del usuario
			const vaccinesRef = collection(firebaseDb, COLLECTIONS.VACCINES);
			const q = query(vaccinesRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			querySnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.VACCINES, document.id));
			});

			// Luego añadimos las nuevas vacunas
			vaccines.forEach((vaccine) => {
				const docRef = doc(firebaseDb, COLLECTIONS.VACCINES, vaccine.id);
				batch.set(docRef, { ...vaccine, userId });
			});

			await batch.commit();
		} catch (error) {
			console.error("Error al guardar vacunas:", error);
		}
	}

	async addVaccine(vaccine: Omit<Vaccine, "id">): Promise<Vaccine> {
		try {
			const userId = this.getUserId();
			const newVaccine: Vaccine = {
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

	async updateVaccine(vaccine: Vaccine): Promise<void> {
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

	// Alergias
	async getAllergies(): Promise<Allergy[]> {
		try {
			const userId = this.getUserId();
			const allergiesRef = collection(firebaseDb, COLLECTIONS.ALLERGIES);
			const q = query(allergiesRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			const allergies: Allergy[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				allergies.push(convertDates(data) as Allergy);
			});

			return allergies;
		} catch (error) {
			console.error("Error al obtener alergias:", error);
			return [];
		}
	}

	async saveAllergies(allergies: Allergy[]): Promise<void> {
		try {
			const userId = this.getUserId();
			const batch = writeBatch(firebaseDb);

			// Primero eliminamos todas las alergias existentes del usuario
			const allergiesRef = collection(firebaseDb, COLLECTIONS.ALLERGIES);
			const q = query(allergiesRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			querySnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.ALLERGIES, document.id));
			});

			// Luego añadimos las nuevas alergias
			allergies.forEach((allergy) => {
				const docRef = doc(firebaseDb, COLLECTIONS.ALLERGIES, allergy.id);
				batch.set(docRef, { ...allergy, userId });
			});

			await batch.commit();
		} catch (error) {
			console.error("Error al guardar alergias:", error);
		}
	}

	async addAllergy(allergy: Omit<Allergy, "id">): Promise<Allergy> {
		try {
			const userId = this.getUserId();
			const newAllergy: Allergy = {
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

	async updateAllergy(allergy: Allergy): Promise<void> {
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

	// Tratamientos
	async getTreatments(): Promise<Treatment[]> {
		try {
			const userId = this.getUserId();
			const treatmentsRef = collection(firebaseDb, COLLECTIONS.TREATMENTS);
			const q = query(treatmentsRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			const treatments: Treatment[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				treatments.push(convertDates(data) as Treatment);
			});

			return treatments;
		} catch (error) {
			console.error("Error al obtener tratamientos:", error);
			return [];
		}
	}

	async saveTreatments(treatments: Treatment[]): Promise<void> {
		try {
			const userId = this.getUserId();
			const batch = writeBatch(firebaseDb);

			// Primero eliminamos todos los tratamientos existentes del usuario
			const treatmentsRef = collection(firebaseDb, COLLECTIONS.TREATMENTS);
			const q = query(treatmentsRef, where("userId", "==", userId));
			const querySnapshot = await getDocs(q);

			querySnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.TREATMENTS, document.id));
			});

			// Luego añadimos los nuevos tratamientos
			treatments.forEach((treatment) => {
				const docRef = doc(firebaseDb, COLLECTIONS.TREATMENTS, treatment.id);
				batch.set(docRef, { ...treatment, userId });
			});

			await batch.commit();
		} catch (error) {
			console.error("Error al guardar tratamientos:", error);
		}
	}

	async addTreatment(treatment: Omit<Treatment, "id">): Promise<Treatment> {
		try {
			const userId = this.getUserId();
			const newTreatment: Treatment = {
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

	async updateTreatment(treatment: Treatment): Promise<void> {
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

	// Configuraciones
	async getSettings(): Promise<Settings> {
		try {
			const userId = this.getUserId();
			const settingsRef = doc(firebaseDb, COLLECTIONS.SETTINGS, userId);
			const docSnap = await getDoc(settingsRef);

			if (docSnap.exists()) {
				return docSnap.data() as Settings;
			}

			// Valores por defecto
			return {
				id: userId,
				language: "es",
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
				language: "es",
				weightUnit: "kg",
				lengthUnit: "cm",
				dateFormat: "DD/MM/YYYY",
				darkMode: false,
				offlineMode: false,
			};
		}
	}

	async saveSettings(settings: Settings): Promise<void> {
		try {
			const userId = this.getUserId();
			const settingsRef = doc(firebaseDb, COLLECTIONS.SETTINGS, userId);
			await setDoc(settingsRef, { ...settings, id: userId });
		} catch (error) {
			console.error("Error al guardar configuraciones:", error);
		}
	}

	// Utilidades
	async clearAllData(): Promise<void> {
		try {
			const userId = this.getUserId();
			const batch = writeBatch(firebaseDb);

			// Eliminar todos los gatos del usuario
			const catsRef = collection(firebaseDb, COLLECTIONS.CATS);
			const catsQuery = query(catsRef, where("userId", "==", userId));
			const catsSnapshot = await getDocs(catsQuery);
			catsSnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.CATS, document.id));
			});

			// Eliminar todas las vacunas del usuario
			const vaccinesRef = collection(firebaseDb, COLLECTIONS.VACCINES);
			const vaccinesQuery = query(vaccinesRef, where("userId", "==", userId));
			const vaccinesSnapshot = await getDocs(vaccinesQuery);
			vaccinesSnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.VACCINES, document.id));
			});

			// Eliminar todas las alergias del usuario
			const allergiesRef = collection(firebaseDb, COLLECTIONS.ALLERGIES);
			const allergiesQuery = query(allergiesRef, where("userId", "==", userId));
			const allergiesSnapshot = await getDocs(allergiesQuery);
			allergiesSnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.ALLERGIES, document.id));
			});

			// Eliminar todos los tratamientos del usuario
			const treatmentsRef = collection(firebaseDb, COLLECTIONS.TREATMENTS);
			const treatmentsQuery = query(
				treatmentsRef,
				where("userId", "==", userId)
			);
			const treatmentsSnapshot = await getDocs(treatmentsQuery);
			treatmentsSnapshot.forEach((document) => {
				batch.delete(doc(firebaseDb, COLLECTIONS.TREATMENTS, document.id));
			});

			// Eliminar configuraciones del usuario
			const settingsRef = doc(firebaseDb, COLLECTIONS.SETTINGS, userId);
			batch.delete(settingsRef);

			await batch.commit();
		} catch (error) {
			console.error("Error al limpiar todos los datos:", error);
		}
	}
}

// Exportar una instancia única del servicio
export const storageService = new StorageService();
