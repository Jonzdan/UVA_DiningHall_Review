import type { Request } from "express";
import type { Types } from "mongoose";

export interface IUserRequest<
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Record<string, unknown>,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    userId?: Types.ObjectId | null | undefined;
    cookies: {
        CSRF_TOKEN?: string;
        [key: string]: string | undefined;
    };
    signedCookies: {
        SESSION_ID?: string;
        [key: string]: string | undefined;
    };
}
