import type { Request } from "express";

export interface IUserRequest<
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Record<string, unknown>,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    userId?: string | null | undefined;
    cookies: {
        CSRF_TOKEN?: string;
        [key: string]: string | undefined;
    };
    signedCookies: {
        SESSION_ID?: string;
        [key: string]: string | undefined;
    };
}
