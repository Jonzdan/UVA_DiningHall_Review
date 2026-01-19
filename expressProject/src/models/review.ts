import type { InferSchemaType } from "mongoose";

import { Schema } from "mongoose";

export const ReviewSchema = new Schema({
    review: {
        maxLength: 500,
        required: false,
        type: String,
    },
    stars: {
        enum: [1, 2, 3, 4, 5],
        required: true,
        type: Number,
    },
});

export type ReviewSchemaType = InferSchemaType<typeof ReviewSchema>;
