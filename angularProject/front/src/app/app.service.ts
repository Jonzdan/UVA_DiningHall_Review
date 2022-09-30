import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient) { }

  getData(target:string) {
    return this.http.get(`http://localhost:4200/api/${target}`).pipe(map((res: any) => JSON.stringify(res)))
  }

}
