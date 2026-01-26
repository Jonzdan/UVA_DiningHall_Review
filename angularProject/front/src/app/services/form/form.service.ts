import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FormFieldErrors, DoublePasswordGroupValues, FormValidationOutput } from './types';
import { AuthFieldEnum, AuthFields, FormValidationErrorCodes, MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from 'hoorank-shared';

@Injectable({
  providedIn: 'root'
})
export class FormService {
    extractFormData<T extends Record<string, unknown>>(form: FormGroup): T {
        const obj: Record<string, unknown> = {};

        Object.keys(form.controls).forEach((field) => {
            const control = form.get(field);

            if (control instanceof FormGroup) {
                obj[field] = this.extractFormData(control);
                } else {
                obj[field] = control?.value;
            }
        });

        return obj as T;
    }

    private buildFormErrors(field: AuthFields, control: AbstractControl<string>): Partial<FormFieldErrors> {
        const errors: Partial<FormFieldErrors> = {};
        const value = control.value;

        switch (field) {
            case AuthFieldEnum.user: 
                if (value.length < MIN_USERNAME_LENGTH) {
                    errors.USERNAME_TOO_SHORT = true;
                }
                if (value.length > MAX_USERNAME_LENGTH) {
                    errors.USERNAME_TOO_LONG = true;
                }
                break;
            
            case AuthFieldEnum.email:
                if (!!Validators.email(control)) {
                    errors.EMAIL_INVALID = true;
                }

                if (!!Validators.required(control)) {
                    errors.MISSING_FIELDS = true
                }
                break;
            case AuthFieldEnum.oldPassword:
            case AuthFieldEnum.password:
            case AuthFieldEnum.confirmPassword: 
                if (value.length < MIN_PASSWORD_LENGTH || value.length > MAX_PASSWORD_LENGTH) {
                    errors.PASSWORD_TOO_WEAK = true;
                }
        }

        return errors;
    }

    public buildErrors(field: AuthFields, control: AbstractControl<string | null>): Partial<FormFieldErrors> {
        const errors: Partial<FormFieldErrors> = {};
        if (control.value === null) {
            errors.MISSING_FIELDS = true;
            return errors;
        }

        if (/\s/.test(control.value)) {
            errors.WHITESPACE_PRESENT = true;
        }

        if (control.value.length === 0) {
            errors.MISSING_FIELDS = true;
        }

        return {
            ...this.buildFormErrors(field, control as AbstractControl<string>),
            ...errors
        };
    }

    public validate<T extends { [K in keyof T]: AbstractControl<unknown> }>(formGroup: FormGroup<T>): FormValidationOutput {
        const result: FormValidationOutput = {
            valid: true,
            errors: {}
        };
        Object.keys(formGroup.controls).forEach((field) => {
            const control = formGroup.get(field);

            if (control instanceof FormGroup) {
                /**
                 * Should not short circuit - retrieve all errors
                 */
                result.valid = this.validate<T>(control) && result.valid;
                return;
            }

            if (!(control instanceof FormControl)) {
                return;
            }

            if (!control.touched || !control.dirty) {
                control.markAsTouched({ onlySelf: true });
                control.markAsDirty({ onlySelf: true });
            }

            const errors = this.buildErrors(field as AuthFields, control);
            console.log(errors);
            if (Object.keys(errors).length) {
                result.valid = false;
            }
            result.errors[field as AuthFields] = errors;
            control.setErrors(errors);
        });
        return result;
    }

    matchingPasswords<T extends DoublePasswordGroupValues>(): ValidatorFn {
        return (control: AbstractControl<T>): ValidationErrors | null => {
            const password = control.value[AuthFieldEnum.password].value;
            const confirmPassword = control.value[AuthFieldEnum.confirmPassword].value;
            if (!password?.length || !confirmPassword?.length) {
                return null;
            }

            if (
                password.length < MIN_PASSWORD_LENGTH ||
                password.length > MAX_PASSWORD_LENGTH ||
                confirmPassword.length < MIN_PASSWORD_LENGTH ||
                confirmPassword.length > MAX_PASSWORD_LENGTH
            ) {
                return null;
            }
            return password === confirmPassword
                ? null
                : { [FormValidationErrorCodes.PASSWORDS_DONT_MATCH] : true };
        };
    }
}
