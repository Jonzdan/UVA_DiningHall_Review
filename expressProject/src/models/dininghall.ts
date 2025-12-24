import { model, Model, Schema, type InferSchemaType } from "mongoose";
import { createItemSchema } from "./item.js";

export const DiningHall = new Schema({
    hallId: {
        type: String, // TODO: add enum
        required: true
    },
    stationName: {
        type: String,
        required: true,
    },
    item: { type: createItemSchema(), required: true },
    activeDate: {
        type: Array,
        required: true,
    }
});

export type DiningHallSchemaType = InferSchemaType<typeof DiningHall>;
export const DiningHallModel: Model<DiningHallSchemaType> = model<
    Schema<DiningHallSchemaType>
>('Dining Halls', DiningHall);
