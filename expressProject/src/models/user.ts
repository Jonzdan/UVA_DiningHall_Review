import { type InferSchemaType, Model, Schema, model } from "mongoose";

export const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profile: {
        picture: {
            type: String,
            required: false,
        },
        subMessage: {
            type: String,
            required: false,
        },
        bannerColor: {
            type: String,
            required: true,
        },
        remainAnonymous: {
            type: Boolean,
            required: true,
        },
    },
    notifications: {
        ohillOptIn: {
            type: Boolean,
            required: true,
        },
        runkOptIn: {
            type: Boolean,
            required: true,
        },
        newcombOptIn: {
            type: Boolean,
            required: true,
        },
        optInWhenToNotify: {
            type: Array,
            required: true,
        },
        foodOptInBol: {
            type: Boolean,
            required: true,
        },
        foodOptInVal: {
            type: Array,
            required: true,
        },
        replyToPost: {
            type: Boolean,
            required: true,
        },
    },
    dateJoined: {
        type: Date,
        required: true,
    },
});

export type UserSchemaType = InferSchemaType<typeof UserSchema>;
export const UserModel: Model<UserSchemaType> = model<Schema<UserSchemaType>>(
    "User",
    UserSchema,
);
