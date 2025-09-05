import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
    HttpClient,
    type HttpEvent,
    HttpEventType,
    HttpResponse,
} from '@angular/common/http';
import {
    BehaviorSubject,
    TimeoutError,
    catchError,
    last,
    map,
    tap,
    timeout,
} from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private _accountInfo: Record<string, any> = {};
    private _logUrl = '';
    private _authHeaders = {
        headers: {
            'content-type': 'application/json',
        },
    };
    public eventMsg = new BehaviorSubject<string>('');
    public eventLoginMsg = new BehaviorSubject<string>('');
    private _currentSelected = 'Profile';
    public accountText = 'Not Signed In';
    private _signedIn = false;
    private _tempSettingStore: Record<string, any> = {};
    private _pendingChanges = false;
    private _clickedOnTargets = new Array<any>(); //this could be really bad, maybe change later **IMPORTANT**
    private _notificationsEmailText =
        "Get emails to find out what's going on when you're not online. You can turn these off.";
    private _notificationsPushText =
        "Get push notifications in-app to find out what's going on when you're online.";
    private _passwordText = 'Configure details about your password';
    private _profileText = 'View Details About Your Profile';

    get signedIn() {
        return this._signedIn;
    }
    get pendingChanges() {
        return this._pendingChanges;
    }
    set pendingChanges(b: boolean) {
        this._pendingChanges = b;
    }
    get accountInfo() {
        return this._accountInfo;
    }
    get clickedOnTargets() {
        return this._clickedOnTargets;
    }
    get tempSettingStore() {
        return JSON.parse(JSON.stringify(this._tempSettingStore));
    }
    get currentSelected() {
        return this._currentSelected;
    }
    set currentSelected(s: string) {
        if (this.convertViewToProperty(s) === '') {
            alert('Unknown Request'); //probably use modal or something to showcase
            return;
        }
        this._currentSelected = s;
    }

    private updateTemporaryAccountSettings(): boolean {
        const keys = Object.keys(this.accountInfo);
        for (const setting in this._tempSettingStore) {
            if (!keys.includes(setting)) {
                return false;
            }
            if (Object.keys(setting).length > 0) {
                const settings: Record<string, any> =
                    this._tempSettingStore[setting];
                for (const property in settings) {
                    //what if there are more nested properties? Also maybe assume both have same properties to speed this up?
                    try {
                        this.accountInfo[setting][property] =
                            settings[property];
                    } catch (err) {
                        return false;
                    }
                }
            } else {
                this.accountInfo[setting] = this._tempSettingStore[
                    setting
                ] as Record<string, any>;
            }
        }
        return true;
    }

    updateAccountSettings(): boolean {
        //only upon save changes button
        const updatedSuccess = this.updateTemporaryAccountSettings();
        if (!updatedSuccess) return false;

        const url = './user/updateSettings';
        this._tempSettingStore['username'] = this._accountInfo['username'];
        this.http
            .post(url, this._tempSettingStore, {
                headers: {
                    'content-type': 'application/json',
                },
                reportProgress: true,
            })
            .pipe(
                timeout(5000),
                catchError((err, caught) => {
                    console.error(err);
                    return caught;
                }),
            )
            .subscribe((res) => {
                //console.log(res)
            });
        this.resetNotificationSettingsToDefault();
        return true;
    }

    addTempSettingStore(
        identifier_key: string,
        obj_key: string,
        value: any,
    ): void {
        if (typeof obj_key !== 'string') return;
        obj_key.trim();
        if (this._tempSettingStore[identifier_key] === undefined) {
            this._tempSettingStore[identifier_key] = {};
        }
        this._tempSettingStore[identifier_key][obj_key] = value;
        this._pendingChanges = true;
    }

    resetSettingsToDefault(): void {
        this._currentSelected = 'Profile';
        this.resetNotificationSettingsToDefault();
    }

    resetNotificationSettingsToDefault(): void {
        this._tempSettingStore = {};
        this._clickedOnTargets = [];
        this._pendingChanges = false;
    }

    addToTargetsArray(e: any, actualPropName: string) {
        if (
            !(e.target instanceof HTMLInputElement) ||
            !(e instanceof PointerEvent)
        )
            return;
        if (
            this._clickedOnTargets.includes({
                target: e.target,
                prop: actualPropName,
            })
        )
            return;
        this._clickedOnTargets.push({ target: e.target, prop: actualPropName });
    }

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {}

    authBeginning() {
        const _url = './authConfirm';
        return this.http
            .post(_url, '', {
                observe: 'response',
            })
            .subscribe((res: HttpResponse<any>) => {
                if (
                    res.body === '1110111' ||
                    res.status !== 200 ||
                    (res.body as loginResponse)?.username === undefined
                ) {
                    return;
                }
                this._signedIn = true;
                this.accountInfo['username'] = (
                    res.body as loginResponse
                )?.username;
                this.accountText = (res.body as loginResponse)?.username;
                if (this.router.url === '/settings') {
                    this.pullAccountDetails();
                }
            });
    }

    async createAccount(form: FormGroup) {
        const obj: Record<string, any> = {};
        Object.keys(form.controls).forEach((field) => {
            const control = form.get(field);
            if (control instanceof FormGroup) {
                //only assuming one nested group
                Object.keys(control.controls).forEach((f) => {
                    const data = control.get(f);
                    obj[f] = data?.value;
                });
            } else {
                obj[field] = control?.value; //could just ban spaces
            }
        });
        const url = `./user/register`;

        /*const req = new HttpRequest('POST','./user/register', JSON.stringify(obj), { --another way of doing it
      reportProgress:true,
    })
    return this.http.request(req).pipe(
      map(event => this.getEventMessage(event)),
      tap(msg => console.log(msg)),
      last()
    ).subscribe(res => console.log(res)) */

        let sent = false;

        const b = this.http
            .post(url, JSON.stringify(obj), {
                headers: {
                    'content-type': 'application/json',
                },
                observe: 'events',
                reportProgress: true,
            })
            .pipe(
                map((event) => this.getEventMessage(event)),
                tap(async (msg) => {
                    await msg.then((res) => {
                        if (
                            sent &&
                            this.eventMsg.getValue() != 'Submitting...'
                        ) {
                            this.eventMsg.next('Submitting...');
                        }
                        if (res === 'Submitting...') {
                            sent = true;
                            this.eventMsg.next(res);
                        } else if (res === 'Done!') {
                            this.eventMsg.next(res);
                        }
                    });
                }),
                timeout(5000),
                last(),
                catchError((err, caught) => {
                    if (err.error?.codes !== undefined) {
                        //server-side error in validation
                        for (let i = 0; i < err.error?.codes.length; i++) {
                            switch (err.error?.codes[i]) {
                                case '1000': {
                                    this.eventMsg.next('FIRSTPASS_ERROR_MAX');
                                    break;
                                }
                                case '1001': {
                                    this.eventMsg.next('FIRSTPASS_ERROR_MIN');
                                    break;
                                }
                                case '1101': {
                                    this.eventMsg.next('USER_ERROR_MIN');
                                    break;
                                }
                                case '1100': {
                                    this.eventMsg.next('USER_ERROR_MAX');
                                    break;
                                }
                                case '2000': {
                                    this.eventMsg.next('SECONDPASS_ERROR_MAX');
                                    break;
                                }
                                case '2001': {
                                    this.eventMsg.next('SECONDPASS_ERROR_MIN');
                                    break;
                                }
                                case '3000': {
                                    this.eventMsg.next('PASS_MATCHING_ERROR');
                                    break;
                                }
                                case '1111': {
                                    this.eventMsg.next('EMAIL_ERROR');
                                    break;
                                }
                                case 'u0000': {
                                    this.eventMsg.next('USER_WHITESPACE_ERROR');
                                    break;
                                }
                                case 'f0000': {
                                    this.eventMsg.next(
                                        'FIRSTPASS_WHITESPACE_ERROR',
                                    );
                                    break;
                                }
                                case 's0000': {
                                    this.eventMsg.next(
                                        'SECONDPASS_WHITESPACE_ERROR',
                                    );
                                    break;
                                }
                                case 'e0000': {
                                    this.eventMsg.next(
                                        'EMAIL_WHITESPACE_ERROR',
                                    );
                                    break;
                                }
                            }
                        }
                    } else if (err.error?.code !== undefined) {
                        this.eventMsg.next(err.error?.code);
                    } else {
                        this.eventMsg.next('TIMEOUT_ERROR');
                    }
                    throw err;
                }),
            )
            .subscribe((res) => {});
        /*
         */
    }

    async pullAccount(form: FormGroup) {
        const obj: Record<string, any> = {};
        Object.keys(form.controls).forEach((field) => {
            const control = form.get(field);
            if (control instanceof FormGroup) {
                //only assuming one nested group
                Object.keys(control.controls).forEach((f) => {
                    const data = control.get(f);
                    obj[f] = data?.value;
                });
            } else {
                obj[field] = control?.value; //could just ban spaces
            }
        });
        const url = `./user/login`;
        this.eventLoginMsg.next('Submitting...');
        const req = this.http
            .post(url, JSON.stringify(obj), {
                headers: {
                    'content-type': 'application/json',
                },
                observe: 'response',
                reportProgress: true,
            })
            .pipe(
                tap(() => {}),
                timeout(5000),
                last(),
                catchError((err, caught) => {
                    if (err.error?.code === '01101111011101') {
                        this.eventLoginMsg.next('ERROR');
                    } else if (err.error?.codes !== undefined) {
                        //server-side error in validation
                        for (let i = 0; i < err.error?.codes.length; i++) {
                            switch (err.error?.codes[i]) {
                                case '1000': {
                                    this.eventLoginMsg.next('PASS_ERROR_MAX');
                                    break;
                                }
                                case '1001': {
                                    this.eventLoginMsg.next('PASS_ERROR_MIN');
                                    break;
                                }
                                case '1101': {
                                    this.eventLoginMsg.next('USER_ERROR_MIN');
                                    break;
                                }
                                case '1100': {
                                    this.eventLoginMsg.next('USER_ERROR_MAX');
                                    break;
                                }
                                case 'u0000': {
                                    this.eventLoginMsg.next(
                                        'USER_WHITESPACE_ERROR',
                                    );
                                    break;
                                }
                                case 'p0000': {
                                    this.eventLoginMsg.next(
                                        'PASS_WHITESPACE_ERROR',
                                    );
                                    break;
                                }
                            }
                        }
                    } else if (
                        err instanceof TimeoutError ||
                        err.status === 504
                    ) {
                        this.eventLoginMsg.next('TIMEOUT_ERROR');
                    } else {
                        this.eventLoginMsg.next('TIMEOUT_ERROR');
                    }
                    throw err;
                }),
            );

        const _ = req.subscribe((res: HttpResponse<object>) => {
            try {
                if (res.body !== null) {
                    this.accountInfo['username'] = (
                        res.body as loginResponse
                    )?.username;
                    this.accountText = (res.body as loginResponse)?.username;
                    this._signedIn = true;
                    setTimeout(() => {
                        this.eventLoginMsg.next('Done!');
                        setTimeout(() => {
                            this.eventLoginMsg.next('LOGIN'); //ew??
                            this.router.navigateByUrl('/');
                        }, 400);
                    }, 400);
                    //redirect to signed in navigation...
                    //remove sign-in option/register when signed in
                    //add sign-out option
                } else {
                    // console.log(res.headers)
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    async pullAccountDetails() {
        if (!this._signedIn || Object.keys(this.accountInfo).length === 0)
            return;
        const url = './user/settings';
        this.http
            .post(url, this.accountInfo, {
                headers: {
                    'content-type': 'application/json',
                },
                observe: 'response',
            })
            .pipe(
                catchError((err, caught) => {
                    throw err;
                }),
            )
            .subscribe((res: HttpResponse<any>) => {
                this._accountInfo = res?.body[0];
            });
    }

    async resetPassword(form: FormGroup) {
        const obj: Record<string, any> = {};
        obj['username'] = this._accountInfo['username'];
        Object.keys(form.controls).forEach((field) => {
            const control = form.get(field);
            if (control instanceof FormGroup) {
                //only assuming one nested group
                Object.keys(control.controls).forEach((f) => {
                    const data = control.get(f);
                    obj[f] = data?.value;
                });
            } else {
                obj[field] = control?.value; //could just ban spaces
            }
        });
        const url = `./user/updateSettings`;
        this.eventLoginMsg.next('Submitting...');
        const req = this.http
            .post(url, JSON.stringify(obj), {
                headers: {
                    'content-type': 'application/json',
                },
                observe: 'response',
                reportProgress: true,
            })
            .pipe(
                tap(() => {}),
                timeout(5000),
                last(),
                catchError((err, caught) => {
                    //* handle ERROR HANDLING LATER *
                    this.eventMsg.next('401');
                    throw err;
                }),
            );

        const b = await new Promise((resolve, reject) => {
            req.subscribe((res: HttpResponse<object>) => {
                try {
                    if (res.body !== null) {
                        //do something...
                        resolve(res);
                    } else {
                        resolve(res);
                    }
                } catch (err) {
                    reject(res);
                }
            });
        }).then((res) => {
            return res;
        });

        return b;
    }

    timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async getEventMessage(event: HttpEvent<any>) {
        switch (event.type) {
            case HttpEventType.Sent: {
                return 'Submitting...';
            }
            case HttpEventType.Response: {
                await this.timeout(1000);
                return 'Done!';
            }
            default: {
                return event.type.toString();
            }
        }
    }

    signOut() {
        const clearCookies = this.http.post(
            './user/signOut',
            this.accountInfo,
            {
                observe: 'response',
            },
        );
        clearCookies.subscribe((res: HttpResponse<object>) => {
            if (
                (res.body as signOutResponse)?.msg === 'Signed Out Successfully'
            ) {
                //signed out successfully
                this._signedIn = false;
                this._accountInfo = {};
                this.accountText = 'Not Signed In';
                this.authBeginning();
            } else {
                console.error(res);
            }
        });
    }

    convertPropertyToView(s: string): string {
        switch (s) {
            case 'dateJoined': {
                return 'Date Joined';
            }
            case 'email': {
                return 'Email';
            }
            case 'notifications': {
                return 'Notification';
            }
            case 'profile': {
                return 'Profile';
            }
            case 'username': {
                return 'Username';
            }
            case 'password': {
                return 'Password';
            }
            default:
                return '';
        }
    }

    convertViewToProperty(s: string): string {
        switch (s) {
            case 'Date Joined': {
                return 'dateJoined';
            }
            case 'Email': {
                return 'email';
            }
            case 'Notification': {
                return 'notifications';
            }
            case 'Profile': {
                return 'profile';
            }
            case 'Username': {
                return 'username';
            }
            case 'Password': {
                return 'password';
            }
            case 'Logout': {
                this.signOut();
                return s;
            }
            default:
                return '';
        }
    }

    convertNotificationPropIntoView(s: string) {
        switch (s) {
            case 'food_opt_in_bol':
                return 'Food Notifications';
            case 'newcomb_opt_in':
                return 'Newcomb Notifications';
            case 'ohill_opt_in':
                return 'Ohill Notifications';
            case 'opt_in_whenToNotify':
                return 'Notification Times';
            case 'reply_to_post':
                return 'Comment Notifications';
            case 'runk_opt_in':
                return 'Runk Notifications';
            default:
                return '';
        }
    }

    convertViewIntoNotificationProp(s: string) {
        switch (s) {
            case 'Food Notifications':
                return 'food_opt_in_bol';
            case 'Newcomb Notifications':
                return 'newcomb_opt_in';
            case 'Ohill Notifications':
                return 'ohill_opt_in';
            case 'Notification Times':
                return 'opt_in_whenToNotify';
            case 'Comment Notifications':
                return 'reply_to_post';
            case 'Runk Notifications':
                return 'runk_opt_in';
            default:
                return '';
        }
    }

    getNotificationSubtext(s: string) {
        switch (s) {
            case 'food_opt_in_bol':
                return 'Get notified when a certain food(s) arrives';
            case 'newcomb_opt_in':
                return 'Recieve notifications from Newcomb Dining Hall';
            case 'ohill_opt_in':
                return 'Recieve notifications from Observatory Hill Dining Hall';
            case 'opt_in_whenToNotify':
                return 'Opt in to recieve notifications from a specific time period';
            case 'reply_to_post':
                return 'Comment Notifications';
            case 'runk_opt_in':
                return 'Recieve notifications from Runk Dining Hall';
            default:
                return '';
        }
    }

    getStringsForIdentifiers(identifier: string): Record<string, any> {
        const strings: Record<string, any> = {};
        switch (identifier) {
            case 'Notification': {
                strings['title'] = `Email ${identifier}s`;
                strings['subtext'] = this._notificationsEmailText;
                break;
            }
            case 'Password': {
                strings['title'] = `Change your ${identifier}`;
                strings['subtext'] = this._passwordText;
                break;
            }
            case 'Profile': {
                strings['title'] = `View your ${identifier}`;
                strings['subtext'] = this._profileText;
                break;
            }
            default: {
                break;
            }
        }
        return strings;
    }

    convertIdentifierToActualPropNames(
        o: Record<string, any>,
        identifier: string,
    ): Record<string, any> {
        const retObj: Record<string, any> = {};
        switch (identifier) {
            case 'Date Joined': {
                break;
            }
            case 'Email': {
                break;
            }
            case 'Notification': {
                retObj['name'] = this.convertNotificationPropIntoView(o['key']);
                retObj['subtext'] = this.getNotificationSubtext(o['key']);
                break;
            }
            case 'Profile': {
                retObj['name'] = o['key'];
                retObj['subText'] = 'WHERE IS THIS';
                break;
            }
            case 'Username': {
                break;
            }
            case 'Password': {
                retObj['name'] = 'temp';
                retObj['subtext'] = 'placeholder';
                break;
            }
            default:
                break;
        }
        return retObj;
    }
}

interface loginResponse {
    username: string;
    //...
}

interface signOutResponse {
    msg: string;
}
