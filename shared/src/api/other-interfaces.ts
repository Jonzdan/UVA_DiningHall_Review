export interface AuthConfirmOutput {
    username?: string;
}

export interface UserLoginOutput {
    username: string;
    pictureB64?: string;  
}

export const DiningHallsEnum = {
    Runk: "Runk",
    Ohill: "Ohill",
    Newcomb: "Newcomb",
} as const;

export type DiningHalls =
    (typeof DiningHallsEnum)[keyof typeof DiningHallsEnum];
