import type { InferSchemaType } from "mongoose";

import { Model, model, Schema } from "mongoose";

import { setTokenExpiry } from "../utils.js";

export const IdentifierSchema = new Schema(
    {
        csrf: {
            required: true,
            type: String,
        },
        expiresAt: {
            default: setTokenExpiry,
            required: true,
            type: Date,
        },
        session: {
            required: false,
            type: String,
        },
        userID: {
            required: false,
            type: Schema.Types.ObjectId,
        },
    },
    { timestamps: true },
);

IdentifierSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
IdentifierSchema.index({ csrf: 1 }, { unique: true });
IdentifierSchema.index({ session: 1 }, { unique: true });

export type IdentifierSchemaType = InferSchemaType<typeof IdentifierSchema>;
export const IdentifierModel: Model<IdentifierSchemaType> = model<
    Schema<IdentifierSchemaType>
>("Token", IdentifierSchema);
