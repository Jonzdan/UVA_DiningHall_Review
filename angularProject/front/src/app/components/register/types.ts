import { FormControl, FormGroup } from "@angular/forms";
import { AuthFieldEnum } from "hoorank-shared";

export interface RegisterFormValues {
    readonly email: FormControl<string | null>;
    readonly user: FormControl<string | null>;
    readonly passwordGroup: FormGroup<RegisterFormPasswordGroupValues>;
}

export interface RegisterFormPasswordGroupValues {
    readonly password: FormControl<string | null>;
    readonly confirmPassword: FormControl<string | null>;
}

export interface States {
    [AuthFieldEnum.email]: boolean;
    [AuthFieldEnum.user]: boolean;
    [AuthFieldEnum.password]: boolean;
    [AuthFieldEnum.confirmPassword]: boolean;
}

export interface LoadingStates extends States {}

export interface ErrorStates extends States {
    readonly submit: ExistsErrorStates;
    bothPasswords: boolean;
}

// TODO - not implemented yet
export interface ExistsErrorStates {
    email: boolean;
    user: boolean;
}

export interface HideItems {
    errorText: boolean;
    userErrorText: boolean;
}
