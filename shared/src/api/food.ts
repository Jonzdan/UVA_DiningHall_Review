import { z } from "zod";
import { MAX_REVIEWS } from "./constants.js";

export const FoodItemReviewSchemaDetail = z.object({
    stars: z.int().min(1).max(5),
    review: z.string().trim().max(500).optional(),
});

// TODO: Add Pagination
export const FoodItemReviewSchema = z.object({
    starRating: z.number(),
    details: z.array(FoodItemReviewSchemaDetail).max(MAX_REVIEWS),
});

export const FoodItemSchemaInput = z.object({
    name: z.string(),
    reviewOptions: FoodItemReviewSchemaDetail,
});

export const FoodItemSchemaOutput = z.object({
    name: z.string(),
    description: z.string(),
    reviewOptions: FoodItemReviewSchema.optional(),
});

export const StationFoodItemSchemaInput = z.object({
    stationName: z.string(),
    item: FoodItemSchemaInput,
});

export const StationFoodItemSchemaOutput = z.object({
    stationName: z.string(),
    item: FoodItemSchemaOutput,
});

export type FoodItemInput = z.infer<typeof FoodItemSchemaInput>;
export type FoodItemOutput = z.infer<typeof FoodItemSchemaOutput>;

export type StationFoodItemInput = z.infer<typeof StationFoodItemSchemaInput>;
export type StationFoodItemOutput = z.infer<typeof StationFoodItemSchemaOutput>;

export type StationFoodItemInputs = StationFoodItemInput[];
export type StationFoodItemOutputs = StationFoodItemOutput[];

export type FormBodyType = 'Login' | 'Signup' | 'Reset';

export const FormValidationErrorCodes = {
    MISSING_FIELDS:     'MISSING_FIELDS',
    WHITESPACE_PRESENT: 'WHITESPACE_PRESENT',
    USERNAME_TOO_SHORT: 'USERNAME_TOO_SHORT',
    USERNAME_TOO_LONG:  'USERNAME_TOO_LONG',
    EMAIL_INVALID:      'EMAIL_INVALID',
    PASSWORD_TOO_WEAK:  'PASSWORD_TOO_WEAK',
    PASSWORDS_DONT_MATCH: 'PASSWORDS_DONT_MATCH'
} as const;

export type FormValidationErrorType = typeof FormValidationErrorCodes[keyof typeof FormValidationErrorCodes];
export type FormValidationError = { error: FormValidationErrorType};
