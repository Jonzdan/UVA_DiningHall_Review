import { FormControl } from "@angular/forms";
import { AuthFieldEnum } from "hoorank-shared";

export interface LoginFormValues {
    readonly [AuthFieldEnum.user]: FormControl<string | null>;
    readonly [AuthFieldEnum.password]: FormControl<string | null>;
}

export interface States {
    [AuthFieldEnum.user]: boolean;
    [AuthFieldEnum.password]: boolean;
}

export interface LoadingStates extends States {}

export interface ErrorStates extends States {
    submit: boolean;
}

export interface HideItems {
    errorText: boolean;
    userErrorText: boolean;
}
