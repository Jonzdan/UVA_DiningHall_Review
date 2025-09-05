import {
    CSRF_TOKEN,
    CSRF_TOKEN_HEADER,
    SESSION_ID,
    blockLoggedInUsers,
    blockLoggedOutUsers,
    createUserWithDefaults,
    csrf,
    findHeader,
    findUserByBasicAuth,
    findUserByEmailOrUser,
    findUserWithQuery,
    resetTokens,
    updateSession,
    updateUserSettings,
    validateBody,
} from "../services/index.js";
import { type Response, Router } from "express";
import {
    type UpdateUserApi,
    loginSchema,
    signupSchema,
    updateUserApiSchema,
} from "hoorank-shared";
import {
    mongoSanitizerMiddleware,
    setCSRFCookie,
    setSessionCookie,
} from "../utils.js";
import { HttpStatusCode } from "axios";
import type { IUserRequest } from "../types/index.js";

export const userRouter = Router();
userRouter.use(csrf);

userRouter.post(
    "/register",
    validateBody(signupSchema),
    blockLoggedInUsers,
    async (req, res) => {
        const { email, user, password } = req.body;
        try {
            const existingUser = await findUserByEmailOrUser(user, password);

            if (existingUser.length) {
                return res.status(HttpStatusCode.Conflict).end();
            }

            await createUserWithDefaults(email, user, password);
            return res.status(HttpStatusCode.Created).end();
        } catch (err) {
            console.error(err);
            return res.status(HttpStatusCode.InternalServerError).end();
        }
    },
);

userRouter.post(
    "/login",
    validateBody(loginSchema),
    blockLoggedInUsers,
    async (req, res) => {
        const { user, password } = req.body;

        const existingUser = await findUserByBasicAuth(user, password);

        if (!existingUser) {
            return res.status(HttpStatusCode.BadRequest).end();
        }

        const userId = existingUser._id;

        const { csrfToken, sessionId } = await updateSession(
            userId,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            findHeader(req.headers, CSRF_TOKEN_HEADER)!,
        );

        setSessionCookie(res, sessionId);
        setCSRFCookie(res, csrfToken);

        // TODO: Set this as a shared API interface
        return res.status(HttpStatusCode.Ok).json({
            username: existingUser.username,
            picture: existingUser.profile?.picture,
        });
    },
);

userRouter.post(
    "/signOut",
    blockLoggedOutUsers,
    async (req: IUserRequest, res) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const sessionId = req.signedCookies.SESSION_ID!;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const csrf = req.cookies.CSRF_TOKEN!;

        const newCSRFToken = await resetTokens(sessionId, csrf);

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
    "/settings",
    blockLoggedOutUsers,
    async (req: IUserRequest, res) => {
        if (!req.userId) {
            return res.status(HttpStatusCode.Unauthorized).end();
        }

        const user = await findUserWithQuery(
            {
                _id: req.userId,
            },
            {
                _id: 0, // Internal MongoDB ID field
                password: 0,
                __v: 0, // Internal MongoDB Version Number
            },
        );

        if (!user.length) {
            return res.status(HttpStatusCode.Unauthorized).end();
        } else {
            return res.status(HttpStatusCode.Ok).json(user);
        }
    },
);

userRouter.put(
    "/settings",
    validateBody(updateUserApiSchema),
    blockLoggedOutUsers,
    mongoSanitizerMiddleware,
    async (req: IUserRequest<object, object, UpdateUserApi>, res: Response) => {
        if (!req.userId) {
            return res.status(HttpStatusCode.Unauthorized).end();
        }

        const { email } = req.body;
        if (email) {
            /**
             * TODO: Send an email for 2-step verification
             */
        }

        try {
            await updateUserSettings(req);
            return res.status(HttpStatusCode.NoContent).end();
        } catch (err) {
            console.error('/PUT; path:"settings" failed', err);
            return res.status(HttpStatusCode.InternalServerError).end();
        }
    },
);
