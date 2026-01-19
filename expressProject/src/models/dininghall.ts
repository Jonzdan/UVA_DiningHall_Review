import { DiningHallsEnum } from "hoorank-shared";
import { type InferSchemaType, Model, model, Schema } from "mongoose";

import { createItemSchema } from "./item.js";

export const DiningHall = new Schema({
    activeDate: {
        match: /^\d{8}$/,
        required: true,
        type: String,
    },
    hallId: {
        enum: DiningHallsEnum,
        required: true,
        type: String,
    },
    item: { required: true, type: createItemSchema() },
    stationName: {
        required: true,
        type: String,
    },
});

DiningHall.index({
    activeDate: 1,
    hallId: 1,
    "item.itemReviewCount": -1,
    "item.timeFrame": 1,
    stationName: 1,
});

export type DiningHallSchemaType = InferSchemaType<typeof DiningHall>;
export const DiningHallModel: Model<DiningHallSchemaType> = model<
    Schema<DiningHallSchemaType>
>("dining_halls", DiningHall);
