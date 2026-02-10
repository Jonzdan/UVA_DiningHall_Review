import type { Types } from "mongoose";

import { randomBytes } from "crypto";

import type { IdentifierSchemaType } from "../../models/index.js";

import { SESSION_HEX_BYTE_LENGTH } from "../../constants.js";
import {
    findToken,
    resetTokens,
    updateTokens,
} from "../../repositories/index.js";
import { setTokenExpiry } from "../../utils.js";
import { generateCSRF, hashToken } from "../../validations/index.js";

// TODO: add public DTO
export async function findAuthTokens(
    csrfToken?: string,
    sessionId?: string,
): Promise<IdentifierSchemaType | null> {
    if (!sessionId && !csrfToken) {
        return null;
    }

    const result = await findToken({
        csrfToken,
        sessionId,
    });

    if (!result?.length) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return convertTokenToJSObject(result[0]!);
}

export async function resetAuthTokens(
    sessionId: string,
    csrfToken: string,
): Promise<string> {
    const newCsrfToken = generateCSRF();
    await resetTokens(sessionId, csrfToken, newCsrfToken);
    return newCsrfToken;
}

export async function updateCSRF(): Promise<string> {
    const newCsrfToken = generateCSRF();
    await updateTokens({
        metadata: {
            upsert: true,
        },
        newCsrfToken,
    });
    return newCsrfToken;
}

export async function updateSession(
    userId: Types.ObjectId | undefined,
    oldCsrfToken: string,
) {
    const sessionId = randomBytes(SESSION_HEX_BYTE_LENGTH).toString("hex");
    const newCsrfToken = generateCSRF();
    await updateTokens({
        metadata: {
            expiresAt: setTokenExpiry(),
            upsert: true,
        },
        newCsrfToken,
        oldCsrfToken,
        sessionId: hashToken(sessionId),
        userId,
    });
    return { newCsrfToken, sessionId };
}

export async function refreshSession(
    userId: Types.ObjectId | undefined | null,
    currentCsrfToken: string,
    currentSessionToken: string,
): Promise<void> {
    await updateTokens({
        metadata: {
            expiresAt: setTokenExpiry(),
            upsert: true,
        },
        oldCsrfToken: currentCsrfToken,
        sessionId: currentSessionToken,
        userId,
    });
}

function convertTokenToJSObject({
    createdAt,
    csrf,
    expiresAt,
    session,
    userID,
}: IdentifierSchemaType): IdentifierSchemaType | null {
    return {
        createdAt,
        csrf,
        expiresAt,
        session: session ?? null,
        updatedAt: createdAt,
        userID: userID ?? null,
    };
}
