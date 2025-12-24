import {
    sanitizeHtml,
} from "./validations/index.js";
import { NEWCOMB_API, OHILL_API, ROUTES, RUNK_API, USER_API } from "hoorank-shared";
import { confirmAuthSessionHandler, connectToMongo, setCSRFCookie } from "./utils.js";
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
import { updateCSRF } from "./services/controller/index.js";

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

app.get(ROUTES.CONFIRM_AUTH, async (req: IUserRequest, res): Promise<void> => {
    if (
        req.cookies.CSRF_TOKEN &&
        req.signedCookies.SESSION_ID
    ) {
        await confirmAuthSessionHandler(req, res);
    } else {
        res.header(
            "Content-Security-Policy",
            "default-src 'self'; style-src 'self', 'unsafe-inline'",
        );
        setCSRFCookie(res, await updateCSRF());
        res.status(HttpStatusCode.NoContent).end();
    }
});

app.use(RUNK_API, runkRouter);
app.use(OHILL_API, ohillRouter);
app.use(NEWCOMB_API, newcombRouter);
app.use(USER_API, userRouter);

app.listen(process.env["PORT"] ?? 4000, () => {
    console.log(
        `Server running on http://localhost:${process.env["PORT"] ?? "4000"}`,
    );
});
