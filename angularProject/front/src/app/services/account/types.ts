import type { LoginApi, ResetApi, SignupApi, UserSettingsApi } from 'hoorank-shared';
import { BehaviorSubject } from 'rxjs';

export interface AccountDetails {
    displayText: string;
    isSignedIn: boolean;
    isSignedIn$: BehaviorSubject<boolean | null>
    username?: string;
    settings?: UserSettingsApi;
}

export type ApiGroups = SignupApi | LoginApi | ResetApi; 
