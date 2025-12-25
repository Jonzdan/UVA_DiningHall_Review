import type { NextFunction, Request, Response } from "express";
import { CSRF_TOKEN_HEADER } from "./constants.js";
import { HttpStatusCode } from "axios";
import type { IUserRequest } from "../types/index.js";
import { findHeader } from "./utils.js";
import { findToken } from "../repositories/index.js";
import type { z } from "zod";

export async function csrf(
    req: IUserRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const csrfToken = findHeader(req.headers, CSRF_TOKEN_HEADER);
    if (csrfToken && csrfToken === req.cookies.CSRF_TOKEN) {
        const result = await findToken({ csrfToken });

        if (!result?.length) {
            res.status(HttpStatusCode.BadRequest).end();
            return;
        } else {
            req.userId = result[0]?.userID?.toString();
            next();
            return;
        }
    } else {
        res.status(HttpStatusCode.BadRequest).end();
    }
}

export function validateBody<T>(schema: z.ZodType<T>) {
    return (
        req: Request<object, object, T>,
        res: Response,
        next: NextFunction,
    ): void => {
        const { error, success, data } = schema.safeParse(req.body);
        if (!success) {
            res.status(HttpStatusCode.BadRequest).json(error.issues).end();
            return;
        }
        req.body = data;
        next();
    };
}

export async function blockLoggedInUsers(
    req: IUserRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (!req.signedCookies.SESSION_ID?.length) {
        next();
        return;
    }
    const response = await findToken({
        csrfToken: req.cookies.CSRF_TOKEN,
        sessionId: req.signedCookies.SESSION_ID,
    });
    if (response?.length !== 1 || response[0]?.userID) {
        res.status(HttpStatusCode.NoContent).end();
        return;
    }

    next();
}

export async function blockLoggedOutUsers(
    req: IUserRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (!req.signedCookies.SESSION_ID?.length) {
        res.status(HttpStatusCode.Unauthorized).end();
        return;
    }

    if (!req.userId) {
        const response = await findToken({
            csrfToken: req.cookies.CSRF_TOKEN,
            sessionId: req.signedCookies.SESSION_ID,
        });
        if (!response?.length || !response[0]?.userID) {
            res.status(HttpStatusCode.Unauthorized).end();
            return;
        }

        req.userId = response[0].userID.toString();
    }
    next();
}
