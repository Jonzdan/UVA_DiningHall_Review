import { Injectable } from '@angular/core';
import { AccountService } from '../account/account.service';
import { SettingsService } from '../settings';
import { BehaviorSubject, distinctUntilChanged, filter, map, combineLatest, Observable, switchMap, Subject, withLatestFrom, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountOrchestrationService {
    private isAccountInitialized: BehaviorSubject<boolean>;
    public isAccountInitialized$: Observable<boolean>;
    private initializeTrigger$: Subject<void>;

    constructor(private accountService: AccountService, private settingsService: SettingsService) {
        this.isAccountInitialized = new BehaviorSubject(this.accountService.isSignedIn);
        this.isAccountInitialized$ = this.isAccountInitialized.asObservable();

        this.initializeTrigger$ = new Subject<void>;
        this.initializeTrigger$.pipe(
            withLatestFrom(this.accountService.isSignedIn$),
            filter(([_, isSignedIn]) => {
                if (isSignedIn === null) {
                    return false;
                }
                return isSignedIn;
            }),
            take(1),
            tap(() => this.initialize())
        ).subscribe();

        this.accountService.isSignedIn$
            .pipe(
                distinctUntilChanged(),
                filter(isSignedIn => !isSignedIn),
                tap(() => {
                    this.reset();
                    this.unsetInitializationStatus();
                })
            ).subscribe();
    }

    triggerInitialization() {
        this.initializeTrigger$.next();
    }

    async initialize(): Promise<void> {
        await this.accountService.pullAccountDetails();
        this.settingsService.buildToggleState(this.accountService.accountDetails.settings);
        this.isAccountInitialized.next(true);
    }

    /** Save staged settings to backend and refresh source of truth */
    async save(): Promise<boolean> {
        const success = await this.settingsService.updateAccountSettings();
        if (!success) {
            return false;
        }

        await this.accountService.pullAccountDetails();
        this.settingsService.buildToggleState(this.accountService.accountDetails.settings);

        return true;
    }

    reset(): void {
        this.settingsService.buildToggleState(this.accountService.accountDetails.settings);
        this.settingsService.resetInternalState();
    }

    unsetInitializationStatus(): void {
        this.isAccountInitialized.next(false);
    }

    get initialized(): Readonly<Observable<boolean>> {
        return this.isAccountInitialized.asObservable();
    }
}
