import { Injectable } from '@angular/core';
import { NestedToggleSettingKeys, SettingTabTypes, ToggleMapState, ToggleSettingsKeys, type CurrentSelectedSettingTab } from './types';
import { ROUTES, type UpdateUserApi, type UserSettingsApi } from 'hoorank-shared';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    private _currentSettingsTab: CurrentSelectedSettingTab;
    private _stagedSettings: ToggleMapState;
    private _pendingChanges: boolean;

    constructor(private http: HttpClient) {
        this._currentSettingsTab = SettingTabTypes.PROFILE;
        this._stagedSettings = {};
        this._pendingChanges = false;
    }

    set currentSettingsTab(newTab: CurrentSelectedSettingTab) {
        if (!(Object.values(SettingTabTypes).includes(newTab))) {
            return;
        }
        this._currentSettingsTab = newTab;
    }

    get currentSettingsTab(): CurrentSelectedSettingTab {
        return this._currentSettingsTab;
    }

    public buildToggleState(
        api?: UserSettingsApi
    ): void {
        this._stagedSettings = {
            "notifications.ohillOptIn": !!api?.notifications?.ohillOptIn,
            "notifications.runkOptIn": !!api?.notifications?.runkOptIn,
            "notifications.newcombOptIn": !!api?.notifications?.newcombOptIn,
            "notifications.foodOptInBol": !!api?.notifications?.foodOptInBol,
            "notifications.replyToPost": !!api?.notifications?.replyToPost,
        };
    }

    /**
     * Converts topLevelKey.bottomLevelKey into nested object for UserSettingsApi
     * @returns 
     */
    private convertStagedSettingsToApi(): UserSettingsApi {
        const userSettings: UserSettingsApi = {};
        const stagedAccountKeys: (ToggleSettingsKeys)[] = Object.keys(this._stagedSettings) as ToggleSettingsKeys[];

        for (const absolutePathKey of stagedAccountKeys) {
            const value = this._stagedSettings[absolutePathKey];
            
            if (value === undefined) {
                continue;
            }

            const [settingKey, subSettingKey] = absolutePathKey.split(".") as [keyof UserSettingsApi, NestedToggleSettingKeys];
            if (!userSettings[settingKey]) {
                userSettings[settingKey] = {};
            }

            /**
             * Bypasses runtime/dynamic string validation mismatch with compile-time union type narrowing
             * Object before cast is UserSettingsApi[key], and has NestedToggleSettingKeys as subkeys
             * Internal-facing function with minimal user exposure: developer set I/O 
             * eslint-disable-next-line @typescript/eslint/no-explicit-any
             */ 
            (userSettings[settingKey] as any)[subSettingKey] = value;
        }
        return userSettings;
    }

    /**
     * Updates backend settings
     * @returns returns true if successful update, else false
     */
    async updateAccountSettings(): Promise<boolean> {
        try {
            await firstValueFrom(this.http.put(
                ROUTES.USER.SETTINGS,
                {
                    userSettingsSchema: this.convertStagedSettingsToApi()
                } satisfies Omit<UpdateUserApi, "email" | "passwordReset">,
                {
                    headers: { 'content-type': 'application/json', },
                    reportProgress: true,
                }
            ).pipe(timeout(5000)));
        } catch (error) {
            console.error(error);
            return false;
        }
        this._pendingChanges = false;
        return true;
    }

    addValueToStagedSettings<T extends ToggleSettingsKeys>(
        absoluteSettingKey: T,
        value: boolean
    ): void {
        this._stagedSettings[absoluteSettingKey] = value;
        this._pendingChanges = true;
    }

    resetInternalState(): void {
        // this._currentSettingsTab = SettingTabTypes.PROFILE;
        this._pendingChanges = false;
    }

    get currentSettings(): Readonly<Partial<Record<ToggleSettingsKeys, boolean>>> {
        return this._stagedSettings
    }

    get pendingChanges(): boolean {
        return this._pendingChanges;
    }
}
