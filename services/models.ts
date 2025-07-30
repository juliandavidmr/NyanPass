import * as z from "zod";

import { APP_LANGUAGES } from "@/constants/appLanguages";

export const TimestampCreationSchema = z.object({
	createdAt: z
		.date()
		.default(() => new Date())
		.optional(),
	updatedAt: z
		.date()
		.default(() => new Date())
		.optional(),
});

export const CatWeightUnit = z.enum(["kg", "lbs"]);

export const CatProfileSchema = z
	.object({
		id: z.string(),
		name: z.string().min(2).max(30),
		nickname: z.string().min(2).max(20).optional(),
		birthdate: z.date().max(new Date()),
		breed: z.string().min(2).max(30),
		weight: z.number().min(0).max(100).optional(),
		weightUnit: CatWeightUnit.optional().default(CatWeightUnit.enum.kg),
		weightRecords: z
			.array(
				z.object({
					weight: z.number().min(0).max(100),
					unit: CatWeightUnit,
					date: z.date(),
				})
			)
			.optional()
			.default([]),
		traits: z.array(z.string()),
		image: z.string().optional(),
	})
	.and(TimestampCreationSchema);

export type TCatProfile = z.infer<typeof CatProfileSchema>;

export const VaccineSchema = z.intersection(
	z.object({
		id: z.string(),
		catId: z.string(),
		name: z.string(),
		applicationDate: z.date(),
		nextDoseDate: z.date().optional(),
		notes: z.string().max(250).optional(),
	}),
	TimestampCreationSchema
);

export type TVaccine = z.infer<typeof VaccineSchema>;

export const SeveritySchema = z.enum(["low", "medium", "high"]);

export const AllergySchema = z.object({
	id: z.string(),
	catId: z.string(),
	name: z.string().min(2).max(60),
	symptoms: z.string().min(2).max(250),
	severity: SeveritySchema,
	notes: z.string().max(250).optional(),
	diagnosisDate: z.date().optional().default(new Date()),
});

export type TAllergy = z.infer<typeof AllergySchema>;

export const TreatmentSchema = z.object({
	id: z.string(),
	catId: z.string(),
	name: z.string().min(2).max(30),
	startDate: z.date().max(new Date()),
	endDate: z.date().max(new Date()).optional(),
	dosage: z.string().optional(),
	frequency: z.string().optional(),
	veterinarian: z.string().optional(),
	notes: z.string().max(250).optional(),
	attachments: z.array(z.string()).optional(),
});

export type TTreatment = z.infer<typeof TreatmentSchema>;

export const LanguageSchema = z.enum(APP_LANGUAGES);
export const WeightUnitSchema = z.enum(["kg", "lbs"]);
export type TWeightUnit = z.infer<typeof WeightUnitSchema>;
export const LengthUnitSchema = z.enum(["cm", "in"]);
export type TLengthUnit = z.infer<typeof LengthUnitSchema>;

export const DateFormatSchema = z.enum(["DD/MM/YYYY", "MM/DD/YYYY"]);
export type TDateFormat = z.infer<typeof DateFormatSchema>;

export const SettingsSchema = z.object({
	id: z.string().optional(),
	language: LanguageSchema,
	weightUnit: WeightUnitSchema,
	lengthUnit: LengthUnitSchema,
	dateFormat: DateFormatSchema,
	darkMode: z.boolean(),
	offlineMode: z.boolean(),
});

export type TSettings = z.infer<typeof SettingsSchema>;
