import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, ValidatorFn,Validator, AbstractControl, ValidationErrors, Form } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, tap, Subject } from 'rxjs';
import { AccountService } from '../account.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  firstTime: boolean = true
  first: boolean = false
  inputForm!: FormGroup
  userLoading:boolean = false; firstPassLoading:boolean = false; secondPassLoading:boolean = false; emailLoading:boolean = false;
  goodMsg!:string
  hideErrorText:boolean = false;
  hideUserErrorText:boolean = false;
  regButtonText: string = "REGISTER"
  showPopup:boolean = false
  invalidEmailSubmit:boolean = false; invalidUserSubmit:boolean = false;
  emailError: boolean = false; userError:boolean = false; secondPassError: boolean = false; firstPassError:boolean = false; bothPassError:boolean = false
  private currentSubmission: boolean = false;
  

  constructor(private as: AccountService, private route: Router) { }

  ngOnInit(): void {

    this.inputForm = new FormGroup({
      email: new FormControl(
        '', {}
      ),
      user: new FormControl('', [
      ]),
      passGroup: new FormGroup({
        firstPass: new FormControl('', []),
        secondPass: new FormControl('', []),
      }, this.matchingPasswords()),
    }
    )
      

    this.email?.valueChanges.pipe(
      tap(()=> this.emailLoading = true),
      debounceTime(400),
    ).subscribe((res)=> {
      this.emailLoading = false; this.invalidEmailSubmit = false; 
      const obj: {[index:string]:any} = this.helper('email', this.email)
      this.email?.setErrors(obj)
      if (obj?.['email'] || obj?.['required'] || obj?.['whitespace']) { this.emailError = true; }
      else { this.emailError = false; }
    })

    this.passGroup?.valueChanges.pipe(
      tap(()=> { this.firstPassLoading = true; this.secondPassLoading = true; this.hideErrorText = true}),
      debounceTime(400),
    ).subscribe((res)=> {
      this.firstPassLoading = false; this.secondPassLoading = false; this.hideErrorText = false; 
      //this.passGroup?.setErrors(this.matchingPasswords())
      if (this.passGroup?.errors?.['matchingPasswords']) { this.bothPassError = true}
      else { this.bothPassError = false}
      
    })

    this.firstPass?.valueChanges.pipe(
      //tap(()=> {this.firstPassLoading = true; this.secondPassLoading = true}),
      debounceTime(400),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = this.helper('firstPass', this.firstPass)
      this.firstPass?.setErrors(obj)
      if (obj?.['minlength'] || obj?.['maxlength'] || obj?.['required'] || obj?.['whitespace']) { this.firstPassError = true} 
      else { this.firstPassError = false }
      //this.firstPassLoading = false; this.secondPassLoading = false
    })

    this.secondPass?.valueChanges.pipe(
      //tap(()=> {this.secondPassLoading = true; this.firstPassLoading = true}),
      debounceTime(400),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = this.helper("secondPass", this.secondPass)
      //this.secondPassLoading = false; this.firstPassLoading = false
      this.secondPass?.setErrors(obj)
      if (obj?.['minlength'] || obj?.['maxlength'] || obj?.['required'] || obj?.['whitespace']) { this.secondPassError = true} 
      else { this.secondPassError = false }
    })

    this.user?.valueChanges.pipe(
      tap((e)=> this.userLoading = true),
      debounceTime(400),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = this.helper("user", this.user)
      this.userLoading = false; this.invalidUserSubmit = false;
      this.user?.setErrors(obj)
      if (obj?.['minlength'] || obj?.['maxlength'] || obj?.['required'] || obj?.['whitespace']) { this.userError = true} 
      else { this.userError = false }
      
    },
    )

  }

  get email() { return this.inputForm.get('email') as FormControl}
  get user() { return this.inputForm.get('user') as FormControl}
  get firstPass() { return this.passGroup?.get('firstPass') as FormControl}
  get secondPass() { return this.passGroup?.get('secondPass') as FormControl}
  get passGroup() { return this.inputForm.get('passGroup') as FormGroup }

  updateBool(e:any) {
    if (this.firstTime) this.firstTime = false
    this.first = !this.first
  }

  async onSubmit(e:any) {
    //Pretty shit solution, change to rxjs subject later...
    if (this.userLoading || this.emailLoading || this.firstPassLoading || this.secondPassLoading) {
      setTimeout(()=>{
        this.onSubmit(e)
      },500)
      return
    }
      
    if (this.invalidEmailSubmit || this.invalidUserSubmit || this.currentSubmission || this.userError || this.bothPassError || this.emailError || this.firstPassError || this.secondPassError) {
      return
    }
    
    if (this.validate(this.inputForm)) {
      //submit form
      this.as.eventMsg.subscribe((res)=> { //* Good Enough For Now*
        switch (res) {
          case "Submitting...":{
            this.regButtonText = res; this.currentSubmission = true; this.hideErrorText = true; this.hideUserErrorText = true;
            this.userError = false; this.firstPassLoading = false; this.secondPassLoading = false; this.emailLoading = false;
            this.firstPassLoading = true; this.secondPassLoading = true; this.emailLoading = true; this.userLoading = true;
            break
          }
          case "Done!": {
            this.regButtonText = res
            setTimeout(()=>{
              //prefetch maybe -- Def add transition later **IMPORTANT** --perhaps disable input fields
              this.route.navigateByUrl('/login')
              this.regButtonText = "REGISTER"
              this.currentSubmission = false
            },400) 
            break
          }
          case "110": {
            setTimeout(()=>{
              this.invalidEmailSubmit = true; this.invalidUserSubmit = true; this.inputDefault()
            },400)
            
            break
          }
          case "001": {
            setTimeout(()=>{
              this.invalidEmailSubmit = true; this.invalidUserSubmit = false; 
              this.inputDefault()
            },400)
            break
          }
          case "010": {
            setTimeout(()=>{
              this.invalidUserSubmit = true; this.invalidEmailSubmit = false; 
              this.inputDefault()
            }, 400)
            break
          }
          case "FIRSTPASS_ERROR_MAX": {
            setTimeout(() => {
                this.inputDefault();
                this.firstPassError = true;
                this.firstPass.setErrors({'maxlength': true})
            }, 400);
            break
          }
          case "FIRSTPASS_ERROR_MIN": {
            setTimeout(() => {
                this.inputDefault();
                this.firstPassError = true;
                this.firstPass.setErrors({'minlength': true})
            }, 400);
            break
          }
          case "USER_ERROR_MIN": {
            setTimeout(() => {
                this.inputDefault();
                this.userError = true;
                this.user.setErrors({'minlength': true})
            }, 400);
            break
          }
          case "USER_ERROR_MAX": {
            setTimeout(() => {
                this.inputDefault();
                this.userError = true;
                this.user.setErrors({'maxlength': true})
            }, 400);
            break
          }
          case "SECONDPASS_ERROR_MAX": {
            setTimeout(() => {
                this.inputDefault();
                this.secondPassError = true;
                this.secondPass.setErrors({'maxlength': true})
            }, 400);
            break
          }
          case "SECONDPASS_ERROR_MIN": {
            setTimeout(() => {
                this.inputDefault();
                this.secondPassError = true;
                this.secondPass.setErrors({'minlength': true})
            }, 400);
            break
          }
          case "PASS_MATCHING_ERROR": {
            setTimeout(() => {
                this.inputDefault();
                this.bothPassError = true;
                this.passGroup.setErrors({'matchingPasswords': true})
            }, 400);
            break
          }
          case "EMAIL_ERROR": {
            setTimeout(() => {
                this.inputDefault();
                this.emailError = true;
                this.email.setErrors({'email': true})
            }, 400);
            break
          }
          case "USER_WHITESPACE_ERROR": {
            setTimeout(() => {
                this.inputDefault();
                this.userError = true;
                this.user.setErrors({'whitespace': true})
            }, 400);
            break
          }
          case "FIRSTPASS_WHITESPACE_ERROR": {
            setTimeout(() => {
                this.inputDefault();
                this.firstPassError = true;
                this.firstPass.setErrors({'whitespace': true})
            }, 400);
            break
          }
          case "SECONDPASS_WHITESPACE_ERROR": {
            setTimeout(() => {
                this.inputDefault();
                this.secondPassError = true;
                this.secondPass.setErrors({'whitespace': true})
            }, 400);
            break
          }
          case "EMAIL_WHITESPACE_ERROR": {
            setTimeout(() => {
                this.inputDefault();
                this.emailError = true;
                this.email.setErrors({'whitespace': true})
            }, 400);
            break
          }
        }

      })
      const msg = await this.as.createAccount(this.inputForm)

      
    }
    else {
      //incorrect form or something
      //* Review Later about this */
      this.emailLoading = true; this.userLoading = true; this.firstPassLoading = true; this.secondPassLoading = true; this.hideErrorText = true; this.hideUserErrorText = true;
      setTimeout(()=>{
        this.emailLoading = false; this.userLoading = false; this.firstPassLoading = false; this.secondPassLoading = false; this.hideErrorText = false; this.hideUserErrorText = false; this.currentSubmission = false;
      }, 500)
    }
  }
  
 
  helper(field:string, control:AbstractControl) {
    const obj: {[index:string]:any} = {}
    if (/\s/.test(control.value)) {
      obj['whitespace'] = true
    }
    if (control.value.length === 0) {
      obj['required'] = true
    }
    switch (field) {
      case "user": {
        if (control.value.length < 6 && control.value.length > 0) {
        obj['minlength'] = true
        }
        if (control.value.length > 16) { 
          obj['maxlength'] = true
        }
        break
      }
      case "email": {
        obj['email'] = Validators.email(control); obj['required'] = Validators.required(control); //auto trims it seems; good or bad thing?
        break
      }
      case "firstPass": {
        if (control.value.length < 8 && control.value.length > 0) {
          obj['minlength'] = true
        }
        if (control.value.length > 32) { 
          obj['maxlength'] = true
        }
        break
      }
      case "secondPass": {
        if (control.value.length < 8 && control.value.length > 0) {
          obj['minlength'] = true
        }
        if (control.value.length > 32) { 
          obj['maxlength'] = true
        }
        break
      }
      
    }
    return obj
  }

  validate(fg: FormGroup) {
    let error:boolean = true
    Object.keys(fg.controls).forEach(field => {
      const control = fg.get(field)
      if (control instanceof FormControl) {
        if (!control.touched || !control.dirty) {
          control.markAsTouched({onlySelf:true})
          control.markAsDirty({onlySelf:true})
        }
        const obj = this.helper(field, control)
        if (Object.keys(obj).length > 0 && obj['email'] === undefined) {error = false; }
        else if (obj['email'] !== undefined && obj['email']!==null) { error = false;  }
        control.setErrors(obj) 
        
      }
      else if (control instanceof FormGroup) {
        this.validate(control)
      }
    })
    return error
  }

  switchToHomePage(e:any) {
    this.route.navigateByUrl(``) //add animation later
  }

  inputDefault():void {
    this.regButtonText = "REGISTER"; this.userLoading = false; this.secondPassLoading=false; this.firstPassLoading = false; this.emailLoading = false;
    this.currentSubmission = false;
    this.hideUserErrorText = false; this.hideErrorText = false;
  }

  ngOnDestroy(): void {
  }

  matchingPasswords():ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('firstPass')?.value; const confirmPassword = control.get('secondPass')?.value
      if (password.length < 8 || password.length > 32 || confirmPassword.length < 8 || confirmPassword > 32) { return null } //doesn't fit
      return password === confirmPassword ? null : { matchingPasswords: true}
  }
}
}





