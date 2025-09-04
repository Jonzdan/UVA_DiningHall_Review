import { randomBytes } from "crypto";
import { IdentifierModel, type IdentifierSchemaType } from "src/models";
import { hashToken } from "../validation/utils";
import { CSRF_HEX_BYTE_LENGTH, SESSION_HEX_BYTE_LENGTH } from "../validation/constants";
import type { HydratedDocument, Types } from "mongoose";

function generateCSRF(): string {
    return randomBytes(CSRF_HEX_BYTE_LENGTH).toString('hex');
}

export async function updateCSRF(): Promise<string> {
    return (await IdentifierModel.create({
        csrf: generateCSRF(),
    })).csrf;
}

export async function updateSession(userId: Types.ObjectId, csrfToken: string) {
    const sessionId = randomBytes(SESSION_HEX_BYTE_LENGTH).toString('hex');
    await IdentifierModel.findOneAndUpdate(
        {
            csrf: csrfToken,
        },
        {
            session: hashToken(sessionId),
            userID: userId,
        }
    );
    return sessionId;
}

export async function resetTokens(sessionId: string, csrfToken: string): Promise<string> {
    const token = generateCSRF();
    await IdentifierModel.findOneAndUpdate(
        {
            session: sessionId,
            csrf:    csrfToken,
        },
        {
            $unset: {
                userID: '',
                session: '',
            },
            $set: {
                csrf: token
            }
        }
    );
    return token;
}

export async function findToken(csrfToken?: string, sessionId?: string): Promise<HydratedDocument<IdentifierSchemaType>[] | undefined> {
    if (!sessionId && !csrfToken) {
        return undefined;
    }

    return await IdentifierModel.find({
        ...(sessionId && { session: hashToken(sessionId) }),
        ...(csrfToken && { csrf: csrfToken })
    });
}
