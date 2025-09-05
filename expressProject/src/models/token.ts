import { Model, Schema, model } from "mongoose";
import type { InferSchemaType } from "mongoose";
import { setTokenExpiry } from "../utils.js";

export const IdentifierSchema = new Schema({
    session: {
        type: String,
        required: false,
    },
    csrf: {
        type: String,
        required: true,
    },
    userID: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    expiresAt: {
        type: Date,
        default: setTokenExpiry,
        required: true,
    },
});

IdentifierSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
IdentifierSchema.index({ csrf: 1 }, { unique: true });
IdentifierSchema.index({ session: 1 }, { unique: true });

export type IdentifierSchemaType = InferSchemaType<typeof IdentifierSchema>;
export const IdentifierModel: Model<IdentifierSchemaType> = model<
    Schema<IdentifierSchemaType>
>("Token", IdentifierSchema);
