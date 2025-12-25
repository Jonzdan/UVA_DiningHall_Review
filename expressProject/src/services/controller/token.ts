import { SESSION_HEX_BYTE_LENGTH, hashToken } from "../../validations/index.js";
import {
    findToken,
    resetTokens,
    updateTokens,
} from "src/repositories/index.js";
import type { IdentifierSchemaType } from "src/models/index.js";
import type { Types } from "mongoose";
import { generateCSRF } from "src/validations/index.js";
import { randomBytes } from "crypto";
import { setTokenExpiry } from "../../utils.js";

function convertTokenToJSObject({
    session,
    csrf,
    userID,
    createdAt,
    expiresAt,
}: IdentifierSchemaType): IdentifierSchemaType | null {
    return {
        session: session ?? null,
        csrf,
        userID: userID ?? null,
        createdAt,
        expiresAt,
    };
}

export async function updateCSRF(): Promise<string> {
    const newCsrfToken = generateCSRF();
    await updateTokens({
        newCsrfToken,
        metadata: {
            upsert: true,
        },
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
        userId,
        oldCsrfToken,
        newCsrfToken,
        sessionId: hashToken(sessionId),
        metadata: {
            upsert: true,
            expiresAt: setTokenExpiry(),
        },
    });
    return { newCsrfToken, sessionId };
}

export async function resetAuthTokens(
    sessionId: string,
    csrfToken: string,
): Promise<string> {
    const newCsrfToken = generateCSRF();
    await resetTokens(sessionId, csrfToken, newCsrfToken);
    return newCsrfToken;
}

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
