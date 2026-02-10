import type { AuthConfirmServiceOutput, AuthCookies } from "./types.js";

import {
    findAuthTokens,
    findUserById,
    updateSession,
} from "../controller/index.js";

export async function confirmAuthService(
    cookies: AuthCookies,
): Promise<AuthConfirmServiceOutput | null> {
    const response = await findAuthTokens(cookies.csrfToken, cookies.sessionId);

    if (!response?.userID) {
        return null;
    }

    const userId = response.userID;
    const [{ newCsrfToken, sessionId }, person] = await Promise.all([
        updateSession(userId, response.csrf),
        findUserById(userId.toString()),
    ]);

    if (!person) {
        return null;
    }

    return {
        newCsrfToken,
        sessionId,
        user: person.username,
    };
}
