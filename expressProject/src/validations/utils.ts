import type { IncomingHttpHeaders } from "http";

import { compare, genSalt, hash } from "bcrypt";
import { createHash, randomBytes } from "crypto";

import {
    CSRF_HEX_BYTE_LENGTH,
    SALT_ROUNDS,
    SESSION_HEX_BYTE_LENGTH,
} from "../constants.js";

export function findHeader(
    headers: IncomingHttpHeaders,
    header: string,
): string | undefined {
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() == header.toLowerCase()) {
            return Array.isArray(value) ? value[0] : value;
        }
    }
    return undefined;
}

export function generateCSRF(): string {
    return randomBytes(CSRF_HEX_BYTE_LENGTH).toString("hex");
}

export function generateSession(): string {
    return randomBytes(SESSION_HEX_BYTE_LENGTH).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, await genSalt(SALT_ROUNDS));
}

export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function verifyPassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    return await compare(password, hashedPassword);
}
