import type { IUserRequest } from "src/types/request.js";

import { HttpStatusCode } from "axios";
import { Router } from "express";
import { SUBROUTES } from "hoorank-shared";
import { updateCSRF } from "src/services/index.js";

import { refreshAuth, setCSRFCookie } from "./utils.js";

export const authRouter = Router();
authRouter.get(
    SUBROUTES.AUTH.REFRESH,
    async (req: IUserRequest, res): Promise<void> => {
        if (!req.cookies.CSRF_TOKEN || !req.signedCookies.SESSION_ID) {
            res.header(
                "Content-Security-Policy",
                "default-src 'self'; style-src 'self', 'unsafe-inline'",
            );
            setCSRFCookie(res, await updateCSRF());
            res.status(HttpStatusCode.NoContent).end();
            return;
        }

        await refreshAuth(
            {
                csrfToken: req.cookies.CSRF_TOKEN,
                sessionId: req.signedCookies.SESSION_ID,
            },
            res,
        );
    },
);
