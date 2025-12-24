import type { FindTokenParams, UpdateTokensParams } from "./interface.js";
import {
    IdentifierModel,
    type IdentifierSchemaType,
} from "../models/index.js";
import type { HydratedDocument } from "mongoose";
import { hashToken } from "../validations/index.js";

export async function updateTokens(
    {
        userId,
        oldCsrfToken,
        newCsrfToken,
        sessionId,
        metadata: { expiresAt, upsert},
    }: UpdateTokensParams
): Promise<void> {
    await IdentifierModel.findOneAndUpdate(
        {
            ...(userId && { userID: userId }),
            ...(oldCsrfToken && { csrf: oldCsrfToken })
        },
        {
            ...(sessionId && { session: sessionId }),
            ...(newCsrfToken && { csrf: newCsrfToken }),
            ...(userId && { userID: userId }),
            ...(expiresAt && { expiresAt: expiresAt })
        },
        {
            sanitizeFilter: true,
            upsert: upsert,
            new: upsert
        }
    );
}

export async function resetTokens(
    sessionId: string,
    csrfToken: string,
    newCsrfToken: string,
): Promise<void> {
    await IdentifierModel.findOneAndUpdate(
        {
            session: sessionId,
            csrf: csrfToken,
        },
        {
            $unset: {
                userID: "",
                session: "",
            },
            $set: {
                csrf: newCsrfToken,
            },
        },
        {
            sanitizeFilter: true,
        },
    );
}

export async function findToken(
    { csrfToken, sessionId }: FindTokenParams
): Promise<HydratedDocument<IdentifierSchemaType>[] | undefined> {
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
