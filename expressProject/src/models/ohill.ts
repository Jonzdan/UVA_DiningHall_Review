import { Model, Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { OhillTimeFrameEnum } from './types';
import { createItemSchema } from './item';

export const OhillDiningHall = new Schema({
    stationName: {
        type: String,
        required: true
    },
    item: { type: createItemSchema(OhillTimeFrameEnum), required: true },
    activeDate: { 
        type: Array,
        required: true
    }
});

export type OhillDiningHallSchemaType = InferSchemaType<typeof OhillDiningHall>;
export const OhillModel: Model<OhillDiningHallSchemaType> = new Model<Schema<OhillDiningHallSchemaType>>(OhillDiningHall);
