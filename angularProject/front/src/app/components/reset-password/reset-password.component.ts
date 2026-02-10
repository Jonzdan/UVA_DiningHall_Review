import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { debounceTime, Subscription, tap } from 'rxjs';
import { AccountService, FormService } from 'src/app/services';
import { LoadingStates, ErrorStates, HideItems, ResetPasswordFormValues, InvalidSubmitErrorStates, ResetErrorFields } from './types';
import { AuthFieldEnum, ErrorFormat, FormValidationErrorCodes, FormValidationErrorType, ResetFields, UpdateUserField } from 'hoorank-shared';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    @Input() title!: string;
    @Input() description!: string;

    public preAnimation: boolean;
    public firstAnimationPhase: boolean;
    private _subscription: Subscription = new Subscription();
    private readonly loadingStates: LoadingStates;
    private readonly errorStates: ErrorStates;
    private readonly hideItems: HideItems;
    private readonly resetPasswordForm: FormGroup<ResetPasswordFormValues>;

    constructor(private formService: FormService, private accountService: AccountService) {
        this.resetPasswordForm = new FormGroup({
            [AuthFieldEnum.oldPassword]: new FormControl('', []),
            passwordGroup: new FormGroup(
                {
                    [AuthFieldEnum.password]: new FormControl('', []),
                    [AuthFieldEnum.confirmPassword]: new FormControl('', []),
                },
                this.formService.matchingPasswords(),
            ),
        });

        this.preAnimation = true;
        this.firstAnimationPhase = false;

        this.loadingStates = {
            password: false,
            oldPassword: false,
            confirmPassword: false,
        };

        this.errorStates = {
            ...this.loadingStates,
            passwordReset: false,
            submit: {
                password: false,
            },
        };

        this.hideItems = {
            errorText: false,
        };
    }

    ngOnInit(): void {
        const oldPassword = this.oldPassword.valueChanges
            .pipe(
                tap(() => {
                    this.errorStates.oldPassword = false;
                    this.loadingStates.oldPassword = true;
                }),
                debounceTime(400),
            )
            .subscribe(() => {
                this.loadingStates.oldPassword = false;
                this.errorStates.submit.password = false;
                this.oldPassword.setErrors(this.formService.buildErrors(AuthFieldEnum.oldPassword, this.oldPassword));
            });
        
        /**
         * Only sets loading state of 2nd password (confirmPassword) as a UI choice -- one spinner per group at the bottom
         */
        const passwordGroup = this.passwordGroup.valueChanges
            .pipe(
                tap(() => {
                    this.loadingStates.confirmPassword = true;
                }),
                debounceTime(400),
            )
            .subscribe(() => {
                this.loadingStates.confirmPassword = false;
                this.errorStates.passwordReset = !!this.passwordGroup.errors?.[FormValidationErrorCodes.PASSWORDS_DONT_MATCH]; 
            });

        const password = this.password.valueChanges
            .pipe(
                debounceTime(400),
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
                debounceTime(400),
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

        this._subscription.add(passwordGroup);
        this._subscription.add(password);
        this._subscription.add(oldPassword);
        this._subscription.add(confirmPassword);
    }

    private isLoading(): boolean {
        return (Object.values(this.loadingStates) as (LoadingStates[keyof LoadingStates])[]).some((value) => {
            return value;
        });
    }

    private hasError(): boolean {
        const hasError = (object: ErrorStates | InvalidSubmitErrorStates): boolean => {
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
        (error.error as ErrorFormat<ResetErrorFields, FormValidationErrorType>[]).forEach(({field, errors}) => {
            /**
             * Temporary error code location until Zod V4
             */
            this[field].setErrors(
                errors.reduce((previous, field) => {
                    return {
                        ...previous,
                        [field]: true
                    }
                }, {} satisfies Partial<Record<ResetErrorFields, boolean>>)
            );
            this.errorStates[field] = true;
            this.errorStates.submit.password = true;
        });
    }

    async onSubmit() {
        if (this.isLoading()) {
            setTimeout(() => {
                this.onSubmit();
            }, 500);
            return;
        }

        if (this.hasError()) {
            return;
        }

        const { valid, errors } = this.formService.validate(this.resetPasswordForm);
        if (!valid) {
            this.setAllLoadingStates(true);
            this.hideItems.errorText = true;
            setTimeout(() => {
                this.setAllLoadingStates(false);
                this.hideItems.errorText = false;
            }, 500);

            Object.entries(errors).forEach(([field, errors]) => {
                this[field as ResetFields].setErrors(errors);
            });

            return;
        }
        try {
            await this.accountService.resetPassword({
                passwordReset: {
                    oldPassword: this.resetPasswordForm.value?.[AuthFieldEnum.oldPassword]!,
                    password: this.resetPasswordForm.value.passwordGroup?.[AuthFieldEnum.password]!,
                    confirmPassword: this.resetPasswordForm.value.passwordGroup?.[AuthFieldEnum.confirmPassword]!
                }
            });
            
        } catch (error) {
            if (!(error instanceof HttpErrorResponse)) {
                return;
            }

            this.handleHttpError(error);
        }
        this.resetPasswordForm.controls.oldPassword.setValue('');
        this.resetPasswordForm.controls.passwordGroup.controls.password.setValue('');
        this.resetPasswordForm.controls.passwordGroup.controls.confirmPassword.setValue('');
    }

    private setAllLoadingStates(value: boolean): void {
        (Object.keys(this.loadingStates) as (keyof LoadingStates)[]).forEach((key) => {
            this.loadingStates[key] = value;
        });
    }

    updateAnimationState(): void {
        if (this.preAnimation) {
            this.preAnimation = false;
        }
        this.firstAnimationPhase = !this.firstAnimationPhase;
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    get passwordReset() {
        return this.resetPasswordForm.controls.passwordGroup;
    }

    get resetForm() {
        return this.resetPasswordForm;
    }

    get isPasswordWeakError() {
        return [this.oldPassword, this.password, this.confirmPassword].some((password) => !!password.errors?.[FormValidationErrorCodes.PASSWORD_TOO_WEAK]);
    }

    get passwordWhitespaceError() {
        return [this.oldPassword, this.password, this.confirmPassword].some((password) => !!password.errors?.[FormValidationErrorCodes.WHITESPACE_PRESENT]);
    }
    
    get mismatchedPasswordError() {
        return !!this.passwordGroup.errors?.[FormValidationErrorCodes.PASSWORDS_DONT_MATCH] || this.errorStates.passwordReset;
    }

    get oldPassword() {
        return this.resetPasswordForm.controls.oldPassword;
    }

    get oldPasswordError() {
        return this.errorStates.oldPassword;
    }

    get passwordError() {
        return this.errorStates.password;
    }

    get confirmPasswordError() {
        return this.errorStates.confirmPassword;
    }

    get bothPasswordError() {
        return this.errorStates.passwordReset;
    }

    get password() {
        return this.passwordGroup.controls[AuthFieldEnum.password];
    }

    get confirmPassword() {
        return this.passwordGroup.controls[AuthFieldEnum.confirmPassword];
    }

    get passwordGroup() {
        return this.resetPasswordForm.controls.passwordGroup;
    }
}
