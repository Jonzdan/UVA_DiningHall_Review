import type { UpdateUserPrefixes } from "@shared/api";
import ExpressMongoSanitize from "express-mongo-sanitize";

export function flattenForUpdate<
    T extends object,
    K extends keyof T & string
 >(prefix: UpdateUserPrefixes, obj: T): Record<`${typeof prefix}.${K}`, T[K]> {
    return (Object.keys(obj) as K[]).reduce((acc, key) => {
        acc[`${prefix}.${key}`] = obj[key];
        return acc;
    }, {} as Record<`${typeof prefix}.${K}`, T[K]>);
}

export const mongoSanitizerMiddleware = ExpressMongoSanitize({
    replaceWith: '_'
});

export const mongoSanitizer = (input: string): string => {
    return ExpressMongoSanitize.sanitize({ input }).input;
}
