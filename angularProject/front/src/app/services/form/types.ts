import { FormControl } from "@angular/forms";
import { AuthFieldEnum, AuthFields, FormValidationErrorCodes } from "hoorank-shared";

export interface FormFieldErrors {
    [FormValidationErrorCodes.WHITESPACE_PRESENT]?: boolean;
    [FormValidationErrorCodes.MISSING_FIELDS]?: boolean;
    [FormValidationErrorCodes.USERNAME_TOO_LONG]?: boolean;
    [FormValidationErrorCodes.USERNAME_TOO_SHORT]?: boolean;
    [FormValidationErrorCodes.PASSWORD_TOO_WEAK]?: boolean;
    [FormValidationErrorCodes.PASSWORDS_DONT_MATCH]?: boolean;
    [FormValidationErrorCodes.EMAIL_INVALID]?: boolean;
}

export type FormValidationOutput = { valid: boolean, errors: Partial<Record<AuthFields, FormFieldErrors>> };

export interface DoublePasswordGroupValues{
    readonly [AuthFieldEnum.password]: FormControl<string | null>;
    readonly [AuthFieldEnum.confirmPassword]: FormControl<string | null>;
}
