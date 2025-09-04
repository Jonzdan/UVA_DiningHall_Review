import type { FilterQuery, HydratedDocument, ProjectionType, Types } from "mongoose";
import { UserModel, type UserSchemaType } from "src/models";
import { type Request } from "express";
import type { UpdateUserApi } from "@shared/api";
import { flattenForUpdate, mongoSanitizer } from "src/utils";
import { hashPassword, sanitizeInput, verifyPassword } from "../validation";

export async function findUserById(user: Types.ObjectId): Promise<HydratedDocument<UserSchemaType>[]> {
    return await UserModel.find(
        {
            _id: user,
        }, {}, {
            sanitizeFilter: true
        }
    );
}

export async function findUserByBasicAuth(username: string, password: string): Promise<HydratedDocument<UserSchemaType> | null> {
    const result = await findUserWithQuery({
        username:  {
            $eq: username
        }
    });

    if (result[0] && await verifyPassword(password, result[0].password)) {
        return result[0];
    }

    return null;
}

export async function findUserByEmailOrUser(username: string, email: string): Promise<HydratedDocument<UserSchemaType>[]> {
    return await findUserWithQuery({
        $or: [
            { email: { $eq: email } },
            { username: { $eq: username } }
        ]
    });
}

/**
 * Sanitizes input
 * @param query 
 * @param projection 
 * @returns 
 */
export async function findUserWithQuery(query: FilterQuery<UserSchemaType>, projection?: ProjectionType<UserSchemaType>): Promise<HydratedDocument<UserSchemaType>[]> {
    return await UserModel.find(query, projection, {
        sanitizeFilter: true,
        sanitizeProjection: true
    });
}

export async function createUserWithDefaults(email: string, username: string, password: string): Promise<void> {
    await UserModel.create({
        email: mongoSanitizer(sanitizeInput(email)),
        username: mongoSanitizer(sanitizeInput(username)),
        password: await hashPassword(password),
        profile: {
            bannerColor:     "default",
            remainAnonymous: false,
        },
        notifications: {
            ohillOptIn:        true,
            runkOptIn:         true,
            newcombOptIn:      true,
            optInWhenToNotify: [],
            foodOptInBol:      true,
            foodOptInVal:      [],
            replyToPost:       true

        },
        dateJoined: new Date(),
    } as UserSchemaType);
}

export async function updateUserSettings(req: Request<{}, {}, UpdateUserApi>): Promise<void> {
    const { passwordReset, profile, notifications } = req.body;
    await UserModel.findByIdAndUpdate(req.userId,
        {
            $set: {
                ...(!!passwordReset && { password: passwordReset.password }),
                ...(!!profile && flattenForUpdate('profile', profile)),
                ...(!!notifications && flattenForUpdate('notifications', notifications))
            }
        }, {
            sanitizeFilter: true,
            sanitizeProjection: true
        }
    );
}
