import { Model, Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { NewcombDiningHallTimeFrameEnum } from './types';
import { ReviewSchema } from './review';

export const NewcombDiningHall = new Schema({
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
            enum: NewcombDiningHallTimeFrameEnum,
            required: true,
        },
    },
    activeDate: { 
        type: Array,
        required: true
    }
});

export type NewcombDiningHallSchemaType = InferSchemaType<typeof NewcombDiningHall>;
export const NewcombModel: Model<NewcombDiningHallSchemaType> = new Model<Schema<NewcombDiningHallSchemaType>>(NewcombDiningHall);
