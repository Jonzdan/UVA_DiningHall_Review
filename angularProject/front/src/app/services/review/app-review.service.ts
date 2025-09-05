import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppReviewService {
    constructor(private http: HttpClient) {}

    async sendReview(target: string, content: any) {
        const options = { 'content-type': 'application/json' };
        const path = `/api/${target}`;
        return this.http.post(path, content, { headers: options });
    }
}
