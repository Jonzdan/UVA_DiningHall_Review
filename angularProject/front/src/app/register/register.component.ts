import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, filter, Observable, Subscription, switchMap, tap } from 'rxjs';

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
      }),
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
      tap(()=> {this.firstPassLoading = true; this.secondPassLoading = true}),
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe((res)=> {
      this.firstPassLoading = false; this.secondPassLoading = false;
      this.passGroup?.setErrors({'matchingPasswords':this.matchingPasswords()})
    })

    this.firstPass?.valueChanges.pipe(
      tap(()=> {this.firstPassLoading = true; this.secondPassLoading = true}),
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
      this.firstPassLoading = false; this.secondPassLoading = false
      this.firstPass?.setErrors(obj)
    })

    this.secondPass?.valueChanges.pipe(
      tap(()=> {this.secondPassLoading = true; this.firstPassLoading = true}),
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
      this.secondPassLoading = false; this.firstPassLoading = false
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
    console.log(e.target)

    //validate all input fields again...
    //actually just check if any errors -- long ass if statement
    if (!this.email.dirty && !this.email.touched && !this.user.dirty && !this.user.touched /* continue on... */) { return }
  }

  ngOnDestroy(): void {
    
  }
  matchingPasswords():ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.get('firstPass')==control.get('secondPass') ? {matchingPasswords: {value: control.value}} : null
  }
}
}





