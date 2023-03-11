import { Injectable } from '@angular/core';
import { Form, FormGroup } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, last, map, Subject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountInfo: {[index:string]: any} = {}
  private _logUrl = ''
  private _authHeaders = {}
  public eventMsg:BehaviorSubject<string> = new BehaviorSubject("")
  public eventLoginMsg:BehaviorSubject<string> = new BehaviorSubject("")
  public accountText:string = "Not Signed In"
  private _signedIn:boolean = false

  get signedIn() {
    return this._signedIn
  }

  constructor(private http: HttpClient, private router: Router) { }


  authBeginning() {
    const _url = './authConfirm'
    return this.http.post(_url, '', {
      observe: 'response'
    }).subscribe((res: HttpResponse<any>) => {
      console.log(res.body)
      if (res.body === '1110111' || res.status !== 200 || (res.body as loginResponse)?.username === undefined) { 
        return
      }
      this._signedIn = true; this.accountInfo['username'] = (res.body as loginResponse)?.username; this.accountText = (res.body as loginResponse)?.username

    })
  }

  async createAccount(form: FormGroup) {
    let obj: {[index:string]: any} = {}
    Object.keys(form.controls).forEach((field)=> {
      const control = form.get(field)
      if (control instanceof FormGroup) { //only assuming one nested group
        Object.keys(control.controls).forEach((f)=> {
          const data = control.get(f)
          obj[f] = data?.value.trim()
        })
      }
      else {
        obj[field] = control?.value.trim() //could just ban spaces
      }
      
    })
    const url = `./user/register`

    /*const req = new HttpRequest('POST','./user/register', JSON.stringify(obj), { --another way of doing it
      reportProgress:true,
    })
    return this.http.request(req).pipe(
      map(event => this.getEventMessage(event)),
      tap(msg => console.log(msg)),
      last()
    ).subscribe(res => console.log(res)) */

    let sent:boolean = false

    return this.http.post(url, JSON.stringify(obj), {
      'headers': {
        'content-type':'application/json'
      },
      observe: 'events',
      reportProgress: true
    }).pipe(
      map(event => this.getEventMessage(event)),
      tap(async msg => {
        await msg.then((res) => {
          if (sent && this.eventMsg.getValue() != "Submitting...") {
            this.eventMsg.next("Submitting...")
          }
          if ((res) === "Submitting...") {
            sent = true
            this.eventMsg.next(res)  
          }
          else if (res === "Done!") {
            this.eventMsg.next(res)
          }
        })
      
      }),
      last(),
      catchError((err, caught)=>{
        //this.eventMsg.next(err.error?.code)
        throw err
      }),
      ).subscribe((res)=> {
        console.log(res)

    })
    /*
    */
  }


  async pullAccount(form: FormGroup) {
    let obj: {[index:string]: any} = {}
    Object.keys(form.controls).forEach((field)=> {
      const control = form.get(field)
      if (control instanceof FormGroup) { //only assuming one nested group
        Object.keys(control.controls).forEach((f)=> {
          const data = control.get(f)
          obj[f] = data?.value.trim()
        })
      }
      else {
        obj[field] = control?.value.trim() //could just ban spaces
      }
      
    })
    const url = `./user/login`
    this.eventLoginMsg.next("Submitting...")

    const req =  this.http.post(url, JSON.stringify(obj), {
      'headers': {
        'content-type':'application/json'
      },
      observe: 'response',
      reportProgress: true
    }).pipe(
      tap(()=> {
        
      }),
      last(),
      catchError((err, caught) => {
        if (err.error?.code === '01101111011101') {
          this.eventLoginMsg.next("ERROR")
        }
        else if (err.error?.code === "4444") { //work on more
          this.eventLoginMsg.next("WHITESPACE_ERROR")
        }
        else if (err.error?.codes !== undefined) { //server-side error in validation
          for(let i = 0; i < err.error?.codes.length; i++) {
            switch (err.error?.codes[0]) {
              case "1000": {
                this.eventLoginMsg.next("PASS_ERROR_MAX")
                break
              }
              case "1001": {
                this.eventLoginMsg.next("PASS_ERROR_MIN")
                break
              }
              case "1101": {
                this.eventLoginMsg.next("USER_ERROR_MIN")
                break
              }
              case "1100": {
                this.eventLoginMsg.next("USER_ERROR_MAX")
                break
              }
            }
          }
        }
        throw err
      })
    )
  
    //** NEXT STEP::: FINISH INVALID FORM APPEARNCE */

      req.subscribe((res: HttpResponse<Object>)=> {
        if (res.body !== null) { 
        this.accountInfo['username'] = (res.body as loginResponse)?.username
        this.accountText = (res.body as loginResponse)?.username
        this._signedIn = true
        setTimeout(() => {
          this.eventLoginMsg.next("Done!")
          setTimeout(()=>{
            this.eventLoginMsg.next("LOGIN") //ew??
            this.router.navigateByUrl('/')
          },400)
        }, 400);
        //redirect to signed in navigation...
        //remove sign-in option/register when signed in
        //add sign-out option
      }
      else {
        console.log(res.headers)
      } 

    })


    
    /*
    */
  }

  timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getEventMessage(event:HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.Sent: {
        return "Submitting..."
      }
      case HttpEventType.Response: {
        await this.timeout(1000)
        return "Done!"
      }
      default: {
        console.log(event)
        return event.type.toString()
      }
    }
  }

  signOut() {
    const clearCookies = this.http.post('./user/signOut', this.accountInfo, {
      observe: "response"
    } )
    clearCookies.subscribe((res: HttpResponse<Object>)=> {
      if ((res.body as signOutResponse)?.msg === "Signed Out Successfully") { //signed out successfully
        this._signedIn = false; this.accountInfo = {}; this.accountText = "Not Signed In"
      }
      else {
        console.error(res)
      }
      
    })
    //send request to backend to clear all cookies/tokens
    
  }

}

interface loginResponse {
  username: string,
  //...
}

interface signOutResponse {
  msg: string
}
