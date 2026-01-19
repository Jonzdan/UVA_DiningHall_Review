export interface AuthConfirmServiceOutput {
    readonly newCsrfToken: string;
    readonly sessionId: string;
    readonly user: string;
}

export interface AuthCookies {
    readonly csrfToken?: string;
    readonly sessionId?: string;
}
