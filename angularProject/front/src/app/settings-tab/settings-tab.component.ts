import { Component, ElementRef, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AccountService } from '../account.service';
import { Subscription, debounceTime, tap } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {

  @Input() identifier!: any;
  @ViewChild('modal') modal:any;
  options:{[index:string]:any} = {}
  text:{[index:string]:any} = {}
  firstTime: boolean = true
  first: boolean = false
  inputForm!: FormGroup
  passLoading:boolean = false;  firstPassLoading:boolean = false; secondPassLoading:boolean = false;
  goodMsg!:string
  hideErrorText:boolean = false;
  invalidPassSubmit:boolean = false; invalidUserSubmit:boolean = false;
  private currentSubmission:boolean = false;
  resetPassbtn: string = "Reset Password"
  passError:boolean = false; secondPassError: boolean = false; firstPassError:boolean = false; bothPassError:boolean = false
  dialogText:string = "Invalid Password"; subDialogText:string = "Our system detected an error with one of the entered passwords. Please check your passwords and try again."
  private _subscription:Subscription = new Subscription()
  constructor(private acc:AccountService, private elementRef:ElementRef, private router:Router) { }

  ngOnInit(): void {
    this.options = this.acc.accountInfo[this.acc.convertViewToProperty(this.identifier)]
    this.text = this.acc.getStringsForIdentifiers(this.identifier)
    this.inputForm = new FormGroup({
      password: new FormControl('', []),
      passGroup: new FormGroup({
        firstPass: new FormControl('', []),
        secondPass: new FormControl('', []),
      }, this.matchingPasswords()),
    })

  
    const passObs = this.password?.valueChanges.pipe(
      tap(()=>{ this.passError = false}),
      debounceTime(400),
    ).subscribe((res)=>{
      this.passLoading = false; this.invalidPassSubmit = false;
      const obj = this.helper("password", this.password)
      this.password?.setErrors(obj);
    })

    const passgroup = this.passGroup?.valueChanges.pipe(
      tap(()=> { /* this.firstPassLoading = true; */ this.secondPassLoading = true;}),
      debounceTime(400),
    ).subscribe((res)=> {
      //this.passGroup?.setErrors(this.matchingPasswords())
      this.secondPassLoading = false;
    })

    const fp = this.firstPass?.valueChanges.pipe(
      //tap(()=> {this.firstPassLoading = true; this.secondPassLoading = true}),
      debounceTime(400),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = this.helper('firstPass', this.firstPass)
      this.firstPass?.setErrors(obj)
      /* if (obj?.['minlength'] || obj?.['maxlength'] || obj?.['required'] || obj?.['whitespace']) { this.firstPassError = true} 
      else { this.firstPassError = false } */
      //this.firstPassLoading = false; this.secondPassLoading = false
    })

    const sp = this.secondPass?.valueChanges.pipe(
      //tap(()=> {this.secondPassLoading = true; this.firstPassLoading = true}),
      debounceTime(400),
    ).subscribe((res)=>{
      const obj: {[index:string]:any} = this.helper("secondPass", this.secondPass)
      //this.secondPassLoading = false; this.firstPassLoading = false
      this.secondPass?.setErrors(obj)
      /* if (obj?.['minlength'] || obj?.['maxlength'] || obj?.['required'] || obj?.['whitespace']) { this.secondPassError = true} 
      else { this.secondPassError = false } */
    })

    const regEventMsg = this.acc.eventMsg.subscribe((res)=> { //* Good Enough For Now*
      switch (res) {
        case "401": { //temporary
          this.inputDefault(); this.passError = true;
          this.showModals('');
          break
        }
        case "Submitting...":{
          this.resetPassbtn = "Reset Password", this.currentSubmission = true; this.hideErrorText = true; 
          this.firstPassLoading = false; this.secondPassLoading = false; 
          this.firstPassLoading = true; this.secondPassLoading = true; 
          break
        }
        case "Done!": {
          this.resetPassbtn = res
          setTimeout(()=>{
            //prefetch maybe -- Def add transition later **IMPORTANT** --perhaps disable input fields
            this.resetPassbtn = "RESET PASSWORD"
            this.currentSubmission = false
          },400) 
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
        case "TIMEOUT_ERROR": {
          setTimeout(() => {
            this.inputDefault();
            this.secondPass.setErrors({'timeout': true})
          }, 400);
        }
      }

    })
      
    this._subscription.add(passObs)
    this._subscription.add(fp); this._subscription.add(sp); this._subscription.add(passgroup); this._subscription.add(regEventMsg)
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
        control.setErrors(obj) 
        
      }
      else if (control instanceof FormGroup) {
        this.validate(control)
      }
    })
    return error
  }

  async onSubmit(e:any) {
    //Pretty shit solution, change to rxjs subject later...
    if (this.firstPassLoading || this.secondPassLoading) {
      setTimeout(()=>{
        this.onSubmit(e)
      },500)
      return
    }  

    if (this.invalidPassSubmit || this.invalidUserSubmit || this.currentSubmission || this.passError || this.firstPassError || this.secondPassError) {
      return
    }
    if (this.validate(this.inputForm)) {
      //submit form

      const res = await this.acc.resetPassword(this.inputForm)
      console.log(res);
      //just in case

    }
    else {
      //incorrect form or something
      //* Review Later about this */
      this.hideErrorText = true;  this.passLoading = true
      setTimeout(()=>{
        this.hideErrorText = false; this.currentSubmission = false; this.passLoading = false;
      }, 500)
    }
  }

  inputDefault():void {
    this.resetPassbtn = "Reset Password"; this.passLoading = false; this.secondPassLoading=false; this.firstPassLoading = false;
    this.currentSubmission = false;
    this.hideErrorText = false;
  }

  updateBool(e:any) {
    if (this.firstTime) this.firstTime = false
    this.first = !this.first
  }

  helper(field:string, control:AbstractControl) {
    const obj: {[index:string]:any} = {}
    if (control.value.length === 0) {
      obj['required'] = true
    }
    if (/\s/.test(control.value)) {
      obj['whitespace'] = true
    }
    switch (field) {
      case "password": {
        if (control.value.length < 8 && control.value.length > 0) {
          obj['minlength'] = true
        }
        if (control.value.length > 32) { 
          obj['maxlength'] = true
        }
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

  matchingPasswords():ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('firstPass')?.value; const confirmPassword = control.get('secondPass')?.value
      //if (password.length < 8 || password.length > 32 || confirmPassword.length < 8 || confirmPassword > 32) { return null } //doesn't fit
      return password === confirmPassword ? null : { matchingPasswords: true}
    }
  }

  ngAfterViewInit():void {
    
  }

  showModals(e:any) {
    this.modal.nativeElement.showModal();
  }

  closeModal(e:any) {
    this.modal.nativeElement.close();
  }

  checkIfPropIsChecked(specificSetting:string) { //don't need general since it's specific to component
    return this.options[specificSetting]
  }

  skipFoodProperty(s:string) {
    if (s === "food_opt_in_val") return false
    return true
  }

  get title() { return this.text['title'] }
  get subtext() { return this.text['subtext'] } 
  get settingsList() { return this.acc.accountInfo}
  get password() {
    return this.inputForm.get('password') as FormControl
  }

  get firstPass() { return this.passGroup?.get('firstPass') as FormControl}
  get secondPass() { return this.passGroup?.get('secondPass') as FormControl}
  get passGroup() { return this.inputForm.get('passGroup') as FormGroup }

}
