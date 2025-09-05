import { DiningHallsEnum, OhillTimeFrameEnum } from "./types.js";
import { type InferSchemaType, Model, Schema, model } from "mongoose";
import { createItemSchema } from "./item.js";

export const OhillDiningHall = new Schema({
    stationName: {
        type: String,
        required: true,
    },
    item: { type: createItemSchema(OhillTimeFrameEnum), required: true },
    activeDate: {
        type: Array,
        required: true,
    },
});

export type OhillDiningHallSchemaType = InferSchemaType<typeof OhillDiningHall>;
export const OhillModel: Model<OhillDiningHallSchemaType> = model<
    Schema<OhillDiningHallSchemaType>
>(DiningHallsEnum.Ohill, OhillDiningHall);
