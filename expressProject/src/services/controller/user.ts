import {
    createUserWithDefaults,
    findUserByBasicAuthRepo,
    findUserByEmailOrUserRepo,
    findUserByIdRepo,
    updateUserSettings,
} from "../../repositories/index.js";
import {
    hashPassword,
    verifyPassword,
} from "../../validations/index.js";
import type { IUserRequest } from "../../types/index.js";
import type { Types } from "mongoose";
import type { UpdateUserApi } from "hoorank-shared";
import type { UserSchemaType } from "../../models/index.js";
import { sanitizeInput } from "../../utils.js";

interface UserSchemaWithId extends UserSchemaType {
    readonly _id: Types.ObjectId;
}

function convertUserToJSObject({
    dateJoined,
    email,
    notifications,
    profile,
    username,
    _id,
}: UserSchemaWithId): Omit<UserSchemaWithId, "password"> | null {
    return {
        _id,
        username,
        dateJoined,
        email,
        notifications: notifications ?? null,
        profile: profile ?? null,
    };
}

export async function findUserById(
    userId: string,
): Promise<Omit<UserSchemaWithId, "password"> | null> {
    const result = await findUserByIdRepo(userId);

    if (!result) {
        return null;
    }

    return convertUserToJSObject(result);
}

export async function findUserWithBasicAuth(
    username: string,
    password: string,
): Promise<Omit<UserSchemaWithId, "password"> | null> {
    const result = await findUserByBasicAuthRepo(username);
    if (result[0] && (await verifyPassword(password, result[0].password))) {
        return convertUserToJSObject(result[0]);
    }

    return null;
}

export async function findUserByEmailOrUser(
    username: string,
    email: string,
): Promise<Omit<UserSchemaWithId, "password"> | null> {
    const result = await findUserByEmailOrUserRepo(username, email);
    if (!result[0]) {
        return null;
    }

    return convertUserToJSObject(result[0]);
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

export async function updateUser({
    userId,
    body: { passwordReset, userSettingsSchema },
}: IUserRequest<object, object, UpdateUserApi>): Promise<boolean> {
    if (!userId || !passwordReset) {
        return false;
    }

    await updateUserSettings(userId, passwordReset, userSettingsSchema);
    return true;
}
