import type { RequestHandler } from "express";
import type { UpdateUserPrefixes } from "hoorank-shared";

import ExpressMongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import sanitize from "sanitize-html";

import { TOKEN_AGE } from "./constants.js";
import { DiningHallModel, type DiningHallSchemaType } from "./models/index.js";

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

export const mongoSanitizerMiddleware = ExpressMongoSanitize({
    replaceWith: "_",
});

export const mongoSanitizer = (input: string): string => {
    return ExpressMongoSanitize.sanitize({ input }).input;
};

export function setTokenExpiry(): Date {
    return new Date(Date.now() + TOKEN_AGE);
}

export const sanitizeHtml: RequestHandler = (req, _res, next) => {
    req.body = sanitizeInput<unknown>(req.body);
    req.params = sanitizeInput(req.params);
    req.query = sanitizeInput(req.query);
    req.cookies = sanitizeInput<unknown>(req.cookies);

    next();
};

type SanitizeOutput<T> = T extends string
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
            sanitizedObj[key as keyof T] = sanitizeInput(input[key]);
        }
        return sanitizedObj as SanitizeOutput<T>;
    }
    return input as SanitizeOutput<T>;
}
