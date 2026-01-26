import type { UpdateUserApi } from "hoorank-shared";
import type { Types } from "mongoose";

import type { PrivateUserFields, UserSchemaType } from "../../models/index.js";
import type { IUserRequest } from "../../types/index.js";

import {
    createUserWithDefaults,
    findUserByBasicAuthRepo,
    findUserByEmailOrUserRepo,
    findUserByIdRepo,
    updateUserSettings,
} from "../../repositories/index.js";
import { sanitizeInput } from "../../utils.js";
import { hashPassword, verifyPassword } from "../../validations/index.js";

interface UserSchemaWithId extends UserSchemaType {
    readonly _id?: Types.ObjectId;
}

export async function createUser(
    email: string,
    username: string,
    password: string,
): Promise<void> {
    await createUserWithDefaults(
        sanitizeInput(email),
        sanitizeInput(username),
        await hashPassword(password),
    );
}

export async function findUserByEmailOrUser(
    username: string,
    email: string,
): Promise<null | UserSchemaWithId> {
    const result = await findUserByEmailOrUserRepo(username, email);
    if (!result[0]) {
        return null;
    }

    return result[0];
}

export async function findUserById(
    userId: string,
): Promise<null | UserSchemaWithId> {
    const result = await findUserByIdRepo(userId);

    if (!result) {
        return null;
    }

    return result;
}

export async function findUserWithBasicAuth(
    username: string,
    password: string,
): Promise<null | UserSchemaWithId> {
    const result = await findUserByBasicAuthRepo(username);
    if (result[0] && (await verifyPassword(password, result[0].password))) {
        return result[0];
    }

    return null;
}

export function toPublicUserDTO({
    dateJoined,
    email,
    notifications,
    profile,
    username,
}: UserSchemaWithId): null | Omit<UserSchemaWithId, PrivateUserFields> {
    return {
        dateJoined,
        email,
        notifications: notifications ?? null,
        profile: profile ?? null,
        username,
    };
}

export async function updateUser({
    body: { passwordReset, userSettingsSchema },
    userId,
}: IUserRequest<object, object, UpdateUserApi>): Promise<boolean> {
    if (!userId) {
        return false;
    }

    await updateUserSettings(userId, passwordReset, userSettingsSchema);
    return true;
}
