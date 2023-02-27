import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private http: HttpClient) { }

  async getCSRF() {
    await new Promise(resolve => (this.http.get('./getCSRFToken').subscribe(res => resolve(res)))) //should set by default
  }

  async getSession() {
    
  }
}
