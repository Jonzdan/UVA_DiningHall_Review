import {
    HttpClient,
    HttpHeaders,
} from '@angular/common/http';
import {
    BehaviorSubject,
    firstValueFrom,
    Observable,
    timeout,
} from 'rxjs';
import { Injectable } from '@angular/core';
import type { AccountDetails, ApiGroups } from './types';
import {
    type AppRoute,
    type AuthConfirmOutput,
    LoginApi,
    ROUTES,
    SignupApi,
    UpdateUserApi,
    type UserLoginOutput,
    type UserSettingsApi,
} from 'hoorank-shared';
import { timeoutDurationMs } from './constants';

const jsonHeader: HttpHeaders | {
    [header: string]: string | string[];
} = {
    'content-type': 'application/json',
};

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private details: AccountDetails;

    constructor(
        private http: HttpClient,
    ) {
        this.details = {
            isSignedIn$: new BehaviorSubject<boolean | null>(null),
            isSignedIn: false,
            displayText: 'Not Signed In',
        };
    }

    /**
     * old method name: authBeginning
     * Add handling when session times out on server (clear)
     */
    async initializeSession(): Promise<void> {
        const { status, body } = await firstValueFrom(this.http
            .get<AuthConfirmOutput>(ROUTES.AUTH.REFRESH, {
                observe: 'response',
                withCredentials: true
            })
            .pipe(
                timeout(timeoutDurationMs)
            )
        );

        if (status !== 200 || !body?.username) {
            this.setSignedInStatus(false);
            this.details.username = '';
            return;
        }

        this.setSignedInStatus(true);
        this.details.username = body.username;
        this.details.displayText = body.username;
    }

    async createAccount(data: SignupApi): Promise<void> {
        await this.post<void>(ROUTES.USER.REGISTER, data);
    }

    private setSignedInStatus(value: boolean): void {
        this.details.isSignedIn = value;
        this.details.isSignedIn$.next(value);
    }

    async getAccount(data: LoginApi): Promise<void> {
        const { username, pictureB64 } = await this.post<UserLoginOutput>(ROUTES.USER.LOGIN, data);

        this.setSignedInStatus(true);
        this.details.username = username;
        this.details.displayText = username;

        this.details.settings ??= {};
        this.details.settings.profile ??= {};
        this.details.settings.profile.picture = pictureB64;
    }

    async pullAccountDetails(): Promise<void> {
        const { profile, notifications } = await this.get<UserSettingsApi>(ROUTES.USER.SETTINGS);
        this.details.settings = {
            ...this.details.settings,
            profile,
            notifications,
        };
    }

    async resetPassword(data: UpdateUserApi): Promise<void> {
        await firstValueFrom(this.http
            .put(ROUTES.USER.SETTINGS, data, { headers: jsonHeader })
            .pipe(
                timeout(timeoutDurationMs),
            )
        );
    }

    async logout(): Promise<void> {
        await this.post<void>(ROUTES.USER.LOGOUT, null);
        await this.initializeSession();
    }

    private async get<T>(route: AppRoute, header={ headers: jsonHeader }): Promise<T> {
        return await firstValueFrom(
            this.http
                .get<T>(route, { ...header, withCredentials: true })
                .pipe(
                    timeout(timeoutDurationMs)
                ),
        );
    }

    private async post<T>(route: AppRoute, body: ApiGroups | null, header={ headers: jsonHeader }): Promise<T> {
        return await firstValueFrom(this.http
            .post<T>(route, body, { ...header, withCredentials: true })
            .pipe(
                timeout(timeoutDurationMs)
            )
        )
    }

    get accountDetails(): Readonly<AccountDetails> {
        return this.details;
    }

    get isSignedIn(): boolean {
        return this.details.isSignedIn;
    }

    get isSignedIn$(): Observable<boolean | null> {
        return this.accountDetails.isSignedIn$.asObservable();
    }
}
