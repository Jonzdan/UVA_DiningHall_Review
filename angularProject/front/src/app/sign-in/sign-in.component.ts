import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, tap } from 'rxjs';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  firstTime: boolean = true
  first: boolean = false
  inputForm!: FormGroup
  userLoading:boolean = false; passLoading:boolean = false; 
  goodMsg!:string
  hideErrorText:boolean = false;
  hideUserErrorText:boolean = false;
  invalidPassSubmit:boolean = false; invalidUserSubmit:boolean = false;
  private currentSubmission:boolean = false;
  loginButtonText: string = "LOGIN"
  userError:boolean = false; passError:boolean = false;
  constructor(private as: AccountService, private router: Router) { }

  ngOnInit(): void {
    this.inputForm = new FormGroup({
      user: new FormControl('', []),
      password: new FormControl('', [])
    })
    
    this.user?.valueChanges.pipe(
      tap(()=> this.userLoading = true),
      debounceTime(400),
    ).subscribe((res)=>{
      this.userLoading = false; this.invalidUserSubmit = false;
      const obj = this.helper("user", this.user)
      this.user?.setErrors(obj)
      if (obj?.['minlength'] || obj?.['maxlength'] || obj?.['required']) { this.userError = true} 
      else { this.userError = false }
    })

    this.password?.valueChanges.pipe(
      tap(()=>this.passLoading = true),
      debounceTime(400)
    ).subscribe((res)=>{
      this.passLoading = false; this.invalidPassSubmit = false;
      const obj = this.helper("password", this.password)
      this.password?.setErrors(obj)
      if (obj?.['minlength'] || obj?.['maxlength'] || obj?.['required']) { this.passError = true} 
      else { this.passError = false }
    })
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
        // Add Something upon Form Submit where fields are invalid...
      }
      else if (control instanceof FormGroup) {
        this.validate(control)
      }
    })
    return error
  }

  async onSubmit(e:any) {
    //Pretty shit solution, change to rxjs subject later...
    if (this.userLoading || this.passLoading) {
      setTimeout(()=>{
        this.onSubmit(e)
      },500)
      return
    }  

    if (this.invalidPassSubmit || this.invalidUserSubmit || this.currentSubmission) {
      return
    }
    if (this.validate(this.inputForm)) {
      //submit form
      this.as.eventLoginMsg.subscribe((res)=> { //* Good Enough For Now*
        switch (res) {
          case "Submitting...":{
            this.loginButtonText = res; this.currentSubmission = true
            break
          }
          case "Done!": {
            this.loginButtonText = res
            setTimeout(()=>{
              //prefetch maybe -- Def add transition later **IMPORTANT** --perhaps disable input fields
              //this.router.navigateByUrl('/')
              this.loginButtonText = "LOGIN"
              this.currentSubmission = false
            },500) 
            break
          }
          case "01101111011101": {
            setTimeout(()=>{
              this.invalidPassSubmit = true; this.invalidUserSubmit = true
              this.currentSubmission = false; this.loginButtonText = "LOGIN"
            },500)
            
          }
          
        }
      })
      try {
        const msg = await this.as.pullAccount(this.inputForm)
      }
      catch (err) {
        console.log(err); this.loginButtonText = "LOGIN"
      }
      

      
    }
    else {
      //incorrect form or something
      //* Review Later about this */
      this.hideErrorText = true; this.hideUserErrorText = true; this.userLoading = true; this.passLoading = true
      setTimeout(()=>{
        this.hideErrorText = false; this.hideUserErrorText = false; this.currentSubmission = false; this.userLoading = false; this.passLoading = false;
      }, 500)
    }
  }

  get password() {
    return this.inputForm.get('password') as FormControl
  }

  get user() {
    return this.inputForm.get('user') as FormControl
  }

  updateBool(e:any) {
    if (this.firstTime) this.firstTime = false
    this.first = !this.first
  }

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
      case "password": {
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

  switchToHomePage(e:any) {
    this.router.navigateByUrl(``) //add animation later
  }

}
