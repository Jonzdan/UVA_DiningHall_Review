import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AppReviewService {

  constructor(private http: HttpClient) { }

  async sendReview(target:string, content: any) {
    let options = { 'content-type': 'application/json'}
    let path = `/api/${target}`
    return this.http.post(path, content, {'headers':options})
  }
}
