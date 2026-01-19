import { type InferSchemaType, Model, Schema, model } from "mongoose";
import { DiningHallsEnum } from "hoorank-shared";
import { createItemSchema } from "./item.js";

export const DiningHall = new Schema({
    hallId: {
        type: String,
        enum: DiningHallsEnum,
        required: true,
    },
    stationName: {
        type: String,
        required: true,
    },
    item: { type: createItemSchema(), required: true },
    activeDate: {
        type: Array,
        required: true,
    },
});

DiningHall.index({
    hallId: 1,
    stationName: 1,
    activeDate: 1,
    "item.timeFrame": 1,
    "item.itemName": 1,
});

export type DiningHallSchemaType = InferSchemaType<typeof DiningHall>;
export const DiningHallModel: Model<DiningHallSchemaType> = model<
    Schema<DiningHallSchemaType>
>("Dining Halls", DiningHall);
