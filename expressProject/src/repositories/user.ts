import type { FilterQuery, HydratedDocument, ProjectionType } from "mongoose";
import type { ResetApi, UserSettingsApi } from "hoorank-shared";
import { UserModel, type UserSchemaType } from "../models/index.js";
import { flattenForUpdate, mongoSanitizer } from "../utils.js";

export async function findUserByIdRepo(
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

export async function findUserByBasicAuthRepo(
    username: string,
): Promise<HydratedDocument<UserSchemaType>[]> {
    return await findUserWithQuery({
        username: {
            $eq: username,
        },
    });
}

export async function findUserByEmailOrUserRepo(
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
    passwordReset?: ResetApi,
    userSettings?: UserSettingsApi,
): Promise<void> {
    await UserModel.findByIdAndUpdate(
        userId,
        {
            $set: {
                ...(!!passwordReset && { password: passwordReset.password }),
                ...(!!userSettings?.profile &&
                    flattenForUpdate("profile", userSettings.profile)),
                ...(!!userSettings?.notifications &&
                    flattenForUpdate(
                        "notifications",
                        userSettings.notifications,
                    )),
            },
        },
        {
            sanitizeFilter: true,
            sanitizeProjection: true,
        },
    );
}
