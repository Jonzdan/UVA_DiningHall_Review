import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, ValidatorFn,Validator, AbstractControl, ValidationErrors, Form } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';

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

  constructor() { }

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

    this.email.statusChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((res)=> {
      if (this.email.status === "INVALID") {
        this.email?.setErrors({'email':Validators.email(this.email), 'required':Validators.required(this.email)})
      }
      
  })

    this.email?.valueChanges.pipe(
      tap(()=> this.emailLoading = true),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((res)=> {
      this.emailLoading = false
      this.email?.setErrors({'email':Validators.email(this.email), 'required':Validators.required(this.email)})
    })

    this.passGroup?.valueChanges.pipe(
      tap(()=> {this.firstPassLoading = true; this.secondPassLoading = true; this.hideErrorText = true}),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((res)=> {
      this.firstPassLoading = false; this.secondPassLoading = false; this.hideErrorText = false;
      //this.passGroup?.setErrors(this.matchingPasswords())
      
    })

    this.firstPass?.valueChanges.pipe(
      //tap(()=> {this.firstPassLoading = true; this.secondPassLoading = true}),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = {}
      if (this.firstPass.value.length < 8 && this.firstPass.value.length > 0) {
        obj['minlength'] = true
      }
      if (this.firstPass.value.length > 32) { 
        obj['maxlength'] = true
      }
      if (this.firstPass.value.length === 0) {
        obj['required'] = true
      }
      this.firstPass?.setErrors(obj)
      //this.firstPassLoading = false; this.secondPassLoading = false
    })

    this.secondPass?.valueChanges.pipe(
      //tap(()=> {this.secondPassLoading = true; this.firstPassLoading = true}),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = {}
      if (this.secondPass.value.length < 8 && this.secondPass.value.length > 0) {
        obj['minlength'] = true
      }
      if (this.secondPass.value.length > 32) { 
        obj['maxlength'] = true
      }
      if (this.secondPass.value.length === 0) {
        obj['required'] = true
      }
      //this.secondPassLoading = false; this.firstPassLoading = false
      this.secondPass?.setErrors(obj)
    })

    this.user?.valueChanges.pipe(
      tap((e)=> this.userLoading = true),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = {}
      if (this.user.value.length < 6 && this.user.value.length > 0) {
        obj['minlength'] = true
      }
      if (this.user.value.length > 16) { 
        obj['maxlength'] = true
      }
      if (this.user.value.length === 0) {
        obj['required'] = true
      }
      this.userLoading = false
      this.user?.setErrors(obj)
      
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

  onSubmit(e:any) {
    if (this.validate(this.inputForm)) {
      //submit form
      //use a service to submit to backend
    }
    else {
      //incorrect form or something
      //* Review Later about this */
      this.emailLoading = true; this.userLoading = true; this.firstPassLoading = true; this.secondPassLoading = true; this.hideErrorText = true; this.hideUserErrorText = true;
      setTimeout(()=>{
        this.emailLoading = false; this.userLoading = false; this.firstPassLoading = false; this.secondPassLoading = false; this.hideErrorText = false; this.hideUserErrorText = false;
      }, 500)
      
    }
  }

    //validate all input fields again...
    //actually just check if any errors -- long ass if statement
    
 
  helper(field:string, control:AbstractControl) {
    const obj: {[index:string]:any} = {}
    switch (field) {
      case "user": {
        if (control.value.length < 6 && control.value.length > 0) {
        obj['minlength'] = true
        }
        if (control.value.length > 16) { 
          obj['maxlength'] = true
        }
        if (control.value.length === 0) {
          obj['required'] = true
        }
        break
      }
      case "email": {
        return {'email':Validators.email(control), 'required':Validators.required(control)}
        break
      }
      case "firstPass": {
        if (control.value.length < 8 && control.value.length > 0) {
          obj['minlength'] = true
        }
        if (control.value.length > 32) { 
          obj['maxlength'] = true
        }
        if (control.value.length === 0) {
          obj['required'] = true
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
        if (control.value.length === 0) {
          obj['required'] = true
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
        if (Object.keys(obj).length > 0) error = false
        control.setErrors(obj) 
        
      }
      else if (control instanceof FormGroup) {
        this.validate(control)
      }
    })
    return error
  }


  ngOnDestroy(): void {
    
  }

  matchingPasswords():ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('firstPass')?.value; const confirmPassword = control.get('secondPass')?.value
      return password === confirmPassword ? null : { matchingPasswords: true}
  }
}
}





