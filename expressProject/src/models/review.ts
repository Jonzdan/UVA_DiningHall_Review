import { Schema } from "mongoose";
import type { InferSchemaType } from 'mongoose';

export const ReviewSchema = new Schema({
    stars: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    review: {
        type: String,
        required: false
    }
});

export type ReviewSchemaType = InferSchemaType<typeof ReviewSchema>;
