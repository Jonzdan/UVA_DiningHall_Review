import { ReviewSchema } from "./review.js";
import mongoose from "mongoose";

export function createItemSchema() {
    return new mongoose.Schema({
        itemName: { type: String, required: true },
        itemDesc: { type: String, required: true },
        itemReview: { type: [ReviewSchema], required: true, default: [] },
        itemReviewCount: { type: Number, required: true, default: 0 },
        timeFrame: { type: String, required: true },  // TODO: add global enum type
    });
}
