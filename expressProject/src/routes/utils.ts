import type { NextFunction, Response } from "express";
import type { Request } from "express";
import type { IUserRequest } from "src/types/request.js";
import type z from "zod";

import { HttpStatusCode } from "axios";
import {
    CSRF_TOKEN,
    CSRF_TOKEN_HEADER,
    SESSION_ID,
    TOKEN_AGE,
} from "src/constants.js";
import { findToken } from "src/repositories/token.js";
import { findHeader } from "src/validations/utils.js";

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

export function setCSRFCookie(res: Response, csrfToken: string): void {
    res.cookie(CSRF_TOKEN, csrfToken, {
        maxAge: TOKEN_AGE,
        sameSite: "strict",
    });
}

export function setSessionCookie(res: Response, sessionId: string): void {
    res.cookie(SESSION_ID, sessionId, {
        httpOnly: true,
        maxAge: TOKEN_AGE,
        sameSite: "strict",
        secure: process.env["STAGE"] === "dev" ? false : true,
        signed: true,
    });
}

export function validateBody<T>(schema: z.ZodType<T>) {
    return (
        req: Request<object, object, T>,
        res: Response,
        next: NextFunction,
    ): void => {
        const { data, error, success } = schema.safeParse(req.body);
        if (!success) {
            res.status(HttpStatusCode.BadRequest).json(error.issues).end();
            return;
        }
        req.body = data;
        next();
    };
}
