import { Component, type OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime, tap } from 'rxjs';
import { AccountService, FormFieldErrors, FormService } from '../../services';
import { ErrorStates, HideItems, LoadingStates, LoginFormValues, States } from './types';
import { AuthFieldEnum, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, LoginFields, ErrorFormat, FormValidationErrorType } from 'hoorank-shared';
import { HttpErrorResponse } from '@angular/common/http';
import { ROUTE_PATHS } from 'src/app/constants';

const DEBOUNCE_TIME_MS = 400;

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent implements OnInit {
    public preAnimation: boolean;
    public firstAnimationPhase: boolean;
    public loginButtonText = 'LOGIN';
    private readonly _subscription: Subscription;
    private readonly signInForm: FormGroup<LoginFormValues>;
    private readonly loadingStates: LoadingStates;
    private readonly errorStates: ErrorStates;
    private readonly hideItems: HideItems;

    constructor(
        private accountService: AccountService,
        private formService: FormService,
        private router: Router,
    ) {
        this._subscription = new Subscription();
        this.signInForm = new FormGroup<LoginFormValues>({
            [AuthFieldEnum.user]: new FormControl('', []),
            [AuthFieldEnum.password]: new FormControl('', [])
        });
        this.preAnimation = true;
        this.firstAnimationPhase = false;

        const states: States = {
            [AuthFieldEnum.password]: false,
            [AuthFieldEnum.user]: false,
        };

        this.loadingStates = structuredClone(states);
        this.errorStates = {
            ...structuredClone(states),
            submit: false
        };

        this.hideItems = {
            errorText: false,
            userErrorText: false,
        };
    }

    ngOnInit(): void {
        const user = this.user.valueChanges
            .pipe(
                tap(() => {
                    this.loadingStates.user = true;
                    this.errorStates.user = false;
                }),
                debounceTime(DEBOUNCE_TIME_MS),
            )
            .subscribe(() => {
                this.loadingStates.user = false;
                this.errorStates.submit = false;
                const errors = this.formService.buildErrors(AuthFieldEnum.user, this.user);
                this.user.setErrors(errors);
                this.errorStates.user = !!(errors.USERNAME_TOO_LONG ||
                    errors.USERNAME_TOO_SHORT ||
                    errors.MISSING_FIELDS ||
                    errors.WHITESPACE_PRESENT);
            });

        const password = this.password.valueChanges
            .pipe(
                tap(() => {
                    this.loadingStates.password = true;
                    this.errorStates.password = false;
                }),
                debounceTime(DEBOUNCE_TIME_MS),
            )
            .subscribe(() => {
                this.loadingStates.password = false;
                this.errorStates.submit = false;
                const errors = this.formService.buildErrors(AuthFieldEnum.password, this.password);
                this.password.setErrors(errors);
                this.errorStates.password = !!(errors.PASSWORD_TOO_WEAK ||
                    errors.MISSING_FIELDS ||
                    errors.WHITESPACE_PRESENT);
            });
            
        this._subscription.add(user);
        this._subscription.add(password);
    }

    private handleHttpError(error: HttpErrorResponse) {
        (error.error as ErrorFormat<LoginFields, FormValidationErrorType>[]).forEach(({field, errors}) => {
            /**
             * Temporary error code location until Zod V4
             */
            this[field].setErrors(
                errors.reduce((previous, field) => {
                    return {
                        ...previous,
                        [field]: true
                    }
                }, {} satisfies Partial<Record<LoginFields, boolean>>)
            );
            this.errorStates[field] = true;
            this.errorStates.submit = true;
        });
    }

    async onSubmit(): Promise<void> {
        if (this.isLoading()) {
            setTimeout(() => {
                this.onSubmit();
            }, 500);
            return;
        }

        if (this.hasError()) {
            return;
        }

        const { valid, errors } = this.formService.validate(this.loginForm);
        if (!valid) {
            this.setAllLoadingStates(true);
            this.hideItems.errorText = true;
            this.hideItems.userErrorText = true;
            setTimeout(() => {
                this.setAllLoadingStates(false);
                this.hideItems.errorText = false;
                this.hideItems.userErrorText = false;
            }, DEBOUNCE_TIME_MS);

            Object.entries(errors).forEach(([field, errors]) => {
                this[field as LoginFields].setErrors(errors);
            });
            return;
        }

        try {
            await this.accountService.getAccount({
                user: this.signInForm.value.user!,
                password: this.signInForm.value.password!,
            });
            this.router.navigateByUrl(ROUTE_PATHS.HOME);
        } catch (error) {
            if (!(error instanceof HttpErrorResponse)) {
                return;
            }

            this.handleHttpError(error); 
        }
    }

    updateAnimationState(): void {
        if (this.preAnimation) {
            this.preAnimation = false;
        }
        this.firstAnimationPhase = !this.firstAnimationPhase;
    }
    
    private isLoading(): boolean {
        return (Object.values(this.loadingStates) as (LoadingStates[keyof LoadingStates])[]).some((value) => {
            return value;
        });
    }

    private hasError(): boolean {
        const hasError = (object: ErrorStates): boolean => {
            return (Object.values(object) as (ErrorStates[keyof ErrorStates])[]).some(value => {
                if (typeof value === 'object' && value !== null) {
                    return hasError(value); 
                }
                return value;
            })
        }
        return hasError(this.errorStates);
    }

    private setAllLoadingStates(value: boolean): void {
        (Object.keys(this.loadingStates) as (keyof LoadingStates)[]).forEach((key) => {
            this.loadingStates[key] = value;
        });
    }

    switchToHomePage() {
        this.router.navigateByUrl(``); //add animation later
    }

    private getFieldErrorsFromFormField(field: keyof States): FormFieldErrors {
        switch (field) {
            case "user":
                return this.user.errors as FormFieldErrors;
            case "password":
                return this.password.errors as FormFieldErrors;
        }
    }

    private capitalizeString(input: string) {
        return input.length > 0 ? `${input.charAt(0).toUpperCase()}${input.slice(1)}` : '';
    }

    public errorMessage(field: keyof States) {
        const errors = this.getFieldErrorsFromFormField(field);
        if (errors.MISSING_FIELDS) {
            return 'Required field';
        }

        if (errors.USERNAME_TOO_SHORT) {
            return `Username length must be at least ${MIN_USERNAME_LENGTH} characters`;
        }

        if (errors.USERNAME_TOO_LONG) {
            return `Username length must be less than ${MAX_USERNAME_LENGTH + 1} characters`;
        }

        if (errors.PASSWORD_TOO_WEAK) {
            return `Password must be between ${MIN_PASSWORD_LENGTH} - ${MAX_PASSWORD_LENGTH} characters, inclusive`;
        }

        if (errors.WHITESPACE_PRESENT) {
            return `${this.capitalizeString(field)} cannot contain spaces`;
        }

        if (this.errorStates.submit) {
            return 'The username or password is incorrect';
        }

        return '';
    }

    get loginForm() {
        return this.signInForm;
    }

    get fieldStateEnum() {
        return AuthFieldEnum;
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    get password() {
        return this.signInForm.controls.password;
    }

    get user() {
        return this.signInForm.controls.user;
    }

    get isUserLoading() {
        return this.loadingStates.user;
    }

    get isPasswordLoading() {
        return this.loadingStates.password;
    }

    get hideUserErrorFlag() {
        return this.hideItems.userErrorText;
    }

    get hidePassErrorFlag() {
        return this.hideItems.errorText
    }

    get userErrorFlag() {
        return this.errorStates.user;
    }

    get passwordErrorFlag() {
        return this.errorStates.password;
    }

    get invalidSubmitFlag() {
        return this.errorStates.submit;
    }

    get minPasswordLen() {
        return MIN_PASSWORD_LENGTH;
    }

    get maxPasswordLen() {
        return MAX_PASSWORD_LENGTH;
    }

    get minUsernameLen() {
        return MIN_USERNAME_LENGTH;
    }

    get maxUsernameLen() {
        return MAX_USERNAME_LENGTH;
    }
}
