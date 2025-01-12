const crypto = require('crypto');
const tokenSchema = require('./models/token');

const CSRF_HEX_BYTE_LENGTH = 64;
const SESSION_HEX_BYTE_LENGTH = 128;

async function updateCSRF() {
    let csrfToken = crypto.randomBytes(CSRF_HEX_BYTE_LENGTH).toString('hex');
    let csrfTokenExists = await (async () => {
        try {
            return await tokenSchema.find({
                csrf_token: csrfToken,
            });
        } catch (error) {
            console.log("Failed CSRF Validation", error);
            return null;
        }
    })();
    while (csrfTokenExists && csrfTokenExists.length > 0) {
        csrfToken = crypto.randomBytes(CSRF_HEX_BYTE_LENGTH).toString('hex');
        csrfTokenExists = await (async () => {
            try {
                return await tokenSchema.find({
                    csrf_token: csrfToken,
                });
            } catch (error) {
                console.log("Failed CSRF Validation", error);
                return null;
            }
        })();
    }
    const tokenObject = {
        csrf_token: csrfToken,
    };
    const newToken = new tokenSchema(tokenObject);
    await newToken.save();
    return csrfToken;
}

async function updateSession(user, csrfToken) {
    let sessionId = crypto.randomBytes(SESSION_HEX_BYTE_LENGTH).toString('hex');
    let sessionIdExists = await tokenSchema.find({
        session_token: sessionId,
    });
    while (sessionIdExists.length > 0) {
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

function compareFunctionRuntimes(function1, args1, function2, args2, iterations=1) {
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        function1(...args1);
    }
    let end = performance.now();
    const function1Time = (end - start) / iterations;

    start = performance.now();
    for (let j = 0; j < iterations; j++) {
        function2(...args2);
    }
    end = performance.now();
    const function2Time = (end - start) / iterations;

    console.log(`Average time for function1: ${function1Time.toFixed(4)} ms`);
    console.log(`Average time for function2: ${function2Time.toFixed(4)} ms`);
}

module.exports = { updateSession, updateCSRF, compareFunctionRuntimes };