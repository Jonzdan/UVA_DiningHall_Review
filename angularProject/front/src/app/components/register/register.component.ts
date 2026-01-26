import { Component, type OnInit } from '@angular/core';
import {
    FormControl,
    FormGroup,
} from '@angular/forms';
import { Subscription, debounceTime, tap } from 'rxjs';
import { AccountService, FormFieldErrors, FormService } from '../../services';
import { Router } from '@angular/router';
import { AuthFieldEnum, ErrorFormat, FormValidationErrorCodes, FormValidationErrorType, MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH, ResetFields, SignupFields } from 'hoorank-shared';
import { ErrorStates, HideItems, LoadingStates, RegisterFormValues, States, ExistsErrorStates } from './types';
import { HttpErrorResponse } from '@angular/common/http';
import { ROUTE_PATHS } from 'src/app/constants';

const DEBOUNCE_TIME_MS = 400;

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
    public preAnimation: boolean;
    public firstAnimationPhase: boolean;
    public regButtonText = 'REGISTER';
    private readonly _subscription;
    public readonly registerForm: FormGroup<RegisterFormValues>;
    private readonly loadingStates: LoadingStates;
    private readonly errorStates: ErrorStates;
    private readonly hideItems: HideItems;

    constructor(
        private accountService: AccountService,
        private formService: FormService,
        private route: Router,
    ) {
        this._subscription = new Subscription();
        this.registerForm = new FormGroup<RegisterFormValues>({
            email: new FormControl('', {}),
            user: new FormControl('', []),
            passwordGroup: new FormGroup(
                {
                    password: new FormControl('', []),
                    confirmPassword: new FormControl('', []),
                },
                this.formService.matchingPasswords(),
            ),
        });
        this.preAnimation = true;
        this.firstAnimationPhase = false;

        const states: States = {
            user: false,
            confirmPassword: false,
            email: false,
            password: false,
        }

        this.loadingStates = structuredClone(states);
        this.errorStates = {
            ...structuredClone(states),
            submit: {
                email: false,
                user: false
            },
            bothPasswords: false,
        };

        // NOTE: might need to be true
        this.hideItems = {
            errorText: false,
            userErrorText: false,
        };
        
    }

    ngOnInit(): void {
        const emailStatus = this.email.statusChanges.pipe(debounceTime(DEBOUNCE_TIME_MS)).subscribe(() => {
            if (!!this.email.errors) {
                return;
            }

            this.errorStates.email = true;
        })

        const email = this.email.valueChanges
            .pipe(
                tap(() => (this.loadingStates.email = true)),
                debounceTime(DEBOUNCE_TIME_MS),
            )
            .subscribe(() => {
                this.loadingStates.email = false;
                this.errorStates.submit.email = false;
                const errors = this.formService.buildErrors(
                    AuthFieldEnum.email,
                    this.email,
                );
                this.email.setErrors(errors);
                this.errorStates.email = !!(errors.EMAIL_INVALID || errors.MISSING_FIELDS || errors.WHITESPACE_PRESENT);
                console.log(this.errorStates.email);
            });

        const passgroup = this.passwordGroup.valueChanges
            .pipe(
                tap(() => {
                    this.loadingStates.password = true;
                    this.loadingStates.confirmPassword = true;
                    this.hideItems.errorText = true;
                }),
                debounceTime(DEBOUNCE_TIME_MS),
            )
            .subscribe(() => {
                this.loadingStates.password = false;
                this.loadingStates.confirmPassword = false;
                this.hideItems.errorText = false;
                this.errorStates.bothPasswords = !!this.passwordGroup.errors?.[FormValidationErrorCodes.PASSWORDS_DONT_MATCH]; 
            });

        const password = this.password.valueChanges
            .pipe(
                debounceTime(DEBOUNCE_TIME_MS),
            )
            .subscribe(() => {
                const errors = this.formService.buildErrors(
                    AuthFieldEnum.password,
                    this.password,
                );
                this.password.setErrors(errors);
                this.errorStates.password = !!(errors.PASSWORD_TOO_WEAK ||
                    errors.MISSING_FIELDS ||
                    errors.WHITESPACE_PRESENT);
            });

        const confirmPassword = this.confirmPassword.valueChanges
            .pipe(
                debounceTime(DEBOUNCE_TIME_MS),
            )
            .subscribe(() => {
                const errors = this.formService.buildErrors(
                    AuthFieldEnum.confirmPassword,
                    this.confirmPassword,
                );
                this.confirmPassword.setErrors(errors);
                this.errorStates.confirmPassword = !!(errors.PASSWORD_TOO_WEAK ||
                    errors.MISSING_FIELDS ||
                    errors.WHITESPACE_PRESENT);
            });

        const user = this.user.valueChanges
            .pipe(
                tap(() => (this.loadingStates.user = true)),
                debounceTime(DEBOUNCE_TIME_MS),
            )
            .subscribe(() => {
                const errors = this.formService.buildErrors(AuthFieldEnum.user, this.user);
                this.loadingStates.user = false;
                this.errorStates.submit.user = false;
                this.user.setErrors(errors);
                this.errorStates.user = !!(errors.USERNAME_TOO_LONG ||
                    errors.USERNAME_TOO_SHORT ||
                    errors.MISSING_FIELDS ||
                    errors.WHITESPACE_PRESENT);
            });

        this._subscription.add(password);
        this._subscription.add(confirmPassword);
        this._subscription.add(passgroup);
        this._subscription.add(email);
        this._subscription.add(user);
        this._subscription.add(emailStatus)
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
        const hasError = (object: ErrorStates | ExistsErrorStates): boolean => {
            return (Object.values(object) as (ErrorStates[keyof ErrorStates])[]).some(value => {
                if (typeof value === 'object' && value !== null) {
                    return hasError(value); 
                }
                return value;
            })
        }
        return hasError(this.errorStates);
    }

    private handleHttpError(error: HttpErrorResponse) {
        (error.error as ErrorFormat<SignupFields, FormValidationErrorType>[]).forEach(({field, errors}) => {
            /**
             * Temporary error code location until Zod V4
             */
            this[field].setErrors(
                errors.reduce((previous, field) => {
                    return {
                        ...previous,
                        [field]: true
                    }
                }, {} satisfies Partial<Record<SignupFields, boolean>>)
            );
            this.errorStates[field] = true;
            if (field === 'email' || field === 'user') {
                this.errorStates.submit[field] = true; 
            }
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


        const { valid, errors } = this.formService.validate(this.registerForm);
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
                this[field as SignupFields].setErrors(errors);
            });
            return;
        }

        try {
            await this.accountService.createAccount({
                email: this.registerForm.value.email!,
                user: this.registerForm.value.user!,
                password: this.registerForm.value.passwordGroup?.password!,
                confirmPassword: this.registerForm.value.passwordGroup?.confirmPassword!
            });
            this.route.navigateByUrl(ROUTE_PATHS.LOGIN);
        } catch (error) {
            if (!(error instanceof HttpErrorResponse)) {
                return;
            }
            
            this.handleHttpError(error);
        }
    }

    switchToHomePage() {
        this.route.navigateByUrl('');
    }

    private setAllLoadingStates(value: boolean): void {
        (Object.keys(this.loadingStates) as (keyof LoadingStates)[]).forEach((key) => {
            this.loadingStates[key] = value;
        });
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private getFieldErrorsFromFormField(field: keyof States): FormFieldErrors {
        switch (field) {
            case "user":
                return this.user.errors as FormFieldErrors;
            case "email":
                return this.email.errors as FormFieldErrors;
            case "password":
                return this.password.errors as FormFieldErrors;
            case "confirmPassword":
                return this.confirmPassword.errors as FormFieldErrors;
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

        if (errors.WHITESPACE_PRESENT) {
            return `${this.capitalizeString(field)} cannot contain spaces`;
        }

        if (errors.PASSWORD_TOO_WEAK) {
            return `Password is too weak. Must be between ${MIN_PASSWORD_LENGTH} - ${MAX_PASSWORD_LENGTH} characters, inclusive`;
        }

        if (errors.PASSWORDS_DONT_MATCH) {
            return "Passwords don't match";
        }

        if (errors.EMAIL_INVALID) {
            return 'Invalid Email';
        }

        /**
         * Email check from above indiscriminate set upon HTTP call failing -- placeholder
         */
        if (this.errorStates.submit.user || this.errorStates.submit.email && (field === AuthFieldEnum.user || AuthFieldEnum.email === field)) {
            return 'Username Or Email Already Taken';
        }

        return '';
    }

    get fieldStateEnum() {
        return AuthFieldEnum;
    }

    get email() {
        return this.registerForm.controls.email;
    }

    get user() {
        return this.registerForm.controls.user;
    }

    get password() {
        return this.passwordGroup.controls.password;
    }
    get confirmPassword() {
        return this.passwordGroup.controls.confirmPassword;
    }

    get passwordGroup() {
        return this.registerForm.controls.passwordGroup;
    }

    get isEmailLoading() {
        return this.loadingStates.email;
    }

    get isUserLoading() {
        return this.loadingStates.user;
    }

    get isPasswordLoading() {
        return this.loadingStates.password;
    }

    get isConfirmPasswordLoading() {
        return this.loadingStates.confirmPassword;
    }

    get hideUserErrorFlag() {
        return this.hideItems.userErrorText;
    }

    get hideOtherErrorFlag() {
        return this.hideItems.errorText
    }

    get emailExistsFlag() {
        return this.errorStates.submit.email;
    }

    get userExistsFlag() {
        return this.errorStates.submit.user;
    }

    get emailErrorFlag() {
        return this.errorStates.email;
    }

    get userErrorFlag() {
        return this.errorStates.user;
    }

    get passwordErrorFlag() {
        return this.errorStates.password;
    }

    get confirmPasswordErrorFlag() {
        return this.errorStates.confirmPassword;
    }

    get bothPasswordsErrorFlag() {
        return this.errorStates.bothPasswords;
    }
}
