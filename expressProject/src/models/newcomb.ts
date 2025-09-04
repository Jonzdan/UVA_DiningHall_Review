import { Model, Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { NewcombDiningHallTimeFrameEnum } from './types';
import { createItemSchema } from './item';

export const NewcombDiningHall = new Schema({
    stationName: {
        type: String,
        required: true
    },
    item: { type: createItemSchema(NewcombDiningHallTimeFrameEnum), required: true },
    activeDate: { 
        type: Array,
        required: true
    }
});

export type NewcombDiningHallSchemaType = InferSchemaType<typeof NewcombDiningHall>;
export const NewcombModel: Model<NewcombDiningHallSchemaType> = new Model<Schema<NewcombDiningHallSchemaType>>(NewcombDiningHall);
