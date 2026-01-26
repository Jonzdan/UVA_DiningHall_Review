import { Component, OnDestroy } from '@angular/core';
import { AccountOrchestrationService, AccountService, SettingsService } from '../../services';
import { Router } from '@angular/router';
import { type CurrentSelectedSettingTab, SettingTabTypes } from 'src/app/services/settings/types';
import { ROUTE_PATHS } from 'src/app/constants';
import { EMPTY, filter, firstValueFrom, lastValueFrom, Subscription, switchMap, take, tap, timeout } from 'rxjs';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
    public isLoaded: boolean;

    constructor(
        private accountService: AccountService,
        private accountOrchestrationService: AccountOrchestrationService,
        private settingsService: SettingsService,
        private router: Router,
    ) {
        this.isLoaded = false;
    }

    async ngOnInit(): Promise<void> {
        this.accountService.isSignedIn$.pipe(
            tap(isSignedIn => {
                if (isSignedIn === false) {
                    this.router.navigateByUrl(ROUTE_PATHS.NOT_FOUND);
                    return;
                }

                return this.accountOrchestrationService.triggerInitialization();
            })
        ).subscribe({
            next: () => this.isLoaded = true,
            error: () => {
                alert("Failed to fetch settings tab");
                this.navigateToHome();
            }
        });
    }

    navigateToHome() {
        this.router.navigateByUrl(ROUTE_PATHS.HOME);
    }

    async logout() {
        await this.accountService.logout();
        this.navigateToHome();
    }

    whichTitleSubstring(tabType: CurrentSelectedSettingTab) {
        switch (tabType) {
            case 'Notification': {
                return 'Select the kinds of notifications you get about your activities and recommendations';
            }
            case 'Password': {
                return 'View Password Details and Options';
            }
            case 'Profile':
            default:
                return 'View Profile Details and Security';
        }
    }

    switchContent(tabType: CurrentSelectedSettingTab) {
        this.settingsService.currentSettingsTab = tabType;
    }

    get tabs() {
        return SettingTabTypes;
    }

    get pendingChanges() {
        return this.settingsService.pendingChanges;
    }

    get currentSettings() {
        return this.settingsService.currentSettings;
    }

    get currentSelected(): CurrentSelectedSettingTab {
        return this.settingsService.currentSettingsTab;
    }
}
