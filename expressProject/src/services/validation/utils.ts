import { createHash } from "crypto";
import type { NextFunction, Request, Response } from "express";
import sanitize from 'sanitize-html';
import { genSalt, hash, compare } from 'bcrypt';
import { SALT_ROUNDS } from "./constants";

export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, await genSalt(SALT_ROUNDS));
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword);
}

export type SanitizeOutput<T> = 
    T extends string ? string :
    T extends Array<infer U> ? SanitizeOutput<U>[] :
    T extends object ? { [K in keyof T]: SanitizeOutput<T[K]> } :
    T;

export function sanitizeInput<T>(input: T): SanitizeOutput<T> {
    if (typeof input === "string") {
        return sanitize(input) as SanitizeOutput<T>;
    }
    if (Array.isArray(input)) {
        return input.map(sanitizeInput) as SanitizeOutput<T>;
    }
    if (input !== null && typeof input === "object") {
        const sanitizedObj = {} as { [K in keyof T]: SanitizeOutput<T[K]> };
        for (const key in input) {
            if (Object.hasOwn(input, key)) {
                // TODO: Make a Type
                if (key === 'password' || key === 'confirmPassword') {
                    continue;
                }
                sanitizedObj[key as keyof T] = sanitizeInput(input[key]);
            }
        }
        return sanitizedObj as SanitizeOutput<T>;
    }
    return input as SanitizeOutput<T>;
}

export function sanitizeHtml(req: Request, _res: Response, next: NextFunction): void {
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }

    if (req.params) {
        req.params = sanitizeInput(req.params);
    }

    if (req.query) {
        req.query = sanitizeInput(req.query);
    }

    if (req.cookies) {
        req.cookies = sanitizeInput(req.cookies);
    }

    return next();
}
