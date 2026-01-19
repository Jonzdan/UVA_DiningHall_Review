import type { IUserRequest } from "src/types/request.js";

import { HttpStatusCode } from "axios";
import { Router } from "express";
import { type AuthConfirmOutput, ROUTES } from "hoorank-shared";
import { CSRF_TOKEN, SESSION_ID } from "src/constants.js";
import { confirmAuthService, updateCSRF } from "src/services/index.js";

import { setCSRFCookie, setSessionCookie } from "./utils.js";

export const authRouter = Router();
authRouter.get(
    ROUTES.AUTH.REFRESH,
    async (req: IUserRequest, res): Promise<void> => {
        if (req.cookies.CSRF_TOKEN && req.signedCookies.SESSION_ID) {
            const result = await confirmAuthService({
                csrfToken: req.cookies.CSRF_TOKEN,
                sessionId: req.signedCookies.SESSION_ID,
            });

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
        } else {
            res.header(
                "Content-Security-Policy",
                "default-src 'self'; style-src 'self', 'unsafe-inline'",
            );
            setCSRFCookie(res, await updateCSRF());
            res.status(HttpStatusCode.NoContent).end();
        }
    },
);
