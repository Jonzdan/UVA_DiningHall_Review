const express = require('express');
const { db } = require('../models/user');
const router = express.Router();
const userSchema = require('../models/user');
const { csrf, validateFields, loggedIn_Or_Not, loggedOut_Or_Not, validateFieldsReset } = require('../auth');
const tokenSchema = require('../models/token');
const { updateCSRF, updateSession } = require('../util');

const REGISTER_SUCCESS_RETURN_BODY = "DONE";
const EMAIL_EXISTS_CODE = "001";
const USER_AND_EMAIL_EXISTS_CODE = "110";
const USER_EXISTS_CODE = "010";
const INVALID_LOGIN_CODE = "01101111011101";
const SESSION_TOKEN_NAME = "SESSION_ID";
const CSRF_TOKEN_NAME = "CSRF_TOKEN";

router.use(csrf);
router.post('/register', [validateFields, loggedIn_Or_Not], async(req, res) => {
    const data = req.body;
    try {
        const existingUser$ = await userSchema.find({
            $or: 
            [
                {
                    email: data.email
                },
                {
                    username: data.user
                }
            ]
        })
        if (existingUser$ && Object.keys(existingUser$).length === 0) {
            const userObj = {
                email:    data.email,
                username: data.user,
                password: data.firstPass,
                profile: {
                    bannerColor:     "default",
                    remainAnonymous: false,
                },
                notifications: {
                    ohill_opt_in:        true,
                    runk_opt_in:         true,
                    newcomb_opt_in:      true,
                    opt_in_whenToNotify: [],
                    food_opt_in_bol:     true,
                    food_opt_in_val:     [],
                    reply_to_post:       true

                },
                dateJoined: new Date(),
            }
            const newUser = new userSchema(userObj);
            newUser.save();
            res.json(REGISTER_SUCCESS_RETURN_BODY);
        }
        else {
            let code;
            if (existingUser$.length > 1 || (existingUser$[0].email === data.email && existingUser$[0].username === data.user)) {
                code = USER_AND_EMAIL_EXISTS_CODE;
            } else if (existingUser$[0].email === data.email) {
                code = EMAIL_EXISTS_CODE;
            } else if (existingUser$[0].username === data.user) {
                code = USER_EXISTS_CODE;
            } else {
                console.log(data);
                throw new Error({
                    msg: "Unknown Data",
                });
            }
            res.status(403).json({
                code: code,
            });
        }
    }
    catch (err) {
        console.log(err);
    }
})

router.post('/login', [validateFields, loggedIn_Or_Not] , async(req, res) => {
    const data = req.body;
    const foundUser$ = await (async () => {
        try {
            return await userSchema.find({
                username: data.user,
                password: data.password,
            });
        } catch (error) {
            console.log("Unable to authorize user", error);
            return null;
        }
    })();
    if (foundUser$ && Object.keys(foundUser$).length === 1) {
        const result = await (async () => {
            try {
                return await tokenSchema.find({
                    csrf_token: req.headers.h_csrf_token,
                });
            } catch (error) {
                console.log("Invalid authentication tokens", error);
                return null;
            }
        })();
        if (!result || Object.keys(result).length > 1) {
            res.status(403).json({
                message: "Invalid CSRF"
            }).end(); 
            return;
        }
        const tokenID = result[0]._id;
        const userQuery = result[0].userID;
        const sessionId = await updateSession(userQuery, req.headers.h_csrf_token);
        if (!userQuery) {
            try {
                await tokenSchema.findOneAndUpdate(
                    {
                        csrf_token: req.headers.h_csrf_token,
                    },
                    {
                        session_token: sessionId,
                        userID:        foundUser$[0]._id,
                    }
                );
            } catch (error) {
                console.log("Could not update authentication", error);
            }
            res.cookie('SESSION_ID', sessionId, {
                sameSite: 'strict',
                httpOnly: true,
                maxAge: 1000*60*60*6,
                expires: 1000*60*60*6,
                signed: true,
            });
            res.status(200).json({
                username: foundUser$[0].username,
                picture:  foundUser$[0].profile.picture,
            });
            return;
        }
        if (userQuery.equals(foundUser$[0]._id)) {
            try {
                await tokenSchema.findOneAndUpdate(
                    {
                        userID: foundUser$[0]._id,
                        csrf_token: req.headers.h_csrf_token,
                    },
                    {
                        session_token: sessionId,
                    }
                );
            } catch (err) {
                console.log("Failed to update tokens in login", err);
            }
            res.cookie('SESSION_ID', sessionId, {
                sameSite: 'strict',
                httpOnly: true,
                maxAge: 1000*60*60*6,
                signed: true,
            });
            res.status(200).json({
                username: foundUser$[0].username,
                picture: foundUser$[0].profile.picture,  // *TODO*: Remove this
            });
        }
        else {
            res.status(403).json({
                message: "Invalid CSRF",
            }).end();
            return; 
        }
    }
    else {
        res.status(401).json({
            code: INVALID_LOGIN_CODE,
        })
    }
})

