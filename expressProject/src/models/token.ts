import { Model, Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

export const IdentifierSchema = new Schema({
    session: {
        type: String,
        required: false
    },
    csrf: {
        type: String,
        required: true
    },
    userID: {
        type: Schema.Types.ObjectId,
        required: false
    }
});

export type IdentifierSchemaType = InferSchemaType<typeof IdentifierSchema>;
export const IdentifierModel: Model<IdentifierSchemaType> = new Model<Schema<IdentifierSchemaType>>(IdentifierSchema);
