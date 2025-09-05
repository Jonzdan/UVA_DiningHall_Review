import { DiningHallsEnum, NewcombDiningHallTimeFrameEnum } from "./types.js";
import { Model, Schema, model } from "mongoose";
import type { InferSchemaType } from "mongoose";
import { createItemSchema } from "./item.js";

export const NewcombDiningHall = new Schema({
    stationName: {
        type: String,
        required: true,
    },
    item: {
        type: createItemSchema(NewcombDiningHallTimeFrameEnum),
        required: true,
    },
    activeDate: {
        type: Array,
        required: true,
    },
});

export type NewcombDiningHallSchemaType = InferSchemaType<
    typeof NewcombDiningHall
>;
export const NewcombModel: Model<NewcombDiningHallSchemaType> = model<
    Schema<NewcombDiningHallSchemaType>
>(DiningHallsEnum.Newcomb, NewcombDiningHall);
