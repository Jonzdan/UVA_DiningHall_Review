import {
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import { AccountOrchestrationService, AccountService, SettingsService } from '../../services';
import { Router } from '@angular/router';
import { NotificationMetadata, SettingsTabToMetadata } from './types';
import { notificationsEmailText, passwordText, profileText, SettingTabTypes, ToggleSettingsKeys } from 'src/app/services/settings';
import { ROUTE_PATHS } from 'src/app/constants';
import { TabToTitleAndSubtext, NotificationTitleAndSubtext } from './constants';

@Component({
    selector: 'app-settings-tab',
    templateUrl: './settings-tab.component.html',
    styleUrls: ['./settings-tab.component.css'],
})
export class SettingsTabComponent {
    @ViewChild('modal') modal: any;

    public dialogText = 'Invalid Password';
    public subDialogText =
        'Our system detected an error with one of the entered passwords. Please check your passwords and try again.';

    constructor(
        private accountService: AccountService,
        private accountOrchestrationService: AccountOrchestrationService,
        private settingsService: SettingsService,
        private router: Router,
    ) {}

    public onToggleChange(key: string, value: boolean) {
        this.settingsService.addValueToStagedSettings(key as ToggleSettingsKeys, value);
    }

    async saveChange() {
        const result = await this.accountOrchestrationService.save();
        if (!result) {
            /**
             * TODO: Display some error --> maybe call revert
             */
        }
    }

    discardChange(): void {
        this.accountOrchestrationService.reset();
    }

    showModals(): void {
        this.modal.nativeElement.showModal();
    }

    closeModal(): void {
        this.modal.nativeElement.close();
    }

    checkIfPropIsChecked(specificSetting: string): boolean {
        return !!this.settings?.[specificSetting as ToggleSettingsKeys];
    }

    switchToHomePage(): void {
        this.router.navigateByUrl(ROUTE_PATHS.HOME);
    }

    getToggleTitle(key: string): string {
        return NotificationTitleAndSubtext[key as ToggleSettingsKeys]?.title || 'Unknown title';
    }

    getToggleDescription(key: string): string {
        return NotificationTitleAndSubtext[key as ToggleSettingsKeys]?.description || '';
    }

    get titleTextMapping() {
        return TabToTitleAndSubtext;
    }

    get toggleTitleTextMapping() {
        return NotificationTitleAndSubtext;
    }

    get profileTabMetadata() {
        return TabToTitleAndSubtext.Profile;
    }

    get passwordTabMetadata() {
        return TabToTitleAndSubtext.Password;
    }

    get notificationsTabMetadata() {
        return TabToTitleAndSubtext.Notification;
    }

    get currentTab() {
        return this.settingsService.currentSettingsTab;
    }

    get isProfileTabActive() {
        return this.currentTab === SettingTabTypes.PROFILE;
    }

    get isNotificationTabActive() {
        return this.currentTab === SettingTabTypes.NOTIFICATIONS;
    }

    get isPasswordResetTabActive() {
        return this.currentTab === SettingTabTypes.PASSWORD;
    }

    get settings(): Readonly<Partial<Record<ToggleSettingsKeys, boolean>>> {
        return this.settingsService.currentSettings;
    }

    get username() {
        return this.accountService.accountDetails.username || '';
    }

    get pendingChanges() {
        return this.settingsService.pendingChanges;
    }
}
