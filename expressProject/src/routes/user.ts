import { HttpStatusCode } from "axios";
import { type Response, Router } from "express";
import {
    loginSchema,
    signupSchema,
    SUBROUTES,
    type UpdateUserApi,
    updateUserApiSchema,
    UpdateUserFields,
    type UserLoginOutput,
} from "hoorank-shared";

import type { IUserRequest } from "../types/index.js";

import { CSRF_TOKEN, CSRF_TOKEN_HEADER, SESSION_ID } from "../constants.js";
import {
    createUser,
    findUserByEmailOrUser,
    findUserById,
    findUserWithBasicAuth,
    resetAuthTokens,
    toPublicUserDTO,
    updateSession,
    updateUser,
} from "../services/controller/index.js";
import { mongoSanitizerMiddleware } from "../utils.js";
import { findHeader } from "../validations/index.js";
import {
    blockLoggedInUsers,
    blockLoggedOutUsers,
    csrf,
    setCSRFCookie,
    setSessionCookie,
    validateAuthBody,
    validateBody,
} from "./utils.js";

export const userRouter = Router();

userRouter.post(
    SUBROUTES.USER.REGISTER,
    csrf,
    validateAuthBody(signupSchema),
    blockLoggedInUsers,
    async (req, res) => {
        const { email, password, user } = req.body;
        try {
            const existingUser = await findUserByEmailOrUser(user, password);

            if (existingUser) {
                return res.status(HttpStatusCode.Conflict).end();
            }

            await createUser(email, user, password);
            return res.status(HttpStatusCode.Created).end();
        } catch (err) {
            console.error(err);
            return res.status(HttpStatusCode.InternalServerError).end();
        }
    },
);

userRouter.post(
    SUBROUTES.USER.LOGIN,
    csrf,
    validateAuthBody(loginSchema),
    blockLoggedInUsers,
    async (req, res) => {
        const { password, user } = req.body;

        const existingUser = await findUserWithBasicAuth(user, password);

        if (!existingUser) {
            return res.status(HttpStatusCode.BadRequest).end();
        }

        const userId = existingUser._id;
        const { newCsrfToken, sessionId } = await updateSession(
            userId,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            findHeader(req.headers, CSRF_TOKEN_HEADER)!,
        );

        setSessionCookie(res, sessionId);
        setCSRFCookie(res, newCsrfToken);

        return res.status(HttpStatusCode.Ok).json({
            picture: existingUser.profile?.picture,
            username: existingUser.username,
        } as UserLoginOutput);
    },
);

userRouter.post(
    SUBROUTES.USER.LOGOUT,
    csrf,
    blockLoggedOutUsers,
    async (req: IUserRequest, res) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const sessionId = req.signedCookies.SESSION_ID!;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const csrf = req.cookies.CSRF_TOKEN!;
        const newCSRFToken = await resetAuthTokens(sessionId, csrf);

        res.clearCookie(CSRF_TOKEN);
        res.clearCookie(SESSION_ID);

        res.header(
            "Content-Security-Policy",
            "default-src 'self'; style-src 'self', 'unsafe-inline'",
        );
        setCSRFCookie(res, newCSRFToken);
        return res.status(HttpStatusCode.NoContent).end();
    },
);

userRouter.get(
    SUBROUTES.USER.SETTINGS,
    blockLoggedOutUsers,
    async (req: IUserRequest, res) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const user = await findUserById(req.userId!);
        if (!user) {
            return res.status(HttpStatusCode.Unauthorized).end();
        } else {
            return res.status(HttpStatusCode.Ok).json(toPublicUserDTO(user));
        }
    },
);

userRouter.put(
    SUBROUTES.USER.SETTINGS,
    csrf,
    validateBody(updateUserApiSchema, UpdateUserFields),
    blockLoggedOutUsers,
    mongoSanitizerMiddleware,
    async (req: IUserRequest<object, object, UpdateUserApi>, res: Response) => {
        const { email } = req.body;
        if (email) {
            /**
             * TODO: Send an email for 2-step verification
             */
        }

        try {
            const result = await updateUser(req);
            if (!result) {
                return res.status(HttpStatusCode.BadRequest).end();
            }

            return res.status(HttpStatusCode.NoContent).end();
        } catch (err) {
            console.error('/PUT; path:"settings" failed', err);
            return res.status(HttpStatusCode.InternalServerError).end();
        }
    },
);
