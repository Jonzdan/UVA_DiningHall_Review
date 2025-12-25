import {
    CSRF_TOKEN,
    CSRF_TOKEN_HEADER,
    SESSION_ID,
    blockLoggedInUsers,
    blockLoggedOutUsers,
    csrf,
    findHeader,
    validateBody,
} from "../validations/index.js";
import {
    ROUTES,
    type UpdateUserApi,
    type UserLoginOutput,
    loginSchema,
    signupSchema,
    updateUserApiSchema,
} from "hoorank-shared";
import { type Response, Router } from "express";
import {
    createUser,
    findUserByEmailOrUser,
    findUserById,
    findUserWithBasicAuth,
    resetAuthTokens,
    updateSession,
    updateUser,
} from "../services/controller/index.js";
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
    ROUTES.USER.REGISTER,
    validateBody(signupSchema),
    blockLoggedInUsers,
    async (req, res) => {
        const { email, user, password } = req.body;
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
    ROUTES.USER.LOGIN,
    validateBody(loginSchema),
    blockLoggedInUsers,
    async (req, res) => {
        const { user, password } = req.body;

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
            username: existingUser.username,
            picture: existingUser.profile?.picture,
        } as UserLoginOutput);
    },
);

userRouter.post(
    ROUTES.USER.LOGOUT,
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
    ROUTES.USER.SETTINGS,
    blockLoggedOutUsers,
    async (req: IUserRequest, res) => {
        if (!req.userId) {
            return res.status(HttpStatusCode.Unauthorized).end();
        }

        const user = await findUserById(req.userId);
        if (!user) {
            return res.status(HttpStatusCode.Unauthorized).end();
        } else {
            return res.status(HttpStatusCode.Ok).json(user);
        }
    },
);

userRouter.put(
    ROUTES.USER.SETTINGS,
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
