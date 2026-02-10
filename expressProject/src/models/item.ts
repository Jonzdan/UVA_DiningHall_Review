import mongoose from "mongoose";

import { ReviewSchema } from "./review.js";
import { GlobalTimeFrames } from "./types.js";

export function createItemSchema() {
    return new mongoose.Schema({
        itemDesc: { required: true, type: String },
        itemName: { required: true, type: String },
        itemReview: { default: [], required: true, type: [ReviewSchema] },
        itemReviewCount: { default: 0, required: true, type: Number },
        itemTotalStars: { default: 0, required: true, type: Number },
        timeFrame: { enum: GlobalTimeFrames, required: true, type: String },
    });
}
