import {
    CSRF_TOKEN,
    SESSION_ID,
    findToken,
    findUserById,
    generateCSRF,
    sanitizeHtml,
    updateCSRF,
    updateSession,
} from "./services/index.js";
import { connectToMongo, setCSRFCookie, setSessionCookie } from "./utils.js";
import {
    newcombRouter,
    ohillRouter,
    runkRouter,
    userRouter,
} from "./routes/index.js";
import { HttpStatusCode } from "axios";
import type { IUserRequest } from "./types/index.js";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const app = express();

if (!process.env["DATABASE_URL"] || !process.env["COOKIE_PARSER_SECRET"]) {
    throw new Error();
}

await connectToMongo();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env["COOKIE_PARSER_SECRET"]));
app.use(sanitizeHtml);

app.get("/authConfirm", async (req: IUserRequest, res): Promise<void> => {
    if (
        req.cookies.CSRF_TOKEN &&
        req.signedCookies.SESSION_ID &&
        Object.keys(req.signedCookies.SESSION_ID).length > 0
    ) {
        const response = await findToken(
            req.cookies.CSRF_TOKEN,
            req.signedCookies.SESSION_ID,
        );

        if (response?.length !== 1 || !response[0]?.userID) {
            res.clearCookie(CSRF_TOKEN);
            res.clearCookie(SESSION_ID);
            res.status(HttpStatusCode.BadRequest).end();
            return;
        }

        const userId = response[0].userID;
        const { csrfToken, sessionId } = await updateSession(
            userId,
            generateCSRF(),
        );
        const person = await findUserById(userId);

        if (!person[0]) {
            res.status(HttpStatusCode.Unauthorized).end();
            return;
        }

        setSessionCookie(res, sessionId);
        setCSRFCookie(res, csrfToken);

        res.status(HttpStatusCode.Ok)
            .json({
                username: person[0].username,
            })
            .end();
    } else {
        res.header(
            "Content-Security-Policy",
            "default-src 'self'; style-src 'self', 'unsafe-inline'",
        );
        setCSRFCookie(res, await updateCSRF());
        res.status(HttpStatusCode.NoContent).end();
    }
});

app.use("/api/runk", runkRouter);
app.use("/api/ohill", ohillRouter);
app.use("/api/newcomb", newcombRouter);
app.use("/user", userRouter);

app.listen(process.env["PORT"] ?? 4000, () => {
    console.log(
        `Server running on http://localhost:${process.env["PORT"] ?? "4000"}`,
    );
});
