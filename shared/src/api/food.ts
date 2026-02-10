import { z } from "zod";
import { MAX_REVIEWS } from "./constants.js";

export const FoodItemFields = {
    name: "name",
    reviewOptions: "reviewOptions",
} as const;

export const StationFoodItemFields = {
    stationName: "stationName",
    item: "item",
} as const;


export const FoodItemReviewSchemaDetail = z.object({
    stars: z.number().int().min(1).max(5),
    review: z.string().trim().max(500).optional(),
});

// TODO: Add Pagination
export const FoodItemReviewSchema = z.object({
    starRating: z.number(),
    details: z.array(FoodItemReviewSchemaDetail).max(MAX_REVIEWS),
});

export const FoodItemSchemaInput = z.object({
  [FoodItemFields.name]: z.string(),
  [FoodItemFields.reviewOptions]: FoodItemReviewSchemaDetail,
});

export const FoodItemSchemaOutput = z.object({
  [FoodItemFields.name]: z.string(),
  description: z.string(),
  [FoodItemFields.reviewOptions]: FoodItemReviewSchema.optional(),
});

export const StationFoodItemSchemaInput = z.object({
  [StationFoodItemFields.stationName]: z.string(),
  [StationFoodItemFields.item]: FoodItemSchemaInput,
});

export const StationFoodItemSchemaOutput = z.object({
  [StationFoodItemFields.stationName]: z.string(),
  [StationFoodItemFields.item]: FoodItemSchemaOutput,
});

export type FoodItemInput = z.infer<typeof FoodItemSchemaInput>;
export type FoodItemOutput = z.infer<typeof FoodItemSchemaOutput>;

export type StationFoodItemInput = z.infer<typeof StationFoodItemSchemaInput>;
export type StationFoodItemOutput = z.infer<typeof StationFoodItemSchemaOutput>;

export type StationFoodItemInputs = StationFoodItemInput[];
export type StationFoodItemOutputs = StationFoodItemOutput[];
