import { Model, Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { RunkTimeFrameEnum } from './types';
import { ReviewSchema } from './review';

export const RunkDiningHall = new Schema({
    stationName: {
        type: String,
        required: true
    },
    item: {
        itemName: {
            type: String,
            required: true
        },
        itemDesc: {
            type: String,
            required: true
        },
        itemReview: {
            type: [ReviewSchema],
            required: true,
            default: []
        },
        timeFrame: {
            type: String,
            enum: RunkTimeFrameEnum,
            required: true,
        },
    },
    activeDate: { 
        type: Array,
        required: true
    }
});

export type RunkDiningHallSchemaType = InferSchemaType<typeof RunkDiningHall>;
export const RunkModel: Model<RunkDiningHallSchemaType> = new Model<Schema<RunkDiningHallSchemaType>>(RunkDiningHall);
