export const AuthConfirmOutputFields = {
    username: "username",
} as const;

export const UserLoginOutputFields = {
    username: "username",
    pictureB64: "pictureB64",
} as const;

export type AuthConfirmOutputField = (typeof AuthConfirmOutputFields)[keyof typeof AuthConfirmOutputFields];
export type UserLoginOutputField = (typeof UserLoginOutputFields)[keyof typeof UserLoginOutputFields];

export interface AuthConfirmOutput {
    [AuthConfirmOutputFields.username]?: string;
}

export interface UserLoginOutput {
    [UserLoginOutputFields.username]: string;
    [UserLoginOutputFields.pictureB64]?: string;  
}

export const DiningHallsEnum = {
    Runk: "Runk",
    Ohill: "Ohill",
    Newcomb: "Newcomb",
} as const;

export type DiningHalls =
    (typeof DiningHallsEnum)[keyof typeof DiningHallsEnum];
