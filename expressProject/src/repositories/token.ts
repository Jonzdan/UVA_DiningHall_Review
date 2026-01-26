import type { HydratedDocument } from "mongoose";

import type { FindTokenParams, UpdateTokensParams } from "./interface.js";

import { IdentifierModel, type IdentifierSchemaType } from "../models/index.js";
import { hashToken } from "../validations/index.js";

export async function findToken({
    csrfToken,
    sessionId,
}: FindTokenParams): Promise<
    HydratedDocument<IdentifierSchemaType>[] | undefined
> {
    return await IdentifierModel.find(
        {
            ...(sessionId && { session: hashToken(sessionId) }),
            ...(csrfToken && { csrf: csrfToken }),
        },
        {},
        {
            sanitizeFilter: true,
        },
    );
}

export async function resetTokens(
    sessionId: string,
    csrfToken: string,
    newCsrfToken: string,
): Promise<void> {
    await IdentifierModel.findOneAndUpdate(
        {
            csrf: csrfToken,
            session: sessionId,
        },
        {
            $set: {
                csrf: newCsrfToken,
            },
            $unset: {
                session: "",
                userID: "",
            },
        },
        {
            sanitizeFilter: true,
        },
    );
}

export async function updateTokens({
    metadata: { expiresAt, upsert },
    newCsrfToken,
    oldCsrfToken,
    sessionId,
    userId,
}: UpdateTokensParams): Promise<void> {
    await IdentifierModel.findOneAndUpdate(
        {
            ...(userId && { userID: userId }),
            ...(oldCsrfToken && { csrf: oldCsrfToken }),
            ...(sessionId && { session: sessionId }),
        },
        {
            ...(sessionId && { session: sessionId }),
            ...(newCsrfToken && { csrf: newCsrfToken }),
            ...(userId && { userID: userId }),
            ...(expiresAt && { expiresAt }),
        },
        {
            new: upsert,
            sanitizeFilter: true,
            upsert: upsert,
        },
    );
}
