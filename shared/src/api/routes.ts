const DEFAULT_ROUTE = '/';
const CONFIRM_AUTH = '/refresh';
const PREFIX = {
    AUTH: '/auth',
    API: {
        BASE: '/api',
        RUNK: '/runk',
        OHILL: '/ohill',
        NEWCOMB: '/newcomb',
    },
    USER: '/user',
} as const;

const USER = {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    SETTINGS: '/settings',
} as const;

const OHILL = {
    DEFAULT_ROUTE,
} as const;

const RUNK = {
    DEFAULT_ROUTE,
} as const;

const NEWCOMB = {
    DEFAULT_ROUTE,
} as const;

export const OHILL_API = `${PREFIX.API.BASE}${PREFIX.API.OHILL}` as const;
export const NEWCOMB_API = `${PREFIX.API.BASE}${PREFIX.API.NEWCOMB}` as const;
export const RUNK_API = `${PREFIX.API.BASE}${PREFIX.API.RUNK}` as const;
export const USER_API = PREFIX.USER;
export const AUTH_API = PREFIX.AUTH;

export const ROUTES = {
    DEFAULT_ROUTE,
    AUTH: {
        REFRESH: CONFIRM_AUTH
    },
    API: {
        OHILL: OHILL.DEFAULT_ROUTE,
        RUNK: RUNK.DEFAULT_ROUTE,
        NEWCOMB: NEWCOMB.DEFAULT_ROUTE,
    },
    USER: {
        REGISTER: USER.REGISTER,
        LOGIN: USER.LOGIN,
        LOGOUT: USER.LOGOUT,
        SETTINGS: USER.SETTINGS,
    }
} as const;
