require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const runkRouter = require('./routes/api/runk');
const ohillRouter = require('./routes/api/ohill');
const newcombRouter = require('./routes/api/newcomb');
const userRouter = require('./routes/user');
const tokenSchema = require('./models/token');
const userSchema = require('./models/user');
const { updateCSRF, updateSession } = require('./util');
const { CSRF_TOKEN_NAME, SESSION_TOKEN_NAME } = require('./routes/user');

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected'));

// app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

const REFRESH_CSRF_SUCCESS_CODE = '1110111';
const TOKEN_AGE = 1000*60*60*64;

app.post("/authConfirm", async (req, res) => {
    if (Object.keys(req.body).length !== 0) {
        res.status(402).end();
        return;
    }
    if (req.cookies.CSRF_TOKEN && req.signedCookies.SESSION_ID && Object.keys(req.signedCookies.SESSION_ID).length > 0) {
        const response = await tokenSchema.find({
            session_token: req.signedCookies.SESSION_ID,
            csrf_token:    req.cookies.CSRF_TOKEN,
        });

        if (Object.keys(response).length != 1) {
            res.clearCookie(CSRF_TOKEN_NAME);
            res.clearCookie(SESSION_TOKEN_NAME);
            res.status(400).end("Error Detected");
            return;
        }

        if (response[0].userID === undefined) {
            res.clearCookie(CSRF_TOKEN_NAME);
            res.clearCookie(SESSION_TOKEN_NAME);
            res.status(400).end("Cannot identify user.");
            return;
        }
        
        const user = response[0].userID;

        const csrfToken = await updateCSRF();
        const sessionId = await updateSession(user, csrfToken);
        const person = await userSchema.find({
            _id: user,
        });
        if (Object.keys(person).length === 0) {
            res.status(401).end();
            return;
        }
        res.cookie('SESSION_ID', sessionId, {
            sameSite: 'strict',
            httpOnly: true,
            maxAge:   TOKEN_AGE,
            signed:   true,
        });
        res.cookie('CSRF_TOKEN', csrfToken, {
            sameSite: 'strict',
            maxAge:   TOKEN_AGE,
            expires:  TOKEN_AGE,
        });
        res.status(200).json({
            username: person[0].username,
        });
    } else {
        const csrfToken = await updateCSRF();
        res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'")
        res.cookie('CSRF_TOKEN', csrfToken, {
            sameSite: 'strict',
            maxAge:   TOKEN_AGE,
            expires:  TOKEN_AGE,
        })
        res.status(200).json(REFRESH_CSRF_SUCCESS_CODE);
    }
})

//app.use('/api/runk', runkRouter);
app.use('/api/ohill', ohillRouter);
app.use('/api/newcomb', newcombRouter);
app.use('/user', userRouter);

app.listen(process.env.PORT || 4000);

