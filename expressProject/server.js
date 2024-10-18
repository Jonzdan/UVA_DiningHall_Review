require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const runkRouter = require('./routes/api/runk');
const ohillRouter = require('./routes/api/ohill');
const newcombRouter = require('./routes/api/newcomb');
const userRouter = require('./routes/user');
const tokenSchema = require('./models/token');
const userSchema = require('./models/user');

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected'));

// app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

const CSRF_HEX_BYTE_LENGTH = 64;
const SESSION_HEX_BYTE_LENGTH = 128;
const REFRESH_CSRF_SUCCESS_CODE = '1110111';
const TOKEN_AGE = 1000*60*60*64;

app.post("/authConfirm", async (req, res)=> {
    if (Object.keys(req.body).length !== 0) {
        res.status(402).end();
        return;
    }
    if (req.cookies.CSRF_TOKEN !== undefined) {
        if (req.signedCookies.SESSION_ID === undefined) {
            res.status(400).json("Unauthorized");
            return;
        }
        const response = await tokenSchema.find({
            session_token: req.signedCookies.SESSION_ID,
            csrf_token:    req.cookies.CSRF_TOKEN,
        });

        if (Object.keys(response).length != 1) {
            res.status(400).end("Error Detected");
            return;
        }

        if (response[0].userID === undefined) {
            res.status(400).end("Cannot identify user.");
            return;
        }
        
        const user = response[0].userID;

        const csrfToken = await updateCSRF();
        const sessionId = await updateSession();
        const person = await userSchema.find({
            _id: user
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
        const csrfToken = await updateCSRF()
        res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'")
        res.cookie('CSRF_TOKEN', csrfToken, {
            sameSite: 'strict',
            maxAge: TOKEN_AGE, 
            expires: TOKEN_AGE,
        })
        res.status(200).json(REFRESH_CSRF_SUCCESS_CODE);
    }
})

async function updateCSRF() {
    let csrfToken = crypto.randomBytes(CSRF_HEX_BYTE_LENGTH).toString('hex');
    let csrfTokenExists = await tokenSchema.find({csrf_token: csrfToken});
    while (Object.keys(csrfTokenExists).length > 0) {
        csrfToken = crypto.randomBytes(CSRF_HEX_BYTE_LENGTH).toString('hex');
        csrfTokenExists = await tokenSchema.find({csrf_token: csrfToken});
    }
    const tokenObject = {
        csrf_token: csrfToken,
    };
    const newToken = new tokenSchema(tokenObject);
    await newToken.save();
    return csrfToken;
}

async function updateSession() {
    let sessionId = crypto.randomBytes(SESSION_HEX_BYTE_LENGTH).toString('hex');
    let sessionIdExists = await tokenSchema.find({
        session_token: sessionId,
    });
    while (Object.keys(sessionIdExists).length > 0) {
        sessionId = crypto.randomBytes(SESSION_HEX_BYTE_LENGTH).toString('hex');
        sessionIdExists = await tokenSchema.find({
            session_token: sessionId,
        });
    }
    await tokenSchema.findOneAndUpdate(
        {
            userID: user,
        },
        {
            session_token: sessionId,
            csrf_token:    csrfToken,
        }
    )
    return sessionId
}

app.use('/api/runk', runkRouter);
app.use('/api/ohill', ohillRouter);
app.use('/api/newcomb', newcombRouter);
app.use('/user', userRouter);

app.listen(process.env.PORT || 4000);

