import { DiningHallsEnum, RunkTimeFrameEnum } from "./types.js";
import { type InferSchemaType, Model, Schema, model } from "mongoose";
import { createItemSchema } from "./item.js";

export const RunkDiningHall = new Schema({
    stationName: {
        type: String,
        required: true,
    },
    item: { type: createItemSchema(RunkTimeFrameEnum), required: true },
    activeDate: {
        type: Array,
        required: true,
    },
});

export type RunkDiningHallSchemaType = InferSchemaType<typeof RunkDiningHall>;
export const RunkModel: Model<RunkDiningHallSchemaType> = model<
    Schema<RunkDiningHallSchemaType>
>(DiningHallsEnum.Runk, RunkDiningHall);
