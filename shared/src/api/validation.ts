import { z } from 'zod';
import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from './constants';

/**
 * TODO: On update to zod v4, set error property instead of message
 */
export const FormValidationErrorCodes = {
    MISSING_FIELDS:     'MISSING_FIELDS',
    WHITESPACE_PRESENT: 'WHITESPACE_PRESENT',
    USERNAME_TOO_SHORT: 'USERNAME_TOO_SHORT',
    USERNAME_TOO_LONG:  'USERNAME_TOO_LONG',
    EMAIL_INVALID:      'EMAIL_INVALID',
    PASSWORD_TOO_WEAK:  'PASSWORD_TOO_WEAK',
    PASSWORDS_DONT_MATCH: 'PASSWORDS_DONT_MATCH'
} as const;

export const AuthFieldEnum = {
    email: "email",
    user: "user",
    password: "password",
    confirmPassword: "confirmPassword",
    oldPassword: "oldPassword",
} as const;

export type AuthFields = keyof (typeof AuthFieldEnum);

export const passwordSchema = z.string()
  .min(MIN_PASSWORD_LENGTH, { message: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .max(MAX_PASSWORD_LENGTH, { message: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .regex(/[A-Z]/, { message: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .regex(/\d/, { message: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .regex(/^\S+$/, { message: FormValidationErrorCodes.WHITESPACE_PRESENT });

export const emailSchema = z.string().email({ message: FormValidationErrorCodes.EMAIL_INVALID });

export const usernameSchema = z.string()
  .min(MIN_USERNAME_LENGTH, { message: FormValidationErrorCodes.USERNAME_TOO_SHORT })
  .max(MAX_USERNAME_LENGTH, { message: FormValidationErrorCodes.USERNAME_TOO_LONG })
  .regex(/^\S+$/, { message: FormValidationErrorCodes.WHITESPACE_PRESENT });
  
const signupBase = z.object({
  [AuthFieldEnum.email]: emailSchema,
  [AuthFieldEnum.user]: usernameSchema,
  [AuthFieldEnum.password]: passwordSchema,
  [AuthFieldEnum.confirmPassword]: passwordSchema,
});

export const signupSchema = signupBase.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: [AuthFieldEnum.confirmPassword],
    message: FormValidationErrorCodes.PASSWORDS_DONT_MATCH,
  }
);

export const loginSchema = z.object({
  [AuthFieldEnum.user]: usernameSchema,
  [AuthFieldEnum.password]: passwordSchema,
});

const resetBase = z.object({
  [AuthFieldEnum.oldPassword]: passwordSchema,
  [AuthFieldEnum.password]: passwordSchema,
  [AuthFieldEnum.confirmPassword]: passwordSchema,
});

export const resetSchema = resetBase.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: [AuthFieldEnum.confirmPassword],
    message: FormValidationErrorCodes.PASSWORDS_DONT_MATCH,
  }
);

export const ProfileFields = {
    picture: "picture",
    subMessage: "subMessage",
    bannerColor: "bannerColor",
    remainAnonymous: "remainAnonymous",
} as const;

export const NotificationsFields = {
    ohillOptIn: "ohillOptIn",
    runkOptIn: "runkOptIn",
    newcombOptIn: "newcombOptIn",
    optInWhenToNotify: "optInWhenToNotify",
    foodOptInBol: "foodOptInBol",
    foodOptInVal: "foodOptInVal",
    replyToPost: "replyToPost",
} as const;

export const UserSettingsFields = {
    profile: "profile",
    notifications: "notifications",
} as const;

export const UpdateUserFields = {
    email: "email",
    userSettingsSchema: "userSettingsSchema",
    passwordReset: "passwordReset",
} as const;

export const profileSchema = z.object({
  [ProfileFields.picture]: z.string().optional(),
  [ProfileFields.subMessage]: z.string().optional(),
  [ProfileFields.bannerColor]: z.string(),
  [ProfileFields.remainAnonymous]: z.boolean(),
});

export const notificationsSchema = z.object({
  [NotificationsFields.ohillOptIn]: z.boolean(),
  [NotificationsFields.runkOptIn]: z.boolean(),
  [NotificationsFields.newcombOptIn]: z.boolean(),
  [NotificationsFields.optInWhenToNotify]: z.array(z.string()).nonempty(),
  [NotificationsFields.foodOptInBol]: z.boolean(),
  [NotificationsFields.foodOptInVal]: z.array(z.string()).nonempty(),
  [NotificationsFields.replyToPost]: z.boolean(),
});

export const userSettingsSchema = z.object({
  [UserSettingsFields.profile]: profileSchema.partial().optional(),
  [UserSettingsFields.notifications]: notificationsSchema.partial().optional(),
});

export const updateUserApiSchema = z.object({
  [UpdateUserFields.email]: emailSchema.optional(),
  [UpdateUserFields.userSettingsSchema]: userSettingsSchema.optional(),
  [UpdateUserFields.passwordReset]: resetSchema.optional()
});

export type SignupFields = Extract<keyof z.infer<typeof signupSchema>, AuthFields>;
export type LoginFields = Extract<keyof z.infer<typeof loginSchema>, AuthFields>;
export type ResetFields = Extract<keyof z.infer<typeof resetSchema>, AuthFields>;
export type ProfileField = (typeof ProfileFields)[keyof typeof ProfileFields];
export type NotificationsField = (typeof NotificationsFields)[keyof typeof NotificationsFields];
export type UserSettingsField = (typeof UserSettingsFields)[keyof typeof UserSettingsFields];
export type UpdateUserField = (typeof UpdateUserFields)[keyof typeof UpdateUserFields];

export type FormValidationErrorType = typeof FormValidationErrorCodes[keyof typeof FormValidationErrorCodes];
export type FormValidationError = { error: FormValidationErrorType};

export type UpdateUserPrefixes = Extract<keyof UserSettingsApi, "profile" | "notifications">;
export type UpdateUserApi = z.infer<typeof updateUserApiSchema>;
export type UserSettingsApi = z.infer<typeof userSettingsSchema>;
export type LoginApi = z.infer<typeof loginSchema>;
export type SignupApi = z.infer<typeof signupSchema>;
export type ResetApi = z.infer<typeof resetSchema>;
