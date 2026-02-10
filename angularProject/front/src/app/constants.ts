export const ROUTE_PATHS = {
    HOME: '',
    LOGIN: 'login',
    REGISTER: 'register',
    ABOUT_US: 'aboutus',
    REVIEWS: 'reviews',
    SETTINGS: 'settings',
    NOT_FOUND: '**',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
