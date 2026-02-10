import { FormControl, FormGroup } from "@angular/forms";
import { DoublePasswordGroupValues } from "src/app/services";
import { AuthFieldEnum, UpdateUserFields, UserSettingsFields } from "hoorank-shared";

export interface ResetPasswordFormValues {
    readonly [AuthFieldEnum.oldPassword]: FormControl<string | null>;
    readonly passwordGroup: FormGroup<DoublePasswordGroupValues>;
}

interface States {
    [AuthFieldEnum.oldPassword]: boolean;
    [AuthFieldEnum.password]: boolean;
    [AuthFieldEnum.confirmPassword]: boolean;
}

export interface LoadingStates extends States {}

export type ResetErrorFields = typeof UpdateUserFields.passwordReset;

export interface ErrorStates extends States {
    [AuthFieldEnum.oldPassword]: boolean;
    [UpdateUserFields.passwordReset]: boolean;
    readonly submit: InvalidSubmitErrorStates;
}

export interface InvalidSubmitErrorStates {
    password: boolean;
}

export interface HideItems {
    errorText: boolean;
}
