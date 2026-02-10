import type { Request } from "express";

export interface IUserRequest<
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Record<string, unknown>,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    cookies: {
        [key: string]: string | undefined;
        CSRF_TOKEN?: string;
    };
    signedCookies: {
        [key: string]: string | undefined;
        SESSION_ID?: string;
    };
    userId?: null | string | undefined;
}
