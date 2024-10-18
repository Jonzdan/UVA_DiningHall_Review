const crypto = require('crypto');
const tokenSchema = require('./models/token');

const CSRF_HEX_BYTE_LENGTH = 64;
const SESSION_HEX_BYTE_LENGTH = 128;

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
    );
    return sessionId;
}

export { updateSession, updateCSRF };