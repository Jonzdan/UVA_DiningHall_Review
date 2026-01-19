import { type InferSchemaType, Model, model, Schema } from "mongoose";

export const UserSchema = new Schema({
    dateJoined: {
        required: true,
        type: Date,
    },
    email: {
        required: true,
        type: String,
    },
    notifications: {
        foodOptInBol: {
            required: true,
            type: Boolean,
        },
        foodOptInVal: {
            required: true,
            type: Array,
        },
        newcombOptIn: {
            required: true,
            type: Boolean,
        },
        ohillOptIn: {
            required: true,
            type: Boolean,
        },
        optInWhenToNotify: {
            required: true,
            type: Array,
        },
        replyToPost: {
            required: true,
            type: Boolean,
        },
        runkOptIn: {
            required: true,
            type: Boolean,
        },
    },
    password: {
        required: true,
        type: String,
    },
    profile: {
        bannerColor: {
            required: true,
            type: String,
        },
        picture: {
            required: false,
            type: String,
        },
        remainAnonymous: {
            required: true,
            type: Boolean,
        },
        subMessage: {
            required: false,
            type: String,
        },
    },
    username: {
        required: true,
        type: String,
    },
});

export type UserSchemaType = InferSchemaType<typeof UserSchema>;
export const UserModel: Model<UserSchemaType> = model<Schema<UserSchemaType>>(
    "User",
    UserSchema,
);
