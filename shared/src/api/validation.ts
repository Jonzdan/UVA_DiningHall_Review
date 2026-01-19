import { z } from 'zod';
import { FormValidationErrorCodes } from './food.js';

export const passwordSchema = z.string()
  .min(8, { error: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .max(32, { error: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .regex(/[A-Z]/, { error: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .regex(/\d/, { error: FormValidationErrorCodes.PASSWORD_TOO_WEAK })
  .regex(/^\S+$/, { error: FormValidationErrorCodes.WHITESPACE_PRESENT });

export const emailSchema = z.email({ error: FormValidationErrorCodes.EMAIL_INVALID });

export const usernameSchema = z.string()
  .min(6, { error: FormValidationErrorCodes.USERNAME_TOO_SHORT })
  .max(16, { error: FormValidationErrorCodes.USERNAME_TOO_LONG })
  .regex(/^\S+$/, { error: FormValidationErrorCodes.WHITESPACE_PRESENT });
  
export const signupSchema = z.object({
  email: emailSchema,
  user: usernameSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  error: FormValidationErrorCodes.PASSWORDS_DONT_MATCH,
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: emailSchema,
  user: usernameSchema,
  password: passwordSchema,
});

export const resetSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  error: FormValidationErrorCodes.PASSWORDS_DONT_MATCH,
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  picture: z.string().optional(),
  subMessage: z.string().optional(),
  bannerColor: z.string(),
  remainAnonymous: z.boolean(),
});

export const notificationsSchema = z.object({
  ohillOptIn: z.boolean(),
  runkOptIn: z.boolean(),
  newcombOptIn: z.boolean(),
  optInWhenToNotify: z.array(z.string()).nonempty(),
  foodOptInBol: z.boolean(),
  foodOptInVal: z.array(z.string()).nonempty(),
  replyToPost: z.boolean(),
});

export const userSettingsSchema = z.object({
  profile: profileSchema.partial().optional(),
  notifications: notificationsSchema.partial().optional(),
});

export const updateUserApiSchema = z.object({
  email: emailSchema.optional(),
  userSettingsSchema: userSettingsSchema,
  passwordReset: resetSchema.optional()
});

export type UpdateUserPrefixes = Extract<keyof UserSettingsApi, "profile" | "notifications">;
export type UpdateUserApi = z.infer<typeof updateUserApiSchema>;
export type UserSettingsApi = z.infer<typeof userSettingsSchema>;
export type LoginApi = z.infer<typeof loginSchema>;
export type SignupApi = z.infer<typeof signupSchema>;
export type ResetApi = z.infer<typeof resetSchema>;
