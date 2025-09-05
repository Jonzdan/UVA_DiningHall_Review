import { ReviewSchema } from "./review.js";
import type { TimeFrameEnumTypes } from "./types.js";
import mongoose from "mongoose";

export function createItemSchema(timeFrameEnum: TimeFrameEnumTypes) {
    return new mongoose.Schema({
        itemName: { type: String, required: true },
        itemDesc: { type: String, required: true },
        itemReview: { type: [ReviewSchema], required: true, default: [] },
        itemReviewCount: { type: Number, required: true, default: 0 },
        timeFrame: { type: String, enum: timeFrameEnum, required: true },
    });
}
