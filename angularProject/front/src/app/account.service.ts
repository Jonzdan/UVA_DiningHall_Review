import { Injectable } from '@angular/core';
import { Form, FormGroup } from '@angular/forms';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, catchError, last, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  accountInfo = {}
  private _logUrl = ''
  private _authHeaders = {}
  public eventMsg:BehaviorSubject<string> = new BehaviorSubject("")

  constructor(private http: HttpClient) { }

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
    const url = "./user/register"

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
        this.eventMsg.next(err.error.code)
        throw err
      }),
      ).subscribe((res)=> {
        console.log(res)
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
        return ""
      }
    }
  }


  async getAccount(form: FormGroup) {
    let obj = {}
    Object.keys(form.controls).forEach((field)=>{
      const control = form.get(field)
      Object.assign(obj, control?.value)
    })
    //attach a behaviorSubject here to watch for changes to add loading
    const res = this.http.post(this._logUrl, JSON.stringify(obj), this._authHeaders)

  }

}