router.post('/signOut', loggedOut_Or_Not, async(req, res) => {
    const data = req.body;
    const sessionId = req.signedCookies.SESSION_ID;
    const csrf = req.cookies.CSRF_TOKEN;
    if (!csrf || !sessionId || Object.keys(sessionId).length === 0) {
        res.status(401).end();
        return; 
    }
    const response = await (async () => {
        try {
            return await tokenSchema.find({
                session_token: sessionId,
                csrf_token:    csrf,
            });
        } catch (error) {
            console.log(error);
            return null;
        }    
    })();
    
    if (!response || Object.keys(response).length === 0 ) {
        res.status(401).end('Failed Authentication');
        return;
    }

    const user = await (async () => {
        try {
            return await userSchema.find({
                _id:      response[0].userID,
                username: data.username
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    })();

    if (Object.keys(user).length === 0 || response[0].userID === undefined || user[0].username !== data.username) {
        res.status(401).end();
        return;
    }
    try {
        await tokenSchema.findOneAndUpdate(
            {
                session_token: sessionId,
                csrf_token:    csrf,
            },
            {
                $unset: {
                    userID:        '',
                    session_token: '',
                    csrf_token:    '',
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
    res.clearCookie(CSRF_TOKEN_NAME);
    res.clearCookie(SESSION_TOKEN_NAME);
    const newCSRFToken = await updateCSRF();
    const tokenObject = {
        csrf_token: newCSRFToken,
    }
    const newToken = new tokenSchema(tokenObject);
    await newToken.save();
    res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'");
    res.cookie(CSRF_TOKEN_NAME, newCSRFToken, {
        sameSite: 'strict',
        maxAge:   1000*60*60*6,
        expires:  1000*60*60*6,
    });
    res.status(200).json({
        msg: "Signed Out Successfully"
    });
    
})

router.post('/settings', loggedOut_Or_Not, async(req, res) => {
    const data = req.body;
    const sessionId = req.signedCookies.SESSION_ID;
    const csrf = req.cookies.CSRF_TOKEN;
    if (!sessionId || !csrf || Object.keys(sessionId).length === 0) {
        res.status(401).end("Cannot find authentication tokens");
        return;
    }
    const response = await tokenSchema.find({
        session_token: sessionId,
        csrf_token:    csrf,
    });
    if (Object.keys(response).length === 0 ) {
        res.status(401).end('Failed Authentication');
        return;
    }
    const user = await userSchema.find(
        {
            _id:      response[0].userID,
            username: data.username,
        },
        // Field: 0 -> Do not include field in query result
        {
            _id:      0,  // Internal MongoDB ID field
            password: 0,
            __v:      0,  // Internal MongoDB Version Number
        }
    );
    if (Object.keys(user).length === 0 || response[0].userID === undefined || user[0].username !== data.username) {
        res.status(401).end();
        return;
    }
    else {
        res.status(200).json(user);
    }
})

router.post('/updateSettings', loggedOut_Or_Not, async(req, res) => {
    const data = req.body;
    const sessionId = req.signedCookies.SESSION_ID;
    const csrf = req.cookies.CSRF_TOKEN;
    if (!sessionId || !csrf || Object.keys(sessionId).length === 0) {
        res.status(401).end("Cannot find authentication tokens");
        return;
    }
    const response = await tokenSchema.find({
        session_token: sessionId,
        csrf_token:    csrf,
    });
    if (Object.keys(response).length === 0 ) {
        res.status(401).end('Failed Authentication');
        return;
    }
    const user = await userSchema.find(
        {
            _id:      response[0].userID,
            username: data.username,
        },
        {
            _id: 0,
        },
    );
    if (Object.keys(user).length === 0 || response[0].userID === undefined || user[0].username !== data.username) {
        res.status(401).end();
        return;
    }
    else {
        const foundUser$ = user[0];
        const updateObj = {};
        for (const prop of Object.keys(data)) {
            if (data[prop] instanceof Object) {
                for (const key in data[prop]) {
                    if (foundUser$[prop] === undefined || foundUser$[prop][key] === undefined) {
                        res.status(401).end();
                        return;
                    }
                    updateObj[`${prop}.${key}`] = data[prop][key];
                }
            } else {
                if (prop === "username" || prop === "dateJoined") continue;
                if (prop !== 'firstPass' && prop !== 'secondPass' && foundUser$[prop] === undefined) {
                    res.status(401).end();
                    return;
                }
                if (prop === "email") {  //*TODO*: Send email to target email as verification step

                }
                else if (prop === "password") {
                    if (foundUser$[prop] !== data[prop]) {
                        res.status(401).end("Invalid Password Given");
                        return;
                    }
                    codes = validateFieldsReset(data[prop], data['firstPass'], data['secondPass'])
                    if (Object.keys(codes).length !== 0) {
                        res.status(401).end("Unahotira");
                        return;
                    }
                    if (data['secondPass'] == foundUser$[prop]) {
                        res.status(401).end("Same Password");
                        return;
                    }
                    updateObj[prop] = data['secondPass'];
                    continue;
                }

                updateObj[prop] = data[prop];
            }
        }
        try {
            await userSchema.findOneAndUpdate(
                {
                    session_token: sessionId,
                    csrf_token:    csrf,
                    username:      data.username,
                },
                {
                    $set: updateObj,
                }
            );
            res.status(200).json("DONE"); 
        }
        catch (err) {
            throw err;
        }
    }
})

module.exports = router;

