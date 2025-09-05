import {
    CSRF_HEX_BYTE_LENGTH,
    SESSION_HEX_BYTE_LENGTH,
    hashToken,
} from "../validation/index.js";
import type { HydratedDocument, Types } from "mongoose";
import {
    IdentifierModel,
    type IdentifierSchemaType,
} from "../../models/index.js";
import { randomBytes } from "crypto";
import { setTokenExpiry } from "../../utils.js";

export function generateCSRF(): string {
    return randomBytes(CSRF_HEX_BYTE_LENGTH).toString("hex");
}

export async function updateCSRF(): Promise<string> {
    return (
        await IdentifierModel.create({
            csrf: generateCSRF(),
        })
    ).csrf;
}

export async function updateSession(
    userId: Types.ObjectId | undefined,
    csrfToken: string,
) {
    const sessionId = randomBytes(SESSION_HEX_BYTE_LENGTH).toString("hex");
    await IdentifierModel.findOneAndUpdate(
        userId ? { userID: userId, csrf: csrfToken } : { csrf: csrfToken },
        {
            csrf: csrfToken,
            session: hashToken(sessionId),
            userID: userId,
            expiresAt: setTokenExpiry(),
        },
        {
            sanitizeFilter: true,
            upsert: true,
            new: true,
        },
    );
    return { csrfToken, sessionId };
}

export async function resetTokens(
    sessionId: string,
    csrfToken: string,
): Promise<string> {
    const token = generateCSRF();
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
                csrf: token,
            },
        },
        {
            sanitizeFilter: true,
        },
    );
    return token;
}

export async function findToken(
    csrfToken?: string,
    sessionId?: string,
): Promise<HydratedDocument<IdentifierSchemaType>[] | undefined> {
    if (!sessionId && !csrfToken) {
        return undefined;
    }

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
