import {
	changeLanguage as i18nextChangeLanguage,
	use as i18nextUse,
} from "i18next";
import { initReactI18next } from "react-i18next";

import { APP_LANGUAGES } from "@/constants/appLanguages";

import { storageService } from "../services/storage";

type ResourcesType = {
	[language in APP_LANGUAGES]: {
		translation: Record<string, string | string[]>;
	};
};

// Definir los recursos de traducción
const resources: ResourcesType = {
	es: {
		translation: {
			// Navegación
			"tabs.cats": "Mis Gatos",
			"tabs.vaccines": "Vacunas",
			"tabs.medical": "Historial",
			"tabs.settings": "Ajustes",

			// Pantalla de gatos
			"cats.title": "Mis Gatos",
			"cats.add": "Agregar Gato",
			"cats.empty": "No tienes gatos registrados",
			"cats.months": "meses",
			"cats.years": "años",
			"cats.years_months": "{{years}} años, {{months}} meses",

			// Formulario de gatos
			"cat_form.title.new": "Nuevo Gato",
			"cat_form.title.edit": "Editar Gato",
			"cat_form.name": "Nombre",
			"cat_form.name_placeholder": "Nombre de tu gato",
			"cat_form.nickname": "Apodo",
			"cat_form.nickname_placeholder": "Apodo (opcional)",
			"cat_form.birthdate": "Fecha de nacimiento",
			"cat_form.breed": "Raza",
			"cat_form.breed_placeholder": "Buscar raza",
			"cat_form.custom_breed": "Otra raza",
			"cat_form.weight": "Peso",
			"cat_form.traits": "Rasgos de personalidad",
			"cat_form.traits_placeholder": "Añadir rasgo",
			"cat_form.save": "Guardar",
			"cat_form.cancel": "Cancelar",

			// Pantalla de vacunas
			"vaccines.title": "Carnet de Vacunas",
			"vaccines.add": "Agregar Vacuna",
			"vaccines.empty": "No hay vacunas registradas",
			"vaccines.applied": "Aplicada",
			"vaccines.next_dose": "Próxima dosis",
			"vaccines.expired": "VENCIDA",
			"vaccines.upcoming": "PRÓXIMA",

			// Formulario de vacunas
			"vaccine_form.title.new": "Nueva Vacuna",
			"vaccine_form.title.edit": "Editar Vacuna",
			"vaccine_form.name": "Nombre de la vacuna",
			"vaccine_form.name_placeholder": "Ej: Triple Felina",
			"vaccine_form.cat": "Gato",
			"vaccine_form.application_date": "Fecha de aplicación",
			"vaccine_form.next_dose_date": "Fecha próxima dosis",
			"vaccine_form.notes": "Notas",
			"vaccine_form.notes_placeholder": "Notas adicionales",
			"vaccine_form.save": "Guardar",
			"vaccine_form.cancel": "Cancelar",

			// Pantalla de historial médico
			"medical.title": "Historial Médico",
			"medical.add_allergy": "Agregar Alergia",
			"medical.add_treatment": "Agregar Tratamiento",
			"medical.empty": "No hay registros médicos",
			"medical.allergy": "Alergia",
			"medical.treatment": "Tratamiento",
			"medical.symptoms": "Síntomas",
			"medical.severity.low": "Leve",
			"medical.severity.medium": "Moderada",
			"medical.severity.high": "Grave",
			"medical.start_date": "Inicio",
			"medical.end_date": "Fin",
			"medical.dosage": "Dosis",
			"medical.frequency": "Frecuencia",
			"medical.ongoing": "En curso",
			"medical.attachments": "archivos adjuntos",
			"medical.attachment": "archivo adjunto",

			// Formulario de alergias
			"allergy_form.title.new": "Nueva Alergia",
			"allergy_form.title.edit": "Editar Alergia",
			"allergy_form.name": "Nombre de la alergia",
			"allergy_form.name_placeholder": "Ej: Pollo, Polen",
			"allergy_form.cat": "Gato",
			"allergy_form.symptoms": "Síntomas",
			"allergy_form.symptoms_placeholder": "Ej: Vómitos, diarrea",
			"allergy_form.severity": "Severidad",
			"allergy_form.notes": "Notas",
			"allergy_form.notes_placeholder": "Notas adicionales",
			"allergy_form.save": "Guardar",
			"allergy_form.cancel": "Cancelar",

			// Formulario de tratamientos
			"treatment_form.title.new": "Nuevo Tratamiento",
			"treatment_form.title.edit": "Editar Tratamiento",
			"treatment_form.name": "Nombre del tratamiento",
			"treatment_form.name_placeholder": "Ej: Antibiótico",
			"treatment_form.cat": "Gato",
			"treatment_form.start_date": "Fecha de inicio",
			"treatment_form.end_date": "Fecha de finalización",
			"treatment_form.ongoing": "En curso",
			"treatment_form.dosage": "Dosis",
			"treatment_form.dosage_placeholder": "Ej: 5ml",
			"treatment_form.frequency": "Frecuencia",
			"treatment_form.frequency_placeholder": "Ej: Cada 12 horas",
			"treatment_form.notes": "Notas",
			"treatment_form.notes_placeholder": "Notas adicionales",
			"treatment_form.attachments": "Archivos adjuntos",
			"treatment_form.add_attachment": "Añadir archivo",
			"treatment_form.save": "Guardar",
			"treatment_form.cancel": "Cancelar",

			// Pantalla de ajustes
			"settings.title": "Ajustes",
			"settings.language": "Idioma",
			"settings.weight_unit": "Unidad de Peso",
			"settings.length_unit": "Unidad de Longitud",
			"settings.date_format": "Formato de Fecha",
			"settings.dark_mode": "Modo Oscuro",
			"settings.dark_mode_description": "Cambiar entre tema claro y oscuro",
			"settings.offline_mode": "Modo Sin Conexión",
			"settings.offline_mode_description":
				"Guardar datos localmente sin sincronización",

			// Razas de gatos comunes
			cat_breeds: [
				"Abisinio",
				"American Shorthair",
				"Angora Turco",
				"Azul Ruso",
				"Balinés",
				"Bengalí",
				"Birmano",
				"Bombay",
				"British Shorthair",
				"Burmés",
				"Cornish Rex",
				"Devon Rex",
				"Esfinge",
				"Exótico de Pelo Corto",
				"Himalayo",
				"Maine Coon",
				"Manx",
				"Mau Egipcio",
				"Munchkin",
				"Nebelung",
				"Noruego del Bosque",
				"Persa",
				"Ragdoll",
				"Savannah",
				"Scottish Fold",
				"Siamés",
				"Siberiano",
				"Singapura",
				"Somalí",
				"Sphynx",
			],

			// Mensajes generales
			"general.save": "Guardar",
			"general.cancel": "Cancelar",
			"general.delete": "Eliminar",
			"general.edit": "Editar",
			"general.required": "Requerido",
			"general.optional": "Opcional",
			"general.error": "Error",
			"general.success": "Éxito",
			"general.loading": "Cargando...",
			"general.no_data": "Sin datos",

			// Auth Required
			"auth.required.title": "Inicio de sesión requerido",
			"auth.required.description":
				"Debes iniciar sesión para acceder a esta pantalla.",
			"auth.required.login": "Iniciar sesión",
			"auth.required.register": "Registrarse",

			// Breed Selector
			"breed.selector.title": "Seleccionar Raza",
			"breed.selector.search": "Buscar raza...",
			"breed.selector.custom": "Otra raza",
			"breed.selector.save": "Guardar",

			// Not Found
			"not.found.title": "Esta pantalla no existe.",
			"not.found.description": "¡Vuelve a la pantalla de inicio!",

			// Forgot Password
			"forgot.password.title": "¿Olvidaste tu contraseña?",
			"forgot.password.description":
				"Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
			"forgot.password.email": "Correo electrónico",
			"forgot.password.submit": "Enviar",
			"forgot.password.back": "Volver al inicio de sesión",

			// Login
			"login.title": "Iniciar sesión",
			"login.email": "Correo electrónico",
			"login.password": "Contraseña",
			"login.submit": "Iniciar sesión",
			"login.forgot.password": "¿Olvidaste tu contraseña?",
			"login.register": "¿No tienes una cuenta? Regístrate",

			// Register
			"register.title": "Registrarse",
			"register.email": "Correo electrónico",
			"register.password": "Contraseña",
			"register.confirm.password": "Confirmar contraseña",
			"register.submit": "Registrarse",
			"register.login": "¿Ya tienes una cuenta? Inicia sesión",

			// User Profile
			"user.profile.title": "Perfil de Usuario",
			"user.profile.name": "Nombre",
			"user.profile.email": "Correo electrónico",
			"user.profile.logout": "Cerrar sesión",
		},
	},
	en: {
		translation: {
			// Navigation
			"tabs.cats": "My Cats",
			"tabs.vaccines": "Vaccines",
			"tabs.medical": "Medical",
			"tabs.settings": "Settings",

			// Cats screen
			"cats.title": "My Cats",
			"cats.add": "Add Cat",
			"cats.empty": "No cats registered",
			"cats.months": "months",
			"cats.years": "years",
			"cats.years_months": "{{years}} years, {{months}} months",

			// Cat form
			"cat_form.title.new": "New Cat",
			"cat_form.title.edit": "Edit Cat",
			"cat_form.name": "Name",
			"cat_form.name_placeholder": "Your cat's name",
			"cat_form.nickname": "Nickname",
			"cat_form.nickname_placeholder": "Nickname (optional)",
			"cat_form.birthdate": "Birth date",
			"cat_form.breed": "Breed",
			"cat_form.breed_placeholder": "Search breed",
			"cat_form.custom_breed": "Other breed",
			"cat_form.weight": "Weight",
			"cat_form.traits": "Personality traits",
			"cat_form.traits_placeholder": "Add trait",
			"cat_form.save": "Save",
			"cat_form.cancel": "Cancel",

			// Vaccines screen
			"vaccines.title": "Vaccine Card",
			"vaccines.add": "Add Vaccine",
			"vaccines.empty": "No vaccines registered",
			"vaccines.applied": "Applied",
			"vaccines.next_dose": "Next dose",
			"vaccines.expired": "EXPIRED",
			"vaccines.upcoming": "UPCOMING",

			// Vaccine form
			"vaccine_form.title.new": "New Vaccine",
			"vaccine_form.title.edit": "Edit Vaccine",
			"vaccine_form.name": "Vaccine name",
			"vaccine_form.name_placeholder": "E.g: Feline Triple",
			"vaccine_form.cat": "Cat",
			"vaccine_form.application_date": "Application date",
			"vaccine_form.next_dose_date": "Next dose date",
			"vaccine_form.notes": "Notes",
			"vaccine_form.notes_placeholder": "Additional notes",
			"vaccine_form.save": "Save",
			"vaccine_form.cancel": "Cancel",

			// Medical history screen
			"medical.title": "Medical History",
			"medical.add_allergy": "Add Allergy",
			"medical.add_treatment": "Add Treatment",
			"medical.empty": "No medical records",
			"medical.allergy": "Allergy",
			"medical.treatment": "Treatment",
			"medical.symptoms": "Symptoms",
			"medical.severity.low": "Mild",
			"medical.severity.medium": "Moderate",
			"medical.severity.high": "Severe",
			"medical.start_date": "Start",
			"medical.end_date": "End",
			"medical.dosage": "Dosage",
			"medical.frequency": "Frequency",
			"medical.ongoing": "Ongoing",
			"medical.attachments": "attachments",
			"medical.attachment": "attachment",

			// Allergy form
			"allergy_form.title.new": "New Allergy",
			"allergy_form.title.edit": "Edit Allergy",
			"allergy_form.name": "Allergy name",
			"allergy_form.name_placeholder": "E.g: Chicken, Pollen",
			"allergy_form.cat": "Cat",
			"allergy_form.symptoms": "Symptoms",
			"allergy_form.symptoms_placeholder": "E.g: Vomiting, diarrhea",
			"allergy_form.severity": "Severity",
			"allergy_form.notes": "Notes",
			"allergy_form.notes_placeholder": "Additional notes",
			"allergy_form.save": "Save",
			"allergy_form.cancel": "Cancel",

			// Treatment form
			"treatment_form.title.new": "New Treatment",
			"treatment_form.title.edit": "Edit Treatment",
			"treatment_form.name": "Treatment name",
			"treatment_form.name_placeholder": "E.g: Antibiotic",
			"treatment_form.cat": "Cat",
			"treatment_form.start_date": "Start date",
			"treatment_form.end_date": "End date",
			"treatment_form.ongoing": "Ongoing",
			"treatment_form.dosage": "Dosage",
			"treatment_form.dosage_placeholder": "E.g: 5ml",
			"treatment_form.frequency": "Frequency",
			"treatment_form.frequency_placeholder": "E.g: Every 12 hours",
			"treatment_form.notes": "Notes",
			"treatment_form.notes_placeholder": "Additional notes",
			"treatment_form.attachments": "Attachments",
			"treatment_form.add_attachment": "Add attachment",
			"treatment_form.save": "Save",
			"treatment_form.cancel": "Cancel",

			// Settings screen
			"settings.title": "Settings",
			"settings.language": "Language",
			"settings.weight_unit": "Weight Unit",
			"settings.length_unit": "Length Unit",
			"settings.date_format": "Date Format",
			"settings.dark_mode": "Dark Mode",
			"settings.dark_mode_description": "Switch between light and dark theme",
			"settings.offline_mode": "Offline Mode",
			"settings.offline_mode_description":
				"Save data locally without synchronization",

			// Common cat breeds
			cat_breeds: [
				"Abyssinian",
				"American Shorthair",
				"Balinese",
				"Bengal",
				"Birman",
				"Bombay",
				"British Shorthair",
				"Burmese",
				"Cornish Rex",
				"Devon Rex",
				"Egyptian Mau",
				"Exotic Shorthair",
				"Himalayan",
				"Maine Coon",
				"Manx",
				"Munchkin",
				"Nebelung",
				"Norwegian Forest",
				"Persian",
				"Ragdoll",
				"Russian Blue",
				"Savannah",
				"Scottish Fold",
				"Siamese",
				"Siberian",
				"Singapura",
				"Somali",
				"Sphynx",
				"Turkish Angora",
			],

			// General messages
			"general.save": "Save",
			"general.cancel": "Cancel",
			"general.delete": "Delete",
			"general.edit": "Edit",
			"general.required": "Required",
			"general.optional": "Optional",
			"general.error": "Error",
			"general.success": "Success",
			"general.loading": "Loading...",
			"general.no_data": "No data",

			// Auth Required
			"auth.required.title": "Login Required",
			"auth.required.description":
				"You must be logged in to access this screen.",
			"auth.required.login": "Login",
			"auth.required.register": "Register",

			// Breed Selector
			"breed.selector.title": "Select Breed",
			"breed.selector.search": "Search breed...",
			"breed.selector.custom": "Other breed",
			"breed.selector.save": "Save",

			// Not Found
			"not.found.title": "This screen does not exist.",
			"not.found.description": "Go to home screen!",

			// Forgot Password
			"forgot.password.title": "Forgot Your Password?",
			"forgot.password.description":
				"Enter your email and we'll send you a link to reset your password.",
			"forgot.password.email": "Email",
			"forgot.password.submit": "Submit",
			"forgot.password.back": "Back to login",

			// Login
			"login.title": "Login",
			"login.email": "Email",
			"login.password": "Password",
			"login.submit": "Login",
			"login.forgot.password": "Forgot your password?",
			"login.register": "Don't have an account? Register",

			// Register
			"register.title": "Register",
			"register.email": "Email",
			"register.password": "Password",
			"register.confirm.password": "Confirm password",
			"register.submit": "Register",
			"register.login": "Already have an account? Login",

			// User Profile
			"user.profile.title": "User Profile",
			"user.profile.name": "Name",
			"user.profile.email": "Email",
			"user.profile.logout": "Logout",
		},
	},
	fr: {
		translation: {
			// Navigation
			"tabs.cats": "Mes Chats",
			"tabs.vaccines": "Vaccins",
			"tabs.medical": "Médical",
			"tabs.settings": "Paramètres",

			// Cats screen
			"cats.title": "Mes Chats",
			"cats.add": "Ajouter un Chat",
			"cats.empty": "Aucun chat enregistré",
			"cats.months": "mois",
			"cats.years": "ans",
			"cats.years_months": "{{years}} ans, {{months}} mois",

			// Cat form
			"cat_form.title.new": "Nouveau Chat",
			"cat_form.title.edit": "Modifier le Chat",
			"cat_form.name": "Nom",
			"cat_form.name_placeholder": "Nom de votre chat",
			"cat_form.nickname": "Surnom",
			"cat_form.nickname_placeholder": "Surnom (optionnel)",
			"cat_form.birthdate": "Date de naissance",
			"cat_form.breed": "Race",
			"cat_form.breed_placeholder": "Rechercher une race",
			"cat_form.custom_breed": "Autre race",
			"cat_form.weight": "Poids",
			"cat_form.traits": "Traits de personnalité",
			"cat_form.traits_placeholder": "Ajouter un trait",
			"cat_form.save": "Enregistrer",
			"cat_form.cancel": "Annuler",

			// Vaccines screen
			"vaccines.title": "Carnet de Vaccination",
			"vaccines.add": "Ajouter un Vaccin",
			"vaccines.empty": "Aucun vaccin enregistré",
			"vaccines.applied": "Appliqué",
			"vaccines.next_dose": "Prochaine dose",
			"vaccines.expired": "EXPIRÉ",
			"vaccines.upcoming": "À VENIR",

			// Settings screen
			"settings.title": "Paramètres",
			"settings.language": "Langue",
			"settings.weight_unit": "Unité de Poids",
			"settings.length_unit": "Unité de Longueur",
			"settings.date_format": "Format de Date",
			"settings.dark_mode": "Mode Sombre",
			"settings.dark_mode_description": "Basculer entre thème clair et sombre",
			"settings.offline_mode": "Mode Hors Ligne",
			"settings.offline_mode_description":
				"Enregistrer les données localement sans synchronisation",
		},
	},
	pt: {
		translation: {
			// Navigation
			"tabs.cats": "Meus Gatos",
			"tabs.vaccines": "Vacinas",
			"tabs.medical": "Médico",
			"tabs.settings": "Configurações",

			// Cats screen
			"cats.title": "Meus Gatos",
			"cats.add": "Adicionar Gato",
			"cats.empty": "Nenhum gato registrado",
			"cats.months": "meses",
			"cats.years": "anos",
			"cats.years_months": "{{years}} anos, {{months}} meses",

			// Cat form
			"cat_form.title.new": "Novo Gato",
			"cat_form.title.edit": "Editar Gato",
			"cat_form.name": "Nome",
			"cat_form.name_placeholder": "Nome do seu gato",
			"cat_form.nickname": "Apelido",
			"cat_form.nickname_placeholder": "Apelido (opcional)",
			"cat_form.birthdate": "Data de nascimento",
			"cat_form.breed": "Raça",
			"cat_form.breed_placeholder": "Buscar raça",
			"cat_form.custom_breed": "Outra raça",
			"cat_form.weight": "Peso",
			"cat_form.traits": "Traços de personalidade",
			"cat_form.traits_placeholder": "Adicionar traço",
			"cat_form.save": "Salvar",
			"cat_form.cancel": "Cancelar",

			// Vaccines screen
			"vaccines.title": "Cartão de Vacinas",
			"vaccines.add": "Adicionar Vacina",
			"vaccines.empty": "Nenhuma vacina registrada",
			"vaccines.applied": "Aplicada",
			"vaccines.next_dose": "Próxima dose",
			"vaccines.expired": "VENCIDA",
			"vaccines.upcoming": "PRÓXIMA",

			// Settings screen
			"settings.title": "Configurações",
			"settings.language": "Idioma",
			"settings.weight_unit": "Unidade de Peso",
			"settings.length_unit": "Unidade de Comprimento",
			"settings.date_format": "Formato de Data",
			"settings.dark_mode": "Modo Escuro",
			"settings.dark_mode_description": "Alternar entre tema claro e escuro",
			"settings.offline_mode": "Modo Offline",
			"settings.offline_mode_description":
				"Salvar dados localmente sem sincronização",
		},
	},
};

