import { Model, Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { OhillTimeFrameEnum } from './types';
import { ReviewSchema } from './review';

export const OhillDiningHall = new Schema({
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
            enum: OhillTimeFrameEnum,
            required: true,
        },
    },
    activeDate: { 
        type: Array,
        required: true
    }
});

export type OhillDiningHallSchemaType = InferSchemaType<typeof OhillDiningHall>;
export const OhillModel: Model<OhillDiningHallSchemaType> = new Model<Schema<OhillDiningHallSchemaType>>(OhillDiningHall);
