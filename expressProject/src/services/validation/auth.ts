import type { IncomingHttpHeaders } from "node:http";
import type { Request, Response, NextFunction } from 'express';
import { CSRF_TOKEN, CSRF_TOKEN_HEADER, SESSION_ID } from "./constants";
import { findToken } from "../controllers/token";
import { HttpStatusCode } from "axios";
import type { z } from "zod";

export function findHeader(headers: IncomingHttpHeaders, header: string): string | undefined {
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() == header.toLowerCase()) {
            return Array.isArray(value) ? value[0] : value;
        }
    }
    return undefined;
}

export async function csrf(req: Request, res: Response, next: NextFunction): Promise<void> {
    const csrfToken = findHeader(req.headers, CSRF_TOKEN_HEADER);
    if (csrfToken && csrfToken === req.cookies[CSRF_TOKEN]) {
        const result = await findToken(csrfToken);

        if (!result?.length) {
            res.status(HttpStatusCode.BadRequest).end();
            return;
        }
        else {
            next(); return;
        }
    }
    else {
        res.status(HttpStatusCode.BadRequest).end();
    }
}

export function validateBody<T>(schema: z.ZodType<T>) {
    return (req: Request<object, object, T>, res: Response, next: NextFunction): void => {
        const { error, success, data } = schema.safeParse(req.body);
        if (!success) {
            res.status(HttpStatusCode.BadRequest).json(error.issues).end();
            return;
        }
        req.body = data;
        return next();
    }
}


export async function blockLoggedInUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.signedCookies[SESSION_ID]?.length) {
        next(); return;
    }
    const response = await findToken(req.cookies[CSRF_TOKEN], req.signedCookies[SESSION_ID]);
    if (response?.length !== 1 || response[0]?.userID) {
        res.status(HttpStatusCode.NoContent).end();
        return;
    }

    next();
}

export async function blockLoggedOutUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.signedCookies[SESSION_ID]?.length) {
        res.status(HttpStatusCode.Unauthorized).end();
        return;
    }

    const response = await findToken(req.cookies[CSRF_TOKEN], req.signedCookies[SESSION_ID]);
    if (!response?.length || !response[0]?.userID) {
        res.status(HttpStatusCode.Unauthorized).end();
        return;
    }

    req.userId = response[0].userID;
    next();
}
