import type { AuthConfirmOutput, UpdateUserPrefixes } from "hoorank-shared";
import { CSRF_TOKEN, SESSION_ID } from "./validations/index.js";
import { DiningHallModel, type DiningHallSchemaType } from "./models/index.js";
import { findAuthTokens, updateSession } from "./services/index.js";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { HttpStatusCode } from "axios";
import type { IUserRequest } from "./types/index.js";
import { type Response } from "express";
import { findUserById } from "./services/index.js";
import mongoose from "mongoose";

// 1000 ms * 60s * 30m
const TOKEN_AGE = 1_800_000;

export function flattenForUpdate<T extends object, K extends keyof T & string>(
    prefix: UpdateUserPrefixes,
    obj: T,
): Record<`${typeof prefix}.${K}`, T[K]> {
    return (Object.keys(obj) as K[]).reduce(
        (acc, key) => {
            acc[`${prefix}.${key}`] = obj[key];
            return acc;
        },
        {} as Record<`${typeof prefix}.${K}`, T[K]>,
    );
}

export async function connectToMongo(
    models: mongoose.Model<DiningHallSchemaType>[] = [DiningHallModel],
): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await mongoose.connect(process.env["DATABASE_URL"]!);
        console.log("Connected to MongoDB");
        const db = mongoose.connection;
        db.on("error", (err) => {
            console.error("MongoDB runtime error:", err);
        });

        for (const model of models) {
            try {
                // Minimal lean query to compile schema & cache indexes
                await model.findOne().lean().maxTimeMS(2000).exec();
                console.log(`Pre-warmed model: ${model.modelName}`);
            } catch (err) {
                console.warn(
                    `Failed to pre-warm model ${model.modelName}:`,
                    err,
                );
            }
        }
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

export const mongoSanitizerMiddleware = ExpressMongoSanitize({
    replaceWith: "_",
});

export const mongoSanitizer = (input: string): string => {
    return ExpressMongoSanitize.sanitize({ input }).input;
};

export function setTokenExpiry(): Date {
    return new Date(Date.now() + TOKEN_AGE);
}

export function setSessionCookie(res: Response, sessionId: string): void {
    res.cookie(SESSION_ID, sessionId, {
        sameSite: "strict",
        httpOnly: true,
        maxAge: TOKEN_AGE,
        signed: true,
        secure: process.env["STAGE"] === "dev" ? false : true,
    });
}

export function setCSRFCookie(res: Response, csrfToken: string): void {
    res.cookie(CSRF_TOKEN, csrfToken, {
        sameSite: "strict",
        maxAge: TOKEN_AGE,
    });
}

export async function confirmAuthSessionHandler(
    req: IUserRequest,
    res: Response,
) {
    const response = await findAuthTokens(
        req.cookies.CSRF_TOKEN,
        req.signedCookies.SESSION_ID,
    );

    if (!response?.userID) {
        res.clearCookie(CSRF_TOKEN);
        res.clearCookie(SESSION_ID);
        res.status(HttpStatusCode.BadRequest).end();
        return;
    }

    const userId = response.userID;
    const [{ newCsrfToken, sessionId }, person] = await Promise.all([
        updateSession(userId, response.csrf),
        findUserById(userId.toString()),
    ]);

    if (!person) {
        res.status(HttpStatusCode.Unauthorized).end();
        return;
    }

    setSessionCookie(res, sessionId);
    setCSRFCookie(res, newCsrfToken);

    res.status(HttpStatusCode.Ok)
        .json({
            username: person.username,
        } as AuthConfirmOutput)
        .end();
}
