import type { NextFunction, Response } from "express";
import type { Request } from "express";
import type { IUserRequest } from "src/types/request.js";
import type z from "zod";

import { HttpStatusCode } from "axios";
import {
    type AuthConfirmOutput,
    AuthFieldEnum,
    type AuthFields,
    type ErrorFormat,
    type FormValidationErrorType,
} from "hoorank-shared";
import {
    CSRF_TOKEN,
    CSRF_TOKEN_HEADER,
    SESSION_ID,
    TOKEN_AGE,
} from "src/constants.js";
import { findToken } from "src/repositories/token.js";
import { type AuthCookies, confirmAuthService } from "src/services/index.js";
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

export async function refreshAuth(
    cookies: AuthCookies,
    res: Response,
): Promise<void> {
    try {
        const result = await confirmAuthService(cookies);
        if (!result?.user) {
            res.clearCookie(CSRF_TOKEN);
            res.clearCookie(SESSION_ID);
            res.status(HttpStatusCode.BadRequest).end();
            return;
        }

        const { newCsrfToken, sessionId, user } = result;
        setSessionCookie(res, sessionId);
        setCSRFCookie(res, newCsrfToken);

        res.status(HttpStatusCode.Ok)
            .json({
                username: user,
            } as AuthConfirmOutput)
            .end();
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCode.InternalServerError).json({
            msg: error instanceof Error ? error.message : "",
        });
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

export function validateAuthBody<T>(schema: z.ZodType<T>) {
    return validateBody<T, AuthFields, FormValidationErrorType>(
        schema,
        AuthFieldEnum,
    );
}

export function validateBody<T, TField extends string, TError extends string>(
    schema: z.ZodType<T>,
    validFields: Record<TField, TField>,
    errorCodes?: Record<TError, TError>,
) {
    return (
        req: Request<object, object, T>,
        res: Response,
        next: NextFunction,
    ): void => {
        const { data, error, success } = schema.safeParse(req.body);
        if (!success) {
            res.status(HttpStatusCode.BadRequest)
                .json(
                    buildErrorFormat<TField, TError>(
                        error,
                        validFields,
                        errorCodes,
                    ),
                )
                .end();
            return;
        }
        req.body = data;
        next();
    };
}

function buildErrorFormat<TField extends string, TError extends string>(
    error: z.ZodError<unknown>,
    validFields: Record<TField, TField>,
    errorCodes?: Record<TError, TError>,
): ErrorFormat<TField, TError>[] {
    const errors: Partial<Record<TField, TError[]>> = {};
    const issues = error.issues;
    for (const issue of issues) {
        /**
         * Path is designed to be only top-level (single) fields ATM
         * zodIssue.message currently contains error codes --> fallback to generic error message for basic routes
         */
        const field = issue.path[0] as TField;
        if (!(field in validFields)) {
            continue;
        }

        const currentErrorCode = issue.message as TError;
        (errors[field] ??= []).push(
            errorCodes?.[currentErrorCode] ?? currentErrorCode,
        );
    }

    return (Object.keys(errors) as TField[]).map((field) => {
        return {
            errors: errors[field],
            field,
        } as ErrorFormat<TField, TError>;
    });
}
