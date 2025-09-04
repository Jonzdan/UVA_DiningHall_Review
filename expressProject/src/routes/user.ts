import { HttpStatusCode } from 'axios';
import { Router} from 'express';
import { csrf, blockLoggedInUsers, blockLoggedOutUsers, CSRF_TOKEN_HEADER, findHeader, SESSION_ID, CSRF_TOKEN, validateBody, createUserWithDefaults, findUserWithQuery, resetTokens, updateSession, updateUserSettings, findUserByBasicAuth, findUserByEmailOrUser } from 'src/services';
import { loginSchema, signupSchema, updateUserApiSchema } from '@shared/api';
import { mongoSanitizerMiddleware } from 'src/utils';

export const userRouter = Router();
userRouter.use(csrf);

userRouter.post('/register', validateBody(signupSchema), blockLoggedInUsers, async (req, res) => {
    const { email, user, password } = req.body;
    try {
        const existingUser = await findUserByEmailOrUser(user, password);

        if (existingUser.length) {
            return res.status(HttpStatusCode.Conflict).end();
        }

        await createUserWithDefaults(email, user, password);
        return res.status(HttpStatusCode.Created).end();
    }
    catch (err) {
        console.error(err);
        return res.status(HttpStatusCode.InternalServerError).end();
    }
})

userRouter.post('/login', validateBody(loginSchema), blockLoggedInUsers, async (req, res) => {
    const { user, password }  = req.body;

    const existingUser = await findUserByBasicAuth(user, password);
    
    if (!existingUser) {
        return res.status(HttpStatusCode.BadRequest).end();
    }

    const userId = existingUser._id;
    
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const csrfToken = findHeader(req.headers, CSRF_TOKEN_HEADER)!;
    const sessionId = await updateSession(userId, csrfToken);

    res.cookie(SESSION_ID, sessionId, {
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 1000*60*60*6,
        signed: true,
    });

    // TODO: Set this as a shared API interface
    return res.status(HttpStatusCode.Ok).json({
        username: existingUser?.username,
        picture:  existingUser?.profile?.picture,
    });
});

userRouter.post('/signOut', blockLoggedOutUsers, async(req, res) => {
    const sessionId: string = req.signedCookies[SESSION_ID];
    const csrf: string = req.cookies[CSRF_TOKEN];

    const newCSRFToken = await resetTokens(sessionId, csrf);

    res.clearCookie(CSRF_TOKEN);
    res.clearCookie(SESSION_ID);

    res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'");
    res.cookie(CSRF_TOKEN, newCSRFToken, {
        sameSite: 'strict',
        maxAge:   1000*60*60*6,
    });
    return res.status(HttpStatusCode.NoContent).end();
});

userRouter.get('/settings', blockLoggedOutUsers, async(req, res) => {
    const user = await findUserWithQuery(
        {
            _id:      req.userId
        },
        {
            _id:      0,  // Internal MongoDB ID field
            password: 0,
            __v:      0,  // Internal MongoDB Version Number
        }
    );

    if (!user.length) {
        return res.status(HttpStatusCode.Unauthorized).end();
    } else {
        return res.status(HttpStatusCode.Ok).json(user);
    }
});

userRouter.put('/settings', validateBody(updateUserApiSchema), blockLoggedOutUsers, mongoSanitizerMiddleware, async(req, res) => {
    const { email } = req.body;
    if (email) {
        /**
         * TODO: Send an email for 2-step verification
         */
    }

    try {
        await updateUserSettings(req);
        res.status(HttpStatusCode.NoContent).end(); 
    }
    catch (err) {
        console.error('/PUT; path:"settings" failed', err);
        res.status(HttpStatusCode.InternalServerError).end();
    }
});
