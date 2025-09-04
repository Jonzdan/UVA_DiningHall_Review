import { Model, Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { RunkTimeFrameEnum } from './types';
import { createItemSchema } from './item';

export const RunkDiningHall = new Schema({
    stationName: {
        type: String,
        required: true
    },
    item: { type: createItemSchema(RunkTimeFrameEnum), required: true },
    activeDate: { 
        type: Array,
        required: true
    }
});

export type RunkDiningHallSchemaType = InferSchemaType<typeof RunkDiningHall>;
export const RunkModel: Model<RunkDiningHallSchemaType> = new Model<Schema<RunkDiningHallSchemaType>>(RunkDiningHall);
