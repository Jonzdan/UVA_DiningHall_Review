import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { newcombRouter, ohillRouter, runkRouter, userRouter } from './routes';
import { updateCSRF, updateSession, findToken, findUserById, CSRF_TOKEN, SESSION_ID } from './services';
import { HttpStatusCode } from 'axios';

dotenv.config();
const app = express();

if (!process.env['DATABASE_URL'] || !process.env['COOKIE_PARSER_SECRET']) {
    throw new Error();
}

const mongodbDriver = await mongoose.connect(process.env['DATABASE_URL']);
const db = mongodbDriver.connection;
db.on('error', (error) => { console.error(error) });
db.once('open', () => { console.log('Connected') });

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env['COOKIE_PARSER_SECRET']));

// 1000 ms * 60s * 60m * 24h
const TOKEN_AGE = 86_400_000;

app.get("/authConfirm", async (req, res): Promise<void> => {
    if (req.cookies.CSRF_TOKEN && req.signedCookies.SESSION_ID && Object.keys(req.signedCookies.SESSION_ID).length > 0) {
        const response = await findToken(req.cookies.CSRF_TOKEN, req.signedCookies.SESSION_ID);

        if (response?.length !== 1 || !response[0]?.userID) {
            res.clearCookie(CSRF_TOKEN);
            res.clearCookie(SESSION_ID);
            res.status(HttpStatusCode.BadRequest).end();
            return;
        }
        
        const userId = response[0].userID;
        const csrfToken = await updateCSRF();
        const sessionId = await updateSession(userId, csrfToken);
        const person = await findUserById(userId);

        if (!person.length) {
            res.status(HttpStatusCode.Unauthorized).end();
            return;
        }

        res.cookie(SESSION_ID, sessionId, {
            sameSite: 'strict',
            httpOnly: true,
            maxAge:   TOKEN_AGE,
            signed:   true,
        });

        res.cookie(CSRF_TOKEN, csrfToken, {
            sameSite: 'strict',
            maxAge:   TOKEN_AGE
        });

        res.status(HttpStatusCode.Ok).json({
            username: person[0]!.username,
        }).end();
    } else {
        res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'")
        res.cookie(CSRF_TOKEN, await updateCSRF(), {
            sameSite: 'strict',
            maxAge:   TOKEN_AGE
        })
        res.status(HttpStatusCode.NoContent).end();
    }
})

app.use('/api/runk', runkRouter);
app.use('/api/ohill', ohillRouter);
app.use('/api/newcomb', newcombRouter);
app.use('/user', userRouter);

app.listen(process.env['PORT'] || 4000);