// Inicializar i18next
const initI18n = async () => {
	// Obtener la configuración guardada
	const settings = await storageService.getSettings();

	await i18nextUse(initReactI18next).init({
		resources,
		lng: settings.language,
		fallbackLng: APP_LANGUAGES.ES,
		interpolation: {
			escapeValue: false,
		},
	});
};

// Función para cambiar el idioma
const changeLanguage = async (language: APP_LANGUAGES) => {
	await i18nextChangeLanguage(language);

	// Actualizar la configuración guardada
	const settings = await storageService.getSettings();
	await storageService.saveSettings({
		...settings,
		language: language,
	});
};

// Función para convertir unidades de peso
const convertWeight = (
	weight: number,
	from: "kg" | "lbs",
	to: "kg" | "lbs"
): number => {
	if (from === to) return weight;

	if (from === "kg" && to === "lbs") {
		return weight * 2.20462;
	} else {
		return weight / 2.20462;
	}
};

// Función para convertir unidades de longitud
const convertLength = (
	length: number,
	from: "cm" | "in",
	to: "cm" | "in"
): number => {
	if (from === to) return length;

	if (from === "cm" && to === "in") {
		return length * 0.393701;
	} else {
		return length / 0.393701;
	}
};

// Función para formatear fechas según el formato configurado
const formatDate = (
	date: Date,
	format: "DD/MM/YYYY" | "MM/DD/YYYY" = "DD/MM/YYYY"
): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();

	if (format === "DD/MM/YYYY") {
		return `${day}/${month}/${year}`;
	} else {
		return `${month}/${day}/${year}`;
	}
};

export { changeLanguage, convertLength, convertWeight, formatDate, initI18n };
