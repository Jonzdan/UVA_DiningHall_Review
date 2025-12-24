import type {
    FilterQuery,
    HydratedDocument,
    ProjectionType
} from "mongoose";
import { UserModel, type UserSchemaType } from "../models/index.js";
import { flattenForUpdate, mongoSanitizer } from "../utils.js";
import type { ResetApi, UserSettingsApi } from "hoorank-shared";

export async function findUserById(
    user: string,
): Promise<HydratedDocument<UserSchemaType> | null> {
    return await UserModel.findOne(
        {
            _id: user,
        },
        {},
        {
            sanitizeFilter: true,
        },
    );
}

export async function findUserByBasicAuth(
    username: string,
): Promise<HydratedDocument<UserSchemaType>[]> {
    return await findUserWithQuery({
        username: {
            $eq: username,
        },
    });
}

export async function findUserByEmailOrUser(
    username: string,
    email: string,
): Promise<HydratedDocument<UserSchemaType>[]> {
    return await findUserWithQuery({
        $or: [{ email: { $eq: email } }, { username: { $eq: username } }],
    });
}

/**
 * Sanitizes input
 * @param query
 * @param projection
 * @returns
 */
async function findUserWithQuery(
    query: FilterQuery<UserSchemaType>,
    projection?: ProjectionType<UserSchemaType>,
): Promise<HydratedDocument<UserSchemaType>[]> {
    return await UserModel.find(query, projection, {
        sanitizeFilter: true,
        sanitizeProjection: true,
    });
}

// TODO: defaults should exist in model layer, not here
export async function createUserWithDefaults(
    email: string,
    username: string,
    password: string,
): Promise<void> {
    await UserModel.create({
        email: mongoSanitizer(email),
        username: mongoSanitizer(username),
        password: password,
        profile: {
            bannerColor: "default", // TODO: add type hinting
            remainAnonymous: false,
        },
        notifications: {
            ohillOptIn: true,
            runkOptIn: true,
            newcombOptIn: true,
            optInWhenToNotify: [],
            foodOptInBol: true,
            foodOptInVal: [],
            replyToPost: true,
        },
        dateJoined: new Date(),
    } as UserSchemaType);
}

export async function updateUserSettings(
    userId: string,
    passwordReset: ResetApi,
    { profile, notifications }: UserSettingsApi,
): Promise<void> {
    await UserModel.findByIdAndUpdate(
        userId,
        {
            $set: {
                ...(!!passwordReset && { password: passwordReset.password }),
                ...(!!profile && flattenForUpdate("profile", profile)),
                ...(!!notifications &&
                    flattenForUpdate("notifications", notifications)),
            },
        },
        {
            sanitizeFilter: true,
            sanitizeProjection: true,
        },
    );
}
