import { UserSettingsApi } from "hoorank-shared";

export const SettingTabTypes = {
    PROFILE: 'Profile',
    NOTIFICATIONS: 'Notification',
    PASSWORD: 'Password',
    LOGOUT: 'Logout'
} as const;

export type CurrentSelectedSettingTab =
    Exclude<(typeof SettingTabTypes)[keyof typeof SettingTabTypes], 'Logout'>;

type BooleanLeafKeys<T> = {
  [K in keyof T]:
    [NonNullable<T[K]>] extends [boolean]
      ? K
      : NonNullable<T[K]> extends object
        ? NonNullable<T[K]> extends readonly any[]
          ? never
          : BooleanLeafKeys<NonNullable<T[K]>>
        : never
}[keyof T];

export type NestedToggleSettingKeys = NonNullable<BooleanLeafKeys<UserSettingsApi>>;

type BooleanLeafPaths<
  T,
  Prefix extends string = ''
> = {
  [K in keyof T]:
    [NonNullable<T[K]>] extends [boolean]
      ? Prefix extends ''
        ? Extract<K, string>
        : `${Prefix}.${Extract<K, string>}`
      : NonNullable<T[K]> extends object
        ? NonNullable<T[K]> extends readonly any[]
          ? never
          : BooleanLeafPaths<
              NonNullable<T[K]>,
              Prefix extends ''
                ? Extract<K, string>
                : `${Prefix}.${Extract<K, string>}`
            >
        : never
}[keyof T];

export type ToggleSettingsKeys = NonNullable<BooleanLeafPaths<UserSettingsApi>>;
export type ToggleMapState = Partial<Record<ToggleSettingsKeys, boolean>>;
