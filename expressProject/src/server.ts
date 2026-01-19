import {
    AUTH_API,
    NEWCOMB_API,
    OHILL_API,
    RUNK_API,
    USER_API,
} from "hoorank-shared";
import {
    authRouter,
    newcombRouter,
    ohillRouter,
    runkRouter,
    userRouter,
} from "./routes/index.js";
import { connectToMongo, sanitizeHtml } from "./utils.js";
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

app.use(RUNK_API, runkRouter);
app.use(OHILL_API, ohillRouter);
app.use(NEWCOMB_API, newcombRouter);
app.use(USER_API, userRouter);
app.use(AUTH_API, authRouter);

app.listen(process.env["PORT"] ?? 4000, () => {
    console.log(
        `Server running on http://localhost:${process.env["PORT"] ?? "4000"}`,
    );
});
