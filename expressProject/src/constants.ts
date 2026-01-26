export const CSRF_HEX_BYTE_LENGTH = 32;
export const SESSION_HEX_BYTE_LENGTH = 64;
export const SESSION_ID = "SESSION_ID";
export const CSRF_TOKEN = "CSRF_TOKEN";
export const CSRF_TOKEN_HEADER = "h_csrf_token";
export const SALT_ROUNDS = 12;
/**
 * 1000ms * 60s * 5m
 */
export const SESSION_REFRESH_WINDOW = 300_000;
// 1000 ms * 60s * 30m
export const TOKEN_AGE = 1_800_000;
