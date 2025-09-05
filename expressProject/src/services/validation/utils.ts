import type { NextFunction, Request, Response } from "express";
import { compare, genSalt, hash } from "bcrypt";
import { SALT_ROUNDS } from "./constants.js";
import { createHash } from "crypto";
import sanitize from "sanitize-html";

export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, await genSalt(SALT_ROUNDS));
}

export async function verifyPassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    return await compare(password, hashedPassword);
}

export type SanitizeOutput<T> = T extends string
    ? string
    : T extends (infer U)[]
      ? SanitizeOutput<U>[]
      : T extends object
        ? { [K in keyof T]: SanitizeOutput<T[K]> }
        : T;

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
                if (key === "password" || key === "confirmPassword") {
                    continue;
                }
                sanitizedObj[key as keyof T] = sanitizeInput(input[key]);
            }
        }
        return sanitizedObj as SanitizeOutput<T>;
    }
    return input as SanitizeOutput<T>;
}

export function sanitizeHtml(
    req: Request<unknown, object, object, unknown>,
    _res: Response,
    next: NextFunction,
): void {
    req.body = sanitizeInput(req.body);
    req.params = sanitizeInput(req.params);
    req.query = sanitizeInput(req.query);
    req.cookies = sanitizeInput(req.cookies);

    next();
}
