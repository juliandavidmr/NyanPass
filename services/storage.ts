import AsyncStorage from "@react-native-async-storage/async-storage";

// Claves para el almacenamiento
const STORAGE_KEYS = {
	CATS: "nyanpass_cats",
	VACCINES: "nyanpass_vaccines",
	ALLERGIES: "nyanpass_allergies",
	TREATMENTS: "nyanpass_treatments",
	SETTINGS: "nyanpass_settings",
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

// Funciones para convertir fechas a JSON y viceversa
const dateReviver = (_key: string, value: any) => {
	const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
	if (typeof value === "string" && dateFormat.test(value)) {
		return new Date(value);
	}
	return value;
};

// Servicio de almacenamiento
class StorageService {
	// Gatos
	async getCats(): Promise<CatProfile[]> {
		try {
			const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CATS);
			return jsonValue ? JSON.parse(jsonValue, dateReviver) : [];
		} catch (error) {
			console.error("Error al obtener gatos:", error);
			return [];
		}
	}

	async saveCats(cats: CatProfile[]): Promise<void> {
		try {
			const jsonValue = JSON.stringify(cats);
			await AsyncStorage.setItem(STORAGE_KEYS.CATS, jsonValue);
		} catch (error) {
			console.error("Error al guardar gatos:", error);
		}
	}

	async getCat(catId: string): Promise<CatProfile | undefined> {
		const cats = await this.getCats();
		return cats.find((c) => c.id === catId);
	}

	async addCat(cat: Omit<CatProfile, "id">): Promise<CatProfile> {
		const cats = await this.getCats();
		const newCat: CatProfile = {
			...cat,
			id: generateId(),
		};
		await this.saveCats([...cats, newCat]);
		return newCat;
	}

	async updateCat(cat: CatProfile): Promise<void> {
		const cats = await this.getCats();
		const updatedCats = cats.map((c) => (c.id === cat.id ? cat : c));
		await this.saveCats(updatedCats);
	}

	async deleteCat(catId: string): Promise<void> {
		const cats = await this.getCats();
		const filteredCats = cats.filter((c) => c.id !== catId);
		await this.saveCats(filteredCats);

		// También eliminar vacunas, alergias y tratamientos asociados
		const vaccines = await this.getVaccines();
		const filteredVaccines = vaccines.filter((v) => v.catId !== catId);
		await this.saveVaccines(filteredVaccines);

		const allergies = await this.getAllergies();
		const filteredAllergies = allergies.filter((a) => a.catId !== catId);
		await this.saveAllergies(filteredAllergies);

		const treatments = await this.getTreatments();
		const filteredTreatments = treatments.filter((t) => t.catId !== catId);
		await this.saveTreatments(filteredTreatments);
	}

	// Vacunas
	async getVaccines(): Promise<Vaccine[]> {
		try {
			const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.VACCINES);
			return jsonValue ? JSON.parse(jsonValue, dateReviver) : [];
		} catch (error) {
			console.error("Error al obtener vacunas:", error);
			return [];
		}
	}

	async saveVaccines(vaccines: Vaccine[]): Promise<void> {
		try {
			const jsonValue = JSON.stringify(vaccines);
			await AsyncStorage.setItem(STORAGE_KEYS.VACCINES, jsonValue);
		} catch (error) {
			console.error("Error al guardar vacunas:", error);
		}
	}

	async addVaccine(vaccine: Omit<Vaccine, "id">): Promise<Vaccine> {
		const vaccines = await this.getVaccines();
		const newVaccine: Vaccine = {
			...vaccine,
			id: generateId(),
		};
		await this.saveVaccines([...vaccines, newVaccine]);
		return newVaccine;
	}

	async updateVaccine(vaccine: Vaccine): Promise<void> {
		const vaccines = await this.getVaccines();
		const updatedVaccines = vaccines.map((v) =>
			v.id === vaccine.id ? vaccine : v
		);
		await this.saveVaccines(updatedVaccines);
	}

	async deleteVaccine(vaccineId: string): Promise<void> {
		const vaccines = await this.getVaccines();
		const filteredVaccines = vaccines.filter((v) => v.id !== vaccineId);
		await this.saveVaccines(filteredVaccines);
	}

	// Alergias
	async getAllergies(): Promise<Allergy[]> {
		try {
			const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ALLERGIES);
			return jsonValue ? JSON.parse(jsonValue, dateReviver) : [];
		} catch (error) {
			console.error("Error al obtener alergias:", error);
			return [];
		}
	}

	async saveAllergies(allergies: Allergy[]): Promise<void> {
		try {
			const jsonValue = JSON.stringify(allergies);
			await AsyncStorage.setItem(STORAGE_KEYS.ALLERGIES, jsonValue);
		} catch (error) {
			console.error("Error al guardar alergias:", error);
		}
	}

	async addAllergy(allergy: Omit<Allergy, "id">): Promise<Allergy> {
		const allergies = await this.getAllergies();
		const newAllergy: Allergy = {
			...allergy,
			id: generateId(),
		};
		await this.saveAllergies([...allergies, newAllergy]);
		return newAllergy;
	}

	async updateAllergy(allergy: Allergy): Promise<void> {
		const allergies = await this.getAllergies();
		const updatedAllergies = allergies.map((a) =>
			a.id === allergy.id ? allergy : a
		);
		await this.saveAllergies(updatedAllergies);
	}

	async deleteAllergy(allergyId: string): Promise<void> {
		const allergies = await this.getAllergies();
		const filteredAllergies = allergies.filter((a) => a.id !== allergyId);
		await this.saveAllergies(filteredAllergies);
	}

	// Tratamientos
	async getTreatments(): Promise<Treatment[]> {
		try {
			const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TREATMENTS);
			return jsonValue ? JSON.parse(jsonValue, dateReviver) : [];
		} catch (error) {
			console.error("Error al obtener tratamientos:", error);
			return [];
		}
	}

	async saveTreatments(treatments: Treatment[]): Promise<void> {
		try {
			const jsonValue = JSON.stringify(treatments);
			await AsyncStorage.setItem(STORAGE_KEYS.TREATMENTS, jsonValue);
		} catch (error) {
			console.error("Error al guardar tratamientos:", error);
		}
	}

	async addTreatment(treatment: Omit<Treatment, "id">): Promise<Treatment> {
		const treatments = await this.getTreatments();
		const newTreatment: Treatment = {
			...treatment,
			id: generateId(),
		};
		await this.saveTreatments([...treatments, newTreatment]);
		return newTreatment;
	}

	async updateTreatment(treatment: Treatment): Promise<void> {
		const treatments = await this.getTreatments();
		const updatedTreatments = treatments.map((t) =>
			t.id === treatment.id ? treatment : t
		);
		await this.saveTreatments(updatedTreatments);
	}

	async deleteTreatment(treatmentId: string): Promise<void> {
		const treatments = await this.getTreatments();
		const filteredTreatments = treatments.filter((t) => t.id !== treatmentId);
		await this.saveTreatments(filteredTreatments);
	}

	// Configuraciones
	async getSettings(): Promise<Settings> {
		try {
			const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
			if (jsonValue) {
				return JSON.parse(jsonValue);
			}
			// Valores por defecto
			return {
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
			const jsonValue = JSON.stringify(settings);
			await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
		} catch (error) {
			console.error("Error al guardar configuraciones:", error);
		}
	}

	// Utilidades
	async clearAllData(): Promise<void> {
		try {
			await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
		} catch (error) {
			console.error("Error al limpiar todos los datos:", error);
		}
	}
}

// Exportar una instancia única del servicio
export const storageService = new StorageService();
